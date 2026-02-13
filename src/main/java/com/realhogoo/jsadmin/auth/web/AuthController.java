package com.realhogoo.jsadmin.auth.web;

import com.realhogoo.jsadmin.auth.service.AuthService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/main.do")
    public String main() {
        return "fragments/auth/main";
    }

    /* =========================================================
     * TAB A: 그룹-메뉴 권한
     * ========================================================= */

    // 권한그룹 목록
    @PostMapping("/group/list.json")
    @ResponseBody
    public Map<String, Object> groupList(@RequestBody(required = false) Map<String, Object> body) {
        if (body == null) body = new HashMap<>();
        List<Map<String, Object>> list = authService.getAuthGroupList(body);
        return ok(list);
    }

    // 특정 그룹의 메뉴 권한(계층형 쿼리 결과 = 평면 + tree_lvl)
    @PostMapping("/group/menu/list.json")
    @ResponseBody
    public Map<String, Object> groupMenuList(@RequestBody Map<String, Object> body) {
        Long authGroupSeq = toLong(body.get("auth_group_seq"));
        List<Map<String, Object>> list = authService.getGroupMenuPermList(authGroupSeq);
        return ok(list);
    }

    // 그룹-메뉴 권한 저장(폴더는 프론트에서 풀어서 PAGE만 items로 보냄)
    @PostMapping("/group/menu/save.json")
    @ResponseBody
    public Map<String, Object> groupMenuSave(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        Long authGroupSeq = toLong(body.get("auth_group_seq"));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> items = (List<Map<String, Object>>) body.get("items");

        String actor = (String) req.getAttribute("user_id"); // JwtAuthFilter 세팅 전제
        int saved = authService.saveGroupMenuPerm(authGroupSeq, items, actor);

        return ok(Collections.singletonMap("saved", saved));
    }

    /* =========================================================
     * TAB B: 사용자 예외 (기존 유지)
     * ========================================================= */

    @PostMapping("/user/search.json")
    @ResponseBody
    public Map<String, Object> searchUsers(@RequestBody Map<String, Object> body) {
        List<Map<String, Object>> list = authService.searchUsers(body);
        return ok(list);
    }

    @PostMapping("/user/menuPermList.json")
    @ResponseBody
    public Map<String, Object> userMenuPermList(@RequestBody Map<String, Object> body) {
        Long userSeq = toLong(body.get("user_seq"));
        List<Map<String, Object>> list = authService.getUserMenuPermList(userSeq);
        return ok(list);
    }

    @PostMapping("/user/exception/save.json")
    @ResponseBody
    public Map<String, Object> saveExceptions(@RequestBody Map<String, Object> body, HttpServletRequest req) {
        Long userSeq = toLong(body.get("user_seq"));
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exceptions = (List<Map<String, Object>>) body.get("exceptions");

        String actor = (String) req.getAttribute("user_id"); // JwtAuthFilter 세팅 전제
        authService.saveUserExceptions(userSeq, exceptions, actor);

        return ok(Collections.singletonMap("saved", exceptions == null ? 0 : exceptions.size()));
    }

    @PostMapping("/user/exception/delete.json")
    @ResponseBody
    public Map<String, Object> deleteException(@RequestBody Map<String, Object> body) {
        Long userSeq = toLong(body.get("user_seq"));
        Long menuSeq = toLong(body.get("menu_seq"));
        authService.deleteUserException(userSeq, menuSeq);
        return ok(Collections.singletonMap("deleted", 1));
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private Long toLong(Object v) {
        if (v == null) return null;
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(String.valueOf(v));
    }
}
