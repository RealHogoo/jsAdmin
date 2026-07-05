package com.realhogoo.jsadmin.auth.mapper;

import com.realhogoo.jsadmin.auth.dto.LoginUser;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper
public interface AuthMapper {
    List<Map<String, Object>> selectAuthGroupList(Map<String, Object> param);

    int insertAuthGroup(Map<String, Object> param);

    int updateAuthGroup(Map<String, Object> param);

    int disableAuthGroup(@Param("authGroupSeq") Long authGroupSeq, @Param("updatedBy") String updatedBy);

    List<Map<String, Object>> selectGroupMenuPermList(@Param("authGroupSeq") Long authGroupSeq);

    int disableAllGroupMenuPerm(Map<String, Object> param);

    int disableGroupMenuPerm(Map<String, Object> param);

    int upsertGroupMenuPerm(Map<String, Object> param);

    int updateGroupMenuPerm(Map<String, Object> param);

    int insertGroupMenuPerm(Map<String, Object> param);

    List<Map<String, Object>> searchUsers(Map<String, Object> param);

    List<Map<String, Object>> selectUserMenuPermList(@Param("userSeq") Long userSeq);

    List<Map<String, Object>> selectGroupServicePermList(@Param("authGroupSeq") Long authGroupSeq);

    int upsertGroupServicePerm(Map<String, Object> param);

    List<Map<String, Object>> selectGroupUserList(@Param("authGroupSeq") Long authGroupSeq);

    List<Map<String, Object>> selectGroupUserCandidateList(Map<String, Object> param);

    int upsertGroupUser(Map<String, Object> param);

    List<Map<String, Object>> selectUserServicePermList(@Param("userSeq") Long userSeq);

    int deleteAllUserServiceException(@Param("userSeq") Long userSeq);

    int upsertUserServiceException(Map<String, Object> param);

    int deleteAllUserException(@Param("userSeq") Long userSeq);

    int upsertUserException(Map<String, Object> param);

    int deleteUserException(@Param("userSeq") Long userSeq, @Param("menuSeq") Long menuSeq);

    int updateLoginFailState(Map<String, Object> param);

    int resetLoginFailState(@Param("userSeq") Long userSeq, @Param("updatedBy") String updatedBy);

    int updateLastLoginAt(@Param("userSeq") Long userSeq, @Param("updatedBy") String updatedBy);

    int clearPwdResetFlag(@Param("userSeq") Long userSeq, @Param("updatedBy") String updatedBy);

    int upgradePasswordHash(@Param("userSeq") Long userSeq, @Param("pwdHash") String pwdHash, @Param("updatedBy") String updatedBy);

    LoginUser selectUserForLogin(@Param("user_id") String userId);

    List<String> selectUserRoleCodes(@Param("userSeq") Long userSeq);

    List<Map<String, Object>> selectResolvedServicePermissions(@Param("userSeq") Long userSeq);

    int insertRefreshToken(Map<String, Object> param);

    Map<String, Object> selectActiveRefreshToken(@Param("tokenHash") String tokenHash);

    int revokeRefreshToken(@Param("tokenHash") String tokenHash, @Param("updatedBy") String updatedBy);

    int revokeRefreshTokensBySessionId(@Param("sessionId") String sessionId, @Param("updatedBy") String updatedBy);

    Map<String, Object> selectLoginRateLimit(@Param("clientKey") String clientKey);

    int upsertLoginRateLimit(Map<String, Object> param);

    int deleteLoginRateLimit(@Param("clientKey") String clientKey);

    int deleteOldLoginRateLimits(@Param("retentionHours") long retentionHours);
}
