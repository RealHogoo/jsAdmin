package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.api.ApiResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.*;

@RestController
public class AuthPingController {

    @PostMapping("/auth/ping.json")
    public ApiResponse<Map<String, Object>> ping(HttpServletRequest req, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        String userId = (String) req.getAttribute("user_id");
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) req.getAttribute("roles");

        Map<String, Object> data = new HashMap<>();
        data.put("user_id", userId);
        data.put("roles", roles == null ? Collections.emptyList() : roles);

        return ApiResponse.ok(data, req);
    }
}
