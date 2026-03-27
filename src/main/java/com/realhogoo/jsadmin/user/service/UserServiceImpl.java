package com.realhogoo.jsadmin.user.service;

import com.realhogoo.jsadmin.auth.config.SuperAdminProperties;
import com.realhogoo.jsadmin.user.mapper.UserMapper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    private final UserMapper userMapper;
    private final SuperAdminProperties superAdminProperties;
    private final PasswordEncoder passwordEncoder;
    private volatile boolean schemaEnsured;

    public UserServiceImpl(UserMapper userMapper, SuperAdminProperties superAdminProperties, PasswordEncoder passwordEncoder) {
        this.userMapper = userMapper;
        this.superAdminProperties = superAdminProperties;
        this.passwordEncoder = passwordEncoder;
    }

    private void ensureSchema() {
        if (schemaEnsured) {
            return;
        }
        synchronized (this) {
            if (schemaEnsured) {
                return;
            }
            userMapper.ensureUserSecurityColumns();
            userMapper.ensureUserSequence();
            schemaEnsured = true;
        }
    }

    @Override
    public List<Map<String, Object>> getUserList(Map<String, Object> param) {
        ensureSchema();
        return userMapper.selectUserList(param == null ? new HashMap<String, Object>() : param);
    }

    @Override
    public Map<String, Object> getUserDetail(Long userSeq) {
        ensureSchema();
        if (userSeq == null) {
            throw new IllegalArgumentException("user_seq is required");
        }
        return userMapper.selectUserDetail(userSeq);
    }

    @Override
    @Transactional
    public Long saveUser(Map<String, Object> param, String actor) {
        ensureSchema();
        if (param == null) {
            throw new IllegalArgumentException("param is required");
        }

        Long userSeq = toLongNullable(param.get("user_seq"));
        String loginId = toStr(param.get("login_id"));
        String userNm = toStr(param.get("user_nm"));
        String userPw = toNullableStr(param.get("user_pw"));
        String safeActor = actor == null || actor.trim().isEmpty() ? "SYSTEM" : actor.trim();

        if (loginId == null) {
            throw new IllegalArgumentException("login_id is required");
        }
        if (userNm == null) {
            throw new IllegalArgumentException("user_nm is required");
        }
        if (userSeq == null && userPw == null) {
            throw new IllegalArgumentException("user_pw is required");
        }

        if (superAdminProperties.isSuperLoginIdIgnoreCase(loginId) && !superAdminProperties.isSuperLoginId(loginId)) {
            throw new IllegalArgumentException("슈퍼관리자 아이디는 설정값과 정확히 일치해야 합니다.");
        }

        if (!superAdminProperties.isSuperLoginId(loginId) && !loginId.equals(loginId.toLowerCase())) {
            throw new IllegalArgumentException("슈퍼관리자 계정을 제외한 아이디는 소문자만 사용할 수 있습니다.");
        }

        if (!superAdminProperties.isSuperLoginId(loginId)) {
            loginId = loginId.toLowerCase();
        }

        if (superAdminProperties.isSuperLoginIdIgnoreCase(loginId) && !superAdminProperties.isSuperLoginId(loginId)) {
            throw new IllegalArgumentException("슈퍼관리자 아이디와 동일한 값을 다른 형식으로 사용할 수 없습니다.");
        }

        if (userMapper.countByLoginId(loginId, userSeq) > 0) {
            throw new IllegalArgumentException("login_id already exists");
        }

        Map<String, Object> save = new HashMap<String, Object>();
        save.put("user_seq", userSeq);
        save.put("login_id", loginId);
        save.put("user_nm", userNm);
        save.put("user_pw", userPw == null ? null : passwordEncoder.encode(userPw));
        save.put("use_yn", normalizeYn(param.get("use_yn"), "Y"));
        save.put("updated_by", safeActor);

        if (userSeq == null) {
            save.put("created_by", safeActor);
            save.put("login_fail_cnt", 0);
            save.put("lock_yn", "N");
            save.put("pwd_reset_yn", "N");
            userMapper.insertUser(save);
            Object created = save.get("user_seq");
            return created == null ? null : Long.valueOf(String.valueOf(created));
        }

        if (userPw == null) {
            userMapper.updateUserWithoutPassword(save);
        } else {
            userMapper.updateUser(save);
        }
        return userSeq;
    }

    @Override
    @Transactional
    public int deactivateUser(Long userSeq, String actor) {
        ensureSchema();
        if (userSeq == null) {
            throw new IllegalArgumentException("user_seq is required");
        }
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("user_seq", userSeq);
        param.put("updated_by", actor == null || actor.trim().isEmpty() ? "SYSTEM" : actor.trim());
        return userMapper.deactivateUser(param);
    }

    @Override
    @Transactional
    public int unlockUser(Long userSeq, String actor) {
        ensureSchema();
        if (userSeq == null) {
            throw new IllegalArgumentException("user_seq is required");
        }
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("user_seq", userSeq);
        param.put("updated_by", actor == null || actor.trim().isEmpty() ? "SYSTEM" : actor.trim());
        return userMapper.unlockUser(param);
    }

    @Override
    @Transactional
    public int resetPassword(Long userSeq, String actor) {
        ensureSchema();
        if (userSeq == null) {
            throw new IllegalArgumentException("user_seq is required");
        }
        Map<String, Object> detail = userMapper.selectUserDetail(userSeq);
        if (detail == null || detail.isEmpty()) {
            throw new IllegalArgumentException("user not found");
        }

        Map<String, Object> param = new HashMap<String, Object>();
        param.put("user_seq", userSeq);
        param.put("updated_by", actor == null || actor.trim().isEmpty() ? "SYSTEM" : actor.trim());
        param.put("reset_pw", passwordEncoder.encode(String.valueOf(detail.get("login_id"))));
        return userMapper.resetPassword(param);
    }

    @Override
    public Map<String, Object> getMyProfile(String loginId) {
        ensureSchema();
        String safeLoginId = toNullableStr(loginId);
        if (safeLoginId == null) {
            throw new IllegalArgumentException("login_id is required");
        }
        Map<String, Object> detail = userMapper.selectUserDetailByLoginId(safeLoginId);
        if (detail == null || detail.isEmpty()) {
            throw new IllegalArgumentException("user not found");
        }
        return detail;
    }

    @Override
    @Transactional
    public int updateMyProfile(String loginId, Map<String, Object> param, String actor) {
        ensureSchema();
        String safeLoginId = toNullableStr(loginId);
        String userNm = toNullableStr(param == null ? null : param.get("user_nm"));
        if (safeLoginId == null) {
            throw new IllegalArgumentException("login_id is required");
        }
        if (userNm == null) {
            throw new IllegalArgumentException("user_nm is required");
        }

        Map<String, Object> update = new HashMap<String, Object>();
        update.put("login_id", safeLoginId);
        update.put("user_nm", userNm);
        update.put("updated_by", actor == null || actor.trim().isEmpty() ? safeLoginId : actor.trim());
        return userMapper.updateMyProfile(update);
    }

    @Override
    @Transactional
    public int changeMyPassword(String loginId, String currentPassword, String newPassword, String actor) {
        ensureSchema();
        String safeLoginId = toNullableStr(loginId);
        String safeCurrentPassword = toNullableStr(currentPassword);
        String safeNewPassword = toNullableStr(newPassword);
        if (safeLoginId == null) {
            throw new IllegalArgumentException("login_id is required");
        }
        if (safeCurrentPassword == null) {
            throw new IllegalArgumentException("current_password is required");
        }
        if (safeNewPassword == null) {
            throw new IllegalArgumentException("new_password is required");
        }

        String savedPassword = userMapper.selectPasswordByLoginId(safeLoginId);
        if (savedPassword == null) {
            throw new IllegalArgumentException("user not found");
        }
        if (!matchesPassword(savedPassword, safeCurrentPassword)) {
            throw new IllegalArgumentException("현재 비밀번호가 올바르지 않습니다.");
        }

        Map<String, Object> update = new HashMap<String, Object>();
        update.put("login_id", safeLoginId);
        update.put("user_pw", passwordEncoder.encode(safeNewPassword));
        update.put("updated_by", actor == null || actor.trim().isEmpty() ? safeLoginId : actor.trim());
        return userMapper.updatePasswordByLoginId(update);
    }

    private boolean matchesPassword(String savedPassword, String rawPassword) {
        if (savedPassword == null || rawPassword == null) return false;
        if (isBcryptHash(savedPassword)) {
            return passwordEncoder.matches(rawPassword, savedPassword);
        }
        return savedPassword.equals(rawPassword);
    }

    private boolean isBcryptHash(String value) {
        return value != null && (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$"));
    }

    private Long toLongNullable(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return Long.valueOf(s);
    }

    private String toStr(Object value) {
        String s = toNullableStr(value);
        return s == null ? null : s;
    }

    private String toNullableStr(Object value) {
        if (value == null) return null;
        String s = String.valueOf(value).trim();
        if (s.isEmpty() || "null".equalsIgnoreCase(s)) return null;
        return s;
    }

    private String normalizeYn(Object value, String def) {
        String s = toNullableStr(value);
        if (s == null) return def;
        return "N".equalsIgnoreCase(s) ? "N" : "Y";
    }
}
