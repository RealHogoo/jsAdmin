package com.realhogoo.jsadmin.menu.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface MenuMapper {
    List<Map<String, Object>> selectMenuListByUserId(@Param("user_id") String userId);
    List<Map<String, Object>> selectMenuListByAuthGroupSeq(@Param("auth_group_seq") Long authGroupSeq);
    List<Map<String, Object>> selectMenuListAll();

    Map<String, Object> selectMenuDetail(@Param("menuSeq") Long menuSeq);

    int insertMenu(Map<String, Object> param);
    int updateMenu(Map<String, Object> param);

    int deleteMenu(Map<String, Object> param);
    int countChildMenu(@Param("menuSeq") Long menuSeq);
}
