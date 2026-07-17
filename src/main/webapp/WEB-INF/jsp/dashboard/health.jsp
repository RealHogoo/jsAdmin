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
            상단에서 서비스를 고르면 생존 여부, 요청 처리 가능 여부, DB/의존 서비스, 서버 자원을 확인합니다. 작업 상태는 실제 작업 정보가 있는 서비스에서만 표시됩니다.
        </div>
    </details>

    <div class="toolbar btns health-toolbar">
        <span class="meta">&#xcd5c;&#xc885; &#xd655;&#xc778;: <b id="healthCheckedAt">-</b></span>
        <a href="#" class="btn" id="btnHealthRefresh" role="button">&#xc0c8;&#xb85c;&#xace0;&#xce68;</a>
    </div>

    <div class="tabs health-content-tabs" id="healthContentTabs">
        <a href="javascript:void(0)" class="tab health-content-tab is-active" data-health-tab="service">서비스 상태</a>
        <a href="javascript:void(0)" class="tab health-content-tab" data-health-tab="resource">서버 리소스</a>
        <a href="javascript:void(0)" class="tab health-content-tab" data-health-tab="worker" hidden>작업 상태</a>
    </div>

    <div class="tab-pane health-tab-pane is-active" data-health-pane="service">
        <div class="health-summary-grid">
            <div class="panel health-kpi" data-health-card="overall">
                <div class="health-kpi-label">종합 상태</div>
                <div class="health-kpi-value" id="healthOverallStatus">-</div>
                <div class="health-kpi-sub" id="healthServiceName">admin-service</div>
            </div>
            <div class="panel health-kpi" data-health-card="live">
                <div class="health-kpi-label">프로세스 응답</div>
                <div class="health-kpi-value" id="healthLiveness">-</div>
                <div class="health-kpi-sub">컨테이너/프로세스가 살아서 응답하는지</div>
            </div>
            <div class="panel health-kpi" data-health-card="ready">
                <div class="health-kpi-label">요청 처리 가능</div>
                <div class="health-kpi-value" id="healthReadiness">-</div>
                <div class="health-kpi-sub">DB/외부 의존 자원을 포함해 서비스 가능한지</div>
            </div>
            <div class="panel health-kpi" data-health-card="db">
                <div class="health-kpi-label">DB 응답 시간</div>
                <div class="health-kpi-value" id="healthDbLatency">-</div>
                <div class="health-kpi-sub" id="healthDbMessage">-</div>
            </div>
        </div>

        <div class="panel health-meta-panel">
            <div class="panel-title">&#xc11c;&#xbe44;&#xc2a4; &#xc815;&#xbcf4;</div>
            <div class="health-detail-grid">
                <div class="health-field"><span>호출 주소</span><b id="healthBaseUrl">-</b></div>
                <div class="health-field"><span>서비스 사용 여부</span><b id="healthUseYn">-</b></div>
                <div class="health-field"><span>운영 메모</span><b id="healthRemark">-</b></div>
                <div class="health-field"><span>선택한 서비스</span><b id="healthServiceLabel">-</b></div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-title">DB &#xc0c1;&#xd0dc;</div>
            <div class="health-detail-grid">
                <div class="health-field"><span>연결 상태</span><b id="dbStatusText">-</b></div>
                <div class="health-field"><span>Ping 결과</span><b id="dbPing">-</b></div>
                <div class="health-field"><span>응답 시간</span><b id="dbElapsed">-</b></div>
                <div class="health-field"><span>오류 메시지</span><b id="dbError">-</b></div>
            </div>
            <div class="health-pool-grid">
                <div class="health-pool-box"><span>사용 중 연결</span><b id="dbPoolActive">-</b></div>
                <div class="health-pool-box"><span>대기 연결</span><b id="dbPoolIdle">-</b></div>
                <div class="health-pool-box"><span>전체 연결</span><b id="dbPoolTotal">-</b></div>
                <div class="health-pool-box"><span>연결 대기 요청</span><b id="dbPoolAwaiting">-</b></div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-title">&#xc758;&#xc874; &#xc11c;&#xbe44;&#xc2a4;</div>
            <table class="tbl">
                <thead>
                <tr>
                    <th style="width:200px;">대상</th>
                    <th style="width:120px;">종류</th>
                    <th style="width:120px;">상태</th>
                    <th style="width:120px;">응답 시간</th>
                    <th>메시지</th>
                </tr>
                </thead>
                <tbody id="healthDependencyBody">
                <tr><td colspan="5">Loading...</td></tr>
                </tbody>
            </table>
        </div>
    </div>

    <div class="tab-pane health-tab-pane" data-health-pane="resource" hidden>
        <div class="health-explain-panel">
            <strong>서버 리소스 기준</strong>
            <span id="svResourceScope">-</span>
            <span>CPU/메모리/디스크는 선택한 서비스가 보고한 기준입니다. HOST면 호스트 기준, CONTAINER면 컨테이너 기준입니다.</span>
        </div>
        <div class="health-resource-grid">
            <div class="panel health-kpi" data-health-resource-card="cpu">
                <div class="health-kpi-label">CPU 사용률</div>
                <div class="health-kpi-value" id="svCpuUsage">-</div>
                <div class="health-kpi-sub" id="svCpuDetail">-</div>
            </div>
            <div class="panel health-kpi" data-health-resource-card="memory">
                <div class="health-kpi-label">메모리 사용률</div>
                <div class="health-kpi-value" id="svMemoryUsage">-</div>
                <div class="health-kpi-sub" id="svMemoryDetail">-</div>
            </div>
            <div class="panel health-kpi" data-health-resource-card="network">
                <div class="health-kpi-label">네트워크 상태</div>
                <div class="health-kpi-value" id="svNetworkStatus">-</div>
                <div class="health-kpi-sub" id="svNetworkDetail">-</div>
            </div>
            <div class="panel health-kpi" data-health-resource-card="users">
                <div class="health-kpi-label">접속자수</div>
                <div class="health-kpi-value" id="svActiveUsers">-</div>
                <div class="health-kpi-sub">활성 로그인 세션</div>
            </div>
        </div>

        <div class="panel">
            <div class="panel-title">&#xc11c;&#xbc84; &#xc0c1;&#xd0dc;</div>
            <div class="health-detail-grid">
                <div class="health-field"><span>Host</span><b id="svHost">-</b></div>
                <div class="health-field"><span>Java</span><b id="svJava">-</b></div>
                <div class="health-field"><span>OS</span><b id="svOs">-</b></div>
                <div class="health-field"><span>CPU 코어</span><b id="svCpu">-</b></div>
                <div class="health-field"><span>가동 시간</span><b id="svUptime">-</b></div>
                <div class="health-field"><span>서버 종류</span><b id="svInfo">-</b></div>
                <div class="health-field"><span>스레드</span><b id="svThreads">-</b></div>
                <div class="health-field"><span>JVM Heap</span><b id="svHeap">-</b></div>
                <div class="health-field"><span>디스크</span><b id="svDisk">-</b></div>
                <div class="health-field"><span>Network IP</span><b id="svNetworkIp">-</b></div>
            </div>
        </div>
    </div>

    <div class="tab-pane health-tab-pane" data-health-pane="worker" hidden>
        <div class="health-summary-grid" data-worker-section="summary">
            <div class="panel health-kpi" data-health-worker-card="status">
                <div class="health-kpi-label" id="workerStatusLabel">Worker 상태</div>
                <div class="health-kpi-value" id="workerStatus">-</div>
                <div class="health-kpi-sub" id="workerCheckedAt">-</div>
            </div>
            <div class="panel health-kpi" data-health-worker-card="pods">
                <div class="health-kpi-label" id="workerRunnerLabel">정상 Worker</div>
                <div class="health-kpi-value" id="workerActivePods">-</div>
                <div class="health-kpi-sub" id="workerExpectedPods">-</div>
            </div>
            <div class="panel health-kpi" data-health-worker-card="youtube">
                <div class="health-kpi-label" id="workerJobLabel">YouTube 작업</div>
                <div class="health-kpi-value" id="workerYoutubeJobs">-</div>
                <div class="health-kpi-sub" id="workerJobHelp">queued / running / failed</div>
            </div>
            <div class="panel health-kpi" data-health-worker-card="locks">
                <div class="health-kpi-label" id="workerAuxLabel">중복 방지 Lock</div>
                <div class="health-kpi-value" id="workerLocks">-</div>
                <div class="health-kpi-sub" id="workerAuxHelp">현재 보호 중인 영상</div>
            </div>
        </div>

        <div class="panel" data-worker-section="media">
            <div class="panel-title">Worker Pod</div>
            <table class="tbl">
                <thead>
                <tr>
                    <th style="width:220px;">Worker</th>
                    <th style="width:110px;">상태</th>
                    <th style="width:180px;">Queue</th>
                    <th style="width:180px;">현재 작업</th>
                    <th style="width:190px;">마지막 신호</th>
                    <th>메시지</th>
                </tr>
                </thead>
                <tbody id="workerPodBody">
                <tr><td colspan="6">-</td></tr>
                </tbody>
            </table>
        </div>

        <div class="panel" data-worker-section="media">
            <div class="panel-title">진행 Lock</div>
            <table class="tbl">
                <thead>
                <tr>
                    <th style="width:180px;">Video ID</th>
                    <th style="width:220px;">Worker</th>
                    <th style="width:190px;">Expires</th>
                    <th>Updated</th>
                </tr>
                </thead>
                <tbody id="workerLockBody">
                <tr><td colspan="4">-</td></tr>
                </tbody>
            </table>
        </div>

        <div class="panel" data-worker-section="webhard">
            <div class="panel-title">트랜스코딩 작업</div>
            <table class="tbl">
                <thead>
                <tr>
                    <th style="width:90px;">Job</th>
                    <th style="width:90px;">File</th>
                    <th>File Name</th>
                    <th style="width:110px;">상태</th>
                    <th style="width:90px;">시도</th>
                    <th>메시지</th>
                    <th style="width:190px;">갱신</th>
                </tr>
                </thead>
                <tbody id="transcodeJobBody">
                <tr><td colspan="7">-</td></tr>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="${pageContext.request.contextPath}/static/js/health/health.js?v=${assetVersion}"></script>
