<%@ page contentType="text/html; charset=UTF-8" %>

<div class="page-root dashboard-page" id="homePage">
    <h2 class="page-title">Dashboard</h2>
    <p class="muted">Quick view for project intro and latest notices.</p>

    <div class="home-grid">
        <section class="panel home-intro">
            <div class="panel-title">Project Intro</div>
            <h3 id="homeIntroTitle" class="home-intro-title">Loading...</h3>
            <p id="homeIntroSummary" class="home-intro-summary muted"></p>
            <ul id="homeIntroList" class="home-intro-list"></ul>
            <pre id="homeIntroRaw" class="home-intro-raw"></pre>
        </section>

        <section class="panel home-notice">
            <div class="home-notice-head">
                <div class="panel-title">Notice Cards</div>
            </div>
            <div id="homeNoticeTrack" class="home-notice-track"></div>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/home/home.js"></script>
