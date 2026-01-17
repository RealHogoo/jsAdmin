// 파일: src/main/java/com/realhogoo/jsadmin/auth/jwt/JwtAuthFilter.java

package com.realhogoo.jsadmin.auth.jwt;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realhogoo.jsadmin.api.ApiCode;
import com.realhogoo.jsadmin.api.ApiResponse;

import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.*;

public class JwtAuthFilter implements Filter {

    private static final Set<String> PERMIT = new HashSet<>(Arrays.asList(
        "/login.json",
        "/health/status.json"
    ));

    private final ObjectMapper om = new ObjectMapper();
    private JwtProvider jwtProvider;

    @Override
    public void init(FilterConfig filterConfig) {
        // root-context.xml + ContextLoaderListener 구조이므로 여기서 Bean을 꺼내는 방식이 정석
        WebApplicationContext ctx =
            WebApplicationContextUtils.getRequiredWebApplicationContext(filterConfig.getServletContext());
        this.jwtProvider = ctx.getBean(JwtProvider.class);
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        // POST 고정 규칙
        if (!"POST".equalsIgnoreCase(req.getMethod())) {
            writeJson(resp, 405, ApiResponse.fail(ApiCode.METHOD_NOT_ALLOWED, "POST only", getTraceId(req)));
            return;
        }

        String path = getPath(req);

        // permit 통과
        if (PERMIT.contains(path)) {
            chain.doFilter(request, response);
            return;
        }

        // Authorization 검사
        String auth = req.getHeader("Authorization");
        if (auth == null || auth.isBlank() || !auth.startsWith("Bearer ")) {
            writeUnauthorized(req, resp);
            return;
        }

        String token = auth.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            writeUnauthorized(req, resp);
            return;
        }

        try {
            // Auth0 verifier가 서명/issuer/exp까지 검증 (만료면 예외 발생)
            DecodedJWT jwt = jwtProvider.verify(token);

            // createToken()에서 userId는 subject에 들어감
            String userId = jwt.getSubject();

            // roles claim은 List<String>
            List<String> roles = jwt.getClaim("roles").asList(String.class);
            if (roles == null) roles = Collections.emptyList();

            req.setAttribute("user_id", userId);
            req.setAttribute("roles", roles);

            chain.doFilter(request, response);

        } catch (JWTVerificationException e) {
            // 서명 오류/만료 등
            writeUnauthorized(req, resp);
        } catch (Exception e) {
            writeUnauthorized(req, resp);
        }
    }

    @Override
    public void destroy() {}

    private void writeUnauthorized(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        writeJson(resp, 401, ApiResponse.fail(ApiCode.UNAUTHORIZED, "login required", getTraceId(req)));
    }

    private void writeJson(HttpServletResponse resp, int status, Object body) throws IOException {
        resp.setStatus(status);
        resp.setCharacterEncoding("UTF-8");
        resp.setContentType("application/json; charset=UTF-8");
        resp.getWriter().write(om.writeValueAsString(body));
    }

    private String getPath(HttpServletRequest req) {
        String ctx = req.getContextPath();
        String uri = req.getRequestURI();
        return (ctx != null && !ctx.isEmpty()) ? uri.substring(ctx.length()) : uri;
    }

    private String getTraceId(HttpServletRequest req) {
        // TraceIdFilter.java가 현재 "trace_id"로 세팅 중
        Object v = req.getAttribute("trace_id");
        if (v == null) v = req.getHeader("X-Trace-Id");
        if (v == null) v = req.getHeader("X-Request-Id");
        return v != null ? String.valueOf(v) : java.util.UUID.randomUUID().toString();
    }
}
