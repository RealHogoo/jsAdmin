package com.realhogoo.jsadmin.auth.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import com.realhogoo.jsadmin.auth.service.AuthService;

import java.util.Map;

@Controller
public class LoginController {

    private final AuthService authService;

    public LoginController(AuthService authService) {
        this.authService = authService;
    }
    
    @ResponseBody
    @RequestMapping(value = "/login.json", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
    public Map<String, Object> login(@RequestBody Map<String, Object> body) {
        String userId = body.get("user_id") == null ? null : String.valueOf(body.get("user_id"));
        String userPw = body.get("user_pw") == null ? null : String.valueOf(body.get("user_pw"));
        if (userId == null || userId.trim().isEmpty() || userPw == null) {
            return Map.of("ok", false, "code", "BAD_REQUEST", "message", "user_id/user_pw 필요", "data", null);
        }

        return authService.login(userId.trim(), userPw);
    }
}
