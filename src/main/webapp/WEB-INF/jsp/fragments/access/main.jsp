<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="accessRoot" class="page-root" data-page-url="/access/main.do">
    <h2 class="page-title">접속 관리</h2>
    <p class="muted">현재 로그인 세션과 로그인 성공/실패 이력을 운영 화면에서 바로 확인합니다.</p>

    <div class="tabs">
        <a href="javascript:void(0)" class="tab is-active" data-tab="SESSION">현재 세션</a>
        <a href="javascript:void(0)" class="tab" data-tab="HISTORY">로그인 이력</a>
    </div>

    <section class="tab-pane" data-pane="SESSION">
        <div class="toolbar btns access-filter-bar">
            <input type="text" class="input" id="sessionKeyword" placeholder="로그인 ID, 이름, IP" style="max-width:220px;">
            <select id="sessionStatus" class="input" style="max-width:150px;">
                <option value="">전체 상태</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="REVOKED">REVOKED</option>
            </select>
            <a href="javascript:void(0)" class="btn" id="btnSessionSearch">조회</a>
            <a href="javascript:void(0)" class="btn" id="btnSessionExpire">선택 세션 만료</a>
            <a href="javascript:void(0)" class="btn" id="btnSessionExpireUser">사용자 전체 만료</a>
            <span class="meta">선택 세션: <b id="selectedSessionId">-</b></span>
        </div>

        <section class="panel">
            <div class="panel-title">현재 세션 목록</div>
            <table class="tbl access-table">
                <thead>
                <tr>
                    <th style="width:120px;">상태</th>
                    <th style="width:120px;">LOGIN_ID</th>
                    <th style="width:110px;">사용자명</th>
                    <th style="width:110px;">IP</th>
                    <th style="width:180px;">로그인 시각</th>
                    <th style="width:180px;">최근 접근</th>
                    <th style="width:180px;">만료 예정</th>
                    <th>USER_AGENT</th>
                </tr>
                </thead>
                <tbody id="sessionListBody"></tbody>
            </table>
        </section>
    </section>

    <section class="tab-pane" data-pane="HISTORY" style="display:none;">
        <div class="toolbar btns access-filter-bar">
            <input type="text" class="input" id="historyKeyword" placeholder="로그인 ID, 이름, IP, 사유" style="max-width:240px;">
            <select id="historyResult" class="input" style="max-width:140px;">
                <option value="">전체 결과</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAIL">FAIL</option>
                <option value="LOGOUT">LOGOUT</option>
            </select>
            <input type="date" class="input" id="historyFromDt" style="max-width:150px;">
            <input type="date" class="input" id="historyToDt" style="max-width:150px;">
            <a href="javascript:void(0)" class="btn" id="btnHistorySearch">조회</a>
        </div>

        <section class="panel">
            <div class="panel-title">로그인 이력</div>
            <table class="tbl access-table">
                <thead>
                <tr>
                    <th style="width:110px;">결과</th>
                    <th style="width:120px;">LOGIN_ID</th>
                    <th style="width:110px;">사용자명</th>
                    <th style="width:110px;">IP</th>
                    <th style="width:180px;">로그인 시각</th>
                    <th style="width:160px;">세션 ID</th>
                    <th>상세 사유</th>
                </tr>
                </thead>
                <tbody id="historyListBody"></tbody>
            </table>
        </section>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/access/access.js"></script>
