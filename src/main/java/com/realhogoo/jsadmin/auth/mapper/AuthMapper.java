package com.realhogoo.jsadmin.auth.mapper;

import com.realhogoo.jsadmin.auth.dto.LoginUser;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface AuthMapper {
	/* =========================
     * TAB A: 그룹-메뉴 권한
     * ========================= */

    // ADM_AUTH_GROUP 목록
    List<Map<String, Object>> selectAuthGroupList(Map<String, Object> param);

    // 특정 그룹의 메뉴 권한(계층형 결과 = 평면 + tree_lvl)
    List<Map<String, Object>> selectGroupMenuPermList(@Param("authGroupSeq") Long authGroupSeq);

    // 해당 그룹의 기존 권한을 전부 USE_YN='N'으로 내림
    int disableAllGroupMenuPerm(Map<String, Object> param);
    int disableGroupMenuPerm(Map<String, Object> param);
    int upsertGroupMenuPerm(Map<String, Object> param);

    // 넘어온 (menu_seq, perm_lvl)만 USE_YN='Y'로 MERGE
    int updateGroupMenuPerm(Map<String, Object> param);
    int insertGroupMenuPerm(Map<String, Object> param);

    /* =========================
     * TAB B: 사용자 예외 (기존 있으면 유지)
     * ========================= */

    List<Map<String, Object>> searchUsers(Map<String, Object> param);

    List<Map<String, Object>> selectUserMenuPermList(@Param("userSeq") Long userSeq);

    void saveUserExceptions(@Param("userSeq") Long userSeq,
                            @Param("exceptions") List<Map<String, Object>> exceptions,
                            @Param("actor") String actor);

    int deleteUserException(@Param("userSeq") Long userSeq, @Param("menuSeq") Long menuSeq);
    
    LoginUser selectUserForLogin(@Param("user_id") String userId);
}
