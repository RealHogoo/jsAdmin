package com.realhogoo.jsadmin.user.service;

import java.util.List;
import java.util.Map;

public interface UserService {
    List<Map<String, Object>> getUserList(Map<String, Object> param);

    Map<String, Object> getUserDetail(Long userSeq);

    Long saveUser(Map<String, Object> param, String actor);

    int deactivateUser(Long userSeq, String actor);

    int unlockUser(Long userSeq, String actor);

    Map<String, Object> resetPassword(Long userSeq, String actor);

    Map<String, Object> getMyProfile(String loginId);

    int updateMyProfile(String loginId, Map<String, Object> param, String actor);

    int changeMyPassword(String loginId, String currentPassword, String newPassword, String actor);
}
