package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.jwt.JwtProvider;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service("authService")
public class AuthServiceImpl implements AuthService {

    private final AuthMapper authMapper;
    private final JwtProvider jwtProvider;

    public AuthServiceImpl(AuthMapper authMapper, JwtProvider jwtProvider) {
        this.authMapper = authMapper;
        this.jwtProvider = jwtProvider;
    }

    /* =========================
     * TAB A: 그룹-메뉴 권한
     * ========================= */

    @Override
    public List<Map<String, Object>> getAuthGroupList(Map<String, Object> param) {
        if (param == null) param = new HashMap<>();
        return authMapper.selectAuthGroupList(param);
    }

    @Override
    public List<Map<String, Object>> getGroupMenuPermList(Long authGroupSeq) {
        if (authGroupSeq == null) {
            return Collections.emptyList();
        }
        return authMapper.selectGroupMenuPermList(authGroupSeq);
    }

    @Override
    @Transactional
    public int saveGroupMenuPerm(Long authGroupSeq, List<Map<String, Object>> items, String actor) {
        if (authGroupSeq == null) {
            throw new IllegalArgumentException("auth_group_seq is required");
        }

        // 1) 일괄 비활성화
        Map<String, Object> p = new HashMap<>();
        p.put("auth_group_seq", authGroupSeq);
        p.put("updated_by", actor);
        authMapper.disableAllGroupMenuPerm(p);

        // 2) 활성(Y) + perm>0 만 MERGE
        if (items == null || items.isEmpty()) {
            return 0;
        }

        int saved = 0;
        for (Map<String, Object> it : items) {
            if (it == null) continue;

            Long menuSeq = toLong(it.get("menu_seq"));
            Integer permLvl = toInt(it.get("perm_lvl"));
            String useYn = toStr(it.get("use_yn"), "Y");

            if (menuSeq == null) continue;

            // 저장 대상 필터
            if (!"Y".equalsIgnoreCase(useYn)) continue;
            if (permLvl == null || permLvl <= 0) continue;

            Map<String, Object> m = new HashMap<>();
            m.put("auth_group_seq", authGroupSeq);
            m.put("menu_seq", menuSeq);
            m.put("perm_lvl", permLvl);
            m.put("use_yn", "Y");
            m.put("updated_by", actor);
            m.put("created_by", actor);

            authMapper.mergeGroupMenuPerm(m);
            saved++;
        }

        return saved;
    }

    /* =========================
     * TAB B: 사용자 예외 (네 기존 구현 있으면 그대로 사용해도 됨)
     * ========================= */

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
        // TAB B는 다음 단계에서 확정하자 (mapper/xml까지 같이 맞춰야 함)
        authMapper.saveUserExceptions(userSeq, exceptions, actor);
    }

    @Override
    @Transactional
    public void deleteUserException(Long userSeq, Long menuSeq) {
        authMapper.deleteUserException(userSeq, menuSeq);
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
