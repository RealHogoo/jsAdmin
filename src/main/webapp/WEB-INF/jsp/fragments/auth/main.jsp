<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authRoot" class="page-root" data-page-url="/auth/main.do">
    <h2 class="page-title">권한관리</h2>

    <div class="tabs">
        <a href="javascript:void(0)" class="tab is-active" data-tab="A">그룹-메뉴</a>
        <a href="javascript:void(0)" class="tab" data-tab="B">사용자 예외</a>
    </div>

    <!-- TAB A -->
    <section class="tab-pane" data-pane="A">
        <div class="toolbar btns">
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnGroupReload">그룹조회</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupSave">저장</a>
            <span class="meta">선택 그룹: <b id="selectedGroupSeq">-</b></span>
        </div>

        <div class="grid-2col">
            <div class="panel">
                <div class="panel-title">권한그룹</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">SEQ</th>
                        <th>그룹명</th>
                        <th style="width:70px;">USE</th>
                    </tr>
                    </thead>
                    <tbody id="groupListBody"></tbody>
                </table>
            </div>

            <div class="panel">
                <div class="panel-title">메뉴 권한</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">SEQ</th>
                        <th>메뉴</th>
                        <th style="width:120px;">권한</th>
                        <th style="width:70px;">USE</th>
                    </tr>
                    </thead>
                    <tbody id="menuPermBody"></tbody>
                </table>
            </div>
        </div>
    </section>

    <!-- TAB B (다음 단계) -->
    <section class="tab-pane" data-pane="B" style="display:none;">
        <div class="panel">
            <div class="panel-title">사용자 예외(다음 단계)</div>
            <div class="muted">TAB B는 다음 단계에서 붙입니다.</div>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js"></script>
