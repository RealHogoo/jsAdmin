<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<!doctype html>
<html lang="ko">
<head>
    <meta charset="UTF-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>jsAdmin Service Login</title>
    <link rel="stylesheet" href="${pageContext.request.contextPath}/static/css/common.css?v=${assetVersion}">
</head>
<body>
    <c:set var="serviceName" value="${empty serviceName ? '연계 서비스' : serviceName}" />
    <jsp:include page="/WEB-INF/jsp/fragments/login/service-login.jsp">
        <jsp:param name="serviceName" value="${serviceName}" />
    </jsp:include>

    <script>
        window.CTX = "${pageContext.request.contextPath}";
        window.ADMIN_SERVICE_PUBLIC_BASE_URL = "${adminServicePublicBaseUrl}";
    </script>
    <script src="${pageContext.request.contextPath}/static/js/ux.js?v=${assetVersion}"></script>
    <script src="${pageContext.request.contextPath}/static/js/login/login.js?v=${assetVersion}"></script>
</body>
</html>
