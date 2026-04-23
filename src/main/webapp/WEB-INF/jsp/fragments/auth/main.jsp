<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authRoot" class="page-root" data-page-url="/auth/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xad8c;&#xd55c;&#xad00;&#xb9ac;</h2>
            <div class="tabs">
                <a href="javascript:void(0)" class="tab is-active" data-tab="A">&#xadf8;&#xb8f9;-&#xba54;&#xb274;</a>
                <a href="javascript:void(0)" class="tab" data-tab="B">&#xc0ac;&#xc6a9;&#xc790; &#xc608;&#xc678;</a>
            </div>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xad8c;&#xd55c; &#xadf8;&#xb8f9;&#xbcc4; &#xba54;&#xb274; &#xad8c;&#xd55c;&#xacfc; &#xc0ac;&#xc6a9;&#xc790;&#xbcc4; &#xc608;&#xc678; &#xad8c;&#xd55c;&#xc744; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <section class="tab-pane" data-pane="A">
        <div class="toolbar btns">
            <span class="meta">&#xc120;&#xd0dd; &#xadf8;&#xb8f9;: <b id="selectedGroupSeq">-</b></span>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupNew">&#xc2e0;&#xaddc;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupMetaSave">&#xadf8;&#xb8f9; &#xc800;&#xc7a5;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="10" id="btnGroupDelete">&#xadf8;&#xb8f9; &#xc0ad;&#xc81c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnGroupReload">&#xadf8;&#xb8f9; &#xc870;&#xd68c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupSave">&#xba54;&#xb274; &#xad8c;&#xd55c; &#xc800;&#xc7a5;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupServiceSave">&#xc11c;&#xbe44;&#xc2a4; &#xad8c;&#xd55c; &#xc800;&#xc7a5;</a>
        </div>

        <div class="panel panel-list" style="margin-bottom:12px;">
            <div class="panel-title">&#xad8c;&#xd55c; &#xadf8;&#xb8f9; &#xc815;&#xbcf4;</div>
            <div class="form-grid" id="groupForm">
                <input type="hidden" id="group_auth_group_seq">
                <label for="group_auth_group_cd">&#xadf8;&#xb8f9; &#xcf54;&#xb4dc;</label>
                <input type="text" class="input" id="group_auth_group_cd" maxlength="100" placeholder="ADMIN">

                <label for="group_auth_group_nm">&#xadf8;&#xb8f9;&#xba85;</label>
                <input type="text" class="input" id="group_auth_group_nm" maxlength="100" placeholder="관리자권한">

                <label for="group_use_yn">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</label>
                <select class="input" id="group_use_yn">
                    <option value="Y">Y</option>
                    <option value="N">N</option>
                </select>

                <label for="group_auth_group_desc">&#xc124;&#xba85;</label>
                <textarea class="input" id="group_auth_group_desc" rows="3" maxlength="500" placeholder="권한 그룹 설명"></textarea>
            </div>
        </div>

        <div class="grid-2col">
            <div class="panel panel-list">
                <div class="panel-title">&#xad8c;&#xd55c; &#xadf8;&#xb8f9;</div>
                <div class="grid-scroll" id="groupListWrap">
                    <table class="tbl">
                        <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th style="width:120px;">&#xadf8;&#xb8f9; &#xcf54;&#xb4dc;</th>
                            <th>&#xadf8;&#xb8f9;&#xba85;</th>
                            <th style="width:100px;">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                        </tr>
                        </thead>
                        <tbody id="groupListBody"></tbody>
                    </table>
                </div>
            </div>

            <div>
                <div class="page-tabs" data-subtab-group="group-detail">
                    <a href="javascript:void(0)" class="page-tab is-active" data-subtab="group-menu">&#xba54;&#xb274; &#xad8c;&#xd55c;</a>
                    <a href="javascript:void(0)" class="page-tab" data-subtab="group-service">&#xc11c;&#xbe44;&#xc2a4; &#xad8c;&#xd55c;</a>
                </div>
                <div class="subtab-pane" data-subtab-pane="group-menu" style="margin-top:12px;">
                    <div class="panel panel-list">
                        <div class="panel-title">&#xba54;&#xb274; &#xad8c;&#xd55c;</div>
                        <div class="grid-scroll" id="menuPermWrap">
                            <table class="tbl">
                                <thead>
                                <tr>
                                    <th style="width:30px;">No.</th>
                                    <th>&#xba54;&#xb274;</th>
                                    <th style="width:120px;">&#xad8c;&#xd55c;</th>
                                    <th style="width:100px;">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                                </tr>
                                </thead>
                                <tbody id="menuPermBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="subtab-pane" data-subtab-pane="group-service" style="display:none; margin-top:12px;">
                    <div class="panel panel-list">
                        <div class="panel-title">&#xc11c;&#xbe44;&#xc2a4; &#xad8c;&#xd55c;</div>
                        <div class="grid-scroll" id="servicePermWrap">
                            <table class="tbl">
                                <thead>
                                <tr>
                                    <th style="width:30px;">No.</th>
                                    <th>&#xc11c;&#xbe44;&#xc2a4;</th>
                                    <th>&#xad8c;&#xd55c; &#xcf54;&#xb4dc;</th>
                                    <th style="width:100px;">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                                </tr>
                                </thead>
                                <tbody id="servicePermBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <section class="tab-pane" data-pane="B" style="display:none;">
        <div class="toolbar btns">
            <input type="text" class="input" id="userKeyword" placeholder="&#xb85c;&#xadf8;&#xc778; ID / &#xc0ac;&#xc6a9;&#xc790;&#xba85;" style="max-width:220px;">
            <span class="meta">&#xc120;&#xd0dd; &#xc0ac;&#xc6a9;&#xc790;: <b id="selectedUserSeq">-</b></span>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnUserSearch">&#xc0ac;&#xc6a9;&#xc790; &#xc870;&#xd68c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnUserExceptionSave">&#xc608;&#xc678; &#xc800;&#xc7a5;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnUserServiceExceptionSave">&#xc11c;&#xbe44;&#xc2a4; &#xc608;&#xc678; &#xc800;&#xc7a5;</a>
        </div>

        <div class="grid-2col">
            <div class="panel panel-list">
                <div class="panel-title">&#xc0ac;&#xc6a9;&#xc790; &#xbaa9;&#xb85d;</div>
                <div class="grid-scroll" id="authUserListWrap">
                    <table class="tbl">
                        <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th>&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;</th>
                            <th>&#xc0ac;&#xc6a9;&#xc790;&#xba85;</th>
                        </tr>
                        </thead>
                        <tbody id="userListBody"></tbody>
                    </table>
                </div>
            </div>

            <div>
                <div class="page-tabs" data-subtab-group="user-detail">
                    <a href="javascript:void(0)" class="page-tab is-active" data-subtab="user-menu">&#xc608;&#xc678; &#xba54;&#xb274;</a>
                    <a href="javascript:void(0)" class="page-tab" data-subtab="user-service">&#xc11c;&#xbe44;&#xc2a4; &#xc608;&#xc678;</a>
                </div>
                <div class="subtab-pane" data-subtab-pane="user-menu" style="margin-top:12px;">
                    <div class="panel panel-list">
                        <div class="panel-title">&#xc608;&#xc678; &#xad8c;&#xd55c; &#xba54;&#xb274;</div>
                        <div class="grid-scroll" id="userExceptionWrap">
                            <table class="tbl">
                                <thead>
                                <tr>
                                    <th style="width:30px;">No.</th>
                                    <th>&#xba54;&#xb274;</th>
                                    <th style="width:110px;">&#xae30;&#xbcf8; &#xad8c;&#xd55c;</th>
                                    <th style="width:120px;">&#xc608;&#xc678; &#xad8c;&#xd55c;</th>
                                </tr>
                                </thead>
                                <tbody id="userExceptionBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
                <div class="subtab-pane" data-subtab-pane="user-service" style="display:none; margin-top:12px;">
                    <div class="panel panel-list">
                        <div class="panel-title">&#xc11c;&#xbe44;&#xc2a4; &#xc608;&#xc678; &#xad8c;&#xd55c;</div>
                        <div class="grid-scroll" id="userServiceExceptionWrap">
                            <table class="tbl">
                                <thead>
                                <tr>
                                    <th style="width:30px;">No.</th>
                                    <th>&#xc11c;&#xbe44;&#xc2a4;</th>
                                    <th>&#xad8c;&#xd55c; &#xcf54;&#xb4dc;</th>
                                    <th style="width:110px;">&#xae30;&#xbcf8; &#xad8c;&#xd55c;</th>
                                    <th style="width:120px;">&#xc608;&#xc678; &#xad8c;&#xd55c;</th>
                                </tr>
                                </thead>
                                <tbody id="userServiceExceptionBody"></tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js?v=${assetVersion}"></script>
