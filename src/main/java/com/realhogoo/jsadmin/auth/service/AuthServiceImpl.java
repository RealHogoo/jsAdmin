package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.jwt.JwtProvider;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service("authService")
public class AuthServiceImpl implements AuthService {

    private final AuthMapper authMapper;
    private final JwtProvider jwtProvider;

    public AuthServiceImpl(AuthMapper authMapper, JwtProvider jwtProvider) {
        this.authMapper = authMapper;
        this.jwtProvider = jwtProvider;
    }

    @Override
    public Map<String, Object> login(String userId, String userPw) {
        LoginUser u = authMapper.selectUserForLogin(userId);
        if (u == null) {
            return fail("LOGIN_FAIL", "사용자 정보가 올바르지 않습니다.");
        }

        // 최소 기능: 우선 평문 비교(운영에선 해시 필수)
        if (u.getUserPw() == null || !u.getUserPw().equals(userPw)) {
            return fail("LOGIN_FAIL", "사용자 정보가 올바르지 않습니다.");
        }

        // 권한: 최소 단계에서는 고정 or 추후 roles 조회 추가
        List<String> roles = Arrays.asList("ROLE_ADMIN");

        String token = jwtProvider.createToken(u.getUserId(), roles);

        Map<String, Object> user = new HashMap<>();
        user.put("user_id", u.getUserId());
        user.put("roles", roles);

        Map<String, Object> data = new HashMap<>();
        data.put("token", token);
        data.put("user", user);

        return ok(data);
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private Map<String, Object> fail(String code, String msg) {
        Map<String, Object> res = new HashMap<>();
        res.put("ok", false);
        res.put("code", code);
        res.put("message", msg);
        res.put("data", null);
        return res;
    }
}
