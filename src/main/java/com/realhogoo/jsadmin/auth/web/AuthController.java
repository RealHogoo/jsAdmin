package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.auth.AuthRequestSupport;
import com.realhogoo.jsadmin.auth.service.AuthService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/auth")
public class AuthController {
    private static final int MAX_KEYWORD_LENGTH = 100;
    private static final int MAX_REFRESH_TOKEN_LENGTH = 128;

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/main.do")
    public String main() {
        return "fragments/auth/main";
    }

    @PostMapping("/group/save.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> groupSave(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long authGroupSeq = authService.saveAuthGroup(body, AuthRequestSupport.userId(request));
        return ApiResponse.ok(Collections.<String, Object>singletonMap("auth_group_seq", authGroupSeq), request);
    }

    @PostMapping("/group/delete.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> groupDelete(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long authGroupSeq = toLong(firstNonNull(body, "auth_group_seq", "authGroupSeq"));
        int deleted = authService.deleteAuthGroup(authGroupSeq, AuthRequestSupport.userId(request));
        return ApiResponse.ok(Collections.<String, Object>singletonMap("deleted", deleted), request);
    }

    @PostMapping("/group/list.json")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> groupList(
        @RequestBody(required = false) Map<String, Object> body,
        HttpServletRequest request
    ) {
        AuthRequestSupport.ensureAdmin(request);
        if (body == null) body = new HashMap<String, Object>();
        validateLength("keyword", toStringValue(body.get("keyword")), MAX_KEYWORD_LENGTH);
        return ApiResponse.ok(authService.getAuthGroupList(body), request);
    }

    @PostMapping("/group/menu/list.json")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> groupMenuList(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long authGroupSeq = toLong(firstNonNull(body, "auth_group_seq", "authGroupSeq"));
        return ApiResponse.ok(authService.getGroupMenuPermList(authGroupSeq), request);
    }

    @PostMapping("/group/menu/save.json")
    @ResponseBody
    public ApiResponse<Map<String, Integer>> groupMenuSave(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        Long authGroupSeq = toLong(firstNonNull(body, "auth_group_seq", "authGroupSeq"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) firstNonNull(body, "items", "page", "rows");
        if (items == null) {
            throw new IllegalArgumentException("items(page/rows) is required");
        }

        String actor = (String) req.getAttribute("user_id");
        int saved = authService.saveGroupMenuPerm(authGroupSeq, items, actor);
        return ApiResponse.ok(Collections.singletonMap("saved", saved), req);
    }

    @PostMapping("/group/service/list.json")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> groupServiceList(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long authGroupSeq = toLong(firstNonNull(body, "auth_group_seq", "authGroupSeq"));
        return ApiResponse.ok(authService.getGroupServicePermList(authGroupSeq), request);
    }

    @PostMapping("/group/service/save.json")
    @ResponseBody
    public ApiResponse<Map<String, Integer>> groupServiceSave(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long authGroupSeq = toLong(firstNonNull(body, "auth_group_seq", "authGroupSeq"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) firstNonNull(body, "items", "rows");
        if (items == null) {
            throw new IllegalArgumentException("items(rows) is required");
        }
        String actor = AuthRequestSupport.userId(request);
        int saved = authService.saveGroupServicePerm(authGroupSeq, items, actor);
        return ApiResponse.ok(Collections.singletonMap("saved", saved), request);
    }

    @PostMapping("/user/search.json")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> searchUsers(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        validateLength("keyword", toStringValue(body == null ? null : body.get("keyword")), MAX_KEYWORD_LENGTH);
        return ApiResponse.ok(authService.searchUsers(body), request);
    }

    @PostMapping("/user/menuPermList.json")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> userMenuPermList(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long userSeq = toLong(body.get("user_seq"));
        return ApiResponse.ok(authService.getUserMenuPermList(userSeq), request);
    }

    @PostMapping("/user/exception/save.json")
    @ResponseBody
    public ApiResponse<Map<String, Integer>> saveExceptions(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        Long userSeq = toLong(body.get("user_seq"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exceptions = (List<Map<String, Object>>) body.get("exceptions");

        String actor = (String) req.getAttribute("user_id");
        authService.saveUserExceptions(userSeq, exceptions, actor);
        return ApiResponse.ok(Collections.singletonMap("saved", exceptions == null ? 0 : exceptions.size()), req);
    }

    @PostMapping("/user/servicePermList.json")
    @ResponseBody
    public ApiResponse<List<Map<String, Object>>> userServicePermList(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long userSeq = toLong(body.get("user_seq"));
        return ApiResponse.ok(authService.getUserServicePermList(userSeq), request);
    }

    @PostMapping("/user/serviceException/save.json")
    @ResponseBody
    public ApiResponse<Map<String, Integer>> saveServiceExceptions(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long userSeq = toLong(body.get("user_seq"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exceptions = (List<Map<String, Object>>) body.get("exceptions");
        String actor = AuthRequestSupport.userId(request);
        authService.saveUserServiceExceptions(userSeq, exceptions, actor);
        return ApiResponse.ok(Collections.singletonMap("saved", exceptions == null ? 0 : exceptions.size()), request);
    }

    @PostMapping("/user/exception/delete.json")
    @ResponseBody
    public ApiResponse<Map<String, Integer>> deleteException(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long userSeq = toLong(body.get("user_seq"));
        Long menuSeq = toLong(body.get("menu_seq"));
        authService.deleteUserException(userSeq, menuSeq);
        return ApiResponse.ok(Collections.singletonMap("deleted", 1), request);
    }

    @PostMapping("/refresh.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> refresh(
        @RequestBody(required = false) Map<String, Object> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        String refreshToken = body == null ? null : toStringValue(firstNonNull(body, "refresh_token", "refreshToken"));
        if (refreshToken == null) {
            refreshToken = AuthCookieSupport.readCookie(request, AuthCookieSupport.REFRESH_TOKEN_COOKIE);
        }
        validateLength("refresh_token", refreshToken, MAX_REFRESH_TOKEN_LENGTH);
        ApiResponse<Map<String, Object>> result = authService.refresh(refreshToken, request);
        applyNoStore(response);
        if (result != null && result.isOk() && result.getData() != null) {
            AuthCookieSupport.writeAuthCookies(
                request,
                response,
                toStringValue(result.getData().get("token")),
                toStringValue(result.getData().get("refresh_token")),
                toStringValue(result.getData().get("session_id"))
            );
        } else {
            AuthCookieSupport.clearAuthCookies(request, response);
        }
        return result;
    }

    @PostMapping("/me.json")
    @ResponseBody
    public ApiResponse<Map<String, Object>> me(HttpServletRequest request, HttpServletResponse response) {
        applyNoStore(response);
        String userId = toStringValue(request.getAttribute("user_id"));
        String sessionId = toStringValue(request.getAttribute("session_id"));
        @SuppressWarnings("unchecked")
        List<String> roles = (List<String>) request.getAttribute("roles");
        return ApiResponse.ok(authService.me(userId, roles, sessionId), request);
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(String.valueOf(v));
    }

    private Object firstNonNull(Map<String, Object> body, String... keys) {
        for (String key : keys) {
            Object v = body.get(key);
            if (v != null) return v;
        }
        return null;
    }

    private String toStringValue(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : s;
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }

    private void applyNoStore(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
    }
}
