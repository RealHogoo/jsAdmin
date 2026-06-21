package com.realhogoo.jsadmin.web;

import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.api.GlobalExceptionHandler;
import com.realhogoo.jsadmin.api.SecurityHeadersFilter;
import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.auth.service.AuthService;
import com.realhogoo.jsadmin.auth.service.LoginCryptoService;
import com.realhogoo.jsadmin.auth.web.AuthController;
import com.realhogoo.jsadmin.auth.web.LoginController;
import com.realhogoo.jsadmin.health.mapper.HealthMapper;
import com.realhogoo.jsadmin.health.mapper.ServiceRegistryMapper;
import com.realhogoo.jsadmin.health.web.HealthController;
import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.service.MenuService;
import com.realhogoo.jsadmin.menu.web.MenuController;
import com.realhogoo.jsadmin.notice.service.NoticeService;
import com.realhogoo.jsadmin.notice.web.NoticeController;
import com.realhogoo.jsadmin.serviceregistry.service.ServiceEndpointPolicy;
import com.realhogoo.jsadmin.user.service.UserService;
import com.realhogoo.jsadmin.user.web.UserController;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import javax.sql.DataSource;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.model;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class WebLayerSmokeTest {

    private MockMvc mockMvc;
    private AuthService authService;
    private MenuService menuService;
    private UserService userService;
    private NoticeService noticeService;
    private LoginCryptoService loginCryptoService;
    private AccessService accessService;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        menuService = mock(MenuService.class);
        userService = mock(UserService.class);
        noticeService = mock(NoticeService.class);
        accessService = mock(AccessService.class);
        loginCryptoService = new LoginCryptoService();
        loginCryptoService.init();
        DataSource dataSource = mock(DataSource.class);
        HealthMapper healthMapper = mock(HealthMapper.class);
        ServiceRegistryMapper serviceRegistryMapper = mock(ServiceRegistryMapper.class);
        ServiceEndpointPolicy serviceEndpointPolicy = mock(ServiceEndpointPolicy.class);

        when(authService.login(anyString(), anyString(), any())).thenReturn(ApiResponse.ok(Collections.emptyMap(), "TRACE-1"));
        when(authService.me(anyString(), any(), anyString()))
            .thenReturn(Map.of("user_id", "ADMIN", "user_nm", "ADMIN USER"));
        when(authService.saveAuthGroup(any(), anyString())).thenReturn(10001L);
        when(authService.deleteAuthGroup(any(), anyString())).thenReturn(1);
        when(authService.getGroupUserList(any())).thenReturn(List.of(Map.of("user_seq", 1L, "login_id", "tester1", "user_nm", "Tester")));
        when(authService.searchGroupUserCandidates(any(), any())).thenReturn(List.of(Map.of("user_seq", 2L, "login_id", "tester2", "user_nm", "Tester2")));
        when(authService.saveGroupUsers(any(), any(), anyString())).thenReturn(1);
        when(authService.removeGroupUser(any(), any(), anyString())).thenReturn(1);
        when(menuService.getMenuTree(anyString())).thenReturn(List.of(sampleMenuNode()));
        when(userService.getUserList(any())).thenReturn(List.of(Map.of("login_id", "ADMIN", "user_nm", "ADMIN USER")));
        when(noticeService.selectNoticeList(any())).thenReturn(List.of(Map.of("noti_seq", 1L, "title", "Sample notice")));
        when(serviceRegistryMapper.selectServiceRegistryByCode("admin-service"))
            .thenReturn(Map.of(
                "service_cd", "admin-service",
                "service_nm", "Admin Service",
                "base_url", "http://localhost:8081",
                "use_yn", "Y",
                "remark", "Test registry"
            ));
        when(serviceRegistryMapper.selectServiceRegistryList())
            .thenReturn(List.of(Map.of(
                "service_cd", "admin-service",
                "service_nm", "Admin Service",
                "base_url", "http://localhost:8081",
                "use_yn", "Y",
                "sort_ord", 1
            )));

        mockMvc = MockMvcBuilders
            .standaloneSetup(
                new LoginController(authService, loginCryptoService, "dev"),
                new AuthController(authService),
                new MenuController(menuService),
                new UserController(userService, loginCryptoService, "dev"),
                new NoticeController(noticeService),
                new HealthController(dataSource, healthMapper, serviceRegistryMapper, serviceEndpointPolicy, accessService, "dev", "dev-media-internal-token"),
                new MainController("https://adm.js65.myds.me")
            )
            .setControllerAdvice(new GlobalExceptionHandler())
            .addFilters(new SecurityHeadersFilter())
            .build();
    }

    @Test
    void loginEndpointRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/login.json")
                .header("X-Forwarded-Host", "adm.js65.myds.me")
                .header("X-Forwarded-Proto", "https")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"user_id\":\"ADMIN\",\"user_pw\":\"1111\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(header().stringValues("Set-Cookie",
                org.hamcrest.Matchers.hasItem(org.hamcrest.Matchers.containsString("Domain=js65.myds.me"))));
    }

    @Test
    void loginMissingCredentialsReturnsExpectedErrorEnvelope() throws Exception {
        mockMvc.perform(post("/login.json")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"user_id\":\"\",\"user_pw\":\"1111\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(false))
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    void authMeRespondsForAuthenticatedRequest() throws Exception {
        mockMvc.perform(post("/auth/me.json")
                .with(authenticatedUser()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.user_id").value("ADMIN"));
    }

    @Test
    void menuTreeRespondsForAuthenticatedRequest() throws Exception {
        mockMvc.perform(post("/menu/tree.json")
                .with(authenticatedUser()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void userListRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/user/list.json")
                .with(authenticatedUser())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void noticeListRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/notice/list.json")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.length()").value(1));
    }

    @Test
    void healthLiveRespondsUp() throws Exception {
        mockMvc.perform(post("/health/live.json"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    void loginKeyRespondsWithoutPlainPrivateMaterial() throws Exception {
        mockMvc.perform(post("/auth/login-key.json")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.key_id").isNotEmpty())
            .andExpect(jsonPath("$.data.public_key").isNotEmpty())
            .andExpect(jsonPath("$.data.private_key").doesNotExist());
    }

    @Test
    void serviceListRequiresAdminRequest() throws Exception {
        mockMvc.perform(post("/health/service/list.json"))
            .andExpect(status().is4xxClientError());
    }

    @Test
    void internalServiceUseStatusRequiresInternalToken() throws Exception {
        mockMvc.perform(post("/internal/service/use-status.json")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"service_cd\":\"admin-service\"}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void internalServiceUseStatusRespondsWithMinimalStatus() throws Exception {
        mockMvc.perform(post("/internal/service/use-status.json")
                .header("X-Internal-Api-Token", "dev-media-internal-token")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"service_cd\":\"admin-service\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.service_cd").value("admin-service"))
            .andExpect(jsonPath("$.data.use_yn").value("Y"))
            .andExpect(jsonPath("$.data.base_url").doesNotExist());
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
    void rootPageResolvesDashboardView() throws Exception {
        mockMvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(view().name("dashboard/app"));
    }

    @Test
    void serviceLoginPageUsesForwardedHttpsPublicBaseUrl() throws Exception {
        MockMvc forwardedMockMvc = MockMvcBuilders
            .standaloneSetup(new MainController("http://localhost:8081"))
            .addFilters(new SecurityHeadersFilter())
            .build();

        forwardedMockMvc.perform(get("/service-login-page.do")
                .header("X-Forwarded-Proto", "https")
                .header("X-Forwarded-Host", "adm.js65.myds.me")
                .header("X-Forwarded-Port", "80"))
            .andExpect(status().isOk())
            .andExpect(view().name("login/service-login-page"))
            .andExpect(model().attribute("adminServicePublicBaseUrl", "https://adm.js65.myds.me"));
    }

    @Test
    void mainPageRedirectsToRoot() throws Exception {
        mockMvc.perform(get("/main.do"))
            .andExpect(status().is3xxRedirection())
            .andExpect(header().string("Location", "/"));
    }

    @Test
    void userMainPageResolvesFragmentView() throws Exception {
        mockMvc.perform(post("/user/main.do"))
            .andExpect(status().isOk())
            .andExpect(view().name("fragments/user/main"));
    }

    @Test
    void authGroupMainPageResolvesFragmentView() throws Exception {
        mockMvc.perform(post("/auth/group/main.do"))
            .andExpect(status().isOk())
            .andExpect(view().name("fragments/auth/group-main"));
    }

    @Test
    void authUserMainPageResolvesFragmentView() throws Exception {
        mockMvc.perform(post("/auth/user/main.do"))
            .andExpect(status().isOk())
            .andExpect(view().name("fragments/auth/main"));
    }

    @Test
    void authGroupSaveRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/auth/group/save.json")
                .with(authenticatedUser())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"auth_group_cd\":\"OPS\",\"auth_group_nm\":\"운영권한\",\"use_yn\":\"Y\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.auth_group_seq").value(10001));
    }

    @Test
    void authGroupDeleteRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/auth/group/delete.json")
                .with(authenticatedUser())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"auth_group_seq\":10001}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.deleted").value(1));
    }

    @Test
    void authGroupUserListRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/auth/group/user/list.json")
                .with(authenticatedUser())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"auth_group_seq\":10001}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data[0].login_id").value("tester1"));
    }

    @Test
    void authGroupUserCandidateListRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/auth/group/user/candidateList.json")
                .with(authenticatedUser())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"auth_group_seq\":10001,\"keyword\":\"tester\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data[0].login_id").value("tester2"));
    }

    @Test
    void authGroupUserSaveRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/auth/group/user/save.json")
                .with(authenticatedUser())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"auth_group_seq\":10001,\"users\":[{\"user_seq\":2}]}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.saved").value(1));
    }

    @Test
    void authGroupUserDeleteRespondsWithoutServerError() throws Exception {
        mockMvc.perform(post("/auth/group/user/delete.json")
                .with(authenticatedUser())
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"auth_group_seq\":10001,\"user_seq\":2}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.ok").value(true))
            .andExpect(jsonPath("$.data.deleted").value(1));
    }

    private static RequestPostProcessor authenticatedUser() {
        return request -> {
            MockHttpServletRequest req = (MockHttpServletRequest) request;
            req.setAttribute("user_id", "ADMIN");
            req.setAttribute("session_id", "SESSION-1");
            req.setAttribute("roles", List.of("ROLE_ADMIN"));
            return req;
        };
    }

    private static MenuNode sampleMenuNode() {
        MenuNode node = new MenuNode();
        node.setMenuSeq(1L);
        node.setMenuNm("Dashboard");
        node.setMenuUrl("/home.do");
        node.setIconClass("icon-home");
        return node;
    }
}
