package msa.admin.auth.persistence;

import java.util.List;

import org.springframework.stereotype.Repository;

import egovframework.rte.psl.dataaccess.EgovAbstractMapper;
import msa.admin.auth.vo.AdminUserVO;

@Repository("adminAuthDAO")
public class AdminAuthDAO extends EgovAbstractMapper {

    public AdminUserVO selectUserForLogin(AdminUserVO param) {
        return selectOne("adminAuth.selectUserForLogin", param);
    }

    public List<String> selectUserRoles(String userId) {
        return selectList("adminAuth.selectUserRoles", userId);
    }
    public List<String> selectUserRoleCodes(Long userId) {
        return selectList("adminAuth.selectUserRoleCodes", userId);
    }

    public List<AdminMenuVO> selectUserMenuList(Long userId) {
        return selectList("adminAuth.selectUserMenuList", userId);
    }

}
