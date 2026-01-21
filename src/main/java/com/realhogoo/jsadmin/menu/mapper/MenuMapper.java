package com.realhogoo.jsadmin.menu.mapper;

import java.util.List;
import java.util.Map;

import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MenuMapper {
    List<Map<String, Object>> selectMenuListByUserId(String userId);
    List<Map<String, Object>> selectMenuListAll();

    Map<String, Object> selectMenuDetail(Long menuSeq);

    int insertMenu(Map<String, Object> param);
    int updateMenu(Map<String, Object> param);

    int deleteMenu(Map<String, Object> param);
    int countChildMenu(Long menuSeq);
}
