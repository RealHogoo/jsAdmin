<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="authGroupRoot" class="page-root" data-page-url="/auth/group/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xadf8;&#xb8f9;&#xad00;&#xb9ac;</h2>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xadf8;&#xb8f9; &#xc815;&#xbcf4;&#xb97c; &#xb4f1;&#xb85d;, &#xc218;&#xc815;, &#xc0ad;&#xc81c;&#xd569;&#xb2c8;&#xb2e4;.
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

        <div class="panel panel-list" style="margin-bottom:12px;">
            <div class="panel-title">&#xadf8;&#xb8f9; &#xc815;&#xbcf4;</div>
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

        <div class="panel panel-list">
            <div class="panel-title">&#xadf8;&#xb8f9; &#xbaa9;&#xb85d;</div>
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
    </section>
</div>

<script src="${pageContext.request.contextPath}/static/js/auth/auth.js?v=${assetVersion}"></script>
