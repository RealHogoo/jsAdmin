package com.realhogoo.jsadmin.access.mapper;

import org.apache.ibatis.annotations.Param;
import org.egovframe.rte.psl.dataaccess.mapper.Mapper;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Mapper("accessMapper")
public interface AccessMapper {
    int insertLoginHistory(Map<String, Object> param);

    int insertLoginSession(Map<String, Object> param);

    int updateSessionLastAccess(@Param("sessionId") String sessionId, @Param("accessedAt") Instant accessedAt);

    int expireSession(@Param("sessionId") String sessionId, @Param("actor") String actor, @Param("statusCd") String statusCd);

    int expireSessionsByLoginId(@Param("loginId") String loginId, @Param("actor") String actor, @Param("statusCd") String statusCd);

    Map<String, Object> selectSessionStatus(@Param("sessionId") String sessionId);

    List<Map<String, Object>> selectLoginSessionList(Map<String, Object> param);

    List<Map<String, Object>> selectLoginHistoryList(Map<String, Object> param);
}
