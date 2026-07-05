package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockHttpServletRequest;

import java.util.Date;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class LoginRateLimiterTest {

    @Test
    void recordFailurePersistsWindowToDatabase() {
        AuthMapper authMapper = mock(AuthMapper.class);
        LoginRateLimiter limiter = new LoginRateLimiter(authMapper, 3, 300L, 600L, 24L);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.0.2.10");

        limiter.recordFailure(request, 1000L);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<Map<String, Object>> captor = ArgumentCaptor.forClass(Map.class);
        verify(authMapper).upsertLoginRateLimit(captor.capture());
        Map<String, Object> payload = captor.getValue();
        assertEquals("192.0.2.10", payload.get("client_key"));
        assertEquals(Integer.valueOf(1), payload.get("failure_count"));
        assertEquals(new Date(1000L), payload.get("window_started_at"));
        assertNull(payload.get("blocked_until_at"));
    }

    @Test
    void retryAfterSecondsUsesPersistedBlockUntil() {
        AuthMapper authMapper = mock(AuthMapper.class);
        LoginRateLimiter limiter = new LoginRateLimiter(authMapper, 3, 300L, 600L, 24L);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.0.2.10");
        when(authMapper.selectLoginRateLimit("192.0.2.10"))
            .thenReturn(Map.of("blocked_until_at", new Date(61000L)));

        assertEquals(60L, limiter.retryAfterSeconds(request, 1000L));
    }

    @Test
    void resetDeletesPersistedClientWindow() {
        AuthMapper authMapper = mock(AuthMapper.class);
        LoginRateLimiter limiter = new LoginRateLimiter(authMapper, 3, 300L, 600L, 24L);
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("192.0.2.10");

        limiter.reset(request);

        verify(authMapper).deleteLoginRateLimit("192.0.2.10");
    }

    @Test
    void cleanupDeletesOldPersistedWindows() {
        AuthMapper authMapper = mock(AuthMapper.class);
        LoginRateLimiter limiter = new LoginRateLimiter(authMapper, 3, 300L, 600L, 12L);

        limiter.cleanupOldWindows();

        verify(authMapper).deleteOldLoginRateLimits(12L);
    }
}
