package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.auth.ServicePermissionSupport;
import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.auth.config.SuperAdminProperties;
import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.jwt.JwtProvider;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service("authService")
public class AuthServiceImpl implements AuthService {
    private static final long ONE_MINUTE_MS = 60_000L;
    private static final long TEN_MINUTES_MS = 600_000L;
    private static final int MAX_AUTH_GROUP_CODE_LENGTH = 100;
    private static final int MAX_AUTH_GROUP_NAME_LENGTH = 100;
    private static final int MAX_AUTH_GROUP_DESC_LENGTH = 500;
    private static final int MAX_LOGIN_ID_LENGTH = 100;
    private static final int MAX_PASSWORD_LENGTH = 1000;
    private static final int MAX_REFRESH_TOKEN_LENGTH = 128;
    private static final int MAX_SESSION_ID_LENGTH = 64;

    private final AuthMapper authMapper;
    private final JwtProvider jwtProvider;
    private final AccessService accessService;
    private final SuperAdminProperties superAdminProperties;
    private final PasswordEncoder passwordEncoder;
    private final LoginRateLimiter loginRateLimiter;
    private final long refreshExpSeconds;

    public AuthServiceImpl(
        AuthMapper authMapper,
        JwtProvider jwtProvider,
        AccessService accessService,
        SuperAdminProperties superAdminProperties,
        PasswordEncoder passwordEncoder,
        LoginRateLimiter loginRateLimiter,
        @Value("${jwt.refresh-exp-seconds:1209600}") long refreshExpSeconds
    ) {
        this.authMapper = authMapper;
        this.jwtProvider = jwtProvider;
        this.accessService = accessService;
        this.superAdminProperties = superAdminProperties;
        this.passwordEncoder = passwordEncoder;
        this.loginRateLimiter = loginRateLimiter;
        this.refreshExpSeconds = refreshExpSeconds;
    }

    @Override
    public List<Map<String, Object>> getAuthGroupList(Map<String, Object> param) {
        if (param == null) param = new HashMap<String, Object>();
        return authMapper.selectAuthGroupList(param);
    }

    @Override
    @Transactional
    public Long saveAuthGroup(Map<String, Object> param, String actor) {
        if (param == null) {
            throw new IllegalArgumentException("group data is required");
        }

        Long authGroupSeq = toLong(firstNonNull(param, "auth_group_seq", "authGroupSeq"));
        String authGroupCd = toNullableStr(firstNonNull(param, "auth_group_cd", "authGroupCd"));
        String authGroupNm = toNullableStr(firstNonNull(param, "auth_group_nm", "authGroupNm"));
        String authGroupDesc = toNullableStr(firstNonNull(param, "auth_group_desc", "authGroupDesc"));
        String useYn = toStr(firstNonNull(param, "use_yn", "useYn"), "Y");
        String safeActor = (actor == null || actor.trim().isEmpty()) ? "SYSTEM" : actor.trim();

        if (authGroupCd == null) {
            throw new IllegalArgumentException("auth_group_cd is required");
        }
        if (authGroupNm == null) {
            throw new IllegalArgumentException("auth_group_nm is required");
        }

        authGroupCd = authGroupCd.trim().toUpperCase(Locale.ROOT);
        authGroupNm = authGroupNm.trim();
        authGroupDesc = authGroupDesc == null ? null : authGroupDesc.trim();
        validateLength("auth_group_cd", authGroupCd, MAX_AUTH_GROUP_CODE_LENGTH);
        validateLength("auth_group_nm", authGroupNm, MAX_AUTH_GROUP_NAME_LENGTH);
        validateLength("auth_group_desc", authGroupDesc, MAX_AUTH_GROUP_DESC_LENGTH);

        Map<String, Object> payload = new HashMap<String, Object>();
        payload.put("auth_group_cd", authGroupCd);
        payload.put("auth_group_nm", authGroupNm);
        payload.put("auth_group_desc", authGroupDesc);
        payload.put("use_yn", "N".equalsIgnoreCase(useYn) ? "N" : "Y");
        payload.put("updated_by", safeActor);
        payload.put("created_by", safeActor);

        if (authGroupSeq == null) {
            authMapper.insertAuthGroup(payload);
            return toLong(payload.get("auth_group_seq"));
        }

        payload.put("auth_group_seq", authGroupSeq);
        authMapper.updateAuthGroup(payload);
        return authGroupSeq;
    }

