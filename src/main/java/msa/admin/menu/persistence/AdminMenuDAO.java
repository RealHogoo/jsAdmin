package msa.admin.menu.persistence;

import java.util.List;

import org.springframework.stereotype.Repository;

import egovframework.rte.psl.dataaccess.EgovAbstractMapper;
import msa.admin.menu.vo.AdminMenuVO;

@Repository("adminMenuDAO")
public class AdminMenuDAO extends EgovAbstractMapper {

    public List<AdminMenuVO> selectMenuList() {
        return selectList("adminMenu.selectMenuList");
    }

    public AdminMenuVO selectMenuDetail(Long menuId) {
        return selectOne("adminMenu.selectMenuDetail", menuId);
    }

    public int insertMenu(AdminMenuVO vo) {
        return insert("adminMenu.insertMenu", vo);
    }

    public int updateMenu(AdminMenuVO vo) {
        return update("adminMenu.updateMenu", vo);
    }

    public int deleteMenu(Long menuId) {
        return update("adminMenu.deleteMenu", menuId);
    }
}
