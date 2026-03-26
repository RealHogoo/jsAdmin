package msa.admin.menu.vo;

import java.io.Serializable;

public class AdminMenuVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long menuId;
    private Long upMenuId;   // 상위 메뉴 ID
    private String menuNm;
    private String menuUrl;
    private Integer sortOrd;
    private String useYn;
    private String remark;

    // 화면/쿼리용 (Oracle CONNECT BY LEVEL → LVL)
    private Integer lvl;

    public Long getMenuId() {
        return menuId;
    }
    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

    public Long getUpMenuId() {
        return upMenuId;
    }
    public void setUpMenuId(Long upMenuId) {
        this.upMenuId = upMenuId;
    }

    public String getMenuNm() {
        return menuNm;
    }
    public void setMenuNm(String menuNm) {
        this.menuNm = menuNm;
    }

    public String getMenuUrl() {
        return menuUrl;
    }
    public void setMenuUrl(String menuUrl) {
        this.menuUrl = menuUrl;
    }

    public Integer getSortOrd() {
        return sortOrd;
    }
    public void setSortOrd(Integer sortOrd) {
        this.sortOrd = sortOrd;
    }

    public String getUseYn() {
        return useYn;
    }
    public void setUseYn(String useYn) {
        this.useYn = useYn;
    }

    public String getRemark() {
        return remark;
    }
    public void setRemark(String remark) {
        this.remark = remark;
    }

    public Integer getLvl() {
        return lvl;
    }
    public void setLvl(Integer lvl) {
        this.lvl = lvl;
    }
}
