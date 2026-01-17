<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8"/>
    <title>jsAdmin</title>
</head>
<script>
(function () {
    function boot() {
        var token = null;
        try { token = localStorage.getItem("JWT"); } catch (e) {}

        if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
            if (token && token.trim().length > 0) {
                window.jsAdminSpa.load("/home.do");
            } else {
                window.jsAdminSpa.load("/login.do");
            }
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
</script>
<body>
    <%@ include file="/WEB-INF/jsp/common/header.jspf" %>

    <div style="display:flex; min-height:80vh;">
        <div style="width:240px; border-right:1px solid #ddd; padding:12px;">
            <%@ include file="/WEB-INF/jsp/common/sidebar.jspf" %>
        </div>

        <div style="flex:1; padding:12px;">
            <!-- SPA 렌더 영역 -->
            <div id="app"></div>
        </div>
    </div>

    <%@ include file="/WEB-INF/jsp/common/footer.jspf" %>

    <!-- contextPath 전역 1개만 -->
    <script>
        window.CTX = "${pageContext.request.contextPath}";
    </script>

    <!-- app.jsp는 UX + APP만 로딩 -->
    <script src="${pageContext.request.contextPath}/static/js/ux.js"></script>
	<script src="${pageContext.request.contextPath}/static/js/app.js"></script>
	
	<script src="${pageContext.request.contextPath}/static/js/header/header.js"></script>
	
	<script src="${pageContext.request.contextPath}/static/js/footer/footer.js"></script>
	<script src="${pageContext.request.contextPath}/static/js/sidebar/sidebar.js"></script>


    <!-- 최초 진입 화면: *.do (POST 고정은 app.js 내부 load가 처리) -->
    <script>
        (function () {
            // app.js에 load()가 있으면 그걸 우선 사용
            if (typeof window.load === "function") {
                window.load("/main.do");   // 필요하면 /home.do 로 바꿔도 됨
                return;
            }

            // 기존에 jsAdminSpa.load(...) 형태면 그걸 사용
            if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
                window.jsAdminSpa.load("/main.do");
            }
        })();
    </script>
</body>
</html>
