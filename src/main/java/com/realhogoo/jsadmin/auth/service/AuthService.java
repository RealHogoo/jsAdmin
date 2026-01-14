package com.realhogoo.jsadmin.auth.service;

import java.util.Map;

public interface AuthService {
    Map<String, Object> login(String userId, String userPw);
}
