package com.realhogoo.jsadmin.mypage.web;

import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.auth.service.LoginCryptoService;
import com.realhogoo.jsadmin.user.service.UserService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class MyPageController {
    private static final int MAX_USER_NAME_LENGTH = 100;

    private final UserService userService;
    private final AccessService accessService;
    private final LoginCryptoService loginCryptoService;
    private final String appEnv;

    public MyPageController(
        UserService userService,
        AccessService accessService,
        LoginCryptoService loginCryptoService,
        @Value("${app.env:dev}") String appEnv
    ) {
        this.userService = userService;
        this.accessService = accessService;
        this.loginCryptoService = loginCryptoService;
        this.appEnv = appEnv == null ? "dev" : appEnv.trim();
    }

    @PostMapping("/mypage/main.do")
    public String main() {
        return "fragments/mypage/main";
    }

    @PostMapping("/mypage/detail.json")
    @ResponseBody
    public Map<String, Object> detail(HttpServletRequest request) {
        return ok(userService.getMyProfile(currentUserId(request)));
    }

    @PostMapping("/mypage/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String currentUserId = currentUserId(request);
        String userNm = toNullableString(body == null ? null : body.get("user_nm"));
        if (userNm == null) {
            throw new IllegalArgumentException("user_nm is required");
        }
        validateLength("user_nm", userNm, MAX_USER_NAME_LENGTH);
        int updated = userService.updateMyProfile(currentUserId, body, currentUserId);
        accessService.recordLoginHistory(loginUser(request), currentUserId, true, "MYPAGE_UPDATE", sessionId(request), request);
        return ok(updated);
    }

    @PostMapping("/mypage/changePassword.json")
    @ResponseBody
    public Map<String, Object> changePassword(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String currentUserId = currentUserId(request);
        Map<String, Object> payload = resolveSensitiveBody(body);
        String currentPassword = payload == null || payload.get("current_password") == null ? null : String.valueOf(payload.get("current_password"));
        String newPassword = payload == null || payload.get("new_password") == null ? null : String.valueOf(payload.get("new_password"));
        int changed = userService.changeMyPassword(currentUserId, currentPassword, newPassword, currentUserId);
        accessService.recordLoginHistory(loginUser(request), currentUserId, true, "MYPAGE_PASSWORD_CHANGE", sessionId(request), request);
        return ok(changed);
    }

    private Map<String, Object> resolveSensitiveBody(Map<String, Object> body) {
        if (body != null && body.get("login_payload_enc") != null) {
            return loginCryptoService.decryptPayload(
                toNullableString(body.get("login_key_id")),
                toNullableString(body.get("login_payload_enc"))
            );
        }
        if (isProduction()) {
            throw new IllegalArgumentException("encrypted payload is required");
        }
        return body;
    }

    private boolean isProduction() {
        return "prod".equalsIgnoreCase(appEnv) || "production".equalsIgnoreCase(appEnv);
    }

    private String currentUserId(HttpServletRequest request) {
        Object userId = request.getAttribute("user_id");
        if (userId == null) {
            throw new IllegalArgumentException("login required");
        }
        return String.valueOf(userId);
    }

    private String sessionId(HttpServletRequest request) {
        Object sessionId = request.getAttribute("session_id");
        return sessionId == null ? null : String.valueOf(sessionId);
    }

    private LoginUser loginUser(HttpServletRequest request) {
        Map<String, Object> profile = userService.getMyProfile(currentUserId(request));
        LoginUser user = new LoginUser();
        Object userSeq = profile.get("user_seq");
        if (userSeq instanceof Number) {
            user.setUserSeq(((Number) userSeq).longValue());
        } else if (userSeq != null) {
            user.setUserSeq(Long.valueOf(String.valueOf(userSeq)));
        }
        user.setUserId(String.valueOf(profile.get("login_id")));
        Object userNm = profile.get("user_nm");
        user.setUserNm(userNm == null ? null : String.valueOf(userNm));
        return user;
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private String toNullableString(Object value) {
        if (value == null) {
            return null;
        }
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) {
            return null;
        }
        return s;
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}
