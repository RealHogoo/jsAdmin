package com.realhogoo.jsadmin.apipolicy.web;

import com.realhogoo.jsadmin.apipolicy.service.ApiPolicyService;
import com.realhogoo.jsadmin.auth.AuthRequestSupport;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Controller
public class ApiPolicyController {

    private final ApiPolicyService apiPolicyService;

    public ApiPolicyController(ApiPolicyService apiPolicyService) {
        this.apiPolicyService = apiPolicyService;
    }

    @PostMapping("/api/main.do")
    public String main() {
        return "fragments/api/main";
    }

    @PostMapping("/api/list.json")
    @ResponseBody
    public Map<String, Object> list(@RequestBody(required = false) Map<String, Object> param, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        List<Map<String, Object>> list = apiPolicyService.selectApiPolicyList(param);

        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", list);
        return res;
    }

    @PostMapping("/api/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        String userId = String.valueOf(req.getAttribute("user_id"));

        Map<String, Object> res = new HashMap<String, Object>();
        try {
            Long apiSeq = apiPolicyService.saveApiPolicy(param, userId);
            res.put("ok", true);
            res.put("code", "OK");
            res.put("message", "success");
            res.put("data", Collections.singletonMap("api_seq", apiSeq));
        } catch (Exception e) {
            res.put("ok", false);
            res.put("code", "ERR");
            res.put("message", e.getMessage());
            res.put("data", null);
        }
        return res;
    }

    @PostMapping("/api/delete.json")
    @ResponseBody
    public Map<String, Object> delete(@RequestBody Map<String, Object> param, HttpServletRequest req) {
        AuthRequestSupport.ensureAdmin(req);
        String userId = String.valueOf(req.getAttribute("user_id"));
        Object apiSeqObj = param == null ? null : param.get("api_seq");
        Long apiSeq = apiSeqObj == null ? null : Long.valueOf(String.valueOf(apiSeqObj));

        Map<String, Object> res = new HashMap<String, Object>();
        try {
            int cnt = apiPolicyService.deleteApiPolicy(apiSeq, userId);
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
