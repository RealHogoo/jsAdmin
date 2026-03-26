package com.realhogoo.jsadmin.user.web;

import com.realhogoo.jsadmin.user.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Controller
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/user/main.do")
    public String main() {
        return "fragments/user/main";
    }

    @PostMapping("/user/list.json")
    @ResponseBody
    public Map<String, Object> list(@RequestBody(required = false) Map<String, Object> param) {
        return ok(userService.getUserList(param));
    }

    @PostMapping("/user/detail.json")
    @ResponseBody
    public Map<String, Object> detail(@RequestBody Map<String, Object> body) {
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(userService.getUserDetail(userSeq));
    }

    @PostMapping("/user/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = userService.saveUser(body, actor);
        return ok(Collections.singletonMap("user_seq", userSeq));
    }

    @PostMapping("/user/delete.json")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(Collections.singletonMap("deleted", userService.deactivateUser(userSeq, actor)));
    }

    @PostMapping("/user/unlock.json")
    @ResponseBody
    public Map<String, Object> unlock(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(Collections.singletonMap("unlocked", userService.unlockUser(userSeq, actor)));
    }

    @PostMapping("/user/resetPassword.json")
    @ResponseBody
    public Map<String, Object> resetPassword(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(Collections.singletonMap("reset", userService.resetPassword(userSeq, actor)));
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return Long.valueOf(s);
    }
}
