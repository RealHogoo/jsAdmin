package com.realhogoo.jsadmin.menu.service;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.mapper.MenuMapper;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class MenuServiceImplTest {

    @Test
    void returnsCommonMenusForAnonymousUser() {
        MenuMapper menuMapper = mock(MenuMapper.class);
        when(menuMapper.selectMenuListByAuthGroupSeq(4L)).thenReturn(List.of(
            menuRow(2L, "Dashboard", "/home.do", null, 1, 1),
            menuRow(4L, "Timeline", "/timeline/home.do", null, 3, 1)
        ));

        MenuServiceImpl service = new MenuServiceImpl(menuMapper);

        List<MenuNode> tree = service.getMenuTree(null);

        assertEquals(2, tree.size());
        assertEquals("/home.do", tree.get(0).getMenuUrl());
        assertEquals("/timeline/home.do", tree.get(1).getMenuUrl());
    }

    @Test
    void mergesCommonMenusForAuthenticatedUserWithoutAssignedGroups() {
        MenuMapper menuMapper = mock(MenuMapper.class);
        when(menuMapper.selectMenuListByAuthGroupSeq(4L)).thenReturn(List.of(
            menuRow(2L, "Dashboard", "/home.do", null, 1, 1),
            menuRow(4L, "Timeline", "/timeline/home.do", null, 3, 1)
        ));
        when(menuMapper.selectMenuListByUserId("tester1")).thenReturn(List.of());

        MenuServiceImpl service = new MenuServiceImpl(menuMapper);

        List<MenuNode> tree = service.getMenuTree("tester1");

        assertEquals(2, tree.size());
        assertTrue(tree.stream().anyMatch(node -> "/home.do".equals(node.getMenuUrl())));
        assertTrue(tree.stream().anyMatch(node -> "/timeline/home.do".equals(node.getMenuUrl())));
    }

    @Test
    void preservesUserSpecificMenusAlongsideCommonMenus() {
        MenuMapper menuMapper = mock(MenuMapper.class);
        when(menuMapper.selectMenuListByAuthGroupSeq(4L)).thenReturn(List.of(
            menuRow(2L, "Dashboard", "/home.do", null, 1, 1),
            menuRow(4L, "Timeline", "/timeline/home.do", null, 3, 1)
        ));
        when(menuMapper.selectMenuListByUserId("ops")).thenReturn(List.of(
            menuRow(10L, "Users", "/user/main.do", null, 5, 5)
        ));

        MenuServiceImpl service = new MenuServiceImpl(menuMapper);

        List<MenuNode> tree = service.getMenuTree("ops");

        assertEquals(3, tree.size());
        assertTrue(tree.stream().anyMatch(node -> "/home.do".equals(node.getMenuUrl())));
        assertTrue(tree.stream().anyMatch(node -> "/timeline/home.do".equals(node.getMenuUrl())));
        assertTrue(tree.stream().anyMatch(node -> "/user/main.do".equals(node.getMenuUrl())));
    }

    private static Map<String, Object> menuRow(
        Long menuSeq,
        String menuNm,
        String menuUrl,
        Long upMenuSeq,
        Integer sortNo,
        Integer permLvl
    ) {
        Map<String, Object> row = new HashMap<>();
        row.put("menu_seq", menuSeq);
        row.put("menu_nm", menuNm);
        row.put("menu_url", menuUrl);
        row.put("icon_class", "icon-test");
        row.put("up_menu_seq", upMenuSeq);
        row.put("sort_no", sortNo);
        row.put("perm_lvl", permLvl);
        return row;
    }
}
