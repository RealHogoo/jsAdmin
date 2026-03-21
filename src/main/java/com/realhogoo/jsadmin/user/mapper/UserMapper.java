package com.realhogoo.jsadmin.user.mapper;

import org.egovframe.rte.psl.dataaccess.mapper.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;
import java.util.Map;

@Mapper("userMapper")
public interface UserMapper {
    int ensureUserSecurityColumns();

    int ensureUserSequence();

    List<Map<String, Object>> selectUserList(Map<String, Object> param);

    Map<String, Object> selectUserDetail(@Param("userSeq") Long userSeq);

    Map<String, Object> selectUserDetailByLoginId(@Param("loginId") String loginId);

    String selectPasswordByLoginId(@Param("loginId") String loginId);

    int insertUser(Map<String, Object> param);

    int updateUser(Map<String, Object> param);

    int updateUserWithoutPassword(Map<String, Object> param);

    int deactivateUser(Map<String, Object> param);

    int unlockUser(Map<String, Object> param);

    int resetPassword(Map<String, Object> param);

    int updateMyProfile(Map<String, Object> param);

    int updatePasswordByLoginId(Map<String, Object> param);

    int countByLoginId(@Param("loginId") String loginId, @Param("excludeUserSeq") Long excludeUserSeq);
}
