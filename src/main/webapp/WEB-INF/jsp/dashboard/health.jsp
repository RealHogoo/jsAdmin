<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div id="healthPage" class="page-root health-page">
    <div class="health-head">
        <div>
            <h2 class="page-title">&#xd5ec;&#xc2a4;&#xccb4;&#xd06c;</h2>
            <p class="muted">&#xc11c;&#xbe44;&#xc2a4; &#xc0c1;&#xd0dc;, DB &#xc5f0;&#xacb0;, &#xc11c;&#xbc84; &#xc790;&#xc6d0;&#xc744; &#xd55c; &#xd654;&#xba74;&#xc5d0;&#xc11c; &#xd655;&#xc778;&#xd569;&#xb2c8;&#xb2e4;.</p>
        </div>
        <div class="btns">
            <a href="#" class="btn" id="btnHealthRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
            <span class="health-checked-at" id="healthCheckedAt">-</span>
        </div>
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

<script src="${pageContext.request.contextPath}/static/js/health/health.js?v=20260322_1"></script>
