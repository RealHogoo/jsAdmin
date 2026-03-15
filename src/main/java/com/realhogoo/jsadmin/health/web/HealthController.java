package com.realhogoo.jsadmin.health.web;

import com.realhogoo.jsadmin.health.mapper.HealthMapper;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.sql.DataSource;
import java.lang.management.*;
import java.net.InetAddress;
import java.sql.Connection;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class HealthController {

    private final DataSource dataSource;
    private final HealthMapper healthMapper;

    public HealthController(DataSource dataSource, HealthMapper healthMapper) {
        this.dataSource = dataSource;
        this.healthMapper = healthMapper;
    }

    // 8.2 규칙: 화면 조각은 *.do
    @RequestMapping(value = {"/health/main.do", "/dashboard/health.do"}, method = RequestMethod.POST)
    public String healthPage() {
        return "dashboard/health"; // /WEB-INF/jsp/dashboard/health.jsp
    }

    // 8.3 규칙: 데이터는 *.json (POST 고정)
    @ResponseBody
    @RequestMapping(value = "/health/status.json", method = RequestMethod.POST)
    public Map<String, Object> status() {
        return ok(healthDetail());
    }

    @ResponseBody
    @RequestMapping(value = "/health/db.json", method = RequestMethod.POST)
    public Map<String, Object> db() {
        return ok(dbStatus());
    }

    @ResponseBody
    @RequestMapping(value = "/health/server.json", method = RequestMethod.POST)
    public Map<String, Object> server() {
        return ok(serverStatus());
    }

    @ResponseBody
    @RequestMapping(value = "/health/live.json", method = RequestMethod.POST)
    public Map<String, Object> live() {
        Map<String, Object> data = new HashMap<>();
        data.put("service", "admin-service");
        data.put("status", "UP");
        data.put("checked_at", Instant.now().toString());
        return ok(data);
    }

    @ResponseBody
    @RequestMapping(value = "/health/ready.json", method = RequestMethod.POST)
    public Map<String, Object> ready() {
        Map<String, Object> db = dbStatus();
        Map<String, Object> data = new HashMap<>();
        data.put("service", "admin-service");
        data.put("status", Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DOWN");
        data.put("checked_at", Instant.now().toString());
        data.put("db", db);
        return ok(data);
    }

    @ResponseBody
    @RequestMapping(value = "/health/detail.json", method = RequestMethod.POST)
    public Map<String, Object> detail() {
        return ok(healthDetail());
    }

    private Map<String, Object> dbStatus() {
        Map<String, Object> db = new HashMap<>();
        long t0 = System.currentTimeMillis();

        boolean connOk = false;
        String err = null;
        Integer ping = null;

        try (Connection c = dataSource.getConnection()) {
            connOk = c.isValid(2);
            // MyBatis ping(SELECT 1)로 “쿼리 동작”까지 확인
            ping = healthMapper.ping();
        } catch (Exception e) {
            err = e.getClass().getSimpleName() + ": " + e.getMessage();
        }

        long elapsedMs = System.currentTimeMillis() - t0;

        db.put("ok", connOk && ping != null && ping == 1);
        db.put("ping", ping);
        db.put("elapsed_ms", elapsedMs);
        db.put("error", err);

        // Hikari 사용 시 풀 상태 노출(가능한 경우만)
        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hk = (HikariDataSource) dataSource;
            HikariPoolMXBean mx = hk.getHikariPoolMXBean();
            if (mx != null) {
                Map<String, Object> pool = new HashMap<>();
                pool.put("active", mx.getActiveConnections());
                pool.put("idle", mx.getIdleConnections());
                pool.put("total", mx.getTotalConnections());
                pool.put("threads_awaiting", mx.getThreadsAwaitingConnection());
                db.put("pool", pool);
            }
        }

        return db;
    }

    private Map<String, Object> serverStatus() {
        Map<String, Object> s = new HashMap<>();

        Runtime rt = Runtime.getRuntime();
        long free = rt.freeMemory();
        long total = rt.totalMemory();
        long max = rt.maxMemory();

        RuntimeMXBean rmx = ManagementFactory.getRuntimeMXBean();
        ThreadMXBean tmx = ManagementFactory.getThreadMXBean();
        OperatingSystemMXBean os = ManagementFactory.getOperatingSystemMXBean();

        s.put("now_epoch_ms", System.currentTimeMillis());
        s.put("start_time_epoch_ms", rmx.getStartTime());
        s.put("uptime_ms", rmx.getUptime());

        s.put("java_version", System.getProperty("java.version"));
        s.put("java_vendor", System.getProperty("java.vendor"));
        s.put("os_name", os.getName());
        s.put("os_version", os.getVersion());
        s.put("os_arch", os.getArch());
        s.put("available_processors", os.getAvailableProcessors());

        s.put("heap_free", free);
        s.put("heap_total", total);
        s.put("heap_max", max);

        s.put("threads_live", tmx.getThreadCount());
        s.put("threads_peak", tmx.getPeakThreadCount());

        // 톰캣/서블릿 컨테이너 정보(가능한 범위)
        s.put("server_info", System.getProperty("catalina.base") != null ? "Tomcat" : "Unknown");

        try {
            s.put("host", InetAddress.getLocalHost().getHostName());
        } catch (Exception ignore) {}

        return s;
    }

    private Map<String, Object> healthDetail() {
        Map<String, Object> db = dbStatus();
        Map<String, Object> server = serverStatus();
        List<Map<String, Object>> dependencies = new ArrayList<>();

        Map<String, Object> dbDependency = new HashMap<>();
        dbDependency.put("name", "oracle-db");
        dbDependency.put("type", "database");
        dbDependency.put("status", Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DOWN");
        dbDependency.put("latency_ms", db.get("elapsed_ms"));
        dbDependency.put("message", Boolean.TRUE.equals(db.get("ok")) ? "Connection and ping succeeded" : db.get("error"));
        dependencies.add(dbDependency);

        Map<String, Object> summary = new HashMap<>();
        summary.put("service", "admin-service");
        summary.put("checked_at", Instant.now().toString());
        summary.put("overall_status", Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DEGRADED");
        summary.put("liveness", "UP");
        summary.put("readiness", Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DOWN");

        Map<String, Object> data = new HashMap<>();
        data.put("summary", summary);
        data.put("db", db);
        data.put("server", server);
        data.put("dependencies", dependencies);
        return data;
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }
}
