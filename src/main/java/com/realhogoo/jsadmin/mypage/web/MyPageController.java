package com.realhogoo.jsadmin.mypage.web;

import com.realhogoo.jsadmin.access.service.AccessService;
import com.realhogoo.jsadmin.auth.dto.LoginUser;
import com.realhogoo.jsadmin.user.service.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class MyPageController {

    private final UserService userService;
    private final AccessService accessService;

    public MyPageController(UserService userService, AccessService accessService) {
        this.userService = userService;
        this.accessService = accessService;
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
        int updated = userService.updateMyProfile(currentUserId, body, currentUserId);
        accessService.recordLoginHistory(loginUser(request), currentUserId, true, "MYPAGE_UPDATE", sessionId(request), request);
        return ok(updated);
    }

    @PostMapping("/mypage/changePassword.json")
    @ResponseBody
    public Map<String, Object> changePassword(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        String currentUserId = currentUserId(request);
        String currentPassword = body == null || body.get("current_password") == null ? null : String.valueOf(body.get("current_password"));
        String newPassword = body == null || body.get("new_password") == null ? null : String.valueOf(body.get("new_password"));
        int changed = userService.changeMyPassword(currentUserId, currentPassword, newPassword, currentUserId);
        accessService.recordLoginHistory(loginUser(request), currentUserId, true, "MYPAGE_PASSWORD_CHANGE", sessionId(request), request);
        return ok(changed);
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
}
