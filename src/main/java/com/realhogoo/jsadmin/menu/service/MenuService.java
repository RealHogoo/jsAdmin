package com.realhogoo.jsadmin.menu.service;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import java.util.List;
import java.util.Map;


public interface MenuService {
    List<MenuNode> getMenuTree(String userId);
    List<Map<String, Object>> selectMenuListAll(Map<String, Object> param);

    Map<String, Object> selectMenuDetail(Long menuSeq);

    Long  saveMenu(Map<String, Object> param, String userId);

    int deleteMenu(Long menuSeq, String userId);
}
