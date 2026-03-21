package com.realhogoo.jsadmin.auth.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class SuperAdminProperties {

    private final String loginId;
    private final String password;

    public SuperAdminProperties(
        @Value("${auth.super.login-id:ADMIN}") String loginId,
        @Value("${auth.super.password:}") String password
    ) {
        this.loginId = loginId == null ? "ADMIN" : loginId.trim();
        this.password = password == null ? "" : password;
    }

    public String getLoginId() {
        return loginId;
    }

    public boolean isSuperLoginId(String loginId) {
        return this.loginId != null && !this.loginId.isEmpty() && this.loginId.equals(loginId);
    }

    public boolean isSuperLoginIdIgnoreCase(String loginId) {
        return this.loginId != null && !this.loginId.isEmpty() && loginId != null && this.loginId.equalsIgnoreCase(loginId);
    }

    public boolean hasSuperPassword() {
        return password != null && !password.isEmpty();
    }

    public boolean matchesSuperPassword(String rawPassword) {
        return hasSuperPassword() && password.equals(rawPassword);
    }
}
