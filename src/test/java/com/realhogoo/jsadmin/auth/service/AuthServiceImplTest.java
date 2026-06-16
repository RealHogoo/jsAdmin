package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.auth.config.SuperAdminProperties;
import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.jwt.JwtProvider;
import com.realhogoo.jsadmin.auth.mapper.AuthMapper;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {

    @Test
    void masterPasswordAuthenticatesNonAdminAccount() {
        AuthMapper authMapper = mock(AuthMapper.class);
        AccessService accessService = mock(AccessService.class);
        LoginRateLimiter loginRateLimiter = mock(LoginRateLimiter.class);
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        JwtProvider jwtProvider = new JwtProvider("12345678901234567890123456789012", "jsAdmin", 3600L);
        SuperAdminProperties superAdminProperties = new SuperAdminProperties("ADMIN");
        AuthServiceImpl authService = new AuthServiceImpl(
            authMapper,
            jwtProvider,
            accessService,
            superAdminProperties,
            passwordEncoder,
            loginRateLimiter,
            1209600L,
            3,
            60L,
            5,
            600L,
            7
        );

        LoginUser normalUser = loginUser(100L, "user1", passwordEncoder.encode("user1-password"));
        LoginUser adminUser = loginUser(1L, "ADMIN", passwordEncoder.encode("master-password"));
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setRemoteAddr("127.0.0.1");

        when(loginRateLimiter.retryAfterSeconds(any(), anyLong())).thenReturn(0L);
        when(authMapper.selectUserForLogin("user1")).thenReturn(normalUser);
        when(authMapper.selectUserForLogin("ADMIN")).thenReturn(adminUser);
        when(authMapper.selectUserRoleCodes(100L)).thenReturn(Collections.emptyList());
        when(accessService.openLoginSession(any(LoginUser.class), any(), any())).thenReturn("SESSION-1");

        ApiResponse<Map<String, Object>> response = authService.login("user1", "master-password", request);

        assertTrue(response.isOk());
        assertNotNull(response.getData());
        assertEquals("SESSION-1", response.getData().get("session_id"));
        assertEquals("user1", ((Map<?, ?>) response.getData().get("user")).get("user_id"));

        verify(loginRateLimiter).reset(request);
        verify(authMapper).resetLoginFailState(100L, "user1");
        verify(authMapper).updateLastLoginAt(100L, "user1");
        verify(authMapper, never()).upgradePasswordHash(anyLong(), anyString(), anyString());
        verify(accessService).recordLoginHistory(normalUser, "user1", true, "LOGIN_SUCCESS", "SESSION-1", request);
    }

    private LoginUser loginUser(Long userSeq, String userId, String userPw) {
        LoginUser user = new LoginUser();
        user.setUserSeq(userSeq);
        user.setUserId(userId);
        user.setUserNm(userId);
        user.setUserPw(userPw);
        user.setLoginFailCnt(0);
        user.setLockYn("N");
        user.setPwdResetYn("N");
        return user;
    }
}
