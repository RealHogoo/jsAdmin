package com.realhogoo.jsadmin.menu.service;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.mapper.MenuMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MenuServiceImpl implements MenuService {

    private final MenuMapper menuMapper;

    public MenuServiceImpl(MenuMapper menuMapper) {
        this.menuMapper = menuMapper;
    }

    @Override
    public List<MenuNode> getMenuTree(String userId) {
        List<Map<String, Object>> rows = menuMapper.selectMenuListByUserId(userId);

        // 1) node map
        Map<Long, MenuNode> map = new LinkedHashMap<>();
        for (Map<String, Object> r : rows) {
            MenuNode n = new MenuNode();
            n.setMenuSeq(toLong(r.get("menu_seq")));
            n.setMenuNm((String) r.get("menu_nm"));
            n.setMenuUrl((String) r.get("menu_url"));
            n.setUpMenuSeq(toLongNullable(r.get("up_menu_seq")));
            n.setSortNo(toInt(r.get("sort_no")));
            map.put(n.getMenuSeq(), n);
        }

        // 2) parent-child linking
        List<MenuNode> roots = new ArrayList<>();
        for (MenuNode n : map.values()) {
            Long parentSeq = n.getUpMenuSeq();
            if (parentSeq == null || !map.containsKey(parentSeq)) {
                roots.add(n);
            } else {
                map.get(parentSeq).getChildren().add(n);
            }
        }

        // 3) sort recursively
        sortTree(roots);
        return roots;
    }

    private void sortTree(List<MenuNode> nodes) {
        nodes.sort(Comparator
            .comparing(MenuNode::getSortNo, Comparator.nullsLast(Integer::compareTo))
            .thenComparing(MenuNode::getMenuSeq));
        for (MenuNode n : nodes) {
            if (n.getChildren() != null && !n.getChildren().isEmpty()) {
                sortTree(n.getChildren());
            }
        }
    }

    private Long toLong(Object v) {
        if (v instanceof Number) return ((Number) v).longValue();
        return Long.parseLong(String.valueOf(v));
    }
    private Long toLongNullable(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        if (s.isEmpty()) return null;
        if ("null".equalsIgnoreCase(s)) return null; // ★ 추가
        return toLong(v);
    }
    private Integer toInt(Object v) {
        if (v == null) return 0;
        if (v instanceof Number) return ((Number) v).intValue();
        return Integer.parseInt(String.valueOf(v));
    }
}
