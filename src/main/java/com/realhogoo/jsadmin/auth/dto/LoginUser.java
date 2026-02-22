package com.realhogoo.jsadmin.auth.dto;

import java.util.List;

public class LoginUser {
    private String userId;
    private String userPw;   // (운영에선 해시 권장)
    private List<String> roles;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserPw() { return userPw; }
    public void setUserPw(String userPw) { this.userPw = userPw; }

    public List<String> getRoles() { return roles; }
    public void setRoles(List<String> roles) { this.roles = roles; }
}
