package com.realhogoo.jsadmin.menu.service;

import com.realhogoo.jsadmin.menu.dto.MenuNode;
import com.realhogoo.jsadmin.menu.mapper.MenuMapper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MenuServiceImpl implements MenuService {

    private static final Long COMMON_AUTH_GROUP_SEQ = 4L;
    private static final int MAX_MENU_NAME_LENGTH = 100;
    private static final int MAX_MENU_URL_LENGTH = 300;
    private static final int MAX_MENU_TYPE_CODE_LENGTH = 30;
    private static final int MAX_ICON_CLASS_LENGTH = 100;

    private final MenuMapper menuMapper;

    public MenuServiceImpl(MenuMapper menuMapper) {
        this.menuMapper = menuMapper;
    }

    @Override
    public List<MenuNode> getMenuTree(String userId) {
        List<Map<String, Object>> rows = selectVisibleMenuRows(userId);

        Map<Long, MenuNode> map = new LinkedHashMap<>();
        for (Map<String, Object> row : rows) {
            MenuNode node = new MenuNode();
            node.setMenuSeq(toLong(row.get("menu_seq")));
            node.setMenuNm((String) row.get("menu_nm"));
            node.setMenuUrl((String) row.get("menu_url"));
            node.setIconClass(stringValue(row, "icon_class", "ICON_CLASS", "iconClass"));
            node.setUpMenuSeq(toLongNullable(row.get("up_menu_seq")));
            node.setSortNo(toInt(row.get("sort_no")));
            node.setPermLvl(toInt(row.get("perm_lvl")));
            map.put(node.getMenuSeq(), node);
        }

        List<MenuNode> roots = new ArrayList<>();
        for (MenuNode node : map.values()) {
            Long parentSeq = node.getUpMenuSeq();
            if (parentSeq == null || !map.containsKey(parentSeq)) {
                roots.add(node);
            } else {
                map.get(parentSeq).getChildren().add(node);
            }
        }

        sortTree(roots);
        return roots;
    }

    private List<Map<String, Object>> selectVisibleMenuRows(String userId) {
        List<Map<String, Object>> commonRows = menuMapper.selectMenuListByAuthGroupSeq(COMMON_AUTH_GROUP_SEQ);
        if (userId == null || userId.trim().isEmpty()) {
            return commonRows;
        }

        List<Map<String, Object>> userRows = menuMapper.selectMenuListByUserId(userId);
        List<Map<String, Object>> mergedRows = new ArrayList<>(commonRows.size() + userRows.size());
        mergedRows.addAll(commonRows);
        mergedRows.addAll(userRows);
        return mergedRows;
    }

    @Override
    public List<Map<String, Object>> selectMenuListAll(Map<String, Object> param) {
        return menuMapper.selectMenuListAll(param);
    }

    @Override
    public Map<String, Object> selectMenuDetail(Long menuSeq) {
        return menuMapper.selectMenuDetail(menuSeq);
    }

    @Override
    public Long saveMenu(Map<String, Object> param, String userId) {
        if (param == null) {
            throw new IllegalArgumentException("param is null");
        }

        Object menuSeqObj = param.get("menu_seq");
        Long menuSeq = menuSeqObj == null ? null : Long.valueOf(String.valueOf(menuSeqObj));
        String menuNm = toNullableString(param.get("menu_nm"));
        if (menuNm == null) {
            throw new IllegalArgumentException("menu_nm is required");
        }
        validateLength("menu_nm", menuNm, MAX_MENU_NAME_LENGTH);
        validateLength("menu_url", toNullableString(param.get("menu_url")), MAX_MENU_URL_LENGTH);
        validateLength("menu_type_cd", toNullableString(param.get("menu_type_cd")), MAX_MENU_TYPE_CODE_LENGTH);
        validateLength("icon_class", toNullableString(param.get("icon_class")), MAX_ICON_CLASS_LENGTH);

        param.put("updated_by", userId);
        if (menuSeq == null) {
            param.put("created_by", userId);
            menuMapper.insertMenu(param);
            Object newSeq = param.get("menu_seq");
            return newSeq == null ? null : Long.valueOf(String.valueOf(newSeq));
        }

        menuMapper.updateMenu(param);
        return menuSeq;
    }

    @Override
    public int deleteMenu(Long menuSeq, String userId) {
        if (menuSeq == null) {
            throw new IllegalArgumentException("menu_seq is required");
        }

        menuMapper.deleteAuthUserByRootMenuSeq(menuSeq);
        menuMapper.deleteAuthMenuByRootMenuSeq(menuSeq);
        return menuMapper.deleteMenuTree(menuSeq);
    }

    private void sortTree(List<MenuNode> nodes) {
        nodes.sort(Comparator
            .comparing(MenuNode::getSortNo, Comparator.nullsLast(Integer::compareTo))
            .thenComparing(MenuNode::getMenuSeq));
        for (MenuNode node : nodes) {
            if (node.getChildren() != null && !node.getChildren().isEmpty()) {
                sortTree(node.getChildren());
            }
        }
    }

    private Long toLong(Object value) {
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.parseLong(String.valueOf(value));
    }

    private Long toLongNullable(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty() || "null".equalsIgnoreCase(text)) {
            return null;
        }
        return toLong(value);
    }

    private Integer toInt(Object value) {
        if (value == null) {
            return 0;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.parseInt(String.valueOf(value));
    }

    private String stringValue(Map<String, Object> row, String... keys) {
        for (String key : keys) {
            Object value = row.get(key);
            if (value != null) {
                return String.valueOf(value);
            }
        }
        return null;
    }

    private String toNullableString(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty() || "null".equalsIgnoreCase(text)) {
            return null;
        }
        return text;
    }

    private void validateLength(String field, String value, int maxLength) {
        if (value != null && value.length() > maxLength) {
            throw new IllegalArgumentException(field + " length must be " + maxLength + " or less");
        }
    }
}
