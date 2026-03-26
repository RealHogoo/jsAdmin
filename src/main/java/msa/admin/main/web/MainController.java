package msa.admin.main.web;

import java.util.List;

import javax.annotation.Resource;
import javax.servlet.http.HttpSession;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

import msa.admin.auth.vo.AdminUserVO;
import msa.admin.auth.web.LoginController;
import msa.admin.menu.service.AdminMenuService;
import msa.admin.menu.vo.AdminMenuVO;


@Controller
public class MainController {
	@Resource(name = "adminMenuService")
	private AdminMenuService adminMenuService;
	
    @RequestMapping("/main.do")
    public String main(HttpSession session, Model model) {
        AdminUserVO loginUser  = (AdminUserVO) session.getAttribute(LoginController.SESSION_KEY_LOGIN_USER);
        model.addAttribute("loginUser", loginUser);

        // 메뉴 목록
        List<AdminMenuVO> menuList = null;
//		try {
			menuList = adminMenuService.selectMenuList();
//		} catch (Exception e) {
//			// TODO Auto-generated catch block
//			e.printStackTrace();
//		}
        model.addAttribute("menuList", menuList);
        return "main/main";  // /WEB-INF/views/main/main.jsp
    }
}
