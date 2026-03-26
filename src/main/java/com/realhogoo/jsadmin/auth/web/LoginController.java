package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.auth.service.AuthService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

@Controller
public class LoginController {

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
            return Map.of("ok", false, "code", "BAD_REQUEST", "message", "아이디 또는 비밀번호를 확인하세요.", "data", null);
        }

        return authService.login(userId.trim(), userPw, request);
    }
}
