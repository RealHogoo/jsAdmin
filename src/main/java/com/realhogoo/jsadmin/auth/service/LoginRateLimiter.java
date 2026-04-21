package com.realhogoo.jsadmin.auth.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class LoginRateLimiter {

    private final Map<String, AttemptWindow> windows = new ConcurrentHashMap<String, AttemptWindow>();
    private final int maxAttempts;
    private final long windowMs;
    private final long blockMs;

    public LoginRateLimiter(
        @Value("${auth.login-rate-limit.max-attempts:8}") int maxAttempts,
        @Value("${auth.login-rate-limit.window-seconds:300}") long windowSeconds,
        @Value("${auth.login-rate-limit.block-seconds:300}") long blockSeconds
    ) {
        this.maxAttempts = Math.max(1, maxAttempts);
        this.windowMs = Math.max(1L, windowSeconds) * 1000L;
        this.blockMs = Math.max(1L, blockSeconds) * 1000L;
    }

    public long retryAfterSeconds(HttpServletRequest request, long nowMs) {
        AttemptWindow window = windows.get(clientKey(request));
        if (window == null) {
            return 0L;
        }
        synchronized (window) {
            window.compact(nowMs, windowMs);
            if (window.blockedUntilMs <= nowMs) {
                return 0L;
            }
            return Math.max(1L, (window.blockedUntilMs - nowMs + 999L) / 1000L);
        }
    }

    public void recordFailure(HttpServletRequest request, long nowMs) {
        AttemptWindow window = windows.computeIfAbsent(clientKey(request), key -> new AttemptWindow());
        synchronized (window) {
            window.compact(nowMs, windowMs);
            if (window.blockedUntilMs > nowMs) {
                return;
            }
            window.failures.addLast(Long.valueOf(nowMs));
            if (window.failures.size() >= maxAttempts) {
                window.blockedUntilMs = nowMs + blockMs;
                window.failures.clear();
            }
        }
    }

    public void reset(HttpServletRequest request) {
        windows.remove(clientKey(request));
    }

    private String clientKey(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
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
        String remoteAddr = trimToNull(request.getRemoteAddr(), 45);
        return remoteAddr == null ? "unknown" : remoteAddr;
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

    private static final class AttemptWindow {
        private final Deque<Long> failures = new ArrayDeque<Long>();
        private long blockedUntilMs;

        private void compact(long nowMs, long windowMs) {
            while (!failures.isEmpty() && failures.peekFirst().longValue() < nowMs - windowMs) {
                failures.removeFirst();
            }
            if (blockedUntilMs <= nowMs && failures.isEmpty()) {
                blockedUntilMs = 0L;
            }
        }
    }
}
