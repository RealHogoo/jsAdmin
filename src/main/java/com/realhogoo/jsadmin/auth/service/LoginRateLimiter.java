package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.sql.Timestamp;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class LoginRateLimiter {

    private final AuthMapper authMapper;
    private final int maxAttempts;
    private final long windowMs;
    private final long blockMs;
    private final long cleanupRetentionHours;

    public LoginRateLimiter(
        AuthMapper authMapper,
        @Value("${auth.login-rate-limit.max-attempts:8}") int maxAttempts,
        @Value("${auth.login-rate-limit.window-seconds:300}") long windowSeconds,
        @Value("${auth.login-rate-limit.block-seconds:300}") long blockSeconds,
        @Value("${auth.login-rate-limit.cleanup-retention-hours:24}") long cleanupRetentionHours
    ) {
        this.authMapper = authMapper;
        this.maxAttempts = Math.max(1, maxAttempts);
        this.windowMs = Math.max(1L, windowSeconds) * 1000L;
        this.blockMs = Math.max(1L, blockSeconds) * 1000L;
        this.cleanupRetentionHours = Math.max(1L, cleanupRetentionHours);
    }

    public long retryAfterSeconds(HttpServletRequest request, long nowMs) {
        Map<String, Object> row = authMapper.selectLoginRateLimit(clientKey(request));
        if (row == null || row.isEmpty()) {
            return 0L;
        }
        Date blockedUntil = dateValue(row.get("blocked_until_at"));
        if (blockedUntil == null || blockedUntil.getTime() <= nowMs) {
            return 0L;
        }
        return Math.max(1L, (blockedUntil.getTime() - nowMs + 999L) / 1000L);
    }

    public void recordFailure(HttpServletRequest request, long nowMs) {
        String key = clientKey(request);
        Map<String, Object> row = authMapper.selectLoginRateLimit(key);
        Date blockedUntil = row == null ? null : dateValue(row.get("blocked_until_at"));
        if (blockedUntil != null && blockedUntil.getTime() > nowMs) {
            return;
        }

        Date windowStartedAt = row == null ? null : dateValue(row.get("window_started_at"));
        boolean expiredWindow = windowStartedAt == null || windowStartedAt.getTime() < nowMs - windowMs;
        int failureCount = expiredWindow ? 0 : intValue(row.get("failure_count"));
        Date nextWindowStartedAt = expiredWindow ? new Date(nowMs) : windowStartedAt;
        Date nextBlockedUntil = null;

        failureCount++;
        if (failureCount >= maxAttempts) {
            nextBlockedUntil = new Date(nowMs + blockMs);
            nextWindowStartedAt = new Date(nowMs);
            failureCount = 0;
        }

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("client_key", key);
        param.put("failure_count", Integer.valueOf(failureCount));
        param.put("window_started_at", nextWindowStartedAt);
        param.put("blocked_until_at", nextBlockedUntil);
        authMapper.upsertLoginRateLimit(param);
    }

    public void reset(HttpServletRequest request) {
        authMapper.deleteLoginRateLimit(clientKey(request));
    }

    @Scheduled(cron = "${auth.login-rate-limit.cleanup-cron:0 35 3 * * *}")
    @Transactional
    public void cleanupOldWindows() {
        authMapper.deleteOldLoginRateLimits(cleanupRetentionHours);
    }

    private String clientKey(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        if (isTrustedForwardedSource(request)) {
            String forwarded = trimToNull(request.getHeader("X-Forwarded-For"), 128);
            if (forwarded != null) {
                String[] parts = forwarded.split(",");
                if (parts.length > 0) {
                    String candidate = trimToNull(parts[0], 45);
                    if (candidate != null) {
                        return candidate;
                    }
                }
            }
            String realIp = trimToNull(request.getHeader("X-Real-IP"), 45);
            if (realIp != null) {
                return realIp;
            }
        }
        String remoteAddr = trimToNull(request.getRemoteAddr(), 45);
        return remoteAddr == null ? "unknown" : remoteAddr;
    }

    private boolean isTrustedForwardedSource(HttpServletRequest request) {
        String configured = trimToNull(System.getProperty("app.trust-forwarded-headers"), 16);
        if (configured == null) {
            configured = trimToNull(System.getenv("TRUST_FORWARDED_HEADERS"), 16);
        }
        if ("true".equalsIgnoreCase(configured)) {
            return true;
        }
        try {
            InetAddress address = InetAddress.getByName(request.getRemoteAddr());
            return address.isLoopbackAddress();
        } catch (Exception ignored) {
            return false;
        }
    }

    private String trimToNull(String value, int maxLength) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        if (trimmed.isEmpty()) {
            return null;
        }
        if (trimmed.length() > maxLength) {
            return trimmed.substring(0, maxLength);
        }
        return trimmed;
    }

    private Date dateValue(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Date) {
            return (Date) value;
        }
        if (value instanceof Timestamp) {
            return new Date(((Timestamp) value).getTime());
        }
        return null;
    }

    private int intValue(Object value) {
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        if (value != null) {
            try {
                return Integer.parseInt(String.valueOf(value));
            } catch (NumberFormatException ignored) {
            }
        }
        return 0;
    }
}