    @Override
    @Transactional
    public int deleteAuthGroup(Long authGroupSeq, String actor) {
        if (authGroupSeq == null) {
            throw new IllegalArgumentException("auth_group_seq is required");
        }
        String safeActor = (actor == null || actor.trim().isEmpty()) ? "SYSTEM" : actor.trim();
        return authMapper.disableAuthGroup(authGroupSeq, safeActor);
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
    public List<Map<String, Object>> getGroupServicePermList(Long authGroupSeq) {
        if (authGroupSeq == null) return Collections.emptyList();
        return authMapper.selectGroupServicePermList(authGroupSeq);
    }

    @Override
    @Transactional
    public int saveGroupServicePerm(Long authGroupSeq, List<Map<String, Object>> items, String actor) {
        if (authGroupSeq == null) {
            throw new IllegalArgumentException("auth_group_seq is required");
        }
        if (items == null) {
            throw new IllegalArgumentException("items is required");
        }

        String safeActor = (actor == null || actor.trim().isEmpty()) ? "SYSTEM" : actor.trim();
        int saved = 0;
        for (Map<String, Object> item : items) {
            if (item == null) {
                continue;
            }
            Long servicePermSeq = toLong(firstNonNull(item, "service_perm_seq", "servicePermSeq"));
            String useYn = toStr(firstNonNull(item, "use_yn", "useYn"), "N");
            if (servicePermSeq == null) {
                continue;
            }

            Map<String, Object> payload = new HashMap<String, Object>();
            payload.put("auth_group_seq", authGroupSeq);
            payload.put("service_perm_seq", servicePermSeq);
            payload.put("use_yn", "Y".equalsIgnoreCase(useYn) ? "Y" : "N");
            payload.put("created_by", safeActor);
            payload.put("updated_by", safeActor);
            authMapper.upsertGroupServicePerm(payload);
            saved++;
        }
        return saved;
    }

    @Override
    public List<Map<String, Object>> getUserServicePermList(Long userSeq) {
        if (userSeq == null) return Collections.emptyList();
        return authMapper.selectUserServicePermList(userSeq);
    }

    @Override
    @Transactional
    public void saveUserServiceExceptions(Long userSeq, List<Map<String, Object>> exceptions, String actor) {
        if (userSeq == null) {
            throw new IllegalArgumentException("user_seq is required");
        }

        String safeActor = (actor == null || actor.trim().isEmpty()) ? "SYSTEM" : actor.trim();
        authMapper.deleteAllUserServiceException(userSeq);

        if (exceptions == null) {
            return;
        }

        for (Map<String, Object> row : exceptions) {
            if (row == null) {
                continue;
            }
            Long servicePermSeq = toLong(firstNonNull(row, "service_perm_seq", "servicePermSeq"));
            String accessYn = toStr(firstNonNull(row, "access_yn", "accessYn"), "");
            if (servicePermSeq == null) {
                continue;
            }
            if (!"Y".equalsIgnoreCase(accessYn) && !"X".equalsIgnoreCase(accessYn)) {
                continue;
            }

            Map<String, Object> payload = new HashMap<String, Object>();
            payload.put("user_seq", userSeq);
            payload.put("service_perm_seq", servicePermSeq);
            payload.put("access_yn", accessYn.toUpperCase(Locale.ROOT));
            payload.put("created_by", safeActor);
            payload.put("updated_by", safeActor);
            authMapper.upsertUserServiceException(payload);
        }
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
    public ApiResponse<Map<String, Object>> login(String userId, String userPw, HttpServletRequest request) {
        String normalizedUserId = normalizeLoginId(userId);
        long nowMs = System.currentTimeMillis();
        validateLength("user_id", normalizedUserId, MAX_LOGIN_ID_LENGTH);
        validateLength("user_pw", userPw, MAX_PASSWORD_LENGTH);
        long retryAfterSeconds = loginRateLimiter.retryAfterSeconds(request, nowMs);
        if (retryAfterSeconds > 0L) {
            accessService.recordLoginHistory(null, normalizedUserId, false, "IP_RATE_LIMIT_ACTIVE_" + retryAfterSeconds + "S", null, request);
            return ApiResponse.fail("LOGIN_FAIL", "\uB85C\uADF8\uC778 \uC2DC\uB3C4\uAC00 \uB108\uBB34 \uB9CE\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.", delayData(retryAfterSeconds), request);
        }

        LoginUser user = authMapper.selectUserForLogin(normalizedUserId);
        if (user == null) {
            loginRateLimiter.recordFailure(request, nowMs);
            accessService.recordLoginHistory(null, normalizedUserId, false, "USER_NOT_FOUND", null, request);
            return ApiResponse.fail("LOGIN_FAIL", "\uC544\uC774\uB514 \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", null, request);
        }

        Date now = new Date();
        if ("Y".equalsIgnoreCase(user.getLockYn())) {
            accessService.recordLoginHistory(user, normalizedUserId, false, "ACCOUNT_LOCKED", null, request);
            return ApiResponse.fail("LOGIN_FAIL", "\uC544\uC774\uB514 \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", null, request);
        }

        if (user.getLockUntilAt() != null && user.getLockUntilAt().after(now)) {
            long remainingSeconds = Math.max(1L, (user.getLockUntilAt().getTime() - now.getTime() + 999L) / 1000L);
            accessService.recordLoginHistory(user, normalizedUserId, false, "LOGIN_DELAY_ACTIVE_" + remainingSeconds + "S", null, request);
            return ApiResponse.fail("LOGIN_FAIL", "\uC544\uC774\uB514 \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.", delayData(remainingSeconds), request);
        }

        PasswordCheckResult passwordCheck = verifyPassword(user.getUserPw(), userPw);
        if (!passwordCheck.matched) {
            loginRateLimiter.recordFailure(request, nowMs);
            LoginFailureResult failure = applyLoginFailurePolicy(user, request);
            return ApiResponse.fail(failure.code, failure.message, failure.data, request);
        }

        if (passwordCheck.needsUpgrade) {
            authMapper.upgradePasswordHash(user.getUserSeq(), passwordEncoder.encode(userPw), normalizedUserId);
        }

        if ("Y".equalsIgnoreCase(user.getPwdResetYn())) {
            accessService.recordLoginHistory(user, normalizedUserId, false, "PASSWORD_RESET_REQUIRED", null, request);
            return ApiResponse.fail("PASSWORD_RESET_REQUIRED", "\uBE44\uBC00\uBC88\uD638 \uC7AC\uC124\uC815\uC774 \uD544\uC694\uD569\uB2C8\uB2E4.", null, request);
        }

        loginRateLimiter.reset(request);
        authMapper.resetLoginFailState(user.getUserSeq(), normalizedUserId);
        authMapper.updateLastLoginAt(user.getUserSeq(), normalizedUserId);

        List<String> roles = resolveRoles(user);
        TokenBundle tokenBundle = issueTokens(user, roles, request, null);
        accessService.recordLoginHistory(user, normalizedUserId, true, "LOGIN_SUCCESS", tokenBundle.sessionId, request);

        return ApiResponse.ok(tokenResponse(user, roles, tokenBundle), request);
    }

    @Override
    @Transactional
    public ApiResponse<Map<String, Object>> refresh(String refreshToken, HttpServletRequest request) {
        if (refreshToken == null || refreshToken.trim().isEmpty()) {
            return ApiResponse.fail("UNAUTHORIZED", "refresh token is required", null, request);
        }
        validateLength("refresh_token", refreshToken.trim(), MAX_REFRESH_TOKEN_LENGTH);

        String tokenHash = hashToken(refreshToken);
        Map<String, Object> refreshRow = authMapper.selectActiveRefreshToken(tokenHash);
        if (refreshRow == null || refreshRow.isEmpty()) {
            return ApiResponse.fail("UNAUTHORIZED", "invalid refresh token", null, request);
        }

        String sessionId = toNullableStr(refreshRow.get("session_id"));
        String loginId = toNullableStr(refreshRow.get("login_id"));
        validateLength("session_id", sessionId, MAX_SESSION_ID_LENGTH);
        validateLength("login_id", loginId, MAX_LOGIN_ID_LENGTH);
        String actor = loginId == null ? "SYSTEM" : loginId;
        if (!accessService.touchSession(sessionId, new Date().toInstant())) {
            authMapper.revokeRefreshToken(tokenHash, actor);
            return ApiResponse.fail("UNAUTHORIZED", "session expired", null, request);
        }

        LoginUser user = authMapper.selectUserForLogin(loginId);
        if (user == null) {
            authMapper.revokeRefreshToken(tokenHash, actor);
            return ApiResponse.fail("UNAUTHORIZED", "user not found", null, request);
        }

        List<String> roles = resolveRoles(user);
        authMapper.revokeRefreshToken(tokenHash, actor);
        TokenBundle tokenBundle = issueTokens(user, roles, request, sessionId);
        return ApiResponse.ok(tokenResponse(user, roles, tokenBundle), request);
    }

    @Override
    public Map<String, Object> me(String userId, List<String> roles, String sessionId) {
        if (userId == null || userId.trim().isEmpty()) {
            throw new IllegalArgumentException("login required");
        }

        LoginUser user = authMapper.selectUserForLogin(userId);
        if (user == null) {
            throw new IllegalArgumentException("user not found");
        }

        List<String> resolvedRoles = resolveRoles(user);
        Map<String, Object> data = new HashMap<String, Object>();
        data.put("user_id", user.getUserId());
        data.put("user_nm", user.getUserNm());
        data.put("roles", resolvedRoles.isEmpty() ? (roles == null ? Collections.emptyList() : roles) : resolvedRoles);
        data.put("session_id", sessionId);
        data.put("super_admin", superAdminProperties.isSuperLoginId(user.getUserId()));
        data.put("service_permissions", ServicePermissionSupport.toPermissionMap(
            authMapper.selectResolvedServicePermissions(user.getUserSeq())
        ));
        return data;
    }

    @Override
    @Transactional
    public int revokeRefreshTokensBySessionId(String sessionId, String actor) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return 0;
        }
        return authMapper.revokeRefreshTokensBySessionId(sessionId.trim(), actor == null || actor.trim().isEmpty() ? "SYSTEM" : actor.trim());
    }

