package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.auth.service.AuthService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class LoginController {
    private static final int MAX_LOGIN_ID_LENGTH = 100;
    private static final int MAX_PASSWORD_LENGTH = 1000;

    private final AuthService authService;

    public LoginController(AuthService authService) {
        this.authService = authService;
    }

    @ResponseBody
    @RequestMapping(value = "/login.json", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
    public Map<String, Object> login(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String userId = body.get("user_id") == null ? null : String.valueOf(body.get("user_id"));
        String userPw = body.get("user_pw") == null ? null : String.valueOf(body.get("user_pw"));
        if (userId == null || userId.trim().isEmpty() || userPw == null) {
            Map<String, Object> res = new HashMap<String, Object>();
            res.put("ok", false);
            res.put("code", "BAD_REQUEST");
            res.put("message", "아이디 또는 비밀번호를 확인해 주세요.");
            res.put("data", null);
            return res;
        }
        validateLength("user_id", userId.trim(), MAX_LOGIN_ID_LENGTH);
        validateLength("user_pw", userPw, MAX_PASSWORD_LENGTH);
        return authService.login(userId.trim(), userPw, request);
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}