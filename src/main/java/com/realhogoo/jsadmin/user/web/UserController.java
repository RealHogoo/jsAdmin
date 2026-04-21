package com.realhogoo.jsadmin.user.web;

import com.realhogoo.jsadmin.auth.AuthRequestSupport;
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
    private static final int MAX_LOGIN_ID_LENGTH = 100;
    private static final int MAX_USER_NAME_LENGTH = 100;

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
    public Map<String, Object> list(@RequestBody(required = false) Map<String, Object> param, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        return ok(userService.getUserList(param));
    }

    @PostMapping("/user/options.json")
    @ResponseBody
    public Map<String, Object> options(@RequestBody(required = false) Map<String, Object> param, HttpServletRequest request) {
        return ok(userService.getUserOptions(param));
    }

    @PostMapping("/user/detail.json")
    @ResponseBody
    public Map<String, Object> detail(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(userService.getUserDetail(userSeq));
    }

    @PostMapping("/user/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        String loginId = toNullableString(body == null ? null : body.get("login_id"));
        String userNm = toNullableString(body == null ? null : body.get("user_nm"));
        if (loginId == null) {
            throw new IllegalArgumentException("login_id is required");
        }
        if (userNm == null) {
            throw new IllegalArgumentException("user_nm is required");
        }
        validateLength("login_id", loginId, MAX_LOGIN_ID_LENGTH);
        validateLength("user_nm", userNm, MAX_USER_NAME_LENGTH);
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = userService.saveUser(body, actor);
        return ok(Collections.singletonMap("user_seq", userSeq));
    }

    @PostMapping("/user/delete.json")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(Collections.singletonMap("deleted", userService.deactivateUser(userSeq, actor)));
    }

    @PostMapping("/user/unlock.json")
    @ResponseBody
    public Map<String, Object> unlock(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(Collections.singletonMap("unlocked", userService.unlockUser(userSeq, actor)));
    }

    @PostMapping("/user/resetPassword.json")
    @ResponseBody
    public Map<String, Object> resetPassword(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long userSeq = toLong(body == null ? null : body.get("user_seq"));
        return ok(userService.resetPassword(userSeq, actor));
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

    private String toNullableString(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return s;
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}
