<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>MSA 관리자 포털 - 메인</title>
    <style>
        body {
            margin: 0;
            font-family: Arial, sans-serif;
            background: #f5f5f5;
        }
        #wrap {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }
        header {
            height: 60px;
            background: #343a40;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 20px;
            box-sizing: border-box;
        }
        header .title {
            font-size: 18px;
            font-weight: bold;
        }
        header .user-info {
            font-size: 13px;
        }
        header .user-info a {
            color: #ffc107;
            margin-left: 10px;
            text-decoration: none;
        }
        #container {
            flex: 1;
            display: flex;
        }
        nav#sideMenu {
            width: 220px;
            background: #ffffff;
            border-right: 1px solid #ddd;
            box-sizing: border-box;
        }
        nav#sideMenu h2 {
            margin: 0;
            padding: 15px;
            font-size: 14px;
            border-bottom: 1px solid #eee;
        }
        nav#sideMenu ul {
            list-style: none;
            margin: 0;
            padding: 0;
        }
        nav#sideMenu li a {
            display: block;
            padding: 10px 15px;
            font-size: 13px;
            color: #333;
            text-decoration: none;
            border-bottom: 1px solid #f5f5f5;
        }
        nav#sideMenu li a:hover {
            background: #f1f1f1;
        }
        main#content {
            flex: 1;
            padding: 20px;
            box-sizing: border-box;
        }
        .welcome-box {
            background: #fff;
            border: 1px solid #ddd;
            padding: 20px;
            border-radius: 4px;
        }
        .welcome-box h2 {
            margin-top: 0;
        }
        footer {
            height: 40px;
            background: #ffffff;
            border-top: 1px solid #ddd;
            font-size: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #777;
        }
    </style>
</head>
<body>
<div id="wrap">

    <header>
        <div class="title">MSA 관리자 포털</div>
        <div class="user-info">
            <c:if test="${not empty loginUser}">
                ${loginUser.userNm} (${loginUser.loginId}) 님 환영합니다.
            </c:if>
            <a href="<c:url value='/logout.do'/>">로그아웃</a>
        </div>
    </header>

    <div id="container">
        <!-- 좌측 메뉴 -->
        <nav id="sideMenu">
		    <h2>메뉴</h2>
		    <ul>
		        <c:forEach var="m" items="${menuList}">
		            <c:if test="${m.upMenuId == null}">
		                <!-- 1레벨 메뉴 -->
		                <li>
		                    <span>${m.menuNm}</span>
		                    <ul>
		                        <c:forEach var="c" items="${menuList}">
		                            <c:if test="${c.upMenuId == m.menuId}">
		                                <li>
		                                    <a href="<c:url value='${c.menuUrl}'/>">
		                                        ${c.menuNm}
		                                    </a>
		                                </li>
		                            </c:if>
		                        </c:forEach>
		                    </ul>
		                </li>
		            </c:if>
		        </c:forEach>
		    </ul>
		</nav>

        <!-- 메인 컨텐츠 -->
        <main id="content">
            <div class="welcome-box">
                <h2>대시보드 (초기 버전)</h2>
                <p>
                    <c:choose>
                        <c:when test="${not empty loginUser}">
                            ${loginUser.userNm} (${loginUser.loginId}) 님, 환영합니다.
                        </c:when>
                        <c:otherwise>
                            로그인 사용자 정보가 없습니다. 세션을 확인해주세요.
                        </c:otherwise>
                    </c:choose>
                </p>
                <p>왼쪽 메뉴에서 기능을 선택하세요.</p>

                <!-- 향후 헬스체크 요약 / 다른 서비스 상태 / 공지사항 위젯 등 위치 -->
                <div style="margin-top: 20px;">
                    <strong>시스템 상태 요약(예정)</strong><br/>
                    - 관리자 서비스 DB 상태<br/>
                    - 스케줄링/미디어/웹하드 서비스 상태<br/>
                    - 최근 오류/알림 등
                </div>
            </div>
        </main>
    </div>

    <footer>
        © 2025 MSA 관리자 포털. All rights reserved.
    </footer>

</div>
</body>
</html>
