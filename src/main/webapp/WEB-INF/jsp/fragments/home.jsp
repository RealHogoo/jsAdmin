<%@ page contentType="text/html; charset=UTF-8" %>

<div class="page-root dashboard-page" id="homePage">
    <h2 class="page-title">대시보드</h2>
    <p class="muted">프로젝트 소개와 최근 공지, 주요 관리 화면으로 바로 이동할 수 있습니다.</p>

    <div class="home-grid">
        <section class="panel home-intro">
            <div class="panel-title">프로젝트 소개</div>
            <h3 id="homeIntroTitle" class="home-intro-title">불러오는 중...</h3>
            <p id="homeIntroSummary" class="home-intro-summary muted"></p>
            <ul id="homeIntroList" class="home-intro-list"></ul>
            <div class="home-intro-actions btns">
                <a href="javascript:void(0)" class="btn" data-spa="/mypage/main.do">마이페이지</a>
                <a href="javascript:void(0)" class="btn" data-spa="/access/main.do">접속관리</a>
                <a href="javascript:void(0)" class="btn" data-spa="/user/main.do">사용자관리</a>
                <a href="javascript:void(0)" class="btn" data-spa="/auth/main.do">권한관리</a>
            </div>
            <pre id="homeIntroRaw" class="home-intro-raw"></pre>
        </section>

        <section class="panel home-notice">
            <div class="home-notice-head">
                <div class="panel-title">공지사항</div>
            </div>
            <div id="homeNoticeTrack" class="home-notice-track"></div>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/home/home.js"></script>
