package com.realhogoo.jsadmin.health.web;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.auth.AuthRequestSupport;
import com.realhogoo.jsadmin.health.mapper.HealthMapper;
import com.realhogoo.jsadmin.health.mapper.ServiceRegistryMapper;
import com.realhogoo.jsadmin.serviceregistry.service.ServiceEndpointPolicy;
import com.zaxxer.hikari.HikariDataSource;
import com.zaxxer.hikari.HikariPoolMXBean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.server.ResponseStatusException;

import javax.sql.DataSource;
import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.lang.management.ManagementFactory;
import java.lang.management.OperatingSystemMXBean;
import java.lang.management.RuntimeMXBean;
import java.lang.management.ThreadMXBean;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.URI;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.sql.Connection;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Enumeration;

@Controller
public class HealthController {

    private static final TypeReference<Map<String, Object>> MAP_TYPE = new TypeReference<Map<String, Object>>() { };

    private final DataSource dataSource;
    private final HealthMapper healthMapper;
    private final ServiceRegistryMapper serviceRegistryMapper;
    private final ServiceEndpointPolicy serviceEndpointPolicy;
    private final AccessService accessService;
    private final String appEnv;
    private final String internalApiToken;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public HealthController(
        DataSource dataSource,
        HealthMapper healthMapper,
        ServiceRegistryMapper serviceRegistryMapper,
        ServiceEndpointPolicy serviceEndpointPolicy,
        AccessService accessService,
        @Value("${app.env:dev}") String appEnv,
        @Value("${admin.internal-api-token:}") String internalApiToken
    ) {
        this.dataSource = dataSource;
        this.healthMapper = healthMapper;
        this.serviceRegistryMapper = serviceRegistryMapper;
        this.serviceEndpointPolicy = serviceEndpointPolicy;
        this.accessService = accessService;
        this.appEnv = appEnv == null ? "dev" : appEnv.trim();
        this.internalApiToken = internalApiToken == null ? "" : internalApiToken.trim();
    }

    @RequestMapping(value = {"/health/main.do", "/dashboard/health.do"}, method = RequestMethod.POST)
    public String healthPage() {
        return "dashboard/health";
    }

    @ResponseBody
    @RequestMapping(value = "/health/service/list.json", method = RequestMethod.POST)
    public Map<String, Object> serviceList(HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        return ok(serviceRegistryMapper.selectServiceRegistryList());
    }

    @ResponseBody
    @RequestMapping(value = "/internal/service/use-status.json", method = RequestMethod.POST)
    public Map<String, Object> internalServiceUseStatus(@RequestBody(required = false) String body, HttpServletRequest request) {
        ensureInternalRequest(request);
        Map<String, Object> service = requestedService(parseBody(body));
        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("service_cd", stringValue(service.get("service_cd")));
        data.put("use_yn", stringValue(service.get("use_yn")));
        return ok(data);
    }

    @ResponseBody
    @RequestMapping(value = "/health/status.json", method = RequestMethod.POST)
    public Map<String, Object> status(@RequestBody(required = false) String body) {
        return ok(healthDetail(requestedService(parseBody(body))));
    }

    @ResponseBody
    @RequestMapping(value = "/health/db.json", method = RequestMethod.POST)
    public Map<String, Object> db(@RequestBody(required = false) String body) {
        Map<String, Object> service = requestedService(parseBody(body));
        return ok(isLocalService(service) ? dbStatus() : remoteDatabaseStatus(service));
    }

    @ResponseBody
    @RequestMapping(value = "/health/server.json", method = RequestMethod.POST)
    public Map<String, Object> server(@RequestBody(required = false) String body) {
        Map<String, Object> service = requestedService(parseBody(body));
        return ok(isLocalService(service) ? serverStatus() : remoteServerStatus(service));
    }

