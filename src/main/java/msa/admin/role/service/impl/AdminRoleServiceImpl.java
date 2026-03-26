package msa.admin.role.service.impl;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import msa.admin.menu.service.AdminMenuService;
import msa.admin.role.persistence.AdminRoleDAO;
import msa.admin.role.service.AdminRoleService;
import msa.admin.role.vo.AdminRoleVO;

@Service("adminRoleService")
public class AdminRoleServiceImpl implements AdminRoleService {

    @Resource(name = "adminRoleDAO")
    private AdminRoleDAO adminRoleDAO;

    @Resource(name = "adminMenuService")
    private AdminMenuService adminMenuService; // 메뉴 트리 조회용

    @Override
    public List<AdminRoleVO> selectRoleList() throws Exception {
        return adminRoleDAO.selectRoleList();
    }

    @Override
    public AdminRoleVO selectRoleWithMenus(Long roleId) throws Exception {
        AdminRoleVO role = adminRoleDAO.selectRoleDetail(roleId);
        if (role != null) {
            List<Long> menuIds = adminRoleDAO.selectRoleMenuIds(roleId);
            role.setMenuIdList(menuIds);
        }
        return role;
    }

    @Override
    @Transactional
    public void saveRole(AdminRoleVO vo) throws Exception {

        // 1) ROLE 저장
        if (vo.getRoleId() == null) {
            if (vo.getUseYn() == null) {
                vo.setUseYn("Y");
            }
            adminRoleDAO.insertRole(vo);
        } else {
            adminRoleDAO.updateRole(vo);
        }

        Long roleId = vo.getRoleId();
        if (roleId == null) {
            // selectKey로 세팅 안되면 예외
            throw new IllegalStateException("ROLE_ID 생성 실패");
        }

        // 2) ROLE_MENU 저장
        //    : 일단 해당 ROLE의 기존 매핑을 모두 'N'으로 비활성 처리하고,
        //      넘어온 menuIdList에 대해 다시 'Y'로 INSERT

        adminRoleDAO.deleteRoleMenuAll(roleId);

        if (vo.getMenuIdList() != null) {
            for (Long menuId : vo.getMenuIdList()) {
                adminRoleDAO.insertRoleMenu(roleId, menuId);
            }
        }
    }

    @Override
    @Transactional
    public void deleteRole(Long roleId) throws Exception {
        // ROLE 자체를 USE_YN='N'으로 처리
        adminRoleDAO.deleteRole(roleId);
        // ROLE_MENU / USER_ROLE 은 추후 정책에 따라 같이 비활성화 가능
        adminRoleDAO.deleteRoleMenuAll(roleId);
        // ADMIN_USER_ROLE 에 대한 처리도 필요하다면 여기에 추가
    }
}
