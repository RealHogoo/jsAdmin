<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>

<div id="servicePage" class="page-root" data-page-url="/service/main.do">
    <jsp:include page="/WEB-INF/jsp/common/page-header.jspf">
        <jsp:param name="title" value="&#xc11c;&#xbe44;&#xc2a4; &#xad00;&#xb9ac;" />
        <jsp:param name="help" value="&#xc6b4;&#xc601; &#xc911;&#xc778; MSA &#xc11c;&#xbe44;&#xc2a4;&#xc758; URL, &#xd5ec;&#xc2a4;&#xccb4;&#xd06c; &#xacbd;&#xb85c;, &#xc0ac;&#xc6a9; &#xc5ec;&#xbd80;&#xb97c; &#xad00;&#xb9ac;&#xd569;&#xb2c8;&#xb2e4;." />
    </jsp:include>

    <div class="toolbar btns">
        <input type="text" class="input" id="serviceMgmtKeyword" placeholder="&#xc11c;&#xbe44;&#xc2a4; &#xcf54;&#xb4dc; &#xb610;&#xb294; &#xc11c;&#xbe44;&#xc2a4;&#xba85;" style="max-width:220px;">
        <select id="serviceMgmtUseYn" class="input" style="max-width:140px;">
            <option value="">&#xc804;&#xccb4; &#xc0c1;&#xd0dc;</option>
            <option value="Y">&#xc0ac;&#xc6a9;</option>
            <option value="N">&#xbbf8;&#xc0ac;&#xc6a9;</option>
        </select>
        <a href="javascript:void(0)" class="btn" id="btnServiceMgmtSearch">&#xc870;&#xd68c;</a>
        <a href="javascript:void(0)" class="btn" id="btnServiceMgmtNew">&#xc2e0;&#xaddc;</a>
        <a href="javascript:void(0)" class="btn" id="btnServiceMgmtSave">&#xc800;&#xc7a5;</a>
    </div>

    <div class="grid-2col">
        <section class="panel">
            <div class="panel-title">&#xc11c;&#xbe44;&#xc2a4; &#xc0c1;&#xc138;</div>
            <div class="form-grid" id="serviceMgmtForm">
                <div class="form-item">
                    <label for="service_seq">&#xc11c;&#xbe44;&#xc2a4; &#xbc88;&#xd638;</label>
                    <input type="text" class="input" id="service_seq" readonly>
                </div>
                <div class="form-item">
                    <label for="service_use_yn">&#xc0ac;&#xc6a9; &#xc5ec;&#xbd80;</label>
                    <select id="service_use_yn" class="input">
                        <option value="Y">Y</option>
                        <option value="N">N</option>
                    </select>
                </div>
                <div class="form-item">
                    <label for="service_cd">&#xc11c;&#xbe44;&#xc2a4; &#xcf54;&#xb4dc;</label>
                    <input type="text" class="input" id="service_cd">
                </div>
                <div class="form-item">
                    <label for="service_nm">&#xc11c;&#xbe44;&#xc2a4;&#xba85;</label>
                    <input type="text" class="input" id="service_nm">
                </div>
                <div class="form-item full">
                    <label for="base_url">Base URL</label>
                    <input type="text" class="input" id="base_url" placeholder="http://localhost:8081">
                </div>
                <div class="form-item">
                    <label for="status_path">Status Path</label>
                    <input type="text" class="input" id="status_path" placeholder="/health/status.json">
                </div>
                <div class="form-item">
                    <label for="live_path">Live Path</label>
                    <input type="text" class="input" id="live_path" placeholder="/health/live.json">
                </div>
                <div class="form-item">
                    <label for="ready_path">Ready Path</label>
                    <input type="text" class="input" id="ready_path" placeholder="/health/ready.json">
                </div>
                <div class="form-item">
                    <label for="timeout_ms">Timeout (ms)</label>
                    <input type="number" class="input" id="timeout_ms" min="100" step="100">
                </div>
                <div class="form-item">
                    <label for="sort_ord">&#xc815;&#xb82c; &#xc21c;&#xc11c;</label>
                    <input type="number" class="input" id="sort_ord" min="0" step="1">
                </div>
                <div class="form-item full">
                    <label for="remark">&#xbe44;&#xace0;</label>
                    <textarea class="input" id="remark" rows="4"></textarea>
                </div>
            </div>
        </section>

        <section class="panel panel-list">
            <div class="panel-title">&#xc11c;&#xbe44;&#xc2a4; &#xbaa9;&#xb85d;</div>
            <div id="serviceMgmtGrid" class="vgrid vgrid-fill">
                <div class="vgrid-head">
                    <div class="vgrid-cell vgrid-head-cell" data-width="30px" data-align="center">No.</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="150px" data-align="left">&#xcf54;&#xb4dc;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="170px" data-align="left">&#xc11c;&#xbe44;&#xc2a4;&#xba85;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="250px" data-align="left">Base URL</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="80px" data-align="center">&#xc0ac;&#xc6a9;</div>
                    <div class="vgrid-cell vgrid-head-cell" data-width="70px" data-align="center">&#xc21c;&#xc11c;</div>
                </div>
                <div class="vgrid-body">
                    <div class="vgrid-spacer" aria-hidden="true"></div>
                    <div class="vgrid-rows"></div>
                    <div class="vgrid-empty" style="display:none;"></div>
                </div>
            </div>
        </section>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/service/service.js?v=${assetVersion}"></script>
