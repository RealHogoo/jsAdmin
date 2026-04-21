package com.realhogoo.jsadmin.serviceregistry.web;

import com.realhogoo.jsadmin.auth.AuthRequestSupport;
import com.realhogoo.jsadmin.serviceregistry.service.ServiceAdminService;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Controller
public class ServiceAdminController {
    private static final int MAX_SERVICE_CODE_LENGTH = 100;
    private static final int MAX_SERVICE_NAME_LENGTH = 200;
    private static final int MAX_URL_LENGTH = 500;
    private static final int MAX_PATH_LENGTH = 300;
    private static final int MAX_REMARK_LENGTH = 1000;

    private final ServiceAdminService serviceAdminService;

    public ServiceAdminController(ServiceAdminService serviceAdminService) {
        this.serviceAdminService = serviceAdminService;
    }

    @PostMapping("/service/main.do")
    public String main() {
        return "fragments/service/main";
    }

    @PostMapping("/service/list.json")
    @ResponseBody
    public Map<String, Object> list(@RequestBody(required = false) Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        return ok(serviceAdminService.getServiceList(body));
    }

    @PostMapping("/service/detail.json")
    @ResponseBody
    public Map<String, Object> detail(@RequestBody(required = false) Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        Long serviceSeq = toLong(body == null ? null : body.get("service_seq"));
        return ok(serviceAdminService.getServiceDetail(serviceSeq));
    }

    @PostMapping("/service/save.json")
    @ResponseBody
    public Map<String, Object> save(@RequestBody Map<String, Object> body, HttpServletRequest request) {
        AuthRequestSupport.ensureAdmin(request);
        validateLength("service_cd", toNullableString(body == null ? null : body.get("service_cd")), MAX_SERVICE_CODE_LENGTH);
        validateLength("service_nm", toNullableString(body == null ? null : body.get("service_nm")), MAX_SERVICE_NAME_LENGTH);
        validateLength("base_url", toNullableString(body == null ? null : body.get("base_url")), MAX_URL_LENGTH);
        validateLength("status_path", toNullableString(body == null ? null : body.get("status_path")), MAX_PATH_LENGTH);
        validateLength("live_path", toNullableString(body == null ? null : body.get("live_path")), MAX_PATH_LENGTH);
        validateLength("ready_path", toNullableString(body == null ? null : body.get("ready_path")), MAX_PATH_LENGTH);
        validateLength("remark", toNullableString(body == null ? null : body.get("remark")), MAX_REMARK_LENGTH);

        String actor = request.getAttribute("user_id") == null ? null : String.valueOf(request.getAttribute("user_id"));
        Long serviceSeq = serviceAdminService.saveService(body, actor);
        return ok(Collections.singletonMap("service_seq", serviceSeq));
    }

    private Map<String, Object> ok(Object data) {
        Map<String, Object> res = new HashMap<String, Object>();
        res.put("ok", true);
        res.put("code", "OK");
        res.put("message", "success");
        res.put("data", data);
        return res;
    }

    private Long toLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number) return ((Number) value).longValue();
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return Long.valueOf(s);
    }

    private String toNullableString(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return s;
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}
