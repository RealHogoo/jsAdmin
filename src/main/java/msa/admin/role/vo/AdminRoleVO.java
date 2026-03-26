package msa.admin.role.vo;

import java.io.Serializable;
import java.util.List;

public class AdminRoleVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long roleId;
    private String roleCd;
    private String roleNm;
    private String useYn;
    private String remark;

    // 화면/저장용: 선택된 메뉴 ID 리스트
    private List<Long> menuIdList;

    public Long getRoleId() {
        return roleId;
    }
    public void setRoleId(Long roleId) {
        this.roleId = roleId;
    }
    public String getRoleCd() {
        return roleCd;
    }
    public void setRoleCd(String roleCd) {
        this.roleCd = roleCd;
    }
    public String getRoleNm() {
        return roleNm;
    }
    public void setRoleNm(String roleNm) {
        this.roleNm = roleNm;
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
    public List<Long> getMenuIdList() {
        return menuIdList;
    }
    public void setMenuIdList(List<Long> menuIdList) {
        this.menuIdList = menuIdList;
    }
}
