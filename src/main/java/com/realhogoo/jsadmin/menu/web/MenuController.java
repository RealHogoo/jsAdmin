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
    
    @PostMapping("/menu/detail.json")
    @ResponseBody
    public Map<String, Object> detail(@RequestParam("menu_seq") Long menuSeq) {
        Map<String, Object> data = menuService.selectMenuDetail(menuSeq);

        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    @PostMapping("/menu/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        String userId = String.valueOf(req.getAttribute("user_id"));

        Map<String, Object> res = new HashMap<>();
        try {
            Long menuSeq = menuService.saveMenu(param, userId);
            res.put("ok", true);
            res.put("code", "OK");
            res.put("message", "success");
            res.put("data", Collections.singletonMap("menu_seq", menuSeq));
        } catch (Exception e) {
            res.put("ok", false);
            res.put("code", "ERR");
            res.put("message", e.getMessage());
            res.put("data", null);
        }
        return res;
    }

    @PostMapping("/menu/delete.json")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        String userId = String.valueOf(req.getAttribute("user_id"));
        Object menuSeqObj = param == null ? null : param.get("menu_seq");
        Long menuSeq = menuSeqObj == null ? null : Long.valueOf(String.valueOf(menuSeqObj));

        Map<String, Object> res = new HashMap<>();
        try {
            int cnt = menuService.deleteMenu(menuSeq, userId);
            res.put("ok", true);
            res.put("code", "OK");
            res.put("message", "success");
            res.put("data", Collections.singletonMap("deleted", cnt));
        } catch (Exception e) {
            res.put("ok", false);
            res.put("code", "ERR");
            res.put("message", e.getMessage());
            res.put("data", null);
        }
        return res;
    }
}
