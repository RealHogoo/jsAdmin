package com.realhogoo.jsadmin.access.web;

import com.realhogoo.jsadmin.access.service.AccessService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Controller
public class AccessController {

    private final AccessService accessService;

    public AccessController(AccessService accessService) {
        this.accessService = accessService;
    }

    @PostMapping("/access/main.do")
    public String main() {
        return "fragments/access/main";
    }

    @PostMapping("/access/session/list.json")
    @ResponseBody
    public Map<String, Object> sessionList(@RequestBody(required = false) Map<String, Object> param) {
        return ok(accessService.getLoginSessionList(param));
    }

    @PostMapping("/access/history/list.json")
    @ResponseBody
    public Map<String, Object> historyList(@RequestBody(required = false) Map<String, Object> param) {
        return ok(accessService.getLoginHistoryList(param));
    }

    @PostMapping("/access/session/expire.json")
    @ResponseBody
    public Map<String, Object> expireSession(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String sessionId = stringValue(body == null ? null : body.get("session_id"));
        String actor = stringValue(request.getAttribute("user_id"));
        int expired = accessService.expireSession(sessionId, actor);
        return ok(Collections.singletonMap("expired", expired));
    }

    @PostMapping("/access/session/expireUser.json")
    @ResponseBody
    public Map<String, Object> expireUserSessions(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String loginId = stringValue(body == null ? null : body.get("login_id"));
        String actor = stringValue(request.getAttribute("user_id"));
        int expired = accessService.expireSessionsByLoginId(loginId, actor);
        return ok(Collections.singletonMap("expired", expired));
    }

    @PostMapping("/logout.json")
    @ResponseBody
    public Map<String, Object> logout(HttpServletRequest request) {
        String sessionId = stringValue(request.getAttribute("session_id"));
        String actor = stringValue(request.getAttribute("user_id"));
        int expired = accessService.logout(sessionId, actor, request);
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
}
