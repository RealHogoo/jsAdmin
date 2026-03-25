<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authRoot" class="page-root" data-page-url="/auth/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">권한관리</h2>
            <div class="tabs">
                <a href="javascript:void(0)" class="tab is-active" data-tab="A">그룹-메뉴</a>
                <a href="javascript:void(0)" class="tab" data-tab="B">사용자 예외</a>
            </div>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            권한 그룹별 메뉴 권한과 사용자별 예외 권한을 관리합니다.
        </div>
    </details>

    <section class="tab-pane" data-pane="A">
        <div class="toolbar btns">
            <span class="meta">선택 그룹: <b id="selectedGroupSeq">-</b></span>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnGroupReload">그룹 조회</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupSave">저장</a>
        </div>

        <div class="grid-2col">
            <div class="panel panel-list">
                <div class="panel-title">권한 그룹</div>
                <div class="grid-scroll" id="groupListWrap">
                    <table class="tbl">
                        <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th>그룹명</th>
                            <th style="width:100px;">사용여부</th>
                        </tr>
                        </thead>
                        <tbody id="groupListBody"></tbody>
                    </table>
                </div>
            </div>

            <div class="panel panel-list">
                <div class="panel-title">메뉴 권한</div>
                <div class="grid-scroll" id="menuPermWrap">
                    <table class="tbl">
                        <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th>메뉴</th>
                            <th style="width:120px;">권한</th>
                            <th style="width:100px;">사용여부</th>
                        </tr>
                        </thead>
                        <tbody id="menuPermBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>

    <section class="tab-pane" data-pane="B" style="display:none;">
        <div class="toolbar btns">
            <input type="text" class="input" id="userKeyword" placeholder="로그인 ID / 사용자명" style="max-width:220px;">
            <span class="meta">선택 사용자: <b id="selectedUserSeq">-</b></span>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnUserSearch">사용자 조회</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnUserExceptionSave">예외 저장</a>
        </div>

        <div class="grid-2col">
            <div class="panel panel-list">
                <div class="panel-title">사용자 목록</div>
                <div class="grid-scroll" id="authUserListWrap">
                    <table class="tbl">
                        <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th>로그인 아이디</th>
                            <th>사용자명</th>
                        </tr>
                        </thead>
                        <tbody id="userListBody"></tbody>
                    </table>
                </div>
            </div>

            <div class="panel panel-list">
                <div class="panel-title">예외 권한 메뉴</div>
                <div class="grid-scroll" id="userExceptionWrap">
                    <table class="tbl">
                        <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th>메뉴</th>
                            <th style="width:110px;">기본 권한</th>
                            <th style="width:120px;">예외 권한</th>
                        </tr>
                        </thead>
                        <tbody id="userExceptionBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js?v=20260325_02"></script>
