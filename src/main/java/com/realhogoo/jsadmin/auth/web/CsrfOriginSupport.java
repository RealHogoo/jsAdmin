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

            String requestScheme = normalize(request.getScheme());
            String requestHost = normalize(request.getServerName());
            int requestPort = normalizedPort(request.getServerPort(), requestScheme);

            return sourceScheme.equals(requestScheme)
                && sourceHost.equals(requestHost)
                && sourcePort == requestPort;
        } catch (Exception ignored) {
            return false;
        }
    }

    private static int normalizedPort(int port, String scheme) {
        if (port > 0) {
            return port;
        }
        return "https".equals(scheme) ? 443 : 80;
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
