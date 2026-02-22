package msa.admin.auth.service.impl;

import javax.annotation.Resource;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import msa.admin.auth.persistence.AdminAuthDAO;
import msa.admin.auth.service.AdminAuthService;
import msa.admin.auth.vo.AdminUserVO;

@Service("adminAuthService")
public class AdminAuthServiceImpl implements AdminAuthService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AdminAuthServiceImpl.class);

    @Resource(name = "adminAuthDAO")
    private AdminAuthDAO adminAuthDAO;

    @Override
    public AdminUserVO login(String loginId, String password) throws Exception {

        AdminUserVO param = new AdminUserVO();
        param.setLoginId(loginId);

        AdminUserVO user = adminAuthDAO.selectUserForLogin(param);

        if (user == null) {
            LOGGER.info("로그인 실패 - 존재하지 않는 계정: {}", loginId);
            return null;
        }

        // 현재는 평문 비교 (추후 BCrypt 등으로 변경 예정)
        if (!password.equals(user.getUserPw())) {
            LOGGER.info("로그인 실패 - 비밀번호 불일치: {}", loginId);
            return null;
        }

        // 정상
        return user;
    }
    
    @Service("adminAuthService")
    public class AdminAuthServiceImpl implements AdminAuthService {

        @Resource(name = "adminAuthDAO")
        private AdminAuthDAO adminAuthDAO;

        @Override
        public AdminUserVO login(String loginId, String password) throws Exception {
            // 기존 로그인 로직 그대로 사용 (id/pw 확인)
            ...
        }

        @Override
        public List<String> getUserRoleCodes(Long userId) throws Exception {
            return adminAuthDAO.selectUserRoleCodes(userId);
        }

        @Override
        public List<AdminMenuVO> getUserMenuList(Long userId) throws Exception {
            return adminAuthDAO.selectUserMenuList(userId);
        }
    }

}
