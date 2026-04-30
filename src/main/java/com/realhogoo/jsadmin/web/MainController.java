package com.realhogoo.jsadmin.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class MainController {

    private final String adminServicePublicBaseUrl;

    public MainController(@Value("${app.public-base-url:http://localhost:8081}") String adminServicePublicBaseUrl) {
        this.adminServicePublicBaseUrl = normalizeBaseUrl(adminServicePublicBaseUrl);
    }

    @GetMapping("/")
    public String index(Model model, HttpServletRequest request) {
        model.addAttribute("initialPage", "/home.do");
        model.addAttribute("adminServicePublicBaseUrl", effectivePublicBaseUrl(request));
        return "dashboard/app";
    }

    @GetMapping("/main.do")
    public RedirectView main() {
        return new RedirectView("/", true);
    }

    @GetMapping("/login-page.do")
    public String loginPage(Model model, HttpServletRequest request) {
        model.addAttribute("initialPage", "/login.do");
        model.addAttribute("adminServicePublicBaseUrl", effectivePublicBaseUrl(request));
        return "dashboard/app";
    }

    @GetMapping("/service-login-page.do")
    public String serviceLoginPage(
        @RequestParam(name = "service_nm", required = false) String serviceName,
        Model model,
        HttpServletRequest request
    ) {
        model.addAttribute("serviceName", normalizeServiceName(serviceName));
        model.addAttribute("adminServicePublicBaseUrl", effectivePublicBaseUrl(request));
        return "login/service-login-page";
    }

    @PostMapping("/home.do")
    public String homeFragment() {
        return "fragments/home";
    }

    @PostMapping("/login.do")
    public String loginFragment() {
        return "fragments/login/login";
    }

    @PostMapping("/service-login.do")
    public String serviceLoginFragment(
        @RequestParam(name = "service_nm", required = false) String serviceName,
        Model model
    ) {
        model.addAttribute("serviceName", normalizeServiceName(serviceName));
        return "fragments/login/service-login";
    }

    @PostMapping("/home/intro.json")
    @ResponseBody
    public Map<String, Object> homeIntro() {
        String markdown = readTopLevelReadme();
        Map<String, Object> data = parseIntro(markdown);

        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private String readTopLevelReadme() {
        Path path = Paths.get("README.md");
        if (Files.exists(path)) {
            try {
                String md = new String(Files.readAllBytes(path), StandardCharsets.UTF_8);
                if (!isLikelyGarbled(md)) {
                    return md;
                }
            } catch (IOException ignored) {
            }
        }

        return "# MSA admin-service\n\n"
            + "Admin portal and login gateway\n"
            + "- Auth\n"
            + "- Main dashboard\n"
            + "- Health check";
    }

    private boolean isLikelyGarbled(String s) {
        if (s == null || s.isEmpty()) {
            return true;
        }
        int qCount = 0;
        int repCount = 0;
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (ch == '?') {
                qCount++;
            }
            if (ch == '\uFFFD') {
                repCount++;
            }
        }
        return qCount > 20 || repCount > 0;
    }

    private Map<String, Object> parseIntro(String markdown) {
        String[] lines = markdown == null ? new String[0] : markdown.split("\\r?\\n");

        String title = "MSA admin-service";
        String summary = "Admin portal and common gateway";
        List<String> bullets = new ArrayList<String>();
        boolean titleResolved = false;
        boolean summaryResolved = false;

        for (String raw : lines) {
            String line = raw == null ? "" : raw.trim();
            if (line.isEmpty()) {
                continue;
            }

            if (line.startsWith("# ") && !titleResolved) {
                title = line.substring(2).trim();
                titleResolved = true;
                continue;
            }

            if (!line.startsWith("#") && !line.startsWith("-") && !line.startsWith("```") && !summaryResolved) {
                summary = line;
                summaryResolved = true;
                continue;
            }

            if (line.startsWith("## ")) {
                String heading = line.substring(3).trim();
                heading = heading.replaceFirst("^\\d+(?:\\.\\d+)*\\.\\s*", "").trim();
                if (!heading.isEmpty() && !bullets.contains(heading)) {
                    bullets.add(heading);
                }
                continue;
            }

            if (bullets.size() < 8 && line.startsWith("- ")) {
                String bullet = line.substring(2).trim();
                if (!bullet.isEmpty() && !bullets.contains(bullet)) {
                    bullets.add(bullet);
                }
            }
        }

        if (bullets.isEmpty()) {
            bullets.add("Auth");
            bullets.add("Main dashboard");
            bullets.add("Health check");
        }

        Map<String, Object> data = new HashMap<String, Object>();
        data.put("title", title);
        data.put("summary", summary);
        data.put("highlights", bullets);
        data.put("raw_markdown", markdown == null ? "" : markdown);
        return data;
    }

    private String normalizeServiceName(String serviceName) {
        if (serviceName == null || serviceName.trim().isEmpty()) {
            return "Service";
        }
        return serviceName.trim();
    }

    private String normalizeBaseUrl(String baseUrl) {
        if (baseUrl == null) {
            return "";
        }
        String normalized = baseUrl.trim();
        while (normalized.endsWith("/")) {
            normalized = normalized.substring(0, normalized.length() - 1);
        }
        return normalized;
    }

    private String effectivePublicBaseUrl(HttpServletRequest request) {
        String requestBaseUrl = publicRequestBaseUrl(request);
        if (requestBaseUrl.isEmpty()) {
            return adminServicePublicBaseUrl;
        }
        if (adminServicePublicBaseUrl.isEmpty() || isLocalBaseUrl(adminServicePublicBaseUrl)) {
            return requestBaseUrl;
        }
        return upgradeConfiguredBaseUrl(adminServicePublicBaseUrl, requestBaseUrl);
    }

    private String publicRequestBaseUrl(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String scheme = firstHeaderValue(request.getHeader("X-Forwarded-Proto"));
        if (scheme == null || scheme.isEmpty()) {
            scheme = request.getScheme();
        }
        String host = firstHeaderValue(request.getHeader("X-Forwarded-Host"));
        if (host == null || host.isEmpty()) {
            host = request.getServerName();
        }
        int port = forwardedPort(request, scheme, host);
        String cleanHost = host;
        if (host.contains(":")) {
            cleanHost = host.substring(0, host.lastIndexOf(':'));
        }
        if ("http".equalsIgnoreCase(scheme) && isPublicHost(cleanHost) && (port == 80 || port == 8081)) {
            scheme = "https";
            port = 443;
        }
        return scheme.toLowerCase() + "://" + cleanHost + (isDefaultPort(scheme, port) ? "" : ":" + port);
    }

    private int forwardedPort(HttpServletRequest request, String scheme, String host) {
        String value = firstHeaderValue(request.getHeader("X-Forwarded-Port"));
        if (value != null) {
            try {
                return normalizePort(Integer.parseInt(value), scheme);
            } catch (NumberFormatException ignored) {
            }
        }
        if (host != null && host.contains(":")) {
            try {
                return normalizePort(Integer.parseInt(host.substring(host.lastIndexOf(':') + 1)), scheme);
            } catch (NumberFormatException ignored) {
            }
        }
        return normalizePort(request.getServerPort(), scheme);
    }

    private String upgradeConfiguredBaseUrl(String configuredBaseUrl, String requestBaseUrl) {
        try {
            URI configured = URI.create(configuredBaseUrl);
            URI request = URI.create(requestBaseUrl);
            if ("https".equalsIgnoreCase(request.getScheme())
                && "http".equalsIgnoreCase(configured.getScheme())
                && configured.getHost() != null
                && configured.getHost().equalsIgnoreCase(request.getHost())) {
                return requestBaseUrl;
            }
        } catch (Exception ignored) {
        }
        return configuredBaseUrl;
    }

    private String firstHeaderValue(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.split(",")[0].trim();
    }

    private int normalizePort(int port, String scheme) {
        if ("https".equalsIgnoreCase(scheme) && port == 80) {
            return 443;
        }
        if (port > 0) {
            return port;
        }
        return "https".equalsIgnoreCase(scheme) ? 443 : 80;
    }

    private boolean isDefaultPort(String scheme, int port) {
        return ("https".equalsIgnoreCase(scheme) && port == 443)
            || ("http".equalsIgnoreCase(scheme) && port == 80);
    }

    private boolean isLocalBaseUrl(String baseUrl) {
        try {
            URI uri = URI.create(baseUrl);
            return isLocalHost(uri.getHost());
        } catch (Exception ignored) {
            return false;
        }
    }

    private boolean isLocalHost(String host) {
        if (host == null) {
            return false;
        }
        return "localhost".equalsIgnoreCase(host)
            || "127.0.0.1".equals(host)
            || "::1".equals(host);
    }

    private boolean isPublicHost(String host) {
        if (host == null || isLocalHost(host)) {
            return false;
        }
        return !host.startsWith("10.")
            && !host.startsWith("192.168.")
            && !host.matches("^172\\.(1[6-9]|2\\d|3[0-1])\\..*");
    }
}
