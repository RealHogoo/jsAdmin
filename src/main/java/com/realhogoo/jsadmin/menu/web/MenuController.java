package com.realhogoo.jsadmin.menu.web;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.service.MenuService;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping("/menu/tree.json")
    public Map<String, Object> tree(HttpServletRequest req) {
        // JwtAuthFilter가 세팅한 값 사용(요구사항: request attribute에 user_id/roles 세팅)
        Object userIdObj = req.getAttribute("user_id");
        String userId = userIdObj == null ? null : String.valueOf(userIdObj);

        List<MenuNode> tree = menuService.getMenuTree(userId);

        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", tree);
        return res;
    }
}
