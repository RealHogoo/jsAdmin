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
        String userId = body.get("user_id") == null ? null : String.valueOf(body.get("user_id"));
        String userPw = body.get("user_pw") == null ? null : String.valueOf(body.get("user_pw"));
        if (userId == null || userId.trim().isEmpty() || userPw == null) {
            return ApiResponse.fail("BAD_REQUEST", "?袁⑹뵠???癒?뮉 ??쑬?甕곕뜇?뉒몴??類ㅼ뵥??雅뚯눘苑??", null, request);
        }
        validateLength("user_id", userId.trim(), MAX_LOGIN_ID_LENGTH);
        validateLength("user_pw", userPw, MAX_PASSWORD_LENGTH);

        ApiResponse<Map<String, Object>> result = authService.login(userId.trim(), userPw, request);
        if (result != null && result.isOk() && result.getData() != null) {
            AuthCookieSupport.writeAuthCookies(
                response,
                stringValue(result.getData().get("token")),
                stringValue(result.getData().get("refresh_token")),
                stringValue(result.getData().get("session_id"))
            );
        } else {
            AuthCookieSupport.clearAuthCookies(response);
        }
        return result;
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
