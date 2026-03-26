<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="accessRoot" class="page-root" data-page-url="/access/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xc811;&#xc18d; &#xad00;&#xb9ac;</h2>
            <div class="tabs">
                <a href="javascript:void(0)" class="tab is-active" data-tab="SESSION">&#xd604;&#xc7ac; &#xc138;&#xc158;</a>
                <a href="javascript:void(0)" class="tab" data-tab="HISTORY">&#xb85c;&#xadf8;&#xc778; &#xc774;&#xb825;</a>
            </div>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xd604;&#xc7ac; &#xb85c;&#xadf8;&#xc778; &#xc138;&#xc158;&#xacfc; &#xb85c;&#xadf8;&#xc778; &#xc131;&#xacf5;/&#xc2e4;&#xd328; &#xc774;&#xb825;&#xc744; &#xd654;&#xba74;&#xc5d0;&#xc11c; &#xd655;&#xc778;&#xd569;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <section class="tab-pane" data-pane="SESSION">
        <div class="toolbar btns access-filter-bar">
            <input type="text" class="input" id="sessionKeyword" placeholder="&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;, &#xc0ac;&#xc6a9;&#xc790;&#xba85;, IP" style="max-width:220px;">
            <select id="sessionStatus" class="input" style="max-width:150px;">
                <option value="">&#xc804;&#xccb4; &#xc0c1;&#xd0dc;</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="EXPIRED">EXPIRED</option>
                <option value="REVOKED">REVOKED</option>
            </select>
            <span class="meta">&#xc120;&#xd0dd; &#xc138;&#xc158;: <b id="selectedSessionId">-</b></span>
            <a href="javascript:void(0)" class="btn" id="btnSessionSearch">&#xc870;&#xd68c;</a>
            <a href="javascript:void(0)" class="btn" id="btnSessionExpire">&#xc120;&#xd0dd; &#xc138;&#xc158; &#xb9cc;&#xb8cc;</a>
            <a href="javascript:void(0)" class="btn" id="btnSessionExpireUser">&#xc0ac;&#xc6a9;&#xc790; &#xc804;&#xccb4; &#xb9cc;&#xb8cc;</a>
        </div>

        <section class="panel panel-list">
            <div class="panel-title">&#xd604;&#xc7ac; &#xc138;&#xc158; &#xbaa9;&#xb85d;</div>
            <div class="grid-scroll" id="sessionListWrap">
                <table class="tbl access-table">
                    <thead>
                    <tr>
                        <th style="width:30px;">No.</th>
                        <th style="width:120px;">&#xc0c1;&#xd0dc;</th>
                        <th style="width:160px;">&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;</th>
                        <th style="width:140px;">&#xc0ac;&#xc6a9;&#xc790;&#xba85;</th>
                        <th style="width:140px;">IP</th>
                        <th style="width:180px;">&#xb85c;&#xadf8;&#xc778; &#xc2dc;&#xac01;</th>
                        <th style="width:180px;">&#xcd5c;&#xadfc; &#xc811;&#xc18d;</th>
                        <th style="width:180px;">&#xb9cc;&#xb8cc; &#xc608;&#xc815;</th>
                        <th style="width:420px;">&#xc0ac;&#xc6a9;&#xc790; &#xc5d0;&#xc774;&#xc804;&#xd2b8;</th>
                    </tr>
                    </thead>
                    <tbody id="sessionListBody"></tbody>
                </table>
            </div>
        </section>
    </section>

    <section class="tab-pane" data-pane="HISTORY" style="display:none;">
        <div class="toolbar btns access-filter-bar">
            <input type="text" class="input" id="historyKeyword" placeholder="&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;, &#xc0ac;&#xc6a9;&#xc790;&#xba85;, IP, &#xc0ac;&#xc720;" style="max-width:240px;">
            <select id="historyResult" class="input" style="max-width:140px;">
                <option value="">&#xc804;&#xccb4; &#xacb0;&#xacfc;</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="FAIL">FAIL</option>
                <option value="LOGOUT">LOGOUT</option>
            </select>
            <input type="date" class="input" id="historyFromDt" style="max-width:150px;">
            <input type="date" class="input" id="historyToDt" style="max-width:150px;">
            <a href="javascript:void(0)" class="btn" id="btnHistorySearch">&#xc870;&#xd68c;</a>
        </div>

        <section class="panel panel-list">
            <div id="historyGrid" class="vgrid vgrid-fill">
                <div class="vgrid-head">
                    <div class="vgrid-cell vgrid-head-cell" data-width="30px" data-align="center">No.</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="110px" data-align="center">&#xacb0;&#xacfc;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="140px" data-align="left">&#xb85c;&#xadf8;&#xc778; &#xc544;&#xc774;&#xb514;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="140px" data-align="left">&#xc0ac;&#xc6a9;&#xc790;&#xba85;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="140px" data-align="center">IP</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="180px" data-align="center">&#xb85c;&#xadf8;&#xc778; &#xc2dc;&#xac01;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="220px" data-align="left">&#xc138;&#xc158; ID</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="420px" data-align="left">&#xc0c1;&#xc138; &#xc0ac;&#xc720;</div>
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

<script src="${pageContext.request.contextPath}/static/js/access/access.js?v=20260326_01"></script>
