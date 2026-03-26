package msa.admin.auth.vo;

import java.io.Serializable;
import java.util.List;

public class AdminUserVO implements Serializable {

    private static final long serialVersionUID = 1L;

    private String userId;
    private String loginId;
    private String userPw;   // 해시된 비밀번호
    private String userNm;
    private String email;
    private String useYn;
    private List<String> roleList;

    // getter/setter
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    
    public String getLoginId() { return loginId; }
    public void setLoginId(String loginId) { this.loginId = loginId; }

    public String getUserPw() { return userPw; }
    public void setUserPw(String userPw) { this.userPw = userPw; }

    public String getUserNm() { return userNm; }
    public void setUserNm(String userNm) { this.userNm = userNm; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUseYn() { return useYn; }
    public void setUseYn(String useYn) { this.useYn = useYn; }

    public List<String> getRoleList() { return roleList; }
    public void setRoleList(List<String> roleList) { this.roleList = roleList; }
}
