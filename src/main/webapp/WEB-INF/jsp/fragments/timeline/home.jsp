<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div class="page-root timeline-home-page" id="timelineHomePage" data-page-url="/timeline/home.do">
    <h2 class="page-title">타임라인</h2>
    <div id="timelineHomeScroll" class="card-scroll">
        <div id="timelineHomeCardList" class="timeline-card-list"></div>
        <div id="timelineHomeEmpty" class="muted" style="display:none; margin-top:8px;">표시할 타임라인이 없습니다.</div>
        <div id="timelineHomeLoading" class="muted" style="display:none; margin-top:8px;">불러오는 중...</div>
        <div id="timelineHomeSentinel" style="height:1px;"></div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/timeline/timeline-home.js"></script>
