package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.auth.service.QrLoginService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.Map;

@Controller
@RequestMapping("/auth/qr")
public class QrLoginController {
    private final QrLoginService qrLoginService;

    public QrLoginController(QrLoginService qrLoginService) {
        this.qrLoginService = qrLoginService;
    }

    @GetMapping("/approve.do")
    public String approvePage(String token) {
        return "redirect:/service-login-page.do?qr_token=" + safeToken(token);
    }

    @PostMapping("/create.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> create(HttpServletRequest request, HttpServletResponse response) {
        applyNoStore(response);
        if (!CsrfOriginSupport.isSameOriginRequest(request)) {
            return ApiResponse.fail("FORBIDDEN", "허용되지 않은 출처의 QR 로그인 요청입니다.", null, request);
        }
        return ApiResponse.ok(qrLoginService.create(request), request);
    }

    @PostMapping("/status.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> status(
        @RequestBody Map<String, Object> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        applyNoStore(response);
        if (!CsrfOriginSupport.isSameOriginRequest(request)) {
            return ApiResponse.fail("FORBIDDEN", "허용되지 않은 출처의 QR 로그인 요청입니다.", null, request);
        }
        return ApiResponse.ok(qrLoginService.status(text(body, "request_id"), request), request);
    }

    @PostMapping("/approve.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> approve(
        @RequestBody Map<String, Object> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        applyNoStore(response);
        if (!CsrfOriginSupport.isSameOriginRequest(request)) {
            return ApiResponse.fail("FORBIDDEN", "허용되지 않은 출처의 QR 로그인 요청입니다.", null, request);
        }
        return ApiResponse.ok(qrLoginService.approve(text(body, "token"), request, response), request);
    }

    @PostMapping("/consume.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> consume(
        @RequestBody Map<String, Object> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        applyNoStore(response);
        if (!CsrfOriginSupport.isSameOriginRequest(request)) {
            return ApiResponse.fail("FORBIDDEN", "허용되지 않은 출처의 QR 로그인 요청입니다.", null, request);
        }
        ApiResponse<Map<String, Object>> result = qrLoginService.consume(text(body, "request_id"), request);
        if (result != null && result.isOk() && result.getData() != null) {
            AuthCookieSupport.writeAuthCookies(
                request,
                response,
                text(result.getData(), "token"),
                text(result.getData(), "refresh_token"),
                text(result.getData(), "session_id")
            );
        }
        return result == null ? ApiResponse.ok(Collections.<String, Object>emptyMap(), request) : result;
    }

    private String text(Map<String, Object> body, String key) {
        if (body == null) return null;
        Object value = body.get(key);
        if (value == null) return null;
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? null : text;
    }

    private String safeToken(String token) {
        if (token == null) return "";
        return token.trim().replaceAll("[^A-Za-z0-9_-]", "");
    }

    private void applyNoStore(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
    }
}
