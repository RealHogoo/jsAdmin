package com.realhogoo.jsadmin.web;

import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.api.GlobalExceptionHandler;
import com.realhogoo.jsadmin.api.SecurityHeadersFilter;
import com.realhogoo.jsadmin.auth.service.AuthService;
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
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.view;

class WebLayerSmokeTest {

    private MockMvc mockMvc;
    private AuthService authService;
    private MenuService menuService;
    private UserService userService;
    private NoticeService noticeService;

    @BeforeEach
    void setUp() {
        authService = mock(AuthService.class);
        menuService = mock(MenuService.class);
        userService = mock(UserService.class);
        noticeService = mock(NoticeService.class);
        DataSource dataSource = mock(DataSource.class);
        HealthMapper healthMapper = mock(HealthMapper.class);
        ServiceRegistryMapper serviceRegistryMapper = mock(ServiceRegistryMapper.class);
        ServiceEndpointPolicy serviceEndpointPolicy = mock(ServiceEndpointPolicy.class);

        when(authService.login(anyString(), anyString(), any())).thenReturn(ApiResponse.ok(Collections.emptyMap(), "TRACE-1"));
        when(authService.me(anyString(), any(), anyString()))
            .thenReturn(Map.of("user_id", "ADMIN", "user_nm", "ADMIN USER"));
        when(authService.saveAuthGroup(any(), anyString())).thenReturn(10001L);
        when(authService.deleteAuthGroup(any(), anyString())).thenReturn(1);
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
                new LoginController(authService),
                new AuthController(authService),
                new MenuController(menuService),
                new UserController(userService),
                new NoticeController(noticeService),
                new HealthController(dataSource, healthMapper, serviceRegistryMapper, serviceEndpointPolicy),
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
