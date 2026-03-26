package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.auth.service.AuthService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/main.do")
    public String main() {
        return "fragments/auth/main";
    }

    @PostMapping("/group/list.json")
    @ResponseBody
    public Map<String, Object> groupList(@RequestBody(required = false) Map<String, Object> body) {
        if (body == null) body = new HashMap<>();
        return ok(authService.getAuthGroupList(body));
    }

    @PostMapping("/group/menu/list.json")
    @ResponseBody
    public Map<String, Object> groupMenuList(@RequestBody Map<String, Object> body) {
        Long authGroupSeq = toLong(firstNonNull(body, "auth_group_seq", "authGroupSeq"));
        return ok(authService.getGroupMenuPermList(authGroupSeq));
    }

    @PostMapping("/group/menu/save.json")
    @ResponseBody
    public Map<String, Object> groupMenuSave(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        Long authGroupSeq = toLong(firstNonNull(body, "auth_group_seq", "authGroupSeq"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items =
            (List<Map<String, Object>>) firstNonNull(body, "items", "page", "rows");
        if (items == null) {
            throw new IllegalArgumentException("items(page/rows) is required");
        }

        String actor = (String) req.getAttribute("user_id");
        int saved = authService.saveGroupMenuPerm(authGroupSeq, items, actor);
        return ok(Collections.singletonMap("saved", saved));
    }

    @PostMapping("/user/search.json")
    @ResponseBody
    public Map<String, Object> searchUsers(@RequestBody Map<String, Object> body) {
        return ok(authService.searchUsers(body));
    }

    @PostMapping("/user/menuPermList.json")
    @ResponseBody
    public Map<String, Object> userMenuPermList(@RequestBody Map<String, Object> body) {
        Long userSeq = toLong(body.get("user_seq"));
        return ok(authService.getUserMenuPermList(userSeq));
    }

    @PostMapping("/user/exception/save.json")
    @ResponseBody
    public Map<String, Object> saveExceptions(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        Long userSeq = toLong(body.get("user_seq"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exceptions = (List<Map<String, Object>>) body.get("exceptions");

        String actor = (String) req.getAttribute("user_id");
        authService.saveUserExceptions(userSeq, exceptions, actor);
        return ok(Collections.singletonMap("saved", exceptions == null ? 0 : exceptions.size()));
    }

    @PostMapping("/user/exception/delete.json")
    @ResponseBody
    public Map<String, Object> deleteException(@RequestBody Map<String, Object> body) {
        Long userSeq = toLong(body.get("user_seq"));
        Long menuSeq = toLong(body.get("menu_seq"));
        authService.deleteUserException(userSeq, menuSeq);
        return ok(Collections.singletonMap("deleted", 1));
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
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
}
