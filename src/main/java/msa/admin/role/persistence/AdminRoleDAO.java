package msa.admin.role.persistence;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import egovframework.rte.psl.dataaccess.EgovAbstractMapper;
import msa.admin.role.vo.AdminRoleVO;

@Repository("adminRoleDAO")
public class AdminRoleDAO extends EgovAbstractMapper {

    public List<AdminRoleVO> selectRoleList() {
        return selectList("adminRole.selectRoleList");
    }

    public AdminRoleVO selectRoleDetail(Long roleId) {
        return selectOne("adminRole.selectRoleDetail", roleId);
    }

    public int insertRole(AdminRoleVO vo) {
        return insert("adminRole.insertRole", vo);
    }

    public int updateRole(AdminRoleVO vo) {
        return update("adminRole.updateRole", vo);
    }

    public int deleteRole(Long roleId) {
        return update("adminRole.deleteRole", roleId);
    }

    public List<Long> selectRoleMenuIds(Long roleId) {
        return selectList("adminRole.selectRoleMenuIds", roleId);
    }

    public int deleteRoleMenuAll(Long roleId) {
        return update("adminRole.deleteRoleMenuAll", roleId);
    }

    public int insertRoleMenu(Long roleId, Long menuId) {
        Map<String, Object> param = new HashMap<String, Object>();
        param.put("roleId", roleId);
        param.put("menuId", menuId);
        return insert("adminRole.insertRoleMenu", param);
    }
}
