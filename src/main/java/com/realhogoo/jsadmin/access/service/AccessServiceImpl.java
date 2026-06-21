package com.realhogoo.jsadmin.access.service;

import com.realhogoo.jsadmin.access.mapper.AccessMapper;
import com.realhogoo.jsadmin.auth.dto.LoginUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class AccessServiceImpl implements AccessService {

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_EXPIRED = "EXPIRED";
    private static final String STATUS_REVOKED = "REVOKED";

    private final AccessMapper accessMapper;

    public AccessServiceImpl(AccessMapper accessMapper) {
        this.accessMapper = accessMapper;
    }

    @Override
    @Transactional
    public String openLoginSession(LoginUser user, HttpServletRequest request, Instant expiresAt) {
        if (user == null || user.getUserId() == null) {
            throw new IllegalArgumentException("login user is required");
        }

        String sessionId = UUID.randomUUID().toString();
        Instant now = Instant.now();

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("session_id", sessionId);
        param.put("user_seq", user.getUserSeq());
        param.put("login_id", user.getUserId());
        param.put("user_nm", user.getUserNm());
        param.put("status_cd", STATUS_ACTIVE);
        param.put("client_ip", extractClientIp(request));
        param.put("user_agent", trimToNull(header(request, "User-Agent"), 500));
        param.put("login_at", now);
        param.put("last_access_at", now);
        param.put("expires_at", expiresAt);
        param.put("created_by", user.getUserId());
        param.put("updated_by", user.getUserId());
        accessMapper.insertLoginSession(param);
        return sessionId;
    }

    @Override
    public void recordLoginHistory(LoginUser user, String loginId, boolean success, String resultMessage, String sessionId, HttpServletRequest request) {
        String resultCd = "LOGOUT".equalsIgnoreCase(resultMessage)
            ? "LOGOUT"
            : (success ? "SUCCESS" : "FAIL");
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("user_seq", user == null ? null : user.getUserSeq());
        param.put("login_id", trimToNull(loginId, 100));
        param.put("user_nm", user == null ? null : trimToNull(user.getUserNm(), 100));
        param.put("result_cd", resultCd);
        param.put("result_msg", trimToNull(resultMessage, 400));
        param.put("session_id", trimToNull(sessionId, 64));
        param.put("client_ip", extractClientIp(request));
        param.put("user_agent", trimToNull(header(request, "User-Agent"), 500));
        param.put("created_by", trimToNull(loginId, 100));
        accessMapper.insertLoginHistory(param);
    }

    @Override
    @Transactional
    public boolean touchSession(String sessionId, Instant now) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            return true;
        }

        Map<String, Object> status = accessMapper.selectSessionStatus(sessionId);
        if (status == null || status.isEmpty()) {
            return false;
        }

        String statusCd = stringValue(status.get("status_cd"));
        Instant expiresAt = toInstant(status.get("expires_at"));
        if (!STATUS_ACTIVE.equalsIgnoreCase(statusCd)) {
            return false;
        }

        if (expiresAt != null && expiresAt.isBefore(now)) {
            accessMapper.expireSession(sessionId, "SYSTEM", STATUS_EXPIRED);
            return false;
        }

        accessMapper.updateSessionLastAccess(sessionId, now);
        return true;
    }

    @Override
    public List<Map<String, Object>> getLoginSessionList(Map<String, Object> param) {
        return accessMapper.selectLoginSessionList(param == null ? new HashMap<String, Object>() : param);
    }

    @Override
    public List<Map<String, Object>> getLoginHistoryList(Map<String, Object> param) {
        return accessMapper.selectLoginHistoryList(param == null ? new HashMap<String, Object>() : param);
    }

    @Override
    @Transactional
    public int expireSession(String sessionId, String actor) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("session_id is required");
        }
        return accessMapper.expireSession(sessionId.trim(), defaultActor(actor), STATUS_REVOKED);
    }

    @Override
    @Transactional
    public int expireSessionsByLoginId(String loginId, String actor) {
        if (loginId == null || loginId.trim().isEmpty()) {
            throw new IllegalArgumentException("login_id is required");
        }
        return accessMapper.expireSessionsByLoginId(loginId.trim(), defaultActor(actor), STATUS_REVOKED);
    }

    @Override
    @Transactional
    public int logout(String sessionId, String actor, HttpServletRequest request) {
        if (sessionId == null || sessionId.trim().isEmpty()) {
            throw new IllegalArgumentException("session_id is required");
        }

        Map<String, Object> status = accessMapper.selectSessionStatus(sessionId.trim());
        int expired = accessMapper.expireSession(sessionId.trim(), defaultActor(actor), STATUS_REVOKED);
        if (expired > 0 && status != null && !status.isEmpty()) {
            LoginUser user = new LoginUser();
            user.setUserSeq(toLong(status.get("user_seq")));
            user.setUserId(stringValue(status.get("login_id")));
            user.setUserNm(stringValue(status.get("user_nm")));
            recordLoginHistory(user, user.getUserId(), true, "LOGOUT", sessionId.trim(), request);
        }
        return expired;
    }

    @Override
    public int countActiveLoginSessions() {
        return accessMapper.countActiveLoginSessions();
    }

    private String defaultActor(String actor) {
        String safe = trimToNull(actor, 100);
        return safe == null ? "SYSTEM" : safe;
    }

    private String header(HttpServletRequest request, String name) {
        return request == null ? null : request.getHeader(name);
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return null;

        boolean trustForwardedHeaders = trustForwardedHeaders();
        String forwarded = trustForwardedHeaders ? header(request, "X-Forwarded-For") : null;
        if (forwarded != null) {
            String[] parts = forwarded.split(",");
            if (parts.length > 0) {
                String candidate = trimToNull(parts[0], 45);
                if (candidate != null) return candidate;
            }
        }

        String realIp = trustForwardedHeaders ? trimToNull(header(request, "X-Real-IP"), 45) : null;
        if (realIp != null) return realIp;
        return trimToNull(request.getRemoteAddr(), 45);
    }

    private boolean trustForwardedHeaders() {
        String configured = trimToNull(System.getProperty("app.trust-forwarded-headers"), 16);
        if (configured == null) {
            configured = trimToNull(System.getenv("TRUST_FORWARDED_HEADERS"), 16);
        }
        return "true".equalsIgnoreCase(configured);
    }

    private String trimToNull(String value, int maxLength) {
        if (value == null) return null;
        String trimmed = value.trim();
        if (trimmed.isEmpty()) return null;
        if (trimmed.length() > maxLength) {
            return trimmed.substring(0, maxLength);
        }
        return trimmed;
    }

    private String stringValue(Object value) {
        if (value == null) return null;
        return String.valueOf(value).trim();
    }


    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        String s = String.valueOf(value).trim();
        return s.isEmpty() ? null : Long.valueOf(s);
    }

    private Instant toInstant(Object value) {
        if (value == null) return null;
        if (value instanceof Instant) return (Instant) value;
        if (value instanceof java.sql.Timestamp) return ((java.sql.Timestamp) value).toInstant();
        if (value instanceof java.util.Date) return ((java.util.Date) value).toInstant();
        return null;
    }
}
