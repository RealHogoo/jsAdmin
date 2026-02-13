package com.realhogoo.jsadmin.auth.service;

import java.util.List;
import java.util.Map;

public interface AuthService {

    /* =========================
     * TAB A: 그룹-메뉴 권한
     * ========================= */

    List<Map<String, Object>> getAuthGroupList(Map<String, Object> param);

    List<Map<String, Object>> getGroupMenuPermList(Long authGroupSeq);

    int saveGroupMenuPerm(Long authGroupSeq, List<Map<String, Object>> items, String actor);

    /* =========================
     * TAB B: 사용자 예외 (기존 있으면 유지)
     * ========================= */

    List<Map<String, Object>> searchUsers(Map<String, Object> param);

    List<Map<String, Object>> getUserMenuPermList(Long userSeq);

    void saveUserExceptions(Long userSeq, List<Map<String, Object>> exceptions, String actor);

    void deleteUserException(Long userSeq, Long menuSeq);
    
    Map<String, Object> login(String userId, String userPw);
}
