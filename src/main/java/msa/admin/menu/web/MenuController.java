package msa.admin.menu.web;

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

@Controller
@RequestMapping("/system/menu")
public class MenuController {

    @Resource(name = "adminMenuService")
    private AdminMenuService adminMenuService;

    @RequestMapping("/list.do")
    public String list(Model model) throws Exception {
        List<AdminMenuVO> menuList = adminMenuService.selectMenuList();
        model.addAttribute("menuList", menuList);
        return "menu/menuList";
    }

    @RequestMapping("/saveMenu.json")
    @ResponseBody
    public Map<String, Object> saveMenu(@ModelAttribute AdminMenuVO vo) {
        Map<String, Object> result = new HashMap<>();
        try {
            adminMenuService.saveMenu(vo);
            result.put("success", Boolean.TRUE);
            result.put("message", "");
        } catch (Exception e) {
            result.put("success", Boolean.FALSE);
            result.put("message", "메뉴 저장 중 오류가 발생했습니다.");
        }
        return result;
    }

    @RequestMapping("/deleteMenu.json")
    @ResponseBody
    public Map<String, Object> deleteMenu(Long menuId) {
        Map<String, Object> result = new HashMap<>();
        try {
            adminMenuService.deleteMenu(menuId);
            result.put("success", Boolean.TRUE);
            result.put("message", "");
        } catch (Exception e) {
            result.put("success", Boolean.FALSE);
            result.put("message", "메뉴 삭제 중 오류가 발생했습니다.");
        }
        return result;
    }
}

