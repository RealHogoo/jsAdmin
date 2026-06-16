package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.api.ApiResponse;
import com.realhogoo.jsadmin.auth.service.AuthService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Map;

@Controller
public class LoginController {
    private static final int MAX_LOGIN_ID_LENGTH = 100;
    private static final int MAX_PASSWORD_LENGTH = 1000;

    private final AuthService authService;

    public LoginController(AuthService authService) {
        this.authService = authService;
    }

    @ResponseBody
    @RequestMapping(value = "/login.json", method = RequestMethod.POST, produces = "application/json;charset=UTF-8")
    public ApiResponse<Map<String, Object>> login(
        @RequestBody Map<String, Object> body,
        HttpServletRequest request,
        HttpServletResponse response
    ) {
        if (!CsrfOriginSupport.isSameOriginRequest(request)) {
            return ApiResponse.fail("FORBIDDEN", "허용되지 않은 출처의 로그인 요청입니다.", null, request);
        }
        String userId = body.get("user_id") == null ? null : String.valueOf(body.get("user_id"));
        String userPw = body.get("user_pw") == null ? null : String.valueOf(body.get("user_pw"));
        if (userId == null || userId.trim().isEmpty() || userPw == null) {
            return ApiResponse.fail("BAD_REQUEST", "\uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694.", null, request);
        }
        validateLength("user_id", userId.trim(), MAX_LOGIN_ID_LENGTH);
        validateLength("user_pw", userPw, MAX_PASSWORD_LENGTH);

        ApiResponse<Map<String, Object>> result = authService.login(userId.trim(), userPw, request);
        applyNoStore(response);
        if (result != null && result.isOk() && result.getData() != null) {
            AuthCookieSupport.writeAuthCookies(
                request,
                response,
                stringValue(result.getData().get("token")),
                stringValue(result.getData().get("refresh_token")),
                stringValue(result.getData().get("session_id"))
            );
        } else {
            AuthCookieSupport.clearAuthCookies(request, response);
        }
        return result;
    }

    private void applyNoStore(HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
        response.setHeader("Pragma", "no-cache");
        response.setHeader("Expires", "0");
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }

    private String stringValue(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? null : text;
    }
}
