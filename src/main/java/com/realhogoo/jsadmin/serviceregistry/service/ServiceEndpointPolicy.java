package com.realhogoo.jsadmin.serviceregistry.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Locale;
import java.util.Set;

@Component
public class ServiceEndpointPolicy {

    private final Set<String> allowedOrigins;

    public ServiceEndpointPolicy(
        @Value("${service-registry.allowed-origins:http://localhost:8081,http://localhost:8082}") String allowedOrigins
    ) {
        this.allowedOrigins = parseAllowedOrigins(allowedOrigins);
    }

    public String normalizeBaseUrl(String baseUrl) {
        String text = trimToNull(baseUrl);
        if (text == null) {
            throw new IllegalArgumentException("base_url is required");
        }
        URI uri = parseAbsoluteHttpUrl(text, "base_url");
        if (uri.getRawPath() != null && !uri.getRawPath().isEmpty() && !"/".equals(uri.getRawPath())) {
            throw new IllegalArgumentException("base_url must not contain a path");
        }
        if (uri.getRawQuery() != null || uri.getRawFragment() != null || uri.getRawUserInfo() != null) {
            throw new IllegalArgumentException("base_url must not contain user info, query, or fragment");
        }
        String origin = originOf(uri);
        if (!allowedOrigins.contains(origin)) {
            throw new IllegalArgumentException("base_url origin is not allowed");
        }
        return origin;
    }

    public String normalizeHealthPath(String path, String fieldName) {
        String text = trimToNull(path);
        if (text == null) {
            throw new IllegalArgumentException(fieldName + " is required");
        }
        if (!text.startsWith("/")) {
            throw new IllegalArgumentException(fieldName + " must start with '/'");
        }
        if (text.startsWith("//")) {
            throw new IllegalArgumentException(fieldName + " must be a relative path");
        }
        if (text.contains("..") || text.contains("\\") || text.contains("?") || text.contains("#")) {
            throw new IllegalArgumentException(fieldName + " contains an invalid path");
        }
        return text;
    }

    public String resolveAllowedEndpoint(String baseUrl, String path, String fieldName) {
        String normalizedBaseUrl = normalizeBaseUrl(baseUrl);
        String normalizedPath = normalizeHealthPath(path, fieldName);
        URI resolved = URI.create(normalizedBaseUrl).resolve(normalizedPath);
        if (!allowedOrigins.contains(originOf(resolved))) {
            throw new IllegalArgumentException(fieldName + " origin is not allowed");
        }
        return resolved.toString();
    }

    private Set<String> parseAllowedOrigins(String value) {
        Set<String> origins = new LinkedHashSet<String>();
        Arrays.stream((value == null ? "" : value).split(","))
            .map(String::trim)
            .filter(token -> !token.isEmpty())
            .forEach(token -> origins.add(originOf(parseAbsoluteHttpUrl(token, "service-registry.allowed-origins"))));
        if (origins.isEmpty()) {
            throw new IllegalArgumentException("service-registry.allowed-origins must not be empty");
        }
        return origins;
    }

    private URI parseAbsoluteHttpUrl(String value, String fieldName) {
        URI uri;
        try {
            uri = URI.create(value);
        } catch (Exception exception) {
            throw new IllegalArgumentException(fieldName + " must be a valid URL");
        }
        String scheme = trimToNull(uri.getScheme());
        String host = trimToNull(uri.getHost());
        if (scheme == null || host == null) {
            throw new IllegalArgumentException(fieldName + " must be an absolute URL");
        }
        String normalizedScheme = scheme.toLowerCase(Locale.ROOT);
        if (!"http".equals(normalizedScheme) && !"https".equals(normalizedScheme)) {
            throw new IllegalArgumentException(fieldName + " must use http or https");
        }
        return uri;
    }

    private String originOf(URI uri) {
        String scheme = uri.getScheme().toLowerCase(Locale.ROOT);
        String host = uri.getHost().toLowerCase(Locale.ROOT);
        int port = uri.getPort();
        if (port < 0) {
            port = "https".equals(scheme) ? 443 : 80;
        }
        return scheme + "://" + host + ":" + port;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String text = value.trim();
        return text.isEmpty() ? null : text;
    }
}
