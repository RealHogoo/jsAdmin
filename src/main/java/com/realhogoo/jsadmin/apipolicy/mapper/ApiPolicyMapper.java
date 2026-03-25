package com.realhogoo.jsadmin.apipolicy.mapper;

import org.egovframe.rte.psl.dataaccess.mapper.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper("apiPolicyMapper")
public interface ApiPolicyMapper {
    int ensureApiPolicyTable();
    int ensureApiPolicySequence();
    int ensureApiPolicyIndex01();
    int ensureApiPolicyIndex02();

    int countApiPolicyAll();
    List<Map<String, Object>> selectApiPolicyList(Map<String, Object> param);
    int countDupApiPolicy(@Param("api_type") String apiType,
                          @Param("caller_id") String callerId,
                          @Param("target_service") String targetService,
                          @Param("http_method") String httpMethod,
                          @Param("api_pattern") String apiPattern,
                          @Param("api_seq") Long apiSeq);
    int insertApiPolicy(Map<String, Object> param);
    int updateApiPolicy(Map<String, Object> param);
    int deleteApiPolicy(Map<String, Object> param);
}
