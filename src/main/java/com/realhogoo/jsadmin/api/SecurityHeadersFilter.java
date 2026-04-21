package com.realhogoo.jsadmin.api;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class SecurityHeadersFilter implements Filter {

    private static final String CONTENT_SECURITY_POLICY =
        "default-src 'self'; " +
        "script-src 'self' 'unsafe-inline'; " +
        "connect-src 'self'; " +
        "style-src 'self' 'unsafe-inline'; " +
        "img-src 'self' data:; " +
        "font-src 'self' data:; " +
        "object-src 'none'; " +
        "base-uri 'self'; " +
        "form-action 'self'; " +
        "frame-src 'none'; " +
        "manifest-src 'self'; " +
        "frame-ancestors 'none'";

    @Override
    public void init(FilterConfig filterConfig) {
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {

        if (response instanceof HttpServletResponse) {
            HttpServletResponse resp = (HttpServletResponse) response;
            resp.setHeader("X-Content-Type-Options", "nosniff");
            resp.setHeader("X-Frame-Options", "DENY");
            resp.setHeader("X-Permitted-Cross-Domain-Policies", "none");
            resp.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
            resp.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
            resp.setHeader("Cross-Origin-Opener-Policy", "same-origin");
            resp.setHeader("Cross-Origin-Resource-Policy", "same-origin");
            resp.setHeader("Content-Security-Policy", CONTENT_SECURITY_POLICY);
            if (request.isSecure()) {
                resp.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
            }
        }

        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
    }
}
