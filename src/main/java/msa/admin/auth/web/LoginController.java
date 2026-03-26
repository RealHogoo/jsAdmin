package msa.admin.auth.web;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import msa.admin.auth.service.AdminAuthService;
import msa.admin.auth.vo.AdminUserVO;

@Controller
public class LoginController {

    private static final Logger LOGGER = LoggerFactory.getLogger(LoginController.class);

    public static final String SESSION_KEY_LOGIN_USER = "LOGIN_USER";
    public static final String SESSION_KEY_LOGIN_USER_ROLES = "LOGIN_USER_ROLES";
    public static final String SESSION_KEY_LOGIN_USER_MENUS = "LOGIN_USER_MENUS";

    @Resource(name = "adminAuthService")
    private AdminAuthService adminAuthService;

    /**
     * 로그인 폼
     * GET /login.do
     */
    @RequestMapping(value = "/login.do", method = RequestMethod.GET)
    public String loginForm(HttpServletRequest request, Model model) {

        // 이미 로그인된 상태라면 메인으로 보내는 정책도 가능 (선택)
        HttpSession session = request.getSession(false);
        if (session != null && session.getAttribute(SESSION_KEY_LOGIN_USER) != null) {
            return "redirect:/main.do";
        }

        return "auth/login"; // /WEB-INF/views/auth/login.jsp
    }

    /**
     * 로그인 처리
     * POST /login.json
     */
    @RequestMapping(value = "/login.json", method = RequestMethod.POST)
    @ResponseBody
    public Map<String, Object> login(HttpServletRequest request) {
        Map<String, Object> result = new HashMap<>();
        Map<String, Object> data   = new HashMap<>();

        String loginId  = request.getParameter("loginId");
        String password = request.getParameter("password");

        try {
            AdminUserVO loginUser = adminAuthService.login(loginId, password);

            if (loginUser == null) {
                result.put("success", Boolean.FALSE);
                result.put("message", "아이디 또는 비밀번호가 올바르지 않습니다.");
                result.put("data", null);
                return result;
            }

            // --- 여기부터 추가: ROLE / MENU 조회 ---
            String userId = loginUser.getUserId();

            List<String> roleList = adminAuthService.getUserRoleCodes(userId);
            List<AdminMenuVO> menuList = adminAuthService.getUserMenuList(userId);

            HttpSession session = request.getSession(true);
            session.setAttribute(SESSION_KEY_LOGIN_USER,       loginUser);
            session.setAttribute(SESSION_KEY_LOGIN_USER_ROLES, roleList);
            session.setAttribute(SESSION_KEY_LOGIN_USER_MENUS, menuList);
            // --- 추가 끝 ---

            data.put("loginId", loginUser.getLoginId());
            data.put("userNm",  loginUser.getUserNm());
            data.put("roles",   roleList); // 프론트에서 쓰고 싶으면 포함

            result.put("success", Boolean.TRUE);
            result.put("message", "");
            result.put("data", data);

        } catch (Exception e) {
            result.put("success", Boolean.FALSE);
            result.put("message", "로그인 처리 중 오류가 발생했습니다.");
            result.put("data", null);
        }

        return result;
    }

    /**
     * 로그아웃
     * GET /logout.do
     */
    @RequestMapping(value = "/logout.do", method = RequestMethod.GET)
    public String logout(HttpServletRequest request) {

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }

        return "redirect:/login.do";
    }
}
