<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8"/>
    <title>jsAdmin</title>
    <link rel="stylesheet" href="/static/css/common.css?v=20260326_01">
</head>
<script>
(function () {
    function boot() {
        if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
            window.jsAdminSpa.load("/home.do");
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
</script>
<body class="app-shell">
    <%@ include file="/WEB-INF/jsp/common/header.jspf" %>

    <div class="app-body">
        <aside class="app-sidebar">
            <%@ include file="/WEB-INF/jsp/common/sidebar.jspf" %>
        </aside>

        <main class="app-main">
            <div id="app"></div>
        </main>
    </div>

    <%@ include file="/WEB-INF/jsp/common/footer.jspf" %>

    <script>
        window.CTX = "${pageContext.request.contextPath}";
    </script>

    <script src="${pageContext.request.contextPath}/static/js/ux.js"></script>
    <script src="${pageContext.request.contextPath}/static/js/grid.js?v=20260326_01"></script>
    <script src="${pageContext.request.contextPath}/static/js/menu-icons.js?v=20260325_05"></script>
    <script src="${pageContext.request.contextPath}/static/js/app.js?v=20260328_03"></script>
    <script src="${pageContext.request.contextPath}/static/js/header/header.js?v=20260328_02"></script>
    <script src="${pageContext.request.contextPath}/static/js/footer/footer.js"></script>
    <script src="${pageContext.request.contextPath}/static/js/sidebar/sidebar.js?v=20260327_02"></script>

    <script>
        (function () {
            if (typeof window.load === "function") {
                window.load("/main.do");
                return;
            }

            if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
                window.jsAdminSpa.load("/main.do");
            }
        })();
    </script>
</body>
</html>
