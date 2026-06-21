package com.realhogoo.jsadmin.auth.web;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.util.Locale;

final class CsrfOriginSupport {
    private CsrfOriginSupport() {
    }

    static boolean isSameOriginRequest(HttpServletRequest request) {
        String origin = trimToNull(request.getHeader("Origin"));
        if (origin != null) {
            return isSameOrigin(request, origin);
        }
        String referer = trimToNull(request.getHeader("Referer"));
        return referer == null || isSameOrigin(request, referer);
    }

    private static boolean isSameOrigin(HttpServletRequest request, String source) {
        try {
            URI sourceUri = URI.create(source);
            String sourceScheme = normalize(sourceUri.getScheme());
            String sourceHost = normalize(sourceUri.getHost());
            int sourcePort = normalizedPort(sourceUri.getPort(), sourceScheme);

            String requestScheme = normalize(forwardedScheme(request));
            String requestHost = normalize(forwardedHost(request));
            int requestPort = normalizedPort(forwardedPort(request), requestScheme);

            return sourceScheme.equals(requestScheme)
                && sourceHost.equals(requestHost)
                && sourcePort == requestPort;
        } catch (Exception ignored) {
            return false;
        }
    }

    private static String forwardedScheme(HttpServletRequest request) {
        String value = isTrustedForwardedSource(request) ? firstHeaderValue(request.getHeader("X-Forwarded-Proto")) : null;
        return value == null || value.trim().isEmpty() ? request.getScheme() : value.trim();
    }

    private static String forwardedHost(HttpServletRequest request) {
        String value = isTrustedForwardedSource(request) ? firstHeaderValue(request.getHeader("X-Forwarded-Host")) : null;
        if (value == null || value.trim().isEmpty()) {
            return request.getServerName();
        }
        return value.split(":")[0].trim();
    }

    private static int forwardedPort(HttpServletRequest request) {
        String forwardedPort = isTrustedForwardedSource(request) ? firstHeaderValue(request.getHeader("X-Forwarded-Port")) : null;
        if (forwardedPort != null && !forwardedPort.trim().isEmpty()) {
            try {
                return Integer.parseInt(forwardedPort.trim());
            } catch (NumberFormatException ignored) {
            }
        }
        String forwardedHost = isTrustedForwardedSource(request) ? firstHeaderValue(request.getHeader("X-Forwarded-Host")) : null;
        if (forwardedHost != null && forwardedHost.contains(":")) {
            try {
                return Integer.parseInt(forwardedHost.substring(forwardedHost.lastIndexOf(':') + 1).trim());
            } catch (NumberFormatException ignored) {
            }
        }
        return request.getServerPort();
    }

    private static int normalizedPort(int port, String scheme) {
        if (port > 0) {
            return port;
        }
        return "https".equals(scheme) ? 443 : 80;
    }

    private static boolean isTrustedForwardedSource(HttpServletRequest request) {
        String configured = trimToNull(System.getProperty("app.trust-forwarded-headers"));
        if (configured == null) {
            configured = trimToNull(System.getenv("TRUST_FORWARDED_HEADERS"));
        }
        if ("true".equalsIgnoreCase(configured)) {
            return true;
        }
        try {
            String remote = request.getRemoteAddr();
            return "127.0.0.1".equals(remote) || "0:0:0:0:0:0:0:1".equals(remote) || "::1".equals(remote);
        } catch (Exception ignored) {
            return false;
        }
    }

    private static String firstHeaderValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.split(",")[0].trim();
    }

    private static String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private static String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
