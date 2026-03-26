package com.realhogoo.jsadmin.apipolicy.service;

import java.util.List;
import java.util.Map;

public interface ApiPolicyService {
    List<Map<String, Object>> selectApiPolicyList(Map<String, Object> param);
    Long saveApiPolicy(Map<String, Object> param, String userId);
    int deleteApiPolicy(Long apiSeq, String userId);
}
