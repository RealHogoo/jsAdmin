package com.realhogoo.jsadmin.code.web;

import com.realhogoo.jsadmin.auth.AuthRequestSupport;
import com.realhogoo.jsadmin.code.service.CodeService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import javax.servlet.http.HttpServletRequest;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Collections;

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
    public Map<String, Object> list(HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        List<Map<String, Object>> list = codeService.selectCodeListAll();

        Map<String, Object> res = new HashMap<>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", list);
        return res;
    }

    @PostMapping("/code/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        String userId = String.valueOf(req.getAttribute("user_id"));

        Map<String, Object> res = new HashMap<>();
        try {
            Long codeSeq = codeService.saveCode(param, userId);
            res.put("ok", true);
            res.put("code", "OK");
            res.put("message", "success");
            res.put("data", Collections.singletonMap("code_seq", codeSeq));
        } catch (Exception e) {
            res.put("ok", false);
            res.put("code", "ERR");
            res.put("message", e.getMessage());
            res.put("data", null);
        }
        return res;
    }

    @PostMapping("/code/delete.json")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        String userId = String.valueOf(req.getAttribute("user_id"));
        Object codeSeqObj = param == null ? null : param.get("code_seq");
        Long codeSeq = codeSeqObj == null ? null : Long.valueOf(String.valueOf(codeSeqObj));

        Map<String, Object> res = new HashMap<>();
        try {
            int cnt = codeService.deleteCode(codeSeq, userId);
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
