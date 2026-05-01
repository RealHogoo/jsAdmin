package com.realhogoo.jsadmin.auth;

import com.realhogoo.jsadmin.api.ApiException;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.List;

public final class AuthRequestSupport {

    private AuthRequestSupport() {
    }

    @SuppressWarnings("unchecked")
    public static List<String> roles(HttpServletRequest request) {
        Object roles = request == null ? null : request.getAttribute("roles");
        return roles instanceof List ? (List<String>) roles : Collections.<String>emptyList();
    }

    public static String userId(HttpServletRequest request) {
        Object userId = request == null ? null : request.getAttribute("user_id");
        return userId == null ? "" : String.valueOf(userId);
    }

    public static boolean isAdmin(HttpServletRequest request) {
        List<String> roles = roles(request);
        return roles.contains("ROLE_ADMIN") || roles.contains("ROLE_SUPER_ADMIN");
    }

    public static void ensureAdmin(HttpServletRequest request) {
        if (!isAdmin(request)) {
            throw ApiException.forbidden("\uad8c\ud55c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4. \uad00\ub9ac\uc790 \uad8c\ud55c\uc774 \ud544\uc694\ud569\ub2c8\ub2e4.");
        }
    }
}
