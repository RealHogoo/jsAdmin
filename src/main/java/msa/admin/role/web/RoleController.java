package msa.admin.role.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import msa.admin.menu.service.AdminMenuService;
import msa.admin.menu.vo.AdminMenuVO;
import msa.admin.role.service.AdminRoleService;
import msa.admin.role.vo.AdminRoleVO;

@Controller
@RequestMapping("/system/role")
public class RoleController {

    @Resource(name = "adminRoleService")
    private AdminRoleService adminRoleService;

    @Resource(name = "adminMenuService")
    private AdminMenuService adminMenuService;

    /**
     * 권한 목록 + 상세/메뉴 매핑 화면
     */
    @RequestMapping("/list.do")
    public String list(Long roleId, Model model) throws Exception {

        // 1) ROLE 목록
        List<AdminRoleVO> roleList = adminRoleService.selectRoleList();
        model.addAttribute("roleList", roleList);

        // 2) 선택된 ROLE 상세
        AdminRoleVO selectedRole = null;
        if (roleId != null) {
            selectedRole = adminRoleService.selectRoleWithMenus(roleId);
        }
        model.addAttribute("selectedRole", selectedRole);

        // 3) 메뉴 트리 (모든 메뉴)
        List<AdminMenuVO> menuList = adminMenuService.selectMenuList();
        model.addAttribute("menuList", menuList);

        return "role/roleList"; // /WEB-INF/views/role/roleList.jsp
    }

    /**
     * ROLE + ROLE_MENU 저장
     */
    @RequestMapping("/saveRole.json")
    @ResponseBody
    public Map<String, Object> saveRole(@ModelAttribute AdminRoleVO vo, Long[] menuIds) {

        Map<String, Object> result = new HashMap<String, Object>();

        try {
            // 체크된 메뉴 ID 리스트 세팅
            if (menuIds != null) {
                java.util.List<Long> list = new java.util.ArrayList<Long>();
                for (Long id : menuIds) {
                    list.add(id);
                }
                vo.setMenuIdList(list);
            }

            adminRoleService.saveRole(vo);

            result.put("success", Boolean.TRUE);
            result.put("message", "");
        } catch (Exception e) {
            result.put("success", Boolean.FALSE);
            result.put("message", "권한 저장 중 오류가 발생했습니다.");
        }

        return result;
    }

    /**
     * ROLE 삭제
     */
    @RequestMapping("/deleteRole.json")
    @ResponseBody
    public Map<String, Object> deleteRole(Long roleId) {

        Map<String, Object> result = new HashMap<String, Object>();

        try {
            adminRoleService.deleteRole(roleId);
            result.put("success", Boolean.TRUE);
            result.put("message", "");
        } catch (Exception e) {
            result.put("success", Boolean.FALSE);
            result.put("message", "권한 삭제 중 오류가 발생했습니다.");
        }

        return result;
    }
}
