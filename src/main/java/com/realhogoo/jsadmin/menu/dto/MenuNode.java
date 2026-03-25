package com.realhogoo.jsadmin.menu.dto;

import java.util.ArrayList;
import java.util.List;

public class MenuNode {
    private Long menuSeq;
    private String menuNm;
    private String menuUrl;
    private String iconClass;
    private Long upMenuSeq;
    private Integer sortNo;
    private Integer permLvl;
    private List<MenuNode> children = new ArrayList<>();

    public Long getMenuSeq() { return menuSeq; }
    public void setMenuSeq(Long menuSeq) { this.menuSeq = menuSeq; }

    public String getMenuNm() { return menuNm; }
    public void setMenuNm(String menuNm) { this.menuNm = menuNm; }

    public String getMenuUrl() { return menuUrl; }
    public void setMenuUrl(String menuUrl) { this.menuUrl = menuUrl; }

    public String getIconClass() { return iconClass; }
    public void setIconClass(String iconClass) { this.iconClass = iconClass; }

    public Long getUpMenuSeq() { return upMenuSeq; }
    public void setUpMenuSeq(Long upMenuSeq) { this.upMenuSeq = upMenuSeq; }

    public Integer getSortNo() { return sortNo; }
    public void setSortNo(Integer sortNo) { this.sortNo = sortNo; }

    public Integer getPermLvl() { return permLvl; }
    public void setPermLvl(Integer permLvl) { this.permLvl = permLvl; }

    public List<MenuNode> getChildren() { return children; }
    public void setChildren(List<MenuNode> children) { this.children = children; }
}
