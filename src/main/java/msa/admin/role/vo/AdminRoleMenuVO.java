package msa.admin.role.vo;

import java.io.Serializable;

public class AdminRoleMenuVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long roleId;
    private Long menuId;
    private String useYn;

    // 조인용
    private String menuNm;

    public Long getRoleId() {
        return roleId;
    }
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
    public Long getMenuId() {
        return menuId;
    }
    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }
    public String getUseYn() {
        return useYn;
    }
    public void setUseYn(String useYn) {
        this.useYn = useYn;
    }
    public String getMenuNm() {
        return menuNm;
    }
    public void setMenuNm(String menuNm) {
        this.menuNm = menuNm;
    }
}
