package com.realhogoo.jsadmin.auth.jwt;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.api.ApiCode;
import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.auth.web.AuthCookieSupport;
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
import java.net.InetAddress;
import java.net.URI;
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
        "/auth/ping.json",
        "/auth/refresh.json",
        "/health/live.json",
        "/health/ready.json",
        "/health/status.json",
        "/menu/tree.json",
        "/home/intro.json",
        "/notice/list.json",
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
            writeJson(resp, 405, ApiResponse.fail(ApiCode.METHOD_NOT_ALLOWED, "\ud5c8\uc6a9\ub418\uc9c0 \uc54a\uc740 \uc694\uccad \ubc29\uc2dd\uc785\ub2c8\ub2e4.", req));
            return;
        }

        String path = getPath(req);
        if (PERMIT.contains(path)) {
            tryBindAuthContext(req);
            chain.doFilter(request, response);
            return;
        }

        String authorizationToken = resolveBearerToken(req);
        String cookieToken = normalizeToken(AuthCookieSupport.readCookie(req, AuthCookieSupport.ACCESS_TOKEN_COOKIE));
        String token = authorizationToken.isEmpty() ? cookieToken : authorizationToken;
        if (token.isEmpty()) {
            writeUnauthorized(req, resp);
            return;
        }
        if (authorizationToken.isEmpty() && cookieToken != null && isCrossSiteRequest(req)) {
            writeJson(resp, 403, ApiResponse.fail(ApiCode.FORBIDDEN, "\uc778\uc99d \ucfe0\ud0a4\ub97c \uc0ac\uc6a9\ud560 \uc218 \uc5c6\ub294 \uc694\uccad\uc785\ub2c8\ub2e4.", req));
            return;
        }

        try {
            JwtProvider provider = (jwtProvider != null) ? jwtProvider : resolveJwtProvider();
            if (provider == null) {
                writeJson(resp, 500, ApiResponse.fail(ApiCode.SERVER_ERROR, null, req));
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
                    writeJson(resp, 500, ApiResponse.fail(ApiCode.SERVER_ERROR, null, req));
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
            writeJson(resp, 500, ApiResponse.fail(ApiCode.SERVER_ERROR, null, req));
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
        writeJson(resp, 401, ApiResponse.fail(ApiCode.UNAUTHORIZED, "\ub85c\uadf8\uc778\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.", req));
    }

    private void tryBindAuthContext(HttpServletRequest req) {
        String authorizationToken = resolveBearerToken(req);
        String cookieToken = normalizeToken(AuthCookieSupport.readCookie(req, AuthCookieSupport.ACCESS_TOKEN_COOKIE));
        String token = authorizationToken.isEmpty() ? cookieToken : authorizationToken;
        if (token.isEmpty()) {
            return;
        }
        if (authorizationToken.isEmpty() && cookieToken != null && isCrossSiteRequest(req)) {
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

    private String resolveBearerToken(HttpServletRequest request) {
        String auth = request.getHeader("Authorization");
        if (auth != null && !auth.isBlank() && auth.startsWith("Bearer ")) {
            String token = auth.substring("Bearer ".length()).trim();
            if (!token.isEmpty()) {
                return token;
            }
        }
        return "";
    }

    private String normalizeToken(String token) {
        return token == null ? "" : token.trim();
    }

    private boolean isCrossSiteRequest(HttpServletRequest request) {
        String secFetchSite = request.getHeader("Sec-Fetch-Site");
        if (secFetchSite != null) {
            String normalized = secFetchSite.trim().toLowerCase();
            if ("cross-site".equals(normalized)) {
                return true;
            }
            if ("same-origin".equals(normalized) || "same-site".equals(normalized) || "none".equals(normalized)) {
                return false;
            }
        }
        return !isSameOrigin(request, request.getHeader("Origin")) || !isSameOrigin(request, request.getHeader("Referer"));
    }

    private boolean isSameOrigin(HttpServletRequest request, String source) {
        URI uri;
        if (source == null || source.trim().isEmpty()) {
            return true;
        }
        try {
            uri = URI.create(source.trim());
        } catch (Exception exception) {
            return false;
        }
        String sourceScheme = uri.getScheme();
        String sourceHost = uri.getHost();
        int sourcePort = uri.getPort();
        String requestScheme = forwardedScheme(request);
        String requestHost = forwardedHost(request);
        int requestPort = forwardedPort(request);
        if (sourceScheme == null || sourceHost == null) {
            return false;
        }
        return sourceScheme.equalsIgnoreCase(requestScheme)
            && sourceHost.equalsIgnoreCase(requestHost)
            && normalizePort(sourcePort, sourceScheme) == normalizePort(requestPort, requestScheme);
    }

    private String forwardedScheme(HttpServletRequest request) {
        String value = isTrustedForwardedSource(request) ? request.getHeader("X-Forwarded-Proto") : null;
        return value == null || value.trim().isEmpty() ? request.getScheme() : value.trim();
    }

    private String forwardedHost(HttpServletRequest request) {
        String value = isTrustedForwardedSource(request) ? request.getHeader("X-Forwarded-Host") : null;
        if (value == null || value.trim().isEmpty()) {
            return request.getServerName();
        }
        return value.split(",")[0].trim().split(":")[0].trim();
    }

    private int forwardedPort(HttpServletRequest request) {
        String forwardedPort = isTrustedForwardedSource(request) ? request.getHeader("X-Forwarded-Port") : null;
        if (forwardedPort != null && !forwardedPort.trim().isEmpty()) {
            try {
                return Integer.parseInt(forwardedPort.trim());
            } catch (NumberFormatException ignored) {
            }
        }
        return request.getServerPort();
    }

    private int normalizePort(int port, String scheme) {
        if (port > 0) {
            return port;
        }
        return "https".equalsIgnoreCase(scheme) ? 443 : 80;
    }

    private boolean isTrustedForwardedSource(HttpServletRequest request) {
        if (request == null) {
            return false;
        }
        String configured = System.getProperty("app.trust-forwarded-headers");
        if (configured == null || configured.trim().isEmpty()) {
            configured = System.getenv("TRUST_FORWARDED_HEADERS");
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
}