    @ResponseBody
    @RequestMapping(value = "/health/live.json", method = RequestMethod.POST)
    public Map<String, Object> live(@RequestBody(required = false) String body) {
        Map<String, Object> service = requestedService(parseBody(body));
        if (isLocalService(service)) {
            Map<String, Object> data = new HashMap<String, Object>();
            data.put("service", "admin-service");
            data.put("status", "UP");
            data.put("checked_at", Instant.now().toString());
            return ok(data);
        }
        return ok(remoteBasicStatus(service, "live"));
    }

    @ResponseBody
    @RequestMapping(value = "/health/ready.json", method = RequestMethod.POST)
    public Map<String, Object> ready(@RequestBody(required = false) String body) {
        Map<String, Object> service = requestedService(parseBody(body));
        if (isLocalService(service)) {
            Map<String, Object> db = dbStatus();
            Map<String, Object> data = new HashMap<String, Object>();
            data.put("service", "admin-service");
            data.put("status", Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DOWN");
            data.put("checked_at", Instant.now().toString());
            data.put("db", db);
            return ok(data);
        }
        return ok(remoteBasicStatus(service, "ready"));
    }

    @ResponseBody
    @RequestMapping(value = "/health/detail.json", method = RequestMethod.POST)
    public Map<String, Object> detail(@RequestBody(required = false) String body) {
        return ok(healthDetail(requestedService(parseBody(body))));
    }

    @ResponseBody
    @RequestMapping(value = "/health/overview.json", method = RequestMethod.POST)
    public Map<String, Object> overview(HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        List<Map<String, Object>> services = serviceRegistryMapper.selectServiceRegistryList();
        List<Map<String, Object>> rows = new ArrayList<Map<String, Object>>();
        for (Map<String, Object> service : services) {
            rows.add(serviceOverview(service));
        }
        return ok(rows);
    }

    @ResponseBody
    @RequestMapping(value = "/health/probe.json", method = RequestMethod.POST)
    public Map<String, Object> probe(@RequestBody(required = false) String body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        return ok(serviceOverview(requestedService(parseBody(body))));
    }

    private Map<String, Object> requestedService(Map<String, Object> body) {
        String serviceCd = body == null ? null : stringValue(body.get("service_cd"));
        Map<String, Object> service = serviceCd == null
            ? serviceRegistryMapper.selectServiceRegistryByCode("admin-service")
            : serviceRegistryMapper.selectServiceRegistryByCode(serviceCd);
        if (service == null || service.isEmpty()) {
            throw new IllegalArgumentException("service_cd is invalid");
        }
        return service;
    }

    private void ensureInternalRequest(HttpServletRequest request) {
        if (internalApiToken.isEmpty() || (isProduction() && "dev-media-internal-token".equals(internalApiToken))) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "internal API token is not configured");
        }
        String requestedToken = request.getHeader("X-Internal-Api-Token");
        if (!internalApiToken.equals(requestedToken == null ? "" : requestedToken.trim())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "invalid internal API token");
        }
    }

    private Map<String, Object> serviceOverview(Map<String, Object> service) {
        Map<String, Object> row = new LinkedHashMap<String, Object>();
        row.put("service_seq", service.get("service_seq"));
        row.put("service_cd", service.get("service_cd"));
        row.put("service_nm", service.get("service_nm"));
        row.put("base_url", service.get("base_url"));
        row.put("use_yn", service.get("use_yn"));
        row.put("sort_ord", service.get("sort_ord"));

        if ("N".equalsIgnoreCase(stringValue(service.get("use_yn")))) {
            row.put("overall_status", "DISABLED");
            row.put("liveness", "DISABLED");
            row.put("readiness", "DISABLED");
            row.put("latency_ms", null);
            row.put("checked_at", Instant.now().toString());
            row.put("dependency_down_count", 0);
            row.put("message", "Service is disabled");
            return row;
        }

        Map<String, Object> detail = healthDetail(service);
        Map<String, Object> summary = mapValue(detail.get("summary"));
        Map<String, Object> db = mapValue(detail.get("db"));
        List<Map<String, Object>> dependencies = listValue(detail.get("dependencies"));
        int downCount = 0;
        for (Map<String, Object> dependency : dependencies) {
            String status = statusValue(dependency, "UNKNOWN");
            if (!"UP".equals(status) && !"DISABLED".equals(status)) {
                downCount++;
            }
        }

        String overallStatus = stringValue(summary.get("overall_status"));
        row.put("overall_status", overallStatus == null ? "DEGRADED" : overallStatus);
        row.put("liveness", stringValue(summary.get("liveness")));
        row.put("readiness", stringValue(summary.get("readiness")));
        row.put("latency_ms", firstNonNull(db.get("elapsed_ms"), summary.get("latency_ms")));
        row.put("checked_at", firstNonNull(summary.get("checked_at"), Instant.now().toString()));
        row.put("dependency_down_count", downCount);
        row.put("message", overviewMessage(row, db, downCount));
        return row;
    }

    private String overviewMessage(Map<String, Object> row, Map<String, Object> db, int downCount) {
        String status = stringValue(row.get("overall_status"));
        if ("UP".equals(status)) {
            return downCount > 0 ? "Some dependencies need attention" : "Service is healthy";
        }
        String error = stringValue(db.get("error"));
        if (error != null) {
            return error;
        }
        if (downCount > 0) {
            return downCount + " dependency check failed";
        }
        return "Health check requires attention";
    }

    private Map<String, Object> parseBody(String body) {
        if (body == null || body.trim().isEmpty()) {
            return Collections.emptyMap();
        }
        try {
            return objectMapper.readValue(body, MAP_TYPE);
        } catch (Exception exception) {
            throw new IllegalArgumentException("request body must be valid JSON");
        }
    }

    private Map<String, Object> dbStatus() {
        Map<String, Object> db = new HashMap<String, Object>();
        long t0 = System.currentTimeMillis();
        boolean connOk = false;
        String err = null;
        Integer ping = null;

        try (Connection c = dataSource.getConnection()) {
            connOk = c.isValid(2);
            ping = healthMapper.ping();
        } catch (Exception e) {
            err = e.getClass().getSimpleName() + ": " + e.getMessage();
        }

        long elapsedMs = System.currentTimeMillis() - t0;
        db.put("ok", connOk && ping != null && ping == 1);
        db.put("ping", ping);
        db.put("elapsed_ms", elapsedMs);
        db.put("error", err);

        if (dataSource instanceof HikariDataSource) {
            HikariDataSource hk = (HikariDataSource) dataSource;
            HikariPoolMXBean mx = hk.getHikariPoolMXBean();
            if (mx != null) {
                Map<String, Object> pool = new HashMap<String, Object>();
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
        Map<String, Object> s = new HashMap<String, Object>();
        Runtime rt = Runtime.getRuntime();
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
        s.put("heap_free", rt.freeMemory());
        s.put("heap_total", rt.totalMemory());
        s.put("heap_max", rt.maxMemory());
        s.put("heap_used", rt.totalMemory() - rt.freeMemory());
        s.put("heap_used_pct", percent(rt.totalMemory() - rt.freeMemory(), rt.maxMemory()));
        s.put("threads_live", tmx.getThreadCount());
        s.put("threads_peak", tmx.getPeakThreadCount());
        s.put("server_info", System.getProperty("catalina.base") != null ? "Tomcat" : "Unknown");
        s.put("active_users", activeUsers());
        s.put("cpu", cpuStatus(os));
        s.put("memory", memoryStatus(os));
        s.put("disk", diskStatus());
        s.put("network", networkStatus());

        try {
            s.put("host", InetAddress.getLocalHost().getHostName());
        } catch (Exception ignore) {
        }

        return s;
    }

    private Map<String, Object> cpuStatus(OperatingSystemMXBean os) {
        Map<String, Object> cpu = new LinkedHashMap<String, Object>();
        cpu.put("processors", os.getAvailableProcessors());
        cpu.put("system_load_avg", os.getSystemLoadAverage());
        if (os instanceof com.sun.management.OperatingSystemMXBean) {
            com.sun.management.OperatingSystemMXBean sunOs = (com.sun.management.OperatingSystemMXBean) os;
            cpu.put("system_cpu_load_pct", percentValue(sunOs.getSystemCpuLoad()));
            cpu.put("process_cpu_load_pct", percentValue(sunOs.getProcessCpuLoad()));
        } else {
            cpu.put("system_cpu_load_pct", null);
            cpu.put("process_cpu_load_pct", null);
        }
        return cpu;
    }

    private Map<String, Object> memoryStatus(OperatingSystemMXBean os) {
        Map<String, Object> memory = new LinkedHashMap<String, Object>();
        Runtime rt = Runtime.getRuntime();
        long heapUsed = rt.totalMemory() - rt.freeMemory();
        memory.put("heap_used", heapUsed);
        memory.put("heap_total", rt.totalMemory());
        memory.put("heap_max", rt.maxMemory());
        memory.put("heap_used_pct", percent(heapUsed, rt.maxMemory()));
        if (os instanceof com.sun.management.OperatingSystemMXBean) {
            com.sun.management.OperatingSystemMXBean sunOs = (com.sun.management.OperatingSystemMXBean) os;
            long total = sunOs.getTotalPhysicalMemorySize();
            long free = sunOs.getFreePhysicalMemorySize();
            memory.put("physical_total", total);
            memory.put("physical_free", free);
            memory.put("physical_used", total > 0 && free >= 0 ? total - free : null);
            memory.put("physical_used_pct", total > 0 && free >= 0 ? percent(total - free, total) : null);
        } else {
            memory.put("physical_total", null);
            memory.put("physical_free", null);
            memory.put("physical_used", null);
            memory.put("physical_used_pct", null);
        }
        return memory;
    }

    private Map<String, Object> diskStatus() {
        Map<String, Object> disk = new LinkedHashMap<String, Object>();
        long total = 0L;
        long free = 0L;
        List<Map<String, Object>> roots = new ArrayList<Map<String, Object>>();
        File[] files = File.listRoots();
        if (files != null) {
            for (File file : files) {
                long rootTotal = file.getTotalSpace();
                long rootFree = file.getUsableSpace();
                if (rootTotal <= 0) {
                    continue;
                }
                Map<String, Object> root = new LinkedHashMap<String, Object>();
                root.put("path", file.getAbsolutePath());
                root.put("total", rootTotal);
                root.put("free", rootFree);
                root.put("used", rootTotal - rootFree);
                root.put("used_pct", percent(rootTotal - rootFree, rootTotal));
                roots.add(root);
                total += rootTotal;
                free += rootFree;
            }
        }
        disk.put("total", total);
        disk.put("free", free);
        disk.put("used", total - free);
        disk.put("used_pct", percent(total - free, total));
        disk.put("roots", roots);
        return disk;
    }

    private Map<String, Object> networkStatus() {
        Map<String, Object> network = new LinkedHashMap<String, Object>();
        int activeCount = 0;
        List<String> addresses = new ArrayList<String>();
        try {
            Enumeration<NetworkInterface> interfaces = NetworkInterface.getNetworkInterfaces();
            while (interfaces != null && interfaces.hasMoreElements()) {
                NetworkInterface nif = interfaces.nextElement();
                if (!nif.isUp() || nif.isLoopback() || nif.isVirtual()) {
                    continue;
                }
                activeCount++;
                Enumeration<InetAddress> inetAddresses = nif.getInetAddresses();
                while (inetAddresses.hasMoreElements()) {
                    InetAddress address = inetAddresses.nextElement();
                    if (!address.isLoopbackAddress()) {
                        addresses.add(address.getHostAddress());
                    }
                }
            }
        } catch (Exception ignore) {
        }
        network.put("status", activeCount > 0 ? "UP" : "UNKNOWN");
        network.put("active_interfaces", activeCount);
        network.put("addresses", addresses);
        return network;
    }

    private int activeUsers() {
        try {
            return accessService == null ? 0 : accessService.countActiveLoginSessions();
        } catch (Exception ignore) {
            return 0;
        }
    }

    private Double percent(long used, long total) {
        if (total <= 0 || used < 0) {
            return null;
        }
        return Math.round((used * 10000.0d / total)) / 100.0d;
    }

    private Double percentValue(double load) {
        if (Double.isNaN(load) || load < 0) {
            return null;
        }
        return Math.round(load * 10000.0d) / 100.0d;
    }

    private Map<String, Object> healthDetail(Map<String, Object> service) {
        return isLocalService(service) ? localHealthDetail(service) : remoteHealthDetail(service);
    }

    private Map<String, Object> localHealthDetail(Map<String, Object> service) {
        Map<String, Object> db = dbStatus();
        Map<String, Object> server = serverStatus();
        List<Map<String, Object>> dependencies = new ArrayList<Map<String, Object>>();

        Map<String, Object> dbDependency = new HashMap<String, Object>();
        dbDependency.put("name", "postgres-admin");
        dbDependency.put("type", "database");
        dbDependency.put("status", Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DOWN");
        dbDependency.put("latency_ms", db.get("elapsed_ms"));
        dbDependency.put("message", Boolean.TRUE.equals(db.get("ok")) ? "Connection and ping succeeded" : db.get("error"));
        dependencies.add(dbDependency);

        Map<String, Object> summary = new HashMap<String, Object>();
        summary.put("service", stringValue(service.get("service_cd")));
        summary.put("service_nm", stringValue(service.get("service_nm")));
        summary.put("checked_at", Instant.now().toString());
        summary.put("overall_status", effectiveOverallStatus(stringValue(service.get("use_yn")), Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DEGRADED"));
        summary.put("liveness", "UP");
        summary.put("readiness", Boolean.TRUE.equals(db.get("ok")) ? "UP" : "DOWN");
        summary.put("use_yn", stringValue(service.get("use_yn")));
        summary.put("base_url", stringValue(service.get("base_url")));
        summary.put("remark", stringValue(service.get("remark")));

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("summary", summary);
        data.put("db", db);
        data.put("server", server);
        data.put("dependencies", dependencies);
        return data;
    }

    private Map<String, Object> remoteHealthDetail(Map<String, Object> service) {
        Map<String, Object> statusData = remoteBasicStatus(service, "status");
        Map<String, Object> readyData = remoteBasicStatus(service, "ready");
        Map<String, Object> liveData = remoteBasicStatus(service, "live");

        Map<String, Object> remoteDb = remoteDbStatus(statusData, readyData);

        Map<String, Object> summary = new LinkedHashMap<String, Object>();
        summary.put("service", stringValue(service.get("service_cd")));
        summary.put("service_nm", stringValue(service.get("service_nm")));
        summary.put("checked_at", stringValue(firstNonNull(statusData.get("checked_at"), readyData.get("checked_at"), liveData.get("checked_at"), Instant.now().toString())));
        summary.put("overall_status", effectiveOverallStatus(stringValue(service.get("use_yn")), statusValue(statusData, "DEGRADED")));
        summary.put("liveness", statusValue(liveData, "DOWN"));
        summary.put("readiness", statusValue(readyData, "DOWN"));
        summary.put("use_yn", stringValue(service.get("use_yn")));
        summary.put("base_url", stringValue(service.get("base_url")));
        summary.put("remark", stringValue(service.get("remark")));

        Map<String, Object> db = new LinkedHashMap<String, Object>();
        db.put("ok", remoteDb.isEmpty() ? null : remoteDb.get("ok"));
        db.put("ping", remoteDb.get("ping"));
        db.put("elapsed_ms", firstNonNull(remoteDb.get("elapsed_ms"), statusData.get("latency_ms"), readyData.get("latency_ms")));
        db.put("error", firstNonNull(remoteDb.get("error"), statusData.get("error"), readyData.get("error")));
        db.put("pool", remoteDb.get("pool"));

        Map<String, Object> server = new LinkedHashMap<String, Object>();
        server.put("host", extractHost(stringValue(service.get("base_url"))));
        server.put("java_version", "-");
        server.put("os_name", "-");
        server.put("os_version", "");
        server.put("os_arch", "");
        server.put("available_processors", "-");
        server.put("uptime_ms", null);
        server.put("server_info", "Remote service");
        server.put("threads_live", "-");
        server.put("threads_peak", "-");
        server.put("heap_total", null);
        server.put("heap_max", null);
        server.put("heap_used", null);
        server.put("heap_used_pct", null);
        server.put("active_users", null);
        server.put("cpu", Collections.emptyMap());
        server.put("memory", Collections.emptyMap());
        server.put("disk", Collections.emptyMap());
        server.put("network", Collections.emptyMap());

        List<Map<String, Object>> dependencies = new ArrayList<Map<String, Object>>();
        dependencies.add(dependencyRow("remote-liveness", "http", statusValue(liveData, "DOWN"), liveData));
        dependencies.add(dependencyRow("remote-readiness", "http", statusValue(readyData, "DOWN"), readyData));
        if (!remoteDb.isEmpty()) {
            Map<String, Object> remoteDbDependency = new LinkedHashMap<String, Object>();
            remoteDbDependency.put("name", stringValue(service.get("service_cd")) + "-db");
            remoteDbDependency.put("type", "database");
            remoteDbDependency.put("status", Boolean.TRUE.equals(remoteDb.get("ok")) ? "UP" : "DOWN");
            remoteDbDependency.put("latency_ms", remoteDb.get("elapsed_ms"));
            remoteDbDependency.put("message", Boolean.TRUE.equals(remoteDb.get("ok")) ? "Remote DB ready" : stringValue(remoteDb.get("error")));
            dependencies.add(remoteDbDependency);
        }

        Map<String, Object> data = new LinkedHashMap<String, Object>();
        data.put("summary", summary);
        data.put("db", db);
        data.put("server", server);
        data.put("dependencies", dependencies);
        return data;
    }

    private Map<String, Object> dependencyRow(String name, String type, String status, Map<String, Object> source) {
        Map<String, Object> row = new LinkedHashMap<String, Object>();
        row.put("name", name);
        row.put("type", type);
        row.put("status", status);
        row.put("latency_ms", source.get("latency_ms"));
        row.put("message", firstNonNull(source.get("message"), source.get("error"), "Remote call completed"));
        return row;
    }

    private Map<String, Object> remoteDatabaseStatus(Map<String, Object> service) {
        return mapValue(remoteHealthDetail(service).get("db"));
    }

    private Map<String, Object> remoteDbStatus(Map<String, Object> statusData, Map<String, Object> readyData) {
        Map<String, Object> remoteDb = mapValue(statusData.get("db"));
        if (remoteDb.isEmpty()) {
            remoteDb = mapValue(readyData.get("db"));
        }
        if (!remoteDb.isEmpty()) {
            return remoteDb;
        }

        String dbStatus = stringValue(firstNonNull(statusData.get("db"), readyData.get("db")));
        if (dbStatus == null) {
            dbStatus = stringValue(firstNonNull(statusData.get("mongo"), readyData.get("mongo")));
        }
        if (dbStatus == null) {
            return remoteDb;
        }

        boolean ok = "UP".equalsIgnoreCase(dbStatus);
        remoteDb.put("ok", ok);
        remoteDb.put("ping", ok ? 1 : null);
        remoteDb.put("elapsed_ms", firstNonNull(statusData.get("latency_ms"), readyData.get("latency_ms")));
        remoteDb.put("error", ok ? null : dbStatus);
        return remoteDb;
    }

    private Map<String, Object> remoteServerStatus(Map<String, Object> service) {
        return mapValue(remoteHealthDetail(service).get("server"));
    }

    private Map<String, Object> remoteBasicStatus(Map<String, Object> service, String mode) {
        long startedAt = System.currentTimeMillis();
        try {
            String endpoint = serviceEndpointPolicy.resolveAllowedEndpoint(
                stringValue(service.get("base_url")),
                endpointPath(service, mode),
                mode + "_path"
            );
            HttpURLConnection connection = openPost(endpoint, timeoutMs(service));
            connection.connect();
            int statusCode = connection.getResponseCode();
            long latencyMs = System.currentTimeMillis() - startedAt;
            InputStream stream = statusCode >= 400 ? connection.getErrorStream() : connection.getInputStream();
            Map<String, Object> payload = stream == null ? Collections.<String, Object>emptyMap() : objectMapper.readValue(stream, MAP_TYPE);
            Map<String, Object> data = mapValue(payload.get("data"));
            data.put("http_status", statusCode);
            data.put("latency_ms", latencyMs);
            if (statusCode >= 400 && !data.containsKey("error")) {
                data.put("error", "HTTP " + statusCode);
            }
            return data;
        } catch (Exception exception) {
            Map<String, Object> error = new LinkedHashMap<String, Object>();
            error.put("service", stringValue(service.get("service_cd")));
            error.put("status", "DOWN");
            error.put("checked_at", Instant.now().toString());
            error.put("latency_ms", System.currentTimeMillis() - startedAt);
            error.put("error", exception.getClass().getSimpleName() + ": " + exception.getMessage());
            error.put("message", "Remote health call failed");
            return error;
        }
    }

    private HttpURLConnection openPost(String targetUrl, int timeoutMs) throws Exception {
        URL url = URI.create(targetUrl).toURL();
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        connection.setRequestProperty("Content-Type", "application/json");
        connection.setRequestProperty("Accept", "application/json");
        connection.setConnectTimeout(timeoutMs);
        connection.setReadTimeout(timeoutMs);
        connection.setDoOutput(true);
        try (OutputStream outputStream = connection.getOutputStream()) {
            outputStream.write("{}".getBytes(StandardCharsets.UTF_8));
        }
        return connection;
    }

    private boolean isLocalService(Map<String, Object> service) {
        return "admin-service".equalsIgnoreCase(stringValue(service.get("service_cd")));
    }

    private boolean isProduction() {
        return "prod".equalsIgnoreCase(appEnv) || "production".equalsIgnoreCase(appEnv);
    }

    private String endpointPath(Map<String, Object> service, String mode) {
        if ("live".equals(mode)) {
            return defaultPath(service.get("live_path"), "/health/live.json");
        }
        if ("ready".equals(mode)) {
            return defaultPath(service.get("ready_path"), "/health/ready.json");
        }
        return defaultPath(service.get("status_path"), "/health/status.json");
    }

    private int timeoutMs(Map<String, Object> service) {
        Object value = service.get("timeout_ms");
        return value instanceof Number ? ((Number) value).intValue() : 3000;
    }

    private String defaultPath(Object value, String fallback) {
        String text = stringValue(value);
        return text == null ? fallback : text;
    }

    private String statusValue(Map<String, Object> data, String fallback) {
        String status = stringValue(data.get("status"));
        return status == null ? fallback : status;
    }

    private String effectiveOverallStatus(String useYn, String rawStatus) {
        if ("N".equalsIgnoreCase(useYn)) {
            return "DISABLED";
        }
        return rawStatus == null ? "DEGRADED" : rawStatus;
    }

    private Map<String, Object> mapValue(Object value) {
        if (value instanceof Map) {
            @SuppressWarnings("unchecked")
            Map<String, Object> cast = (Map<String, Object>) value;
            return new LinkedHashMap<String, Object>(cast);
        }
        return new LinkedHashMap<String, Object>();
    }

    private List<Map<String, Object>> listValue(Object value) {
        if (!(value instanceof List)) {
            return Collections.emptyList();
        }
        List<?> source = (List<?>) value;
        List<Map<String, Object>> result = new ArrayList<Map<String, Object>>();
        for (Object item : source) {
            if (item instanceof Map) {
                @SuppressWarnings("unchecked")
                Map<String, Object> cast = (Map<String, Object>) item;
                result.add(new LinkedHashMap<String, Object>(cast));
            }
        }
        return result;
    }

    private String extractHost(String baseUrl) {
        try {
            return URI.create(baseUrl).getHost();
        } catch (Exception ignore) {
            return "-";
        }
    }

    private Object firstNonNull(Object... values) {
        for (Object value : values) {
            if (value != null) {
                return value;
            }
        }
        return null;
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? null : text;
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }
}
