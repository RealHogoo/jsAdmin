package msa.com.interceptor;

import java.io.PrintWriter;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import msa.admin.auth.vo.AdminUserVO;
import msa.admin.auth.web.LoginController;

public class AuthInterceptor extends HandlerInterceptorAdapter {

    private static final Logger LOGGER = LoggerFactory.getLogger(AuthInterceptor.class);

    // 화이트리스트 URL (로그인 체크 제외)
    private static final String[] EXCLUDE_PATTERNS = {
        "/login.do",
        "/login.json",
        "/logout.do",
        "/health.do",
        "/health.json",
        "/css/",
        "/js/",
        "/images/"
    };

    private boolean isExcluded(String uri) {
        if (uri == null) return false;

        for (String pattern : EXCLUDE_PATTERNS) {
            // 간단 패턴: prefix 매칭
            if (uri.startsWith(pattern)) {
                return true;
            }
        }
        return false;
    }

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) throws Exception {

        String contextPath = request.getContextPath();
        String uri = request.getRequestURI().substring(contextPath.length());

        LOGGER.debug("AuthInterceptor preHandle - uri={}", uri);

        // 예외 URL이면 통과
        if (isExcluded(uri)) {
            return true;
        }

        HttpSession session = request.getSession(false);
        AdminUserVO loginUser = null;
        if (session != null) {
            Object obj = session.getAttribute(LoginController.SESSION_KEY_LOGIN_USER);
            if (obj instanceof AdminUserVO) {
                loginUser = (AdminUserVO) obj;
            }
        }

        boolean isJson = uri.endsWith(".json");

        // 세션 없음 → 로그인 필요
        if (loginUser == null) {

            if (isJson) {
                // JSON 요청이면 401 + JSON 반환
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json;charset=UTF-8");

                PrintWriter out = response.getWriter();
                out.write("{\"success\":false,"
                        + "\"message\":\"로그인이 필요합니다.\","
                        + "\"data\":null}");
                out.flush();
            } else {
                // 화면 요청이면 로그인 페이지로
                response.sendRedirect(contextPath + "/login.do");
            }
            return false;
        }

        // 로그인된 상태 → 통과
        return true;
    }
}
