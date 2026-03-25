<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="accessRoot" class="page-root" data-page-url="/access/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">접속 관리</h2>
            <div class="tabs">
                <a href="javascript:void(0)" class="tab is-active" data-tab="SESSION">현재 세션</a>
                <a href="javascript:void(0)" class="tab" data-tab="HISTORY">로그인 이력</a>
            </div>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            현재 로그인 세션과 로그인 성공/실패 이력을 한 화면에서 확인합니다.
        </div>
    </details>

    <section class="tab-pane" data-pane="SESSION">
        <div class="toolbar btns access-filter-bar">
            <input type="text" class="input" id="sessionKeyword" placeholder="로그인 아이디, 사용자명, IP" style="max-width:220px;">
            <select id="sessionStatus" class="input" style="max-width:150px;">
                <option value="">전체 상태</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="REVOKED">REVOKED</option>
            </select>
            <span class="meta">선택 세션: <b id="selectedSessionId">-</b></span>
            <a href="javascript:void(0)" class="btn" id="btnSessionSearch">조회</a>
            <a href="javascript:void(0)" class="btn" id="btnSessionExpire">선택 세션 만료</a>
            <a href="javascript:void(0)" class="btn" id="btnSessionExpireUser">사용자 전체 만료</a>
        </div>

        <section class="panel panel-list">
            <div class="panel-title">현재 세션 목록</div>
            <div class="grid-scroll" id="sessionListWrap">
                <table class="tbl access-table">
                    <thead>
                    <tr>
                        <th style="width:30px;">No.</th>
                        <th style="width:120px;">상태</th>
                        <th style="width:160px;">로그인 아이디</th>
                        <th style="width:140px;">사용자명</th>
                        <th style="width:140px;">IP</th>
                        <th style="width:180px;">로그인 시각</th>
                        <th style="width:180px;">최근 접속</th>
                        <th style="width:180px;">만료 예정</th>
                        <th style="width:420px;">사용자 에이전트</th>
                    </tr>
                    </thead>
                    <tbody id="sessionListBody"></tbody>
                </table>
            </div>
        </section>
    </section>

    <section class="tab-pane" data-pane="HISTORY" style="display:none;">
        <div class="toolbar btns access-filter-bar">
            <input type="text" class="input" id="historyKeyword" placeholder="로그인 아이디, 사용자명, IP, 사유" style="max-width:240px;">
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

        <section class="panel panel-list">
            <div id="historyGrid" class="vgrid vgrid-fill">
                <div class="vgrid-head">
                    <div class="vgrid-cell vgrid-head-cell" data-width="30px" data-align="center">No.</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="110px" data-align="center">결과</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="140px" data-align="left">로그인 아이디</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="140px" data-align="left">사용자명</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="140px" data-align="center">IP</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="180px" data-align="center">로그인 시각</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="220px" data-align="left">세션 ID</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="420px" data-align="left">상세 사유</div>
                </div>
                <div class="vgrid-body">
                    <div class="vgrid-spacer" aria-hidden="true"></div>
                    <div class="vgrid-rows"></div>
                    <div class="vgrid-empty" style="display:none;"></div>
                </div>
            </div>
        </section>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/access/access.js?v=20260325_02"></script>
