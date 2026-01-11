package com.realhogoo.jsadmin.api;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class AuthApiController {

    @PostMapping("/auth/ping.json")
    public ApiResponse<Map<String, Object>> ping(HttpServletRequest req, @RequestParam Map<String, String> param) {
        String traceId = String.valueOf(req.getAttribute("trace_id"));

        Map<String, Object> data = new HashMap<>();
        data.put("pong", true);
        data.put("echo", param);

        return ApiResponse.ok(data, traceId);
    }
}
