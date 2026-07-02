package com.realhogoo.jsadmin.auth.mapper;

import org.apache.ibatis.annotations.Param;

import java.util.Map;

public interface QrLoginMapper {
    int insertQrLoginRequest(Map<String, Object> param);

    Map<String, Object> selectQrLoginRequestById(@Param("requestId") String requestId);

    Map<String, Object> selectQrLoginRequestByTokenHash(@Param("tokenHash") String tokenHash);

    int approveQrLoginRequest(Map<String, Object> param);

    int consumeQrLoginRequest(@Param("requestId") String requestId, @Param("updatedBy") String updatedBy);

    int expireQrLoginRequest(@Param("requestId") String requestId);

    int countRecentQrLoginRequests(
        @Param("clientIp") String clientIp,
        @Param("windowSeconds") long windowSeconds
    );

    int deleteOldQrLoginRequests(@Param("retentionDays") int retentionDays);
}
