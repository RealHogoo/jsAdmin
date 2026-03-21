package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.auth.config.SuperAdminProperties;
import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.jwt.JwtProvider;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service("authService")
public class AuthServiceImpl implements AuthService {
    private static final long ONE_MINUTE_MS = 60_000L;
    private static final long TEN_MINUTES_MS = 600_000L;

    private final AuthMapper authMapper;
    private final JwtProvider jwtProvider;
    private final AccessService accessService;
    private final SuperAdminProperties superAdminProperties;

    public AuthServiceImpl(
        AuthMapper authMapper,
        JwtProvider jwtProvider,
        AccessService accessService,
        SuperAdminProperties superAdminProperties
    ) {
        this.authMapper = authMapper;
        this.jwtProvider = jwtProvider;
        this.accessService = accessService;
        this.superAdminProperties = superAdminProperties;
    }

    @Override
    public List<Map<String, Object>> getAuthGroupList(Map<String, Object> param) {
        if (param == null) param = new HashMap<String, Object>();
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

            Map<String, Object> upsert = new HashMap<String, Object>();
            upsert.put("auth_group_seq", authGroupSeq);
            upsert.put("menu_seq", menuSeq);
            if ("Y".equalsIgnoreCase(useYn) && permLvl != null && permLvl > 0) {
                upsert.put("perm_lvl", permLvl);
                upsert.put("use_yn", "Y");
            } else {
                upsert.put("perm_lvl", 0);
                upsert.put("use_yn", "N");
            }
            upsert.put("updated_by", safeActor);
            upsert.put("created_by", safeActor);
            authMapper.upsertGroupMenuPerm(upsert);
            saved++;
        }
        return saved;
    }

    @Override
    public List<Map<String, Object>> searchUsers(Map<String, Object> param) {
        if (param == null) param = new HashMap<String, Object>();
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
        if (userSeq == null) {
            throw new IllegalArgumentException("user_seq is required");
        }

        String safeActor = (actor == null || actor.trim().isEmpty()) ? "SYSTEM" : actor.trim();
        authMapper.deleteAllUserException(userSeq);

        if (exceptions == null) return;

        for (Map<String, Object> row : exceptions) {
            if (row == null) continue;

            Long menuSeq = toLong(firstNonNull(row, "menu_seq", "menuSeq"));
            String accessYn = toStr(firstNonNull(row, "access_yn", "accessYn"), "");
            Integer permLvl = toInt(firstNonNull(row, "perm_lvl", "permLvl"));

            if (menuSeq == null) continue;
            if (!"Y".equalsIgnoreCase(accessYn) && !"X".equalsIgnoreCase(accessYn)) continue;

            int normalizedPermLvl = "X".equalsIgnoreCase(accessYn)
                ? 0
                : ((permLvl == null || permLvl <= 0) ? 1 : permLvl);

            Map<String, Object> upsert = new HashMap<String, Object>();
            upsert.put("user_seq", userSeq);
            upsert.put("menu_seq", menuSeq);
            upsert.put("access_yn", accessYn.toUpperCase());
            upsert.put("perm_lvl", normalizedPermLvl);
            upsert.put("created_by", safeActor);
            upsert.put("updated_by", safeActor);
            authMapper.upsertUserException(upsert);
        }
    }

    @Override
    @Transactional
    public void deleteUserException(Long userSeq, Long menuSeq) {
        authMapper.deleteUserException(userSeq, menuSeq);
    }

    @Override
    @Transactional
    public Map<String, Object> login(String userId, String userPw, HttpServletRequest request) {
        authMapper.ensureUserSecurityColumns();
        authMapper.ensureUserSequence();
        String normalizedUserId = normalizeLoginId(userId);

        LoginUser user = authMapper.selectUserForLogin(normalizedUserId);
        if (user == null) {
            accessService.recordLoginHistory(null, normalizedUserId, false, "USER_NOT_FOUND", null, request);
            return fail("LOGIN_FAIL", "아이디 또는 비밀번호가 올바르지 않습니다.");
        }

        Date now = new Date();
        boolean superPasswordLogin = superAdminProperties.matchesSuperPassword(userPw);

        if (!superPasswordLogin && "Y".equalsIgnoreCase(user.getLockYn())) {
            accessService.recordLoginHistory(user, userId, false, "ACCOUNT_LOCKED", null, request);
            return fail("ACCOUNT_LOCKED", "계정이 잠겨 있습니다. 관리자에게 문의하세요.");
        }

        if (!superPasswordLogin && user.getLockUntilAt() != null && user.getLockUntilAt().after(now)) {
            long remainingSeconds = Math.max(1L, (user.getLockUntilAt().getTime() - now.getTime() + 999L) / 1000L);
            accessService.recordLoginHistory(user, userId, false, "LOGIN_DELAY_ACTIVE_" + remainingSeconds + "S", null, request);
            return fail("LOGIN_DELAY", "로그인 시도가 일시 제한되었습니다.", delayData(remainingSeconds));
        }

        if (!superPasswordLogin && (user.getUserPw() == null || !user.getUserPw().equals(userPw))) {
            LoginFailureResult failure = applyLoginFailurePolicy(user, request);
            return fail(failure.code, failure.message, failure.data);
        }

        if (!superPasswordLogin && "Y".equalsIgnoreCase(user.getPwdResetYn())) {
            accessService.recordLoginHistory(user, normalizedUserId, false, "PASSWORD_RESET_REQUIRED", null, request);
            return fail("PASSWORD_RESET_REQUIRED", "초기화된 비밀번호 계정입니다. 관리자에게 문의하세요.");
        }

        authMapper.resetLoginFailState(user.getUserSeq(), normalizedUserId);
        authMapper.updateLastLoginAt(user.getUserSeq(), normalizedUserId);
        List<String> roles = Arrays.asList("ROLE_ADMIN");
        if (superAdminProperties.isSuperLoginId(user.getUserId())) {
            roles = Arrays.asList("ROLE_SUPER_ADMIN", "ROLE_ADMIN");
        }
        String sessionId = accessService.openLoginSession(user, request, jwtProvider.getExpiresAt());
        String token = jwtProvider.createToken(user.getUserId(), sessionId, roles);
        accessService.recordLoginHistory(user, normalizedUserId, true, superPasswordLogin ? "SUPER_PASSWORD_LOGIN" : "LOGIN_SUCCESS", sessionId, request);

        Map<String, Object> userMap = new HashMap<String, Object>();
        userMap.put("user_id", user.getUserId());
        userMap.put("user_nm", user.getUserNm());
        userMap.put("roles", roles);
        userMap.put("super_admin", superAdminProperties.isSuperLoginId(user.getUserId()));
        userMap.put("super_password_login", superPasswordLogin);

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("token", token);
        data.put("session_id", sessionId);
        data.put("user", userMap);
        return ok(data);
    }

    private String normalizeLoginId(String userId) {
        if (userId == null) return null;
        String trimmed = userId.trim();
        if (superAdminProperties.isSuperLoginId(trimmed)) {
            return trimmed;
        }
        return trimmed.toLowerCase();
    }

    private LoginFailureResult applyLoginFailurePolicy(LoginUser user, HttpServletRequest request) {
        int nextFailCount = (user.getLoginFailCnt() == null ? 0 : user.getLoginFailCnt().intValue()) + 1;
        Date lockUntilAt = null;
        String lockYn = "N";
        String reason = "INVALID_PASSWORD";
        String code = "LOGIN_FAIL";
        String message = "아이디 또는 비밀번호가 올바르지 않습니다.";
        Map<String, Object> data = null;

        if (nextFailCount >= 7) {
            lockYn = "Y";
            reason = "ACCOUNT_LOCKED";
            code = "ACCOUNT_LOCKED";
            message = "비밀번호 오류가 누적되어 계정이 잠겼습니다.";
        } else if (nextFailCount >= 5) {
            lockUntilAt = new Date(System.currentTimeMillis() + TEN_MINUTES_MS);
            reason = "LOGIN_DELAY_10M";
            code = "LOGIN_DELAY";
            message = "로그인 시도가 10분 동안 제한되었습니다.";
            data = delayData(TEN_MINUTES_MS / 1000L);
        } else if (nextFailCount >= 3) {
            lockUntilAt = new Date(System.currentTimeMillis() + ONE_MINUTE_MS);
            reason = "LOGIN_DELAY_1M";
            code = "LOGIN_DELAY";
            message = "로그인 시도가 1분 동안 제한되었습니다.";
            data = delayData(ONE_MINUTE_MS / 1000L);
        }

        Map<String, Object> update = new HashMap<String, Object>();
        update.put("user_seq", user.getUserSeq());
        update.put("login_fail_cnt", nextFailCount);
        update.put("lock_until_at", lockUntilAt);
        update.put("lock_yn", lockYn);
        update.put("updated_by", user.getUserId());
        authMapper.updateLoginFailState(update);

        user.setLoginFailCnt(nextFailCount);
        user.setLockUntilAt(lockUntilAt);
        user.setLockYn(lockYn);
        accessService.recordLoginHistory(user, user.getUserId(), false, reason, null, request);
        return new LoginFailureResult(code, message, data);
    }

    private Map<String, Object> delayData(long retryAfterSeconds) {
        Map<String, Object> data = new HashMap<String, Object>();
        data.put("retry_after_seconds", retryAfterSeconds);
        data.put("retry_available_at", System.currentTimeMillis() + (retryAfterSeconds * 1000L));
        return data;
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
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private Map<String, Object> fail(String code, String msg) {
        return fail(code, msg, null);
    }

    private Map<String, Object> fail(String code, String msg, Object data) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", false);
        res.put("code", code);
        res.put("message", msg);
        res.put("data", data);
        return res;
    }

    private static final class LoginFailureResult {
        private final String code;
        private final String message;
        private final Map<String, Object> data;

        private LoginFailureResult(String code, String message, Map<String, Object> data) {
            this.code = code;
            this.message = message;
            this.data = data;
        }
    }
}
