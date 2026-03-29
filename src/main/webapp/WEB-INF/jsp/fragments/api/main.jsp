<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="apiPage" class="page-root" data-page-url="/api/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#x41;PI&#xad00;&#xb9ac;</h2>
            <div class="tabs" role="tablist" aria-label="api type tabs">
                <a href="javascript:void(0)" class="tab is-active" data-api-type="EXTERNAL" role="button">&#xc678;&#xbd80; API</a>
                <a href="javascript:void(0)" class="tab" data-api-type="INTERNAL" role="button">&#xb0b4;&#xbd80; &#xc5f0;&#xb3d9;</a>
            </div>
        </div>
    </div>

    <div class="toolbar btns no-wrap" role="toolbar" aria-label="api actions">
        <label for="api_search_use_yn">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</label>
        <select class="input" id="api_search_use_yn" style="max-width:140px;">
            <option value="Y">&#xc0ac;&#xc6a9;</option>
            <option value="N">&#xbbf8;&#xc0ac;&#xc6a9;</option>
            <option value="">&#xc804;&#xccb4;</option>
        </select>
        <label for="api_search_keyword">&#xac80;&#xc0c9;</label>
        <input type="text" class="input" id="api_search_keyword" style="width:180px; min-width:180px;" placeholder="호출주체, 대상서비스" />
        <a href="#" class="btn" id="btnApiSearch" role="button">&#xc870;&#xd68c;</a>
        <a href="#" class="btn" data-perm-lvl="5" id="btnApiSave" role="button">&#xc800;&#xc7a5;</a>
        <a href="#" class="btn" data-perm-lvl="10" id="btnApiDelete" role="button">&#xbbf8;&#xc0ac;&#xc6a9;</a>
        <a href="#" class="btn" id="btnApiNew" role="button">&#xc2e0;&#xaddc;</a>
        <a href="#" class="btn" id="btnApiRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
    </div>

    <div class="grid-2col">
        <div class="panel">
            <div class="panel-title">&#xc815;&#xcc45; &#xc815;&#xbcf4;</div>
            <div id="apiForm" class="form-grid">
                <input type="hidden" id="api_seq" />
                <input type="hidden" id="api_type" value="EXTERNAL" />

                <div class="form-item">
                    <label>&#xc815;&#xcc45;&#xba85;</label>
                    <input type="text" class="input" id="api_nm" />
                </div>

                <div class="form-item">
                    <label>&#xd638;&#xcd9c; &#xc8fc;&#xccb4;</label>
                    <input type="text" class="input" id="caller_id" />
                </div>

                <div class="form-item">
                    <label>&#xb300;&#xc0c1; &#xc11c;&#xbe44;&#xc2a4;</label>
                    <input type="text" class="input" id="target_service" />
                </div>

                <div class="form-item">
                    <label>메서드</label>
                    <select class="input" id="http_method">
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="DELETE">DELETE</option>
                        <option value="PATCH">PATCH</option>
                        <option value="ALL">ALL</option>
                    </select>
                </div>

                <div class="form-item full">
                    <label>API 경로 패턴</label>
                    <input type="text" class="input" id="api_pattern" placeholder="/internal/**" />
                </div>

                <div class="form-item">
                    <label>&#xc778;&#xc99d;&#xbc29;&#xc2dd;</label>
                    <select class="input" id="auth_type">
                        <option value="SESSION">SESSION</option>
                        <option value="JWT">JWT</option>
                        <option value="API_KEY">API_KEY</option>
                        <option value="SERVICE_TOKEN">SERVICE_TOKEN</option>
                        <option value="NONE">NONE</option>
                    </select>
                </div>

                <div class="form-item">
                    <label>&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</label>
                    <select class="input" id="use_yn">
                        <option value="Y">&#xc0ac;&#xc6a9;</option>
                        <option value="N">&#xbbf8;&#xc0ac;&#xc6a9;</option>
                    </select>
                </div>

                <div class="form-item full">
                    <label>&#xc124;&#xba85;</label>
                    <textarea class="input" id="api_desc" rows="4"></textarea>
                </div>
            </div>
        </div>

        <div class="panel panel-list">
            <div class="panel-title">&#xc815;&#xcc45; &#xbaa9;&#xb85d;</div>
            <div class="grid-scroll" id="apiListWrap">
                <table class="tbl" id="apiTable">
                    <thead>
                    <tr>
                        <th style="width:30px;" data-align="center">No.</th>
                        <th style="width:180px;" data-align="left">&#xc815;&#xcc45;&#xba85;</th>
                        <th style="width:160px;" data-align="left">&#xd638;&#xcd9c;&#xc8fc;&#xccb4;</th>
                        <th style="width:160px;" data-align="left">&#xb300;&#xc0c1;&#xc11c;&#xbe44;&#xc2a4;</th>
                        <th style="width:90px;" data-align="center">메서드</th>
                        <th style="width:320px;" data-align="left">API 경로 패턴</th>
                        <th style="width:130px;" data-align="center">&#xc778;&#xc99d;&#xbc29;&#xc2dd;</th>
                        <th style="width:100px;" data-align="center">&#xc0ac;&#xc6a9;&#xc5ec;&#xbd80;</th>
                    </tr>
                    </thead>
                    <tbody id="apiListBody"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/api/api.js?v=${assetVersion}"></script>
