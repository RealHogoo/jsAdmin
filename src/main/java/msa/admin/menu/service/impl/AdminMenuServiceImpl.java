package msa.admin.menu.service.impl;

import java.util.List;

import javax.annotation.Resource;

import org.springframework.stereotype.Service;

import msa.admin.menu.persistence.AdminMenuDAO;
import msa.admin.menu.service.AdminMenuService;
import msa.admin.menu.vo.AdminMenuVO;

@Service("adminMenuService")
public class AdminMenuServiceImpl implements AdminMenuService {

    @Resource(name = "adminMenuDAO")
    private AdminMenuDAO adminMenuDAO;

    @Override
    public List<AdminMenuVO> selectMenuList() {
        return adminMenuDAO.selectMenuList();
    }

    @Override
    public AdminMenuVO selectMenuDetail(Long menuId) throws Exception {
        return adminMenuDAO.selectMenuDetail(menuId);
    }

    @Override
    public void saveMenu(AdminMenuVO vo) throws Exception {
        if (vo.getMenuId() == null) {
            if (vo.getUseYn() == null) {
                vo.setUseYn("Y");
            }
            adminMenuDAO.insertMenu(vo);
        } else {
            adminMenuDAO.updateMenu(vo);
        }
    }

    @Override
    public void deleteMenu(Long menuId) throws Exception {
        adminMenuDAO.deleteMenu(menuId);
    }
}

