<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div class="page-root dashboard-page" id="homePage" data-page-url="/home.do">
    <jsp:include page="/WEB-INF/jsp/common/page-header.jsp">
        <jsp:param name="title" value="&#45824;&#49884;&#48372;&#46300;" />
        <jsp:param name="help" value="&#54532;&#47196;&#51229;&#53944; &#44060;&#50836;, &#52572;&#44540; &#44277;&#51648;, &#51452;&#50836; &#44288;&#47532; &#54868;&#47732;&#51004;&#47196; &#48148;&#47196; &#51060;&#46041;&#54633;&#45768;&#45796;." />
    </jsp:include>

    <div class="home-grid">
        <section class="panel home-intro">
            <div class="panel-title">&#54532;&#47196;&#51229;&#53944; &#49548;&#44060;</div>
            <div id="homeIntroMarkdown" class="home-intro-markdown"></div>
            <div class="home-intro-actions btns">
                <a href="javascript:void(0)" class="btn" data-spa="/mypage/main.do">&#47560;&#51060;&#54168;&#51060;&#51648;</a>
                <a href="javascript:void(0)" class="btn" data-spa="/access/main.do">&#51217;&#44540;&#44288;&#47532;</a>
                <a href="javascript:void(0)" class="btn" data-spa="/user/main.do">&#49324;&#50857;&#51088;&#44288;&#47532;</a>
                <a href="javascript:void(0)" class="btn" data-spa="/auth/main.do">&#44428;&#54620;&#44288;&#47532;</a>
            </div>
        </section>

        <section class="panel home-notice panel-list">
            <div class="home-notice-head">
                <div class="panel-title">&#44277;&#51648;&#49324;&#54637;</div>
            </div>
            <div class="card-scroll">
                <div id="homeNoticeTrack" class="home-notice-track"></div>
            </div>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/home/home.js?v=${assetVersion}"></script>
