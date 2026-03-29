package com.realhogoo.jsadmin.apipolicy.service;

import com.realhogoo.jsadmin.apipolicy.mapper.ApiPolicyMapper;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ApiPolicyServiceImpl implements ApiPolicyService {
    private static final int MAX_API_TYPE_LENGTH = 20;
    private static final int MAX_API_NAME_LENGTH = 200;
    private static final int MAX_CALLER_ID_LENGTH = 100;
    private static final int MAX_TARGET_SERVICE_LENGTH = 100;
    private static final int MAX_HTTP_METHOD_LENGTH = 10;
    private static final int MAX_API_PATTERN_LENGTH = 500;
    private static final int MAX_AUTH_TYPE_LENGTH = 30;
    private static final int MAX_API_DESCRIPTION_LENGTH = 1000;

    private final ApiPolicyMapper apiPolicyMapper;

    public ApiPolicyServiceImpl(ApiPolicyMapper apiPolicyMapper) {
        this.apiPolicyMapper = apiPolicyMapper;
    }

    @Override
    public List<Map<String, Object>> selectApiPolicyList(Map<String, Object> param) {
        Map<String, Object> p = param == null ? new HashMap<String, Object>() : new HashMap<String, Object>(param);
        p.put("api_type", normalizeApiType(p.get("api_type")));
        p.put("use_yn", normalizeUseYn(p.get("use_yn"), ""));
        p.put("keyword", toStrOrNull(p.get("keyword")));
        return apiPolicyMapper.selectApiPolicyList(p);
    }

    @Override
    public Long saveApiPolicy(Map<String, Object> param, String userId) {
        if (param == null) {
            throw new IllegalArgumentException("param is required");
        }

        Long apiSeq = toLongOrNull(param.get("api_seq"));
        String apiType = normalizeApiType(param.get("api_type"));
        String apiNm = toStrOrNull(param.get("api_nm"));
        String callerId = toStrOrNull(param.get("caller_id"));
        String targetService = toStrOrNull(param.get("target_service"));
        String httpMethod = normalizeHttpMethod(param.get("http_method"));
        String apiPattern = toStrOrNull(param.get("api_pattern"));
        String authType = normalizeAuthType(param.get("auth_type"), apiType);
        String actor = toStrOrNull(userId);
        if (actor == null) actor = "SYSTEM";

        if (apiNm == null || callerId == null || targetService == null || apiPattern == null) {
            throw new IllegalArgumentException("api_nm, caller_id, target_service, api_pattern are required");
        }
        validateLength("api_type", apiType, MAX_API_TYPE_LENGTH);
        validateLength("api_nm", apiNm, MAX_API_NAME_LENGTH);
        validateLength("caller_id", callerId, MAX_CALLER_ID_LENGTH);
        validateLength("target_service", targetService, MAX_TARGET_SERVICE_LENGTH);
        validateLength("http_method", httpMethod, MAX_HTTP_METHOD_LENGTH);
        validateLength("api_pattern", apiPattern, MAX_API_PATTERN_LENGTH);
        validateLength("auth_type", authType, MAX_AUTH_TYPE_LENGTH);
        validateLength("api_desc", toStrOrNull(param.get("api_desc")), MAX_API_DESCRIPTION_LENGTH);

        int dup = apiPolicyMapper.countDupApiPolicy(apiType, callerId, targetService, httpMethod, apiPattern, apiSeq);
        if (dup > 0) {
            throw new IllegalStateException("duplicate api policy exists");
        }

        param.put("api_type", apiType);
        param.put("api_nm", apiNm);
        param.put("caller_id", callerId);
        param.put("target_service", targetService);
        param.put("http_method", httpMethod);
        param.put("api_pattern", apiPattern);
        param.put("auth_type", authType);
        param.put("api_desc", toStrOrNull(param.get("api_desc")));
        param.put("use_yn", normalizeUseYn(param.get("use_yn"), "Y"));
        param.put("updated_by", actor);

        if (apiSeq == null) {
            param.put("created_by", actor);
            apiPolicyMapper.insertApiPolicy(param);
            Object created = param.get("api_seq");
            return created == null ? null : Long.valueOf(String.valueOf(created));
        }

        apiPolicyMapper.updateApiPolicy(param);
        return apiSeq;
    }

    @Override
    public int deleteApiPolicy(Long apiSeq, String userId) {
        if (apiSeq == null) {
            throw new IllegalArgumentException("api_seq is required");
        }
        String actor = toStrOrNull(userId);
        if (actor == null) actor = "SYSTEM";

        Map<String, Object> p = new HashMap<String, Object>();
        p.put("api_seq", apiSeq);
        p.put("updated_by", actor);
        return apiPolicyMapper.deleteApiPolicy(p);
    }

    private void ensureSampleData() {
        if (apiPolicyMapper.countApiPolicyAll() > 0) {
            return;
        }

        Map<String, Object> external = new HashMap<String, Object>();
        external.put("api_type", "EXTERNAL");
        external.put("api_nm", "공지사항 조회 API");
        external.put("caller_id", "ADMIN_ROLE");
        external.put("target_service", "admin-service");
        external.put("http_method", "GET");
        external.put("api_pattern", "/notice/list.json");
        external.put("auth_type", "SESSION");
        external.put("api_desc", "외부 관리화면에서 공지사항 목록 조회를 허용하는 샘플 정책");
        external.put("use_yn", "Y");
        external.put("created_by", "SYSTEM");
        apiPolicyMapper.insertApiPolicy(external);

        Map<String, Object> internal = new HashMap<String, Object>();
        internal.put("api_type", "INTERNAL");
        internal.put("api_nm", "주문 사용자 조회 연동");
        internal.put("caller_id", "order-service");
        internal.put("target_service", "user-service");
        internal.put("http_method", "GET");
        internal.put("api_pattern", "/internal/users/**");
        internal.put("auth_type", "SERVICE_TOKEN");
        internal.put("api_desc", "주문 서비스가 사용자 서비스 내부 API를 조회하는 샘플 정책");
        internal.put("use_yn", "Y");
        internal.put("created_by", "SYSTEM");
        apiPolicyMapper.insertApiPolicy(internal);
    }

    private String normalizeApiType(Object value) {
        String s = toStrOrNull(value);
        return "INTERNAL".equalsIgnoreCase(s) ? "INTERNAL" : "EXTERNAL";
    }

    private String normalizeHttpMethod(Object value) {
        String s = toStrOrNull(value);
        if (s == null) return "GET";
        s = s.toUpperCase();
        if ("POST".equals(s) || "PUT".equals(s) || "DELETE".equals(s) || "PATCH".equals(s) || "ALL".equals(s)) {
            return s;
        }
        return "GET";
    }

    private String normalizeAuthType(Object value, String apiType) {
        String s = toStrOrNull(value);
        if (s == null) {
            return "INTERNAL".equals(apiType) ? "SERVICE_TOKEN" : "SESSION";
        }
        s = s.toUpperCase();
        if ("JWT".equals(s) || "API_KEY".equals(s) || "SERVICE_TOKEN".equals(s) || "SESSION".equals(s) || "NONE".equals(s)) {
            return s;
        }
        return "INTERNAL".equals(apiType) ? "SERVICE_TOKEN" : "SESSION";
    }

    private String normalizeUseYn(Object value, String def) {
        String s = toStrOrNull(value);
        if (s == null) return def;
        return "N".equalsIgnoreCase(s) ? "N" : "Y";
    }

    private String toStrOrNull(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return s;
    }

    private Long toLongOrNull(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return Long.valueOf(s);
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}
