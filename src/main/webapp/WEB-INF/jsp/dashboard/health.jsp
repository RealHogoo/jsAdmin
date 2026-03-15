<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>

<div id="healthPage" class="page-root health-page">
    <div class="health-head">
        <div>
            <h2 class="page-title">헬스체크</h2>
            <p class="muted">서비스 상태, DB 연결, 서버 자원을 한 화면에서 확인합니다.</p>
        </div>
        <div class="btns">
            <a href="#" class="btn" id="btnHealthRefresh" role="button">새로고침</a>
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
            <div class="health-kpi-sub">프로세스 응답 가능 여부</div>
        </div>
        <div class="panel health-kpi" data-health-card="ready">
            <div class="health-kpi-label">Readiness</div>
            <div class="health-kpi-value" id="healthReadiness">-</div>
            <div class="health-kpi-sub">핵심 의존성 사용 가능 여부</div>
        </div>
        <div class="panel health-kpi" data-health-card="db">
            <div class="health-kpi-label">DB Latency</div>
            <div class="health-kpi-value" id="healthDbLatency">-</div>
            <div class="health-kpi-sub" id="healthDbMessage">-</div>
        </div>
    </div>

    <div class="health-main-grid">
        <div class="panel">
            <div class="panel-title">DB 상태</div>
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
            <div class="panel-title">서버 상태</div>
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
        <div class="panel-title">의존 서비스</div>
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

<script src="${pageContext.request.contextPath}/static/js/health/health.js?v=20260315_1"></script>
