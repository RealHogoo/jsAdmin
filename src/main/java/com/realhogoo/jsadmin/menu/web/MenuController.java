package com.realhogoo.jsadmin.menu.web;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.service.MenuService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class MenuController {
    private static final int MAX_MENU_NAME_LENGTH = 100;
    private static final int MAX_MENU_URL_LENGTH = 300;
    private static final int MAX_MENU_TYPE_CODE_LENGTH = 30;
    private static final int MAX_ICON_CLASS_LENGTH = 100;

    private final MenuService menuService;

    public MenuController(MenuService menuService) {
        this.menuService = menuService;
    }

    @PostMapping("/menu/tree.json")
    @ResponseBody
    public Map<String, Object> tree(HttpServletRequest req) {
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
        return "fragments/menu/main";
    }

    @PostMapping("/menu/list.json")
    @ResponseBody
    public Map<String, Object> list(@RequestBody(required = false) Map<String, Object> body) {
        List<Map<String, Object>> list = menuService.selectMenuListAll(body);

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
            validateRequired(param, "menu_nm");
            validateLength("menu_nm", stringValue(param, "menu_nm"), MAX_MENU_NAME_LENGTH);
            validateLength("menu_url", stringValue(param, "menu_url"), MAX_MENU_URL_LENGTH);
            validateLength("menu_type_cd", stringValue(param, "menu_type_cd"), MAX_MENU_TYPE_CODE_LENGTH);
            validateLength("icon_class", stringValue(param, "icon_class"), MAX_ICON_CLASS_LENGTH);
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

    private void validateRequired(Map<String, Object> param, String field) {
        if (stringValue(param, field) == null) {
            throw new IllegalArgumentException(field + " is required");
        }
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }

    private String stringValue(Map<String, Object> param, String field) {
        if (param == null) {
            return null;
        }
        Object value = param.get(field);
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty() || "null".equalsIgnoreCase(text)) {
            return null;
        }
        return text;
    }
}
