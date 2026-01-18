package com.realhogoo.jsadmin.menu.service;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import java.util.List;


public interface MenuService {
    List<MenuNode> getMenuTree(String userId);
}
