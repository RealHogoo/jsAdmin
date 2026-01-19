package com.realhogoo.jsadmin.menu.web;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.service.MenuService;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@Controller
public class MenuController {

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping("/menu/tree.json")
    @ResponseBody
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

    @PostMapping("/menu/main.do")
    public String main() {
        return "fragments/menu/main"; // /WEB-INF/jsp/menu/main.jsp
    }
    
    @PostMapping("/menu/list.json")
    @ResponseBody
    public Map<String, Object> list(HttpServletRequest req) {
        List<Map<String, Object>> list = menuService.selectMenuListAll(); // 아래 2)에서 추가

        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", list);
        return res;
    }
}
