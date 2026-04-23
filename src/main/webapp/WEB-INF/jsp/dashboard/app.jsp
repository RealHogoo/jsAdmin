<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8"/>
    <title>jsAdmin</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/common.css?v=${assetVersion}">
</head>
<script>
(function () {
    var initialPage = "${empty initialPage ? '/home.do' : initialPage}";

    function boot() {
        if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
            window.jsAdminSpa.load(initialPage);
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
        window.PUBLIC_BASE_URL = "${publicBaseUrl}";
    </script>

    <script src="${pageContext.request.contextPath}/static/js/ux.js?v=${assetVersion}"></script>
    <script src="${pageContext.request.contextPath}/static/js/grid.js?v=${assetVersion}"></script>
    <script src="${pageContext.request.contextPath}/static/js/menu-icons.js?v=${assetVersion}"></script>
    <script src="${pageContext.request.contextPath}/static/js/app.js?v=${assetVersion}"></script>
    <script src="${pageContext.request.contextPath}/static/js/header/header.js?v=${assetVersion}"></script>
    <script src="${pageContext.request.contextPath}/static/js/sidebar/sidebar.js?v=${assetVersion}"></script>

    <script>
        (function () {
            var initialPage = "${empty initialPage ? '/home.do' : initialPage}";
            if (typeof window.load === "function") {
                window.load(initialPage);
                return;
            }

            if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
                window.jsAdminSpa.load(initialPage);
            }
        })();
    </script>
</body>
</html>