    private String normalizeLoginId(String userId) {
        if (userId == null) return null;
        String trimmed = userId.trim();
        if (superAdminProperties.isSuperLoginId(trimmed)) {
            return trimmed;
        }
        return trimmed.toLowerCase();
    }

    private List<String> resolveRoles(LoginUser user) {
        if (user == null || user.getUserSeq() == null) {
            return Collections.emptyList();
        }

        LinkedHashSet<String> roles = new LinkedHashSet<String>();
        List<String> roleCodes = authMapper.selectUserRoleCodes(user.getUserSeq());
        if (roleCodes != null) {
            for (String roleCode : roleCodes) {
                String roleName = toRoleName(roleCode);
                if (roleName != null) {
                    roles.add(roleName);
                }
            }
        }
        if (superAdminProperties.isSuperLoginId(user.getUserId())) {
            roles.add("ROLE_SUPER_ADMIN");
        }
        return List.copyOf(roles);
    }

    private String toRoleName(String code) {
        if (code == null) {
            return null;
        }

        String normalized = code.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        normalized = normalized.replace('-', '_').replace(' ', '_').toUpperCase(Locale.ROOT);
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }
        return normalized;
    }

    private TokenBundle issueTokens(LoginUser user, List<String> roles, HttpServletRequest request, String existingSessionId) {
        String sessionId = existingSessionId;
        if (sessionId == null || sessionId.trim().isEmpty()) {
            sessionId = accessService.openLoginSession(user, request, jwtProvider.getExpiresAt());
        }

        String accessToken = jwtProvider.createToken(user.getUserId(), sessionId, roles);
        String refreshToken = UUID.randomUUID().toString().replace("-", "") + UUID.randomUUID().toString().replace("-", "");
        Date refreshExpiresAt = new Date(System.currentTimeMillis() + (refreshExpSeconds * 1000L));

        Map<String, Object> refreshParam = new HashMap<String, Object>();
        refreshParam.put("user_seq", user.getUserSeq());
        refreshParam.put("login_id", user.getUserId());
        refreshParam.put("session_id", sessionId);
        refreshParam.put("token_hash", hashToken(refreshToken));
        refreshParam.put("expires_at", refreshExpiresAt);
        refreshParam.put("created_by", user.getUserId());
        authMapper.insertRefreshToken(refreshParam);

        return new TokenBundle(accessToken, refreshToken, sessionId, refreshExpiresAt.getTime());
    }

    private Map<String, Object> tokenResponse(LoginUser user, List<String> roles, TokenBundle tokenBundle) {
        Map<String, Object> userMap = new HashMap<String, Object>();
        userMap.put("user_id", user.getUserId());
        userMap.put("user_nm", user.getUserNm());
        userMap.put("roles", roles);
        userMap.put("super_admin", superAdminProperties.isSuperLoginId(user.getUserId()));

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("token", tokenBundle.accessToken);
        data.put("refresh_token", tokenBundle.refreshToken);
        data.put("session_id", tokenBundle.sessionId);
        data.put("refresh_expires_at", tokenBundle.refreshExpiresAt);
        data.put("user", userMap);
        return data;
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(String.valueOf(token).getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (Exception e) {
            throw new IllegalStateException("failed to hash token", e);
        }
    }

    private String toNullableStr(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? null : s;
    }

    private PasswordCheckResult verifyPassword(String savedPassword, String rawPassword) {
        if (savedPassword == null || rawPassword == null) {
            return PasswordCheckResult.notMatched();
        }
        if (isBcryptHash(savedPassword)) {
            return passwordEncoder.matches(rawPassword, savedPassword)
                ? PasswordCheckResult.matched(false)
                : PasswordCheckResult.notMatched();
        }
        return savedPassword.equals(rawPassword)
            ? PasswordCheckResult.matched(true)
            : PasswordCheckResult.notMatched();
    }

    private boolean isBcryptHash(String value) {
        return value != null && (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$"));
    }

    private LoginFailureResult applyLoginFailurePolicy(LoginUser user, HttpServletRequest request) {
        int nextFailCount = (user.getLoginFailCnt() == null ? 0 : user.getLoginFailCnt().intValue()) + 1;
        Date lockUntilAt = null;
        String lockYn = "N";
        String reason = "INVALID_PASSWORD";
        String code = "LOGIN_FAIL";
        String message = "\uC544\uC774\uB514 \uB610\uB294 \uBE44\uBC00\uBC88\uD638\uAC00 \uC62C\uBC14\uB974\uC9C0 \uC54A\uC2B5\uB2C8\uB2E4.";
        Map<String, Object> data = null;

        if (nextFailCount >= 7) {
            lockYn = "Y";
            reason = "ACCOUNT_LOCKED";
        } else if (nextFailCount >= 5) {
            lockUntilAt = new Date(System.currentTimeMillis() + TEN_MINUTES_MS);
            reason = "LOGIN_DELAY_10M";
            data = delayData(TEN_MINUTES_MS / 1000L);
        } else if (nextFailCount >= 3) {
            lockUntilAt = new Date(System.currentTimeMillis() + ONE_MINUTE_MS);
            reason = "LOGIN_DELAY_1M";
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

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
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

    private static final class PasswordCheckResult {
        private final boolean matched;
        private final boolean needsUpgrade;

        private PasswordCheckResult(boolean matched, boolean needsUpgrade) {
            this.matched = matched;
            this.needsUpgrade = needsUpgrade;
        }

        private static PasswordCheckResult matched(boolean needsUpgrade) {
            return new PasswordCheckResult(true, needsUpgrade);
        }

        private static PasswordCheckResult notMatched() {
            return new PasswordCheckResult(false, false);
        }
    }

    private static final class TokenBundle {
        private final String accessToken;
        private final String refreshToken;
        private final String sessionId;
        private final long refreshExpiresAt;

        private TokenBundle(String accessToken, String refreshToken, String sessionId, long refreshExpiresAt) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.sessionId = sessionId;
            this.refreshExpiresAt = refreshExpiresAt;
        }
    }
}
