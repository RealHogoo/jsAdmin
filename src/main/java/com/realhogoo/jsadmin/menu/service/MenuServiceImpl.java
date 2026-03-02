package com.realhogoo.jsadmin.menu.service;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.mapper.MenuMapper;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class MenuServiceImpl implements MenuService {

    private static final Long COMMON_AUTH_GROUP_SEQ = 4L;

    private final MenuMapper menuMapper;

    public MenuServiceImpl(MenuMapper menuMapper) {
        this.menuMapper = menuMapper;
    }

    @Override
    public List<MenuNode> getMenuTree(String userId) {
        List<Map<String, Object>> rows;
        if (userId == null || userId.trim().isEmpty()) {
            rows = menuMapper.selectMenuListByAuthGroupSeq(COMMON_AUTH_GROUP_SEQ);
        } else {
            rows = menuMapper.selectMenuListByUserId(userId);
        }

        // 1) node map
        Map<Long, MenuNode> map = new LinkedHashMap<>();
        for (Map<String, Object> r : rows) {
            MenuNode n = new MenuNode();
            n.setMenuSeq(toLong(r.get("menu_seq")));
            n.setMenuNm((String) r.get("menu_nm"));
            n.setMenuUrl((String) r.get("menu_url"));
            n.setUpMenuSeq(toLongNullable(r.get("up_menu_seq")));
            n.setSortNo(toInt(r.get("sort_no")));
            n.setPermLvl(toInt(r.get("perm_lvl")));
            
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
    
    @Override
    public List<Map<String, Object>> selectMenuListAll() {
        return menuMapper.selectMenuListAll();
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
    @Override
    public Map<String, Object> selectMenuDetail(Long menuSeq) {
        return menuMapper.selectMenuDetail(menuSeq);
    }

    @Override
    public Long saveMenu(Map<String, Object> param, String userId) {
        if (param == null) throw new IllegalArgumentException("param is null");

        // snake_case 유지 전제
        Object menuSeqObj = param.get("menu_seq");
        Long menuSeq = menuSeqObj == null ? null : Long.valueOf(String.valueOf(menuSeqObj));

        param.put("updated_by", userId);
        if (menuSeq == null) {
            param.put("created_by", userId);
            menuMapper.insertMenu(param); // selectKey로 menu_seq 세팅
            Object newSeq = param.get("menu_seq");
            return newSeq == null ? null : Long.valueOf(String.valueOf(newSeq));
        }

        menuMapper.updateMenu(param);
        return menuSeq;
    }

    @Override
    public int deleteMenu(Long menuSeq, String userId) {
        int childCnt = menuMapper.countChildMenu(menuSeq);
        if (childCnt > 0) {
            throw new IllegalStateException("하위 메뉴가 존재하여 삭제할 수 없습니다.");
        }
        
        Map<String, Object> p = new HashMap<>();
        p.put("menu_seq", menuSeq);
        p.put("updated_by", userId);
        return menuMapper.deleteMenu(p); // soft delete
    }

    private void normalizeNullable(Map<String, Object> param, String key) {
        Object v = param.get(key);
        if (v == null) {
            return;
        }
        String s = String.valueOf(v).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) {
            param.put(key, null);
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
