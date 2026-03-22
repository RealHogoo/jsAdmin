<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authRoot" class="page-root" data-page-url="/auth/main.do">
    <h2 class="page-title">&#xad8c;&#xd55c;&#xad00;&#xb9ac;</h2>

    <div class="tabs">
        <a href="javascript:void(0)" class="tab is-active" data-tab="A">&#xadf8;&#xb8f9;-&#xba54;&#xb274;</a>
        <a href="javascript:void(0)" class="tab" data-tab="B">&#xc0ac;&#xc6a9;&#xc790; &#xc608;&#xc678;</a>
    </div>

    <section class="tab-pane" data-pane="A">
        <div class="toolbar btns">
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnGroupReload">&#xadf8;&#xb8f9; &#xc870;&#xd68c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupSave">&#xc800;&#xc7a5;</a>
            <span class="meta">&#xc120;&#xd0dd; &#xadf8;&#xb8f9;: <b id="selectedGroupSeq">-</b></span>
        </div>

        <div class="grid-2col">
            <div class="panel">
                <div class="panel-title">&#xad8c;&#xd55c; &#xadf8;&#xb8f9;</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">SEQ</th>
                        <th>&#xadf8;&#xb8f9;&#xba85;</th>
                        <th style="width:70px;">USE</th>
                    </tr>
                    </thead>
                    <tbody id="groupListBody"></tbody>
                </table>
            </div>

            <div class="panel">
                <div class="panel-title">&#xba54;&#xb274; &#xad8c;&#xd55c;</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">SEQ</th>
                        <th>&#xba54;&#xb274;</th>
                        <th style="width:120px;">&#xad8c;&#xd55c;</th>
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
            <input type="text" class="input" id="userKeyword" placeholder="&#xb85c;&#xadf8;&#xc778; ID / &#xc0ac;&#xc6a9;&#xc790;&#xba85;" style="max-width:220px;">
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnUserSearch">&#xc0ac;&#xc6a9;&#xc790; &#xc870;&#xd68c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnUserExceptionSave">&#xc608;&#xc678; &#xc800;&#xc7a5;</a>
            <span class="meta">&#xc120;&#xd0dd; &#xc0ac;&#xc6a9;&#xc790;: <b id="selectedUserSeq">-</b></span>
        </div>

        <div class="grid-2col">
            <div class="panel">
                <div class="panel-title">&#xc0ac;&#xc6a9;&#xc790; &#xbaa9;&#xb85d;</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">USER_SEQ</th>
                        <th>LOGIN_ID</th>
                        <th>&#xc0ac;&#xc6a9;&#xc790;&#xba85;</th>
                    </tr>
                    </thead>
                    <tbody id="userListBody"></tbody>
                </table>
            </div>

            <div class="panel">
                <div class="panel-title">&#xc608;&#xc678; &#xad8c;&#xd55c; &#xba54;&#xb274;</div>
                <table class="tbl">
                    <thead>
                    <tr>
                        <th style="width:90px;">SEQ</th>
                        <th>&#xba54;&#xb274;</th>
                        <th style="width:90px;">&#xae30;&#xbcf8; &#xad8c;&#xd55c;</th>
                        <th style="width:110px;">&#xc608;&#xc678; &#xad8c;&#xd55c;</th>
                    </tr>
                    </thead>
                    <tbody id="userExceptionBody"></tbody>
                </table>
            </div>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js?v=20260322_1"></script>
