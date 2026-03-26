package com.realhogoo.jsadmin.access.service;

import com.realhogoo.jsadmin.auth.dto.LoginUser;

import javax.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import java.util.Map;

public interface AccessService {
    String openLoginSession(LoginUser user, HttpServletRequest request, Instant expiresAt);

    void recordLoginHistory(LoginUser user, String loginId, boolean success, String resultMessage, String sessionId, HttpServletRequest request);

    boolean touchSession(String sessionId, Instant now);

    List<Map<String, Object>> getLoginSessionList(Map<String, Object> param);

    List<Map<String, Object>> getLoginHistoryList(Map<String, Object> param);

    int expireSession(String sessionId, String actor);

    int expireSessionsByLoginId(String loginId, String actor);

    int logout(String sessionId, String actor, HttpServletRequest request);
}
