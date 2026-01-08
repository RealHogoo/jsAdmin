<%@ page contentType="text/html; charset=UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<html>
<head>
    <title>jsAdmin</title>
    <meta charset="UTF-8"/>
</head>

<body>
    <%@ include file="/WEB-INF/jsp/common/header.jspf" %>

    <div style="display:flex; min-height: 80vh;">
        <div style="width:240px; border-right:1px solid #ddd; padding:12px;">
            <%@ include file="/WEB-INF/jsp/common/sidebar.jspf" %>
        </div>

        <div style="flex:1; padding:12px;">
            <!-- SPA 렌더 영역 -->
            <div id="app"></div>
        </div>
    </div>

    <%@ include file="/WEB-INF/jsp/common/footer.jspf" %>
	<script type="module">
    	import { UX } from "<c:url value='/static/js/ux.js'/>";

    	// 1) 객체로 접근: UX.NVL(), UX.SUBSTR() ...
    	window.UX = UX;

    	// 2) (선택) DB/백/프론트 동일 함수명 직접 호출: NVL(), SUBSTR() ...
    	//    원하면 이 줄을 켜고, 싫으면 주석 유지.
    	Object.assign(window, UX);
	</script>
	
	<script src="<c:url value='/static/js/app.js'/>"></script>
	
	<script>
	    // 최초 진입 시 기본 화면(POST *.do)
	    window.jsAdminSpa.load("/home.do");
	</script>
</body>
</html>
