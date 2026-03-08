<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authRoot" class="page-root" data-page-url="/auth/main.do">
    <h2 class="page-title">권한관리</h2>

    <div class="tabs">
        <a href="javascript:void(0)" class="tab is-active" data-tab="A">그룹-메뉴</a>
        <a href="javascript:void(0)" class="tab" data-tab="B">사용자 예외</a>
    </div>

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

    <section class="tab-pane" data-pane="B" style="display:none;">
        <div class="toolbar btns">
            <input type="text" class="input" id="userKeyword" placeholder="로그인ID/사용자명" style="max-width:220px;">
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnUserSearch">사용자조회</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnUserExceptionSave">예외저장</a>
            <span class="meta">선택 사용자: <b id="selectedUserSeq">-</b></span>
        </div>

        <div class="grid-2col">
            <div class="panel">
                <div class="panel-title">사용자 목록</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">USER_SEQ</th>
                        <th>LOGIN_ID</th>
                        <th>사용자명</th>
                    </tr>
                    </thead>
                    <tbody id="userListBody"></tbody>
                </table>
            </div>

            <div class="panel">
                <div class="panel-title">예외권한 메뉴</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">SEQ</th>
                        <th>메뉴</th>
                        <th style="width:90px;">기본권한</th>
                        <th style="width:110px;">예외권한</th>
                    </tr>
                    </thead>
                    <tbody id="userExceptionBody"></tbody>
                </table>
            </div>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js?v=20260308_4"></script>
