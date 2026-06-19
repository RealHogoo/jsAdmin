package com.realhogoo.jsadmin.serviceregistry.service;

import java.util.List;
import java.util.Map;

public interface ServiceAdminService {
    List<Map<String, Object>> getServiceList(Map<String, Object> param);

    Map<String, Object> getServiceDetail(Long serviceSeq);

    Long saveService(Map<String, Object> param, String actor);

    Map<String, Object> setServiceUseYn(Long serviceSeq, String useYn, String actor);
}
