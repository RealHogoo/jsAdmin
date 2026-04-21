package com.realhogoo.jsadmin.access.web;

import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.auth.AuthRequestSupport;
import com.realhogoo.jsadmin.auth.service.AuthService;
import com.realhogoo.jsadmin.auth.web.AuthCookieSupport;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Controller
public class AccessController {
    private static final int MAX_SESSION_ID_LENGTH = 64;
    private static final int MAX_LOGIN_ID_LENGTH = 100;
    private static final int MAX_STATUS_LENGTH = 20;
    private static final int MAX_RESULT_CODE_LENGTH = 20;
    private static final int MAX_KEYWORD_LENGTH = 400;
    private static final int DATE_LENGTH = 10;

    private final AccessService accessService;
    private final AuthService authService;

    public AccessController(AccessService accessService, AuthService authService) {
        this.accessService = accessService;
        this.authService = authService;
    }

    @PostMapping("/access/main.do")
    public String main() {
        return "fragments/access/main";
    }

    @PostMapping("/access/session/list.json")
    @ResponseBody
    public Map<String, Object> sessionList(@RequestBody(required = false) Map<String, Object> param, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        validateAccessSearch(param, false);
        return ok(accessService.getLoginSessionList(param));
    }

    @PostMapping("/access/history/list.json")
    @ResponseBody
    public Map<String, Object> historyList(@RequestBody(required = false) Map<String, Object> param, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        validateAccessSearch(param, true);
        return ok(accessService.getLoginHistoryList(param));
    }

    @PostMapping("/access/session/expire.json")
    @ResponseBody
    public Map<String, Object> expireSession(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        String sessionId = stringValue(body == null ? null : body.get("session_id"));
        validateLength("session_id", sessionId, MAX_SESSION_ID_LENGTH);
        String actor = stringValue(request.getAttribute("user_id"));
        int expired = accessService.expireSession(sessionId, actor);
        return ok(Collections.singletonMap("expired", expired));
    }

    @PostMapping("/access/session/expireUser.json")
    @ResponseBody
    public Map<String, Object> expireUserSessions(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        String loginId = stringValue(body == null ? null : body.get("login_id"));
        validateLength("login_id", loginId, MAX_LOGIN_ID_LENGTH);
        String actor = stringValue(request.getAttribute("user_id"));
        int expired = accessService.expireSessionsByLoginId(loginId, actor);
        return ok(Collections.singletonMap("expired", expired));
    }

    @PostMapping("/logout.json")
    @ResponseBody
    public Map<String, Object> logout(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = stringValue(request.getAttribute("session_id"));
        String actor = stringValue(request.getAttribute("user_id"));
        int expired = accessService.logout(sessionId, actor, request);
        authService.revokeRefreshTokensBySessionId(sessionId, actor);
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
        AuthCookieSupport.clearAuthCookies(request, response);
        return ok(Collections.singletonMap("logout", expired));
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private String stringValue(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? null : s;
    }

    private void validateAccessSearch(Map<String, Object> param, boolean history) {
        if (param == null) {
            return;
        }
        validateLength("keyword", stringValue(param.get("keyword")), MAX_KEYWORD_LENGTH);
        if (history) {
            validateLength("result_cd", stringValue(param.get("result_cd")), MAX_RESULT_CODE_LENGTH);
            validateDate("from_dt", stringValue(param.get("from_dt")));
            validateDate("to_dt", stringValue(param.get("to_dt")));
            return;
        }
        validateLength("status_cd", stringValue(param.get("status_cd")), MAX_STATUS_LENGTH);
    }

    private void validateDate(String field, String value) {
        if (value == null) {
            return;
        }
        if (value.length() != DATE_LENGTH || !value.matches("\\d{4}-\\d{2}-\\d{2}")) {
            throw new IllegalArgumentException(field + " must be yyyy-MM-dd");
        }
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}
