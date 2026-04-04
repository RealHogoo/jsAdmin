<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div class="page-root timeline-home-page" id="timelineHomePage" data-page-url="/timeline/home.do">
    <jsp:include page="/WEB-INF/jsp/common/page-header.jsp">
        <jsp:param name="title" value="&#xd0c0;&#xc784;&#xb77c;&#xc778;" />
        <jsp:param name="help" value="&#xc2dc;&#xc2a4;&#xd15c;&#xc5d0; &#xb4f1;&#xb85d;&#xb41c; &#xd0c0;&#xc784;&#xb77c;&#xc778; &#xc774;&#xbca4;&#xd2b8;&#xb97c; &#xc2dc;&#xac04; &#xc21c;&#xc73c;&#xb85c; &#xd655;&#xc778;&#xd569;&#xb2c8;&#xb2e4;." />
    </jsp:include>

    <div id="timelineHomeScroll" class="card-scroll">
        <div id="timelineHomeCardList" class="timeline-card-list"></div>
        <div id="timelineHomeEmpty" class="muted" style="display:none; margin-top:8px;">표시할 타임라인이 없습니다.</div>
        <div id="timelineHomeLoading" class="muted" style="display:none; margin-top:8px;">불러오는 중...</div>
        <div id="timelineHomeSentinel" style="height:1px;"></div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/timeline/timeline-home.js?v=${assetVersion}"></script>
