package msa.admin.auth.service;

import java.util.List;

import msa.admin.auth.vo.AdminUserVO;

public interface AdminAuthService {

    /**
     * 로그인 시도.
     * 성공 시 AdminUserVO, 실패 시 null 반환.
     */
    AdminUserVO login(String loginId, String password) throws Exception;
    
    List<String> getUserRoleCodes(Long userId) throws Exception;

    List<AdminMenuVO> getUserMenuList(Long userId) throws Exception;

}
