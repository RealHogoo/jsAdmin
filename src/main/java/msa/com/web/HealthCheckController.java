package msa.com.web;

import java.time.LocalDateTime;

import javax.annotation.Resource;

import org.apache.log4j.Logger;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import msa.com.service.HealthCheckService;


@Controller
public class HealthCheckController {

    private static final Logger LOGGER = Logger.getLogger(HealthCheckController.class);

    @Resource(name = "healthCheckService")
    private HealthCheckService healthCheckService;

    @RequestMapping("/health.do")
    public String health(Model model) {
        LOGGER.info("health.do called");
        boolean dbUp = healthCheckService.isDbUp();

        model.addAttribute("service", "admin-service");
        model.addAttribute("timestamp", LocalDateTime.now().toString());
        model.addAttribute("status", "UP");
        model.addAttribute("dbStatus", dbUp ? "UP" : "DOWN");

        return "health/health";  // /WEB-INF/views/health/health.jsp
    }

    // JSON으로 헬스체크 (String 직접 반환)
    @RequestMapping(value = "/health.json", produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String healthJson() {
        LOGGER.info("health.json called");
        boolean dbUp = healthCheckService.isDbUp();

        String service = "admin-service";
        String status = "UP";
        String db = dbUp ? "UP" : "DOWN";
        String timestamp = LocalDateTime.now().toString();

        // 아주 단순한 수동 JSON 생성
        StringBuilder sb = new StringBuilder();
        sb.append("{");
        sb.append("\"service\":\"").append(service).append("\",");
        sb.append("\"status\":\"").append(status).append("\",");
        sb.append("\"db\":\"").append(db).append("\",");
        sb.append("\"timestamp\":\"").append(timestamp).append("\"");
        sb.append("}");

        return sb.toString();
    }
}
