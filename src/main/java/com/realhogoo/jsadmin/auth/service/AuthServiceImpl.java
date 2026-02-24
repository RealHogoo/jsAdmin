package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.jwt.JwtProvider;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("authService")
public class AuthServiceImpl implements AuthService {

    private final AuthMapper authMapper;
    private final JwtProvider jwtProvider;

    public AuthServiceImpl(AuthMapper authMapper, JwtProvider jwtProvider) {
        this.authMapper = authMapper;
        this.jwtProvider = jwtProvider;
    }

    @Override
    public List<Map<String, Object>> getAuthGroupList(Map<String, Object> param) {
        if (param == null) param = new HashMap<>();
        return authMapper.selectAuthGroupList(param);
    }

    @Override
    public List<Map<String, Object>> getGroupMenuPermList(Long authGroupSeq) {
        if (authGroupSeq == null) return Collections.emptyList();
        return authMapper.selectGroupMenuPermList(authGroupSeq);
    }

    @Override
    @Transactional
    public int saveGroupMenuPerm(Long authGroupSeq, List<Map<String, Object>> items, String actor) {
        if (authGroupSeq == null) {
            throw new IllegalArgumentException("auth_group_seq is required");
        }
        if (items == null) {
            throw new IllegalArgumentException("items is required");
        }
        String safeActor = (actor == null || actor.trim().isEmpty()) ? "SYSTEM" : actor.trim();

        int saved = 0;
        for (Map<String, Object> it : items) {
            if (it == null) continue;

            Long menuSeq = toLong(firstNonNull(it, "menu_seq", "menuSeq"));
            Integer permLvl = toInt(firstNonNull(it, "perm_lvl", "permLvl"));
            String useYn = toStr(firstNonNull(it, "use_yn", "useYn"), "Y");

            if (menuSeq == null) continue;

            if (!"Y".equalsIgnoreCase(useYn) || permLvl == null || permLvl <= 0) {
                Map<String, Object> disableOne = new HashMap<>();
                disableOne.put("auth_group_seq", authGroupSeq);
                disableOne.put("menu_seq", menuSeq);
                disableOne.put("updated_by", safeActor);
                authMapper.disableGroupMenuPerm(disableOne);
                continue;
            }

            Map<String, Object> upsert = new HashMap<>();
            upsert.put("auth_group_seq", authGroupSeq);
            upsert.put("menu_seq", menuSeq);
            upsert.put("perm_lvl", permLvl);
            upsert.put("use_yn", "Y");
            upsert.put("updated_by", safeActor);
            upsert.put("created_by", safeActor);
            int affected = authMapper.updateGroupMenuPerm(upsert);
            if (affected == 0) {
                affected = authMapper.insertGroupMenuPerm(upsert);
            }
            if (affected > 0) {
                saved++;
            }
        }
        return saved;
    }

    @Override
    public List<Map<String, Object>> searchUsers(Map<String, Object> param) {
        if (param == null) param = new HashMap<>();
        return authMapper.searchUsers(param);
    }

    @Override
    public List<Map<String, Object>> getUserMenuPermList(Long userSeq) {
        if (userSeq == null) return Collections.emptyList();
        return authMapper.selectUserMenuPermList(userSeq);
    }

    @Override
    @Transactional
    public void saveUserExceptions(Long userSeq, List<Map<String, Object>> exceptions, String actor) {
        authMapper.saveUserExceptions(userSeq, exceptions, actor);
    }

    @Override
    @Transactional
    public void deleteUserException(Long userSeq, Long menuSeq) {
        authMapper.deleteUserException(userSeq, menuSeq);
    }

    @Override
    public Map<String, Object> login(String userId, String userPw) {
        LoginUser u = authMapper.selectUserForLogin(userId);
        if (u == null) {
            return fail("LOGIN_FAIL", "사용자 정보가 올바르지 않습니다.");
        }

        if (u.getUserPw() == null || !u.getUserPw().equals(userPw)) {
            return fail("LOGIN_FAIL", "사용자 정보가 올바르지 않습니다.");
        }

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

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(String.valueOf(v));
    }

    private Integer toInt(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).intValue();
        return Integer.parseInt(String.valueOf(v));
    }

    private String toStr(Object v, String def) {
        if (v == null) return def;
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? def : s;
    }

    private Object firstNonNull(Map<String, Object> map, String... keys) {
        for (String key : keys) {
            Object v = map.get(key);
            if (v != null) return v;
        }
        return null;
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
