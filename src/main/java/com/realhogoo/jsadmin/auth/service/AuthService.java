package com.realhogoo.jsadmin.auth.service;

import com.realhogoo.jsadmin.api.ApiResponse;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;

public interface AuthService {

    List<Map<String, Object>> getAuthGroupList(Map<String, Object> param);

    List<Map<String, Object>> getGroupMenuPermList(Long authGroupSeq);

    int saveGroupMenuPerm(Long authGroupSeq, List<Map<String, Object>> items, String actor);

    List<Map<String, Object>> searchUsers(Map<String, Object> param);

    List<Map<String, Object>> getUserMenuPermList(Long userSeq);

    void saveUserExceptions(Long userSeq, List<Map<String, Object>> exceptions, String actor);

    void deleteUserException(Long userSeq, Long menuSeq);

    List<Map<String, Object>> getGroupServicePermList(Long authGroupSeq);

    int saveGroupServicePerm(Long authGroupSeq, List<Map<String, Object>> items, String actor);

    List<Map<String, Object>> getUserServicePermList(Long userSeq);

    void saveUserServiceExceptions(Long userSeq, List<Map<String, Object>> exceptions, String actor);

    ApiResponse<Map<String, Object>> login(String userId, String userPw, HttpServletRequest request);

    ApiResponse<Map<String, Object>> refresh(String refreshToken, HttpServletRequest request);

    Map<String, Object> me(String userId, List<String> roles, String sessionId);

    int revokeRefreshTokensBySessionId(String sessionId, String actor);
}
