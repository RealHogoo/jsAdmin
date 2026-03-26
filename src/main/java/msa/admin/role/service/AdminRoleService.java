package msa.admin.role.service;

import java.util.List;

import msa.admin.role.vo.AdminRoleVO;

public interface AdminRoleService {

    List<AdminRoleVO> selectRoleList() throws Exception;

    AdminRoleVO selectRoleWithMenus(Long roleId) throws Exception;

    void saveRole(AdminRoleVO vo) throws Exception;

    void deleteRole(Long roleId) throws Exception;
}
