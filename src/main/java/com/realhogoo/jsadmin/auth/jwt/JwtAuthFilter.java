package com.realhogoo.jsadmin.auth.jwt;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.api.ApiCode;
import com.realhogoo.jsadmin.api.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;
import org.springframework.web.servlet.FrameworkServlet;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

public class JwtAuthFilter implements Filter {
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    private static final Set<String> PERMIT = new HashSet<String>(Arrays.asList(
        "/login.json",
        "/health/status.json",
        "/home/intro.json",
        "/notice/list.json",
        "/menu/tree.json",
        "/menu/list.json",
        "/menu/detail.json",
        "/code/list.json",
        "/timeline/list.json",
        "/timeline/detail.json"
    ));

    private final ObjectMapper om = new ObjectMapper();
    private JwtProvider jwtProvider;
    private AccessService accessService;
    private ServletContext servletContext;

    @Override
    public void init(FilterConfig filterConfig) {
        this.servletContext = filterConfig.getServletContext();
        this.jwtProvider = resolveJwtProvider();
        this.accessService = resolveAccessService();
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        HttpServletRequest req = (HttpServletRequest) request;
        HttpServletResponse resp = (HttpServletResponse) response;

        if (!"POST".equalsIgnoreCase(req.getMethod())) {
            writeJson(resp, 405, ApiResponse.fail(ApiCode.METHOD_NOT_ALLOWED, "POST only", getTraceId(req)));
            return;
        }

        String path = getPath(req);
        if (PERMIT.contains(path)) {
            tryBindAuthContext(req);
            chain.doFilter(request, response);
            return;
        }

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
            JwtProvider provider = (jwtProvider != null) ? jwtProvider : resolveJwtProvider();
            if (provider == null) {
                writeJson(resp, 500, ApiResponse.fail(ApiCode.SERVER_ERROR, "auth provider not ready", getTraceId(req)));
                return;
            }

            DecodedJWT jwt = provider.verify(token);
            String userId = jwt.getSubject();
            String sessionId = jwt.getClaim("session_id").asString();
            List<String> roles = jwt.getClaim("roles").asList(String.class);
            if (roles == null) {
                roles = Collections.emptyList();
            }

            AccessService accessSvc = (accessService != null) ? accessService : resolveAccessService();
            if (accessSvc != null && sessionId != null && !sessionId.trim().isEmpty()) {
                try {
                    boolean active = accessSvc.touchSession(sessionId, Instant.now());
                    if (!active) {
                        writeUnauthorized(req, resp);
                        return;
                    }
                } catch (Exception e) {
                    log.error("session touch failed. uri={}, sessionId={}", path, sessionId, e);
                    writeJson(resp, 500, ApiResponse.fail(ApiCode.SERVER_ERROR, "session validation failed", getTraceId(req)));
                    return;
                }
            }

            req.setAttribute("user_id", userId);
            req.setAttribute("roles", roles);
            req.setAttribute("session_id", sessionId);
            chain.doFilter(request, response);
        } catch (JWTVerificationException e) {
            writeUnauthorized(req, resp);
        } catch (Exception e) {
            log.error("jwt filter error. uri={}", path, e);
            writeJson(resp, 500, ApiResponse.fail(ApiCode.SERVER_ERROR, "auth processing failed", getTraceId(req)));
        }
    }

    @Override
    public void destroy() {
    }

    private JwtProvider resolveJwtProvider() {
        WebApplicationContext ctx = resolveContext();
        if (ctx == null) {
            return null;
        }
        try {
            jwtProvider = ctx.getBean(JwtProvider.class);
            return jwtProvider;
        } catch (Exception e) {
            return null;
        }
    }

    private AccessService resolveAccessService() {
        WebApplicationContext ctx = resolveContext();
        if (ctx == null) {
            return null;
        }
        try {
            accessService = ctx.getBean(AccessService.class);
            return accessService;
        } catch (Exception e) {
            return null;
        }
    }

    private WebApplicationContext resolveContext() {
        if (servletContext == null) {
            return null;
        }
        WebApplicationContext ctx = WebApplicationContextUtils.getWebApplicationContext(servletContext);
        if (ctx == null) {
            Object dispatcherCtx = servletContext.getAttribute(FrameworkServlet.SERVLET_CONTEXT_PREFIX + "dispatcher");
            if (dispatcherCtx instanceof WebApplicationContext) {
                ctx = (WebApplicationContext) dispatcherCtx;
            }
        }
        return ctx;
    }

    private void writeUnauthorized(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        writeJson(resp, 401, ApiResponse.fail(ApiCode.UNAUTHORIZED, "login required", getTraceId(req)));
    }

    private void tryBindAuthContext(HttpServletRequest req) {
        String auth = req.getHeader("Authorization");
        if (auth == null || auth.isBlank() || !auth.startsWith("Bearer ")) {
            return;
        }

        String token = auth.substring("Bearer ".length()).trim();
        if (token.isEmpty()) {
            return;
        }

        try {
            JwtProvider provider = (jwtProvider != null) ? jwtProvider : resolveJwtProvider();
            if (provider == null) return;

            DecodedJWT jwt = provider.verify(token);
            String userId = jwt.getSubject();
            String sessionId = jwt.getClaim("session_id").asString();
            List<String> roles = jwt.getClaim("roles").asList(String.class);
            if (roles == null) {
                roles = Collections.emptyList();
            }
            AccessService accessSvc = (accessService != null) ? accessService : resolveAccessService();
            if (accessSvc != null && sessionId != null && !sessionId.trim().isEmpty()) {
                boolean active = accessSvc.touchSession(sessionId, Instant.now());
                if (!active) {
                    return;
                }
            }

            req.setAttribute("user_id", userId);
            req.setAttribute("roles", roles);
            req.setAttribute("session_id", sessionId);
        } catch (Exception ignored) {
        }
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
        Object v = req.getAttribute("trace_id");
        if (v == null) {
            v = req.getHeader("X-Trace-Id");
        }
        if (v == null) {
            v = req.getHeader("X-Request-Id");
        }
        return v != null ? String.valueOf(v) : java.util.UUID.randomUUID().toString();
    }
}
