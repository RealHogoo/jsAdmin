package com.realhogoo.jsadmin.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.view.RedirectView;

import java.io.IOException;
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
    public String index(Model model) {
        model.addAttribute("initialPage", "/home.do");
        model.addAttribute("adminServicePublicBaseUrl", adminServicePublicBaseUrl);
        return "dashboard/app";
    }

    @GetMapping("/main.do")
    public RedirectView main() {
        return new RedirectView("/", true);
    }

    @GetMapping("/login-page.do")
    public String loginPage(Model model) {
        model.addAttribute("initialPage", "/login.do");
        model.addAttribute("adminServicePublicBaseUrl", adminServicePublicBaseUrl);
        return "dashboard/app";
    }

    @GetMapping("/service-login-page.do")
    public String serviceLoginPage(
        @RequestParam(name = "service_nm", required = false) String serviceName,
        Model model
    ) {
        model.addAttribute("serviceName", normalizeServiceName(serviceName));
        model.addAttribute("adminServicePublicBaseUrl", adminServicePublicBaseUrl);
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
}
