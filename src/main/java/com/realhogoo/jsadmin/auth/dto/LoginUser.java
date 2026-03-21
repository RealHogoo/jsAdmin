package com.realhogoo.jsadmin.auth.dto;

import java.util.Date;
import java.util.List;

public class LoginUser {
    private Long userSeq;
    private String userId;
    private String userNm;
    private String userPw;
    private Integer loginFailCnt;
    private String lockYn;
    private Date lockUntilAt;
    private String pwdResetYn;
    private List<String> roles;

    public Long getUserSeq() { return userSeq; }
    public void setUserSeq(Long userSeq) { this.userSeq = userSeq; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserNm() { return userNm; }
    public void setUserNm(String userNm) { this.userNm = userNm; }

    public String getUserPw() { return userPw; }
    public void setUserPw(String userPw) { this.userPw = userPw; }

    public Integer getLoginFailCnt() { return loginFailCnt; }
    public void setLoginFailCnt(Integer loginFailCnt) { this.loginFailCnt = loginFailCnt; }

    public String getLockYn() { return lockYn; }
    public void setLockYn(String lockYn) { this.lockYn = lockYn; }

    public Date getLockUntilAt() { return lockUntilAt; }
    public void setLockUntilAt(Date lockUntilAt) { this.lockUntilAt = lockUntilAt; }

    public String getPwdResetYn() { return pwdResetYn; }
    public void setPwdResetYn(String pwdResetYn) { this.pwdResetYn = pwdResetYn; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
