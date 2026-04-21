package com.realhogoo.jsadmin.serviceregistry.service;

import com.realhogoo.jsadmin.serviceregistry.mapper.ServiceAdminMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ServiceAdminServiceImpl implements ServiceAdminService {

    private final ServiceAdminMapper serviceAdminMapper;
    private final ServiceEndpointPolicy serviceEndpointPolicy;

    public ServiceAdminServiceImpl(ServiceAdminMapper serviceAdminMapper, ServiceEndpointPolicy serviceEndpointPolicy) {
        this.serviceAdminMapper = serviceAdminMapper;
        this.serviceEndpointPolicy = serviceEndpointPolicy;
    }

    @Override
    public List<Map<String, Object>> getServiceList(Map<String, Object> param) {
        return serviceAdminMapper.selectServiceList(param == null ? new HashMap<String, Object>() : param);
    }

    @Override
    public Map<String, Object> getServiceDetail(Long serviceSeq) {
        if (serviceSeq == null) {
            return null;
        }
        return serviceAdminMapper.selectServiceDetail(serviceSeq);
    }

    @Override
    @Transactional
    public Long saveService(Map<String, Object> param, String actor) {
        Map<String, Object> payload = param == null ? new HashMap<String, Object>() : new HashMap<String, Object>(param);
        Long serviceSeq = toLong(payload.get("service_seq"));
        String serviceCd = trimToNull(payload.get("service_cd"));
        String serviceNm = trimToNull(payload.get("service_nm"));
        String baseUrl = trimToNull(payload.get("base_url"));
        if (serviceCd == null) {
            throw new IllegalArgumentException("service_cd is required");
        }
        if (serviceNm == null) {
            throw new IllegalArgumentException("service_nm is required");
        }
        if (baseUrl == null) {
            throw new IllegalArgumentException("base_url is required");
        }

        Long existingSeq = serviceAdminMapper.selectServiceSeqByCode(serviceCd);
        if (existingSeq != null && (serviceSeq == null || !existingSeq.equals(serviceSeq))) {
            throw new IllegalArgumentException("service_cd already exists");
        }

        payload.put("service_seq", serviceSeq);
        payload.put("service_cd", serviceCd);
        payload.put("service_nm", serviceNm);
        payload.put("base_url", serviceEndpointPolicy.normalizeBaseUrl(baseUrl));
        payload.put("status_path", serviceEndpointPolicy.normalizeHealthPath(defaultText(payload.get("status_path"), "/health/status.json"), "status_path"));
        payload.put("live_path", serviceEndpointPolicy.normalizeHealthPath(defaultText(payload.get("live_path"), "/health/live.json"), "live_path"));
        payload.put("ready_path", serviceEndpointPolicy.normalizeHealthPath(defaultText(payload.get("ready_path"), "/health/ready.json"), "ready_path"));
        payload.put("timeout_ms", defaultNumber(payload.get("timeout_ms"), 3000));
        payload.put("use_yn", defaultText(payload.get("use_yn"), "Y"));
        payload.put("sort_ord", defaultNumber(payload.get("sort_ord"), 0));
        payload.put("remark", trimToNull(payload.get("remark")));
        payload.put("updated_by", defaultActor(actor));

        if (serviceSeq == null) {
            payload.put("created_by", defaultActor(actor));
            serviceAdminMapper.insertService(payload);
            return toLong(payload.get("service_seq"));
        }

        int updated = serviceAdminMapper.updateService(payload);
        if (updated == 0) {
            throw new IllegalArgumentException("service not found");
        }
        return serviceSeq;
    }

    private String defaultActor(String actor) {
        return actor == null || actor.trim().isEmpty() ? "SYSTEM" : actor.trim();
    }

    private String defaultText(Object value, String fallback) {
        String text = trimToNull(value);
        return text == null ? fallback : text;
    }

    private Integer defaultNumber(Object value, int fallback) {
        Long number = toLong(value);
        return number == null ? fallback : number.intValue();
    }

    private String trimToNull(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty() || "null".equalsIgnoreCase(text)) {
            return null;
        }
        return text;
    }

    private Long toLong(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        String text = trimToNull(value);
        return text == null ? null : Long.valueOf(text);
    }
}
