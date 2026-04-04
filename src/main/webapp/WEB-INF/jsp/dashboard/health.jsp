<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div id="healthPage" class="page-root health-page" data-page-url="/health/main.do">
    <div class="page-title-row">
        <div class="page-title-group">
            <h2 class="page-title">&#xd5ec;&#xc2a4;&#xccb4;&#xd06c;</h2>
            <div class="tabs health-service-tabs" id="healthServiceTabs">
                <a href="javascript:void(0)" class="tab health-service-tab is-active">Loading...</a>
            </div>
        </div>
    </div>

    <details class="page-help">
        <summary><span class="page-help-toggle">?</span></summary>
        <div class="page-help-body">
            &#xc0c1;&#xb2e8; &#xd0ed;&#xc5d0;&#xc11c; &#xb300;&#xc0c1; &#xc11c;&#xbe44;&#xc2a4;&#xb97c; &#xc120;&#xd0dd;&#xd558;&#xba74; &#xac19;&#xc740; &#xad6c;&#xc131;&#xc73c;&#xb85c; &#xd5ec;&#xc2a4; &#xc0c1;&#xd0dc;&#xb97c; &#xbe44;&#xad50;&#xd560; &#xc218; &#xc788;&#xc2b5;&#xb2c8;&#xb2e4;.
        </div>
    </details>

    <div class="toolbar btns health-toolbar">
        <span class="meta">&#xcd5c;&#xc885; &#xd655;&#xc778;: <b id="healthCheckedAt">-</b></span>
        <a href="#" class="btn" id="btnHealthRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
    </div>

    <div class="health-summary-grid">
        <div class="panel health-kpi" data-health-card="overall">
            <div class="health-kpi-label">Overall</div>
            <div class="health-kpi-value" id="healthOverallStatus">-</div>
            <div class="health-kpi-sub" id="healthServiceName">admin-service</div>
        </div>
        <div class="panel health-kpi" data-health-card="live">
            <div class="health-kpi-label">Liveness</div>
            <div class="health-kpi-value" id="healthLiveness">-</div>
            <div class="health-kpi-sub">&#xd504;&#xb85c;&#xc138;&#xc2a4; &#xc751;&#xb2f5; &#xac00;&#xb2a5; &#xc5ec;&#xbd80;</div>
        </div>
        <div class="panel health-kpi" data-health-card="ready">
            <div class="health-kpi-label">Readiness</div>
            <div class="health-kpi-value" id="healthReadiness">-</div>
            <div class="health-kpi-sub">&#xc758;&#xc874; &#xc790;&#xc6d0;&#xc758; &#xc0ac;&#xc6a9; &#xac00;&#xb2a5; &#xc5ec;&#xbd80;</div>
        </div>
        <div class="panel health-kpi" data-health-card="db">
            <div class="health-kpi-label">DB Latency</div>
            <div class="health-kpi-value" id="healthDbLatency">-</div>
            <div class="health-kpi-sub" id="healthDbMessage">-</div>
        </div>
    </div>

    <div class="panel health-meta-panel">
        <div class="panel-title">&#xc11c;&#xbe44;&#xc2a4; &#xc815;&#xbcf4;</div>
        <div class="health-detail-grid">
            <div class="health-field"><span>Base URL</span><b id="healthBaseUrl">-</b></div>
            <div class="health-field"><span>Use</span><b id="healthUseYn">-</b></div>
            <div class="health-field"><span>Remark</span><b id="healthRemark">-</b></div>
            <div class="health-field"><span>Selected Service</span><b id="healthServiceLabel">-</b></div>
        </div>
    </div>

    <div class="health-main-grid">
        <div class="panel">
            <div class="panel-title">DB &#xc0c1;&#xd0dc;</div>
            <div class="health-detail-grid">
                <div class="health-field"><span>Status</span><b id="dbStatusText">-</b></div>
                <div class="health-field"><span>Ping</span><b id="dbPing">-</b></div>
                <div class="health-field"><span>Elapsed</span><b id="dbElapsed">-</b></div>
                <div class="health-field"><span>Error</span><b id="dbError">-</b></div>
            </div>
            <div class="health-pool-grid">
                <div class="health-pool-box"><span>Active</span><b id="dbPoolActive">-</b></div>
                <div class="health-pool-box"><span>Idle</span><b id="dbPoolIdle">-</b></div>
                <div class="health-pool-box"><span>Total</span><b id="dbPoolTotal">-</b></div>
                <div class="health-pool-box"><span>Awaiting</span><b id="dbPoolAwaiting">-</b></div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-title">&#xc11c;&#xbc84; &#xc0c1;&#xd0dc;</div>
            <div class="health-detail-grid">
                <div class="health-field"><span>Host</span><b id="svHost">-</b></div>
                <div class="health-field"><span>Java</span><b id="svJava">-</b></div>
                <div class="health-field"><span>OS</span><b id="svOs">-</b></div>
                <div class="health-field"><span>Processors</span><b id="svCpu">-</b></div>
                <div class="health-field"><span>Uptime</span><b id="svUptime">-</b></div>
                <div class="health-field"><span>Server</span><b id="svInfo">-</b></div>
                <div class="health-field"><span>Threads</span><b id="svThreads">-</b></div>
                <div class="health-field"><span>Heap</span><b id="svHeap">-</b></div>
            </div>
        </div>
    </div>

    <div class="panel">
        <div class="panel-title">&#xc758;&#xc874; &#xc11c;&#xbe44;&#xc2a4;</div>
        <table class="tbl">
            <thead>
            <tr>
                <th style="width:200px;">Name</th>
                <th style="width:120px;">Type</th>
                <th style="width:120px;">Status</th>
                <th style="width:120px;">Latency</th>
                <th>Message</th>
            </tr>
            </thead>
            <tbody id="healthDependencyBody">
            <tr><td colspan="5">Loading...</td></tr>
            </tbody>
        </table>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/health/health.js?v=${assetVersion}"></script>
