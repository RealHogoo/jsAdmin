package com.realhogoo.jsadmin.code.web;

import com.realhogoo.jsadmin.code.service.CodeService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class CodeController {

    private final CodeService codeService;

    public CodeController(CodeService codeService) {
        this.codeService = codeService;
    }

    @PostMapping("/code/main.do")
    public String main() {
        // /WEB-INF/jsp/fragments/code/main.jsp
        return "fragments/code/main";
    }

    @PostMapping("/code/list.json")
    @ResponseBody
    public Map<String, Object> list() {
        List<Map<String, Object>> list = codeService.selectCodeListAll();

        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", list);
        return res;
    }
}
