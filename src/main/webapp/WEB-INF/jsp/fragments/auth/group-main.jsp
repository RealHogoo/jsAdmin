<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authGroupRoot" class="page-root" data-page-url="/auth/group/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xadf8;&#xb8f9;&#xad00;&#xb9ac;</h2>
            <div class="tabs">
                <a href="javascript:void(0)" class="tab is-active" data-group-tab="info">&#xadf8;&#xb8f9; &#xc815;&#xbcf4;</a>
                <a href="javascript:void(0)" class="tab" data-group-tab="users">&#xadf8;&#xb8f9; &#xc0ac;&#xc6a9;&#xc790;</a>
            </div>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xadf8;&#xb8f9; &#xc815;&#xbcf4;&#xc640; &#xadf8;&#xb8f9;&#xc5d0; &#xd3ec;&#xd568;&#xd560; &#xc0ac;&#xc6a9;&#xc790;&#xb97c; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <section class="tab-pane" data-pane="A">
        <div class="toolbar btns">
            <span class="meta">&#xc120;&#xd0dd; &#xadf8;&#xb8f9;: <b id="selectedGroupSeq">-</b></span>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupNew">&#xc2e0;&#xaddc;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="5" id="btnGroupMetaSave">&#xadf8;&#xb8f9; &#xc800;&#xc7a5;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="10" id="btnGroupDelete">&#xadf8;&#xb8f9; &#xc0ad;&#xc81c;</a>
            <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnGroupReload">&#xadf8;&#xb8f9; &#xc870;&#xd68c;</a>
        </div>

        <div data-group-pane="info" style="margin-bottom:12px;">
            <div class="grid-2col" style="grid-template-columns:minmax(360px, 440px) minmax(0, 1fr); align-items:stretch;">
                <section class="panel panel-list">
                    <div class="panel-title">&#xadf8;&#xb8f9; &#xc815;&#xbcf4;</div>
                    <div class="form-grid" id="groupForm">
                        <input type="hidden" id="group_auth_group_seq">
                        <label for="group_auth_group_cd">&#xadf8;&#xb8f9; &#xcf54;&#xb4dc;</label>
                        <input type="text" class="input" id="group_auth_group_cd" maxlength="100" placeholder="ADMIN">

                        <label for="group_auth_group_nm">&#xadf8;&#xb8f9;&#xba85;</label>
                        <input type="text" class="input" id="group_auth_group_nm" maxlength="100" placeholder="&#xad00;&#xb9ac;&#xc790;&#xad8c;&#xd55c;">

                        <label for="group_use_yn">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</label>
                        <select class="input" id="group_use_yn">
                            <option value="Y">Y</option>
                            <option value="N">N</option>
                        </select>

                        <label for="group_auth_group_desc">&#xc124;&#xba85;</label>
                        <textarea class="input" id="group_auth_group_desc" rows="5" maxlength="500" placeholder="&#xad8c;&#xd55c; &#xadf8;&#xb8f9; &#xc124;&#xba85;"></textarea>
                    </div>
                </section>

                <section class="panel panel-list">
                    <div class="panel-title">&#xadf8;&#xb8f9; &#xbaa9;&#xb85d;</div>
                    <div class="grid-scroll" id="groupListWrap" style="height:360px;">
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
                </section>
            </div>
        </div>

        <div data-group-pane="users" style="display:none; margin-bottom:12px;">
            <div class="grid-2col" style="grid-template-columns:minmax(300px, 360px) minmax(0, 1fr); align-items:stretch;">
                <section class="panel panel-list">
                    <div class="panel-title">&#xadf8;&#xb8f9; &#xc120;&#xd0dd;</div>
                    <div class="grid-scroll" style="height:430px;">
                        <table class="tbl">
                            <thead>
                            <tr>
                                <th style="width:30px;">No.</th>
                                <th style="width:110px;">&#xadf8;&#xb8f9; &#xcf54;&#xb4dc;</th>
                                <th>&#xadf8;&#xb8f9;&#xba85;</th>
                            </tr>
                            </thead>
                            <tbody id="groupUserGroupListBody"></tbody>
                        </table>
                    </div>
                </section>

                <section class="panel panel-list">
                    <div class="panel-title">&#xc0ac;&#xc6a9;&#xc790; &#xc120;&#xd0dd;</div>
                    <div class="toolbar btns" style="justify-content:flex-start; margin-bottom:12px;">
                        <input type="text" class="input" id="groupUserKeyword" placeholder="&#xb85c;&#xadf8;&#xc778; ID / &#xc0ac;&#xc6a9;&#xc790;&#xba85;" style="max-width:360px;">
                        <a href="javascript:void(0)" class="btn" data-perm-lvl="1" id="btnGroupUserSearch">&#xc870;&#xd68c;</a>
                    </div>
                    <div class="grid-2col" style="grid-template-columns:minmax(320px, 420px) minmax(0, 1fr); gap:12px;">
                        <section class="panel" style="padding:0;">
                            <div class="panel-title">&#xcd94;&#xac00; &#xac00;&#xb2a5; &#xc0ac;&#xc6a9;&#xc790;</div>
                            <div class="grid-scroll" style="height:360px;">
                                <table class="tbl">
                                    <thead>
                                    <tr>
                                        <th>&#xb85c;&#xadf8;&#xc778; ID / &#xc0ac;&#xc6a9;&#xc790;&#xba85;</th>
                                        <th style="width:70px;">&#xcd94;&#xac00;</th>
                                    </tr>
                                    </thead>
                                    <tbody id="groupUserCandidateBody"></tbody>
                                </table>
                            </div>
                        </section>
                        <section class="panel" style="padding:0;">
                            <div class="panel-title">&#xc18c;&#xc18d; &#xc0ac;&#xc6a9;&#xc790;</div>
                            <div class="grid-scroll" style="height:360px;">
                                <table class="tbl">
                                    <thead>
                                    <tr>
                                        <th style="width:30px;">No.</th>
                                        <th>&#xb85c;&#xadf8;&#xc778; ID</th>
                                        <th>&#xc0ac;&#xc6a9;&#xc790;&#xba85;</th>
                                        <th style="width:70px;">&#xc81c;&#xac70;</th>
                                    </tr>
                                    </thead>
                                    <tbody id="groupUserBody"></tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </section>
            </div>
        </div>
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js?v=${assetVersion}"></script>
