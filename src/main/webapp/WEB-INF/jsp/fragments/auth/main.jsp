<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authRoot" class="page-root" data-page-url="/auth/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xad8c;&#xd55c;&#xad00;&#xb9ac;</h2>
            <div class="tabs">
                <a href="javascript:void(0)" class="tab is-active" data-tab="A">&#xadf8;&#xb8f9; &#xad8c;&#xd55c;</a>
                <a href="javascript:void(0)" class="tab" data-tab="B">&#xc0ac;&#xc6a9;&#xc790; &#xad8c;&#xd55c;</a>
            </div>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xadf8;&#xb8f9;&#xbcc4; &#xba54;&#xb274;/&#xc11c;&#xbe44;&#xc2a4; &#xad8c;&#xd55c;&#xacfc; &#xc0ac;&#xc6a9;&#xc790;&#xbcc4; &#xc608;&#xc678; &#xad8c;&#xd55c;&#xc744; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <section class="tab-pane" data-pane="A">
        <div class="toolbar btns">
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnGroupReload">&#xadf8;&#xb8f9; &#xc870;&#xd68c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupSave">&#xba54;&#xb274; &#xad8c;&#xd55c; &#xc800;&#xc7a5;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupServiceSave">&#xc11c;&#xbe44;&#xc2a4; &#xad8c;&#xd55c; &#xc800;&#xc7a5;</a>
        </div>

        <div class="grid-2col">
            <section class="panel">
                <div class="panel-title">&#xadf8;&#xb8f9; &#xc120;&#xd0dd;</div>
                <div class="form-grid" style="margin-bottom:12px;">
                    <div class="form-item">
                        <label for="authGroupSeqView">&#xadf8;&#xb8f9; &#xbc88;&#xd638;</label>
                        <input type="text" class="input" id="authGroupSeqView" readonly>
                    </div>
                    <div class="form-item">
                        <label for="authGroupUseYnView">&#xc0ac;&#xc6a9; &#xc5ec;&#xbd80;</label>
                        <input type="text" class="input" id="authGroupUseYnView" readonly>
                    </div>
                    <div class="form-item">
                        <label for="authGroupCdView">&#xadf8;&#xb8f9; &#xcf54;&#xb4dc;</label>
                        <input type="text" class="input" id="authGroupCdView" readonly>
                    </div>
                    <div class="form-item">
                        <label for="authGroupNmView">&#xadf8;&#xb8f9;&#xba85;</label>
                        <input type="text" class="input" id="authGroupNmView" readonly>
                    </div>
                </div>
                <div class="grid-scroll" id="groupListWrap" style="height:360px;">
                    <table class="tbl">
                        <thead>
                        <tr>
                            <th style="width:30px;">No.</th>
                            <th style="width:120px;">&#xadf8;&#xb8f9; &#xcf54;&#xb4dc;</th>
                            <th>&#xadf8;&#xb8f9;&#xba85;</th>
                            <th style="width:80px;">&#xc0ac;&#xc6a9;</th>
                        </tr>
                        </thead>
                        <tbody id="groupListBody"></tbody>
                    </table>
                </div>
            </section>

            <section class="panel panel-list">
                <div class="page-tabs" data-subtab-group="group-detail">
                    <a href="javascript:void(0)" class="page-tab is-active" data-subtab="group-menu">&#xba54;&#xb274; &#xad8c;&#xd55c;</a>
                    <a href="javascript:void(0)" class="page-tab" data-subtab="group-service">&#xc11c;&#xbe44;&#xc2a4; &#xad8c;&#xd55c;</a>
                </div>
                <div class="subtab-pane grid-scroll" id="menuPermWrap" data-subtab-pane="group-menu" style="margin-top:12px;">
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
                <div class="subtab-pane grid-scroll" id="servicePermWrap" data-subtab-pane="group-service" style="display:none; margin-top:12px;">
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
            </section>
        </div>
    </section>

    <section class="tab-pane" data-pane="B" style="display:none;">
        <div class="toolbar btns">
            <input type="text" class="input" id="userKeyword" placeholder="&#xb85c;&#xadf8;&#xc778; ID / &#xc0ac;&#xc6a9;&#xc790;&#xba85;" style="max-width:220px;">
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnUserSearch">&#xc0ac;&#xc6a9;&#xc790; &#xc870;&#xd68c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnUserExceptionSave">&#xc608;&#xc678; &#xc800;&#xc7a5;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnUserServiceExceptionSave">&#xc11c;&#xbe44;&#xc2a4; &#xc608;&#xc678; &#xc800;&#xc7a5;</a>
        </div>

        <div class="grid-2col">
            <section class="panel">
                <div class="panel-title">&#xc0ac;&#xc6a9;&#xc790; &#xc120;&#xd0dd;</div>
                <div class="form-grid" style="margin-bottom:12px;">
                    <div class="form-item">
                        <label for="authUserSeqView">&#xc0ac;&#xc6a9;&#xc790; &#xbc88;&#xd638;</label>
                        <input type="text" class="input" id="authUserSeqView" readonly>
                    </div>
                    <div class="form-item">
                        <label for="authUserLoginIdView">&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;</label>
                        <input type="text" class="input" id="authUserLoginIdView" readonly>
                    </div>
                    <div class="form-item full">
                        <label for="authUserNmView">&#xc0ac;&#xc6a9;&#xc790;&#xba85;</label>
                        <input type="text" class="input" id="authUserNmView" readonly>
                    </div>
                </div>
                <div class="grid-scroll" id="authUserListWrap" style="height:360px;">
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
            </section>

            <section class="panel panel-list">
                <div class="page-tabs" data-subtab-group="user-detail">
                    <a href="javascript:void(0)" class="page-tab is-active" data-subtab="user-menu">&#xc608;&#xc678; &#xba54;&#xb274;</a>
                    <a href="javascript:void(0)" class="page-tab" data-subtab="user-service">&#xc11c;&#xbe44;&#xc2a4; &#xc608;&#xc678;</a>
                </div>
                <div class="subtab-pane grid-scroll" id="userExceptionWrap" data-subtab-pane="user-menu" style="margin-top:12px;">
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
                <div class="subtab-pane grid-scroll" id="userServiceExceptionWrap" data-subtab-pane="user-service" style="display:none; margin-top:12px;">
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
            </section>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js?v=${assetVersion}"></script>
