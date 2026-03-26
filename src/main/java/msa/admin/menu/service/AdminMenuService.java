package msa.admin.menu.service;

import java.util.List;

import msa.admin.menu.vo.AdminMenuVO;

public interface AdminMenuService {

    List<AdminMenuVO> selectMenuList() ;

    AdminMenuVO selectMenuDetail(Long menuId) throws Exception;

    void saveMenu(AdminMenuVO vo) throws Exception; // 신규/수정 통합

    void deleteMenu(Long menuId) throws Exception;
}
