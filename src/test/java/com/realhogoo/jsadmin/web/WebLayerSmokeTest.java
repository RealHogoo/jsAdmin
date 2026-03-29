package com.realhogoo.jsadmin.web;

import com.realhogoo.jsadmin.api.GlobalExceptionHandler;
import com.realhogoo.jsadmin.api.SecurityHeadersFilter;
import com.realhogoo.jsadmin.auth.service.AuthService;
import com.realhogoo.jsadmin.auth.web.LoginController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class WebLayerSmokeTest {

    private MockMvc mockMvc;
    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        when(authService.login(anyString(), anyString(), any())).thenReturn(Collections.singletonMap("ok", true));

        mockMvc = MockMvcBuilders
            .standaloneSetup(new LoginController(authService), new MainController())
            .setControllerAdvice(new GlobalExceptionHandler())
            .addFilters(new SecurityHeadersFilter())
            .build();
    }

    @Test
    void loginMissingCredentialsReturnsBadRequestBody() throws Exception {
        mockMvc.perform(post("/login.json")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"user_id\":\"\",\"user_pw\":\"1111\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(false))
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
            .andExpect(jsonPath("$.message").value("아이디 또는 비밀번호를 확인해 주세요."));
    }

    @Test
    void loginValidationExceptionIsMappedTo400() throws Exception {
        when(authService.login(anyString(), anyString(), any()))
            .thenThrow(new IllegalArgumentException("user_id length must be 100 or less"));

        mockMvc.perform(post("/login.json")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"user_id\":\"ADMIN\",\"user_pw\":\"1111\"}"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.ok").value(false))
            .andExpect(jsonPath("$.code").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.message").value("user_id length must be 100 or less"));
    }

    @Test
    void securityHeadersAreAddedToJsonResponses() throws Exception {
        mockMvc.perform(post("/login.json")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"user_id\":\"\",\"user_pw\":\"1111\"}"))
            .andExpect(header().string("X-Content-Type-Options", "nosniff"))
            .andExpect(header().string("X-Frame-Options", "DENY"))
            .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"));
    }

    @Test
    void mainPageResolvesDashboardView() throws Exception {
        mockMvc.perform(get("/main.do"))
            .andExpect(status().isOk())
            .andExpect(view().name("dashboard/app"));
    }
}
