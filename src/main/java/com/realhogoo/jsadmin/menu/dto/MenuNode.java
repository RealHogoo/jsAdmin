package com.realhogoo.jsadmin.menu.dto;

import java.util.ArrayList;
import java.util.List;

public class MenuNode {
    private Long menuSeq;
    private String menuNm;
    private String menuUrl;      // 예: "/health.do"
    private Long upMenuSeq;      // 부모 메뉴
    private Integer sortNo;      // 정렬
    private Integer permLvl;
    
    private List<MenuNode> children = new ArrayList<>();

    public Long getMenuSeq() { return menuSeq; }
    public void setMenuSeq(Long menuSeq) { this.menuSeq = menuSeq; }

    public String getMenuNm() { return menuNm; }
    public void setMenuNm(String menuNm) { this.menuNm = menuNm; }

    public String getMenuUrl() { return menuUrl; }
    public void setMenuUrl(String menuUrl) { this.menuUrl = menuUrl; }

    public Long getUpMenuSeq() { return upMenuSeq; }
    public void setUpMenuSeq(Long upMenuSeq) { this.upMenuSeq = upMenuSeq; }

    public Integer getSortNo() { return sortNo; }
    public void setSortNo(Integer sortNo) { this.sortNo = sortNo; }

    public Integer getPermLvl() { return permLvl; }
    public void setPermLvl(Integer permLvl) { this.permLvl = permLvl; }
    
    public List<MenuNode> getChildren() { return children; }
    public void setChildren(List<MenuNode> children) { this.children = children; }
}
