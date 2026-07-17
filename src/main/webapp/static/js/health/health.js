(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__jsadminHealthBound === true) return;
    global.__jsadminHealthBound = true;

    var timerId = null;
    var currentServiceCd = null;
    var serviceListCache = [];

    function root() {
        return UX.qs("#healthPage");
    }

    function setText(id, value) {
        UX.setText("#" + id, value == null || value === "" ? "-" : String(value), root());
    }

    function setCardStatus(cardKey, status) {
        var card = UX.qs("[data-health-card='" + cardKey + "']", root());
        if (!card) return;
        applyStatusClass(card, status);
    }

    function setResourceCardStatus(cardKey, status) {
        var card = UX.qs("[data-health-resource-card='" + cardKey + "']", root());
        if (!card) return;
        applyStatusClass(card, status);
    }

    function setWorkerCardStatus(cardKey, status) {
        var card = UX.qs("[data-health-worker-card='" + cardKey + "']", root());
        if (!card) return;
        applyStatusClass(card, status);
    }

    function applyStatusClass(card, status) {
        card.classList.remove("health-up", "health-down", "health-degraded", "health-disabled");
        if (status === "UP") card.classList.add("health-up");
        else if (status === "DOWN") card.classList.add("health-down");
        else if (status === "DISABLED") card.classList.add("health-disabled");
        else card.classList.add("health-degraded");
    }

    function fmtBytes(bytes) {
        var n = Number(bytes || 0);
        if (!Number.isFinite(n) || n <= 0) return "0 B";
        var units = ["B", "KB", "MB", "GB", "TB"];
        var idx = 0;
        while (n >= 1024 && idx < units.length - 1) {
            n /= 1024;
            idx++;
        }
        return n.toFixed(idx === 0 ? 0 : 1) + " " + units[idx];
    }

    function fmtMs(ms) {
        var n = Number(ms || 0);
        return Number.isFinite(n) ? (n + " ms") : "-";
    }

    function fmtPct(value) {
        var n = Number(value);
        return Number.isFinite(n) ? (n.toFixed(1) + "%") : "-";
    }

    function statusText(status) {
        if (status === "UP") return "정상";
        if (status === "DOWN") return "장애";
        if (status === "DEGRADED") return "주의";
        if (status === "DISABLED") return "비활성";
        if (status === "STALE") return "신호 끊김";
        if (status === "RUNNING") return "처리 중";
        if (status === "IDLE") return "대기";
        if (status === "QUEUED") return "대기";
        if (status === "FAILED") return "실패";
        if (status === "PENDING") return "예약됨";
        if (status === "DONE") return "완료";
        if (status === "SKIPPED") return "건너뜀";
        return status || "-";
    }

    function fmtUptime(ms) {
        var n = Number(ms || 0);
        if (!Number.isFinite(n) || n < 0) return "-";
        var totalSec = Math.floor(n / 1000);
        var days = Math.floor(totalSec / 86400);
        var hours = Math.floor((totalSec % 86400) / 3600);
        var mins = Math.floor((totalSec % 3600) / 60);
        if (days > 0) return days + "d " + hours + "h " + mins + "m";
        if (hours > 0) return hours + "h " + mins + "m";
        return mins + "m";
    }

    function usageStatus(value) {
        var n = Number(value);
        if (!Number.isFinite(n)) return "DEGRADED";
        if (n >= 90) return "DOWN";
        if (n >= 75) return "DEGRADED";
        return "UP";
    }

    function firstNumber() {
        for (var i = 0; i < arguments.length; i++) {
            var n = Number(arguments[i]);
            if (Number.isFinite(n)) return n;
        }
        return null;
    }

    function statusClass(status) {
        if (status === "UP") return "health-badge up";
        if (status === "RUNNING") return "health-badge up";
        if (status === "IDLE") return "health-badge up";
        if (status === "DONE") return "health-badge up";
        if (status === "DOWN") return "health-badge down";
        if (status === "FAILED") return "health-badge down";
        if (status === "DISABLED") return "health-badge disabled";
        if (status === "STALE") return "health-badge stale";
        return "health-badge degraded";
    }

    function renderStatusBadge(status) {
        var value = status || "-";
        return "<span class='" + statusClass(value) + "' title='" + UX.esc(value) + "'>" + UX.esc(statusText(value)) + "</span>";
    }

    function workerKind(workers) {
        return workers && workers.kind ? String(workers.kind) : "";
    }

    function hasWorkerView(workers) {
        var kind = workerKind(workers);
        return kind === "media-worker" || kind === "webhard-transcode";
    }

    function activeContentTab() {
        var active = UX.qs("[data-health-tab].is-active", root());
        return active ? active.getAttribute("data-health-tab") : "service";
    }

    function setWorkerSections(kind) {
        UX.qsa("[data-worker-section]", root()).forEach(function (section) {
            var sectionKind = section.getAttribute("data-worker-section");
            var visible = sectionKind === "summary"
                || (kind === "media-worker" && sectionKind === "media")
                || (kind === "webhard-transcode" && sectionKind === "webhard");
            section.hidden = !visible;
        });
    }

    function updateContentLayout(workers) {
        var showWorker = hasWorkerView(workers);
        var workerTab = UX.qs("[data-health-tab='worker']", root());
        if (workerTab) {
            workerTab.hidden = !showWorker;
        }
        setWorkerSections(showWorker ? workerKind(workers) : "");
        if (!showWorker && activeContentTab() === "worker") {
            activateContentTab("service");
        }
    }

    function renderDependencies(list) {
        var tbody = UX.qs("#healthDependencyBody", root());
        if (!tbody) return;
        if (!Array.isArray(list) || !list.length) {
            tbody.innerHTML = "<tr><td colspan='5'>No dependencies</td></tr>";
            return;
        }

        tbody.innerHTML = list.map(function (row) {
            var status = row && row.status ? String(row.status) : "-";
            return "<tr>"
                + "<td>" + UX.esc(row.name) + "</td>"
                + "<td>" + UX.esc(row.type) + "</td>"
                + "<td>" + renderStatusBadge(status) + "</td>"
                + "<td>" + UX.esc(fmtMs(row.latency_ms)) + "</td>"
                + "<td>" + UX.esc(row.message) + "</td>"
                + "</tr>";
        }).join("");
    }

    function renderWorkers(workers) {
        workers = workers || {};
        var kind = workers.kind || "";
        if (kind === "webhard-transcode") {
            renderTranscodeWorkers(workers);
            return;
        }
        var pods = Array.isArray(workers.pods) ? workers.pods : [];
        var locks = Array.isArray(workers.locks) ? workers.locks : [];
        var jobs = workers.jobs || {};
        var youtube = jobs.youtube || {};
        var workerStatus = workers.status || (pods.length ? "DEGRADED" : "-");
        var active = Number(workers.active_count || 0);
        var expected = Number(workers.expected_replicas || 0);
        var queued = Number(youtube.QUEUED || 0);
        var running = Number(youtube.RUNNING || 0);
        var failed = Number(youtube.FAILED || 0);

        setText("workerStatusLabel", "Worker 상태");
        setText("workerRunnerLabel", "정상 Worker");
        setText("workerJobLabel", "YouTube 작업");
        setText("workerJobHelp", "queued / running / failed");
        setText("workerAuxLabel", "중복 방지 Lock");
        setText("workerAuxHelp", "현재 보호 중인 영상");
        setText("workerStatus", workerStatus);
        setText("workerCheckedAt", workers.checked_at ? "확인 " + new Date(workers.checked_at).toLocaleString() : (workers.error || "-"));
        setText("workerActivePods", expected ? (active + " / " + expected) : (active || "-"));
        setText("workerExpectedPods", expected ? ("정상 heartbeat / 기대 worker " + expected) : "-");
        setText("workerYoutubeJobs", queued + " / " + running + " / " + failed);
        setText("workerLocks", locks.length);

        setWorkerCardStatus("status", workerStatus);
        setWorkerCardStatus("pods", expected && active >= expected ? "UP" : (active > 0 ? "DEGRADED" : "DOWN"));
        setWorkerCardStatus("youtube", failed > 0 ? "DEGRADED" : "UP");
        setWorkerCardStatus("locks", "UP");

        var podBody = UX.qs("#workerPodBody", root());
        if (podBody) {
            if (!pods.length) {
                podBody.innerHTML = "<tr><td colspan='6'>" + UX.esc(workers.error || "Worker pod 정보가 없습니다.") + "</td></tr>";
            } else {
                podBody.innerHTML = pods.map(function (pod) {
                    var podStatus = pod.stale ? "STALE" : (pod.status || "-");
                    var activeJob = [pod.active_job_type, pod.active_job_id, pod.active_video_id || pod.active_file_id].filter(Boolean).join(" / ") || "-";
                    return "<tr>"
                        + "<td>" + UX.esc(pod.worker_id || "-") + "</td>"
                        + "<td>" + renderStatusBadge(podStatus) + "</td>"
                        + "<td>" + UX.esc(Array.isArray(pod.queues) ? pod.queues.join(", ") : "-") + "</td>"
                        + "<td>" + UX.esc(activeJob) + "</td>"
                        + "<td>" + UX.esc(pod.heartbeat_at ? new Date(pod.heartbeat_at).toLocaleString() : "-") + "</td>"
                        + "<td>" + UX.esc(pod.message || "-") + "</td>"
                        + "</tr>";
                }).join("");
            }
        }

        var lockBody = UX.qs("#workerLockBody", root());
        if (lockBody) {
            if (!locks.length) {
                lockBody.innerHTML = "<tr><td colspan='4'>진행 중인 영상 lock이 없습니다.</td></tr>";
            } else {
                lockBody.innerHTML = locks.map(function (lock) {
                    return "<tr>"
                        + "<td>" + UX.esc(lock.video_id || "-") + "</td>"
                        + "<td>" + UX.esc(lock.worker_id || "-") + "</td>"
                        + "<td>" + UX.esc(lock.lease_expires_at ? new Date(lock.lease_expires_at).toLocaleString() : "-") + "</td>"
                        + "<td>" + UX.esc(lock.updated_at ? new Date(lock.updated_at).toLocaleString() : "-") + "</td>"
                        + "</tr>";
                }).join("");
            }
        }
    }

    function renderTranscodeWorkers(workers) {
        var counts = workers.counts || {};
        var variants = workers.variants || {};
        var items = Array.isArray(workers.items) ? workers.items : [];
        var status = workers.status || "-";
        var pending = Number(counts.PENDING || 0);
        var running = Number(counts.RUNNING || 0);
        var failed = Number(counts.FAILED || 0);
        var done = Number(counts.DONE || 0);
        var variant720 = Number(variants["720"] || 0);
        var variant1080 = Number(variants["1080"] || 0);

        setText("workerStatusLabel", "트랜스코딩 상태");
        setText("workerRunnerLabel", "스케줄러");
        setText("workerStatus", status);
        setText("workerCheckedAt", workers.checked_at ? "확인 " + new Date(workers.checked_at).toLocaleString() : (workers.error || "-"));
        setText("workerActivePods", workers.worker_running ? "실행 중" : "대기 중");
        setText("workerExpectedPods", "허용 시간 " + (workers.start_hour == null ? "-" : workers.start_hour) + ":00-" + (workers.end_hour == null ? "-" : workers.end_hour) + ":00");
        setText("workerJobLabel", "트랜스코딩 작업");
        setText("workerJobHelp", "대기 / 실행 / 실패");
        setText("workerYoutubeJobs", pending + " / " + running + " / " + failed);
        setText("workerAuxLabel", "변환본");
        setText("workerAuxHelp", "720p / 1080p 생성 완료");
        setText("workerLocks", variant720 + " / " + variant1080);

        setWorkerCardStatus("status", status);
        setWorkerCardStatus("pods", workers.worker_running ? "UP" : (pending > 0 ? "DEGRADED" : "UP"));
        setWorkerCardStatus("youtube", failed > 0 ? "DEGRADED" : "UP");
        setWorkerCardStatus("locks", "UP");
        var jobBody = UX.qs("#transcodeJobBody", root());
        if (jobBody) {
            if (!items.length) {
                jobBody.innerHTML = "<tr><td colspan='7'>트랜스코딩 작업 이력이 없습니다.</td></tr>";
            } else {
                jobBody.innerHTML = items.map(function (item) {
                    return "<tr>"
                        + "<td>" + UX.esc(item.job_id || "-") + "</td>"
                        + "<td>" + UX.esc(item.file_id || "-") + "</td>"
                        + "<td>" + UX.esc(item.file_name || "-") + "</td>"
                        + "<td>" + renderStatusBadge(item.status_cd || "-") + "</td>"
                        + "<td>" + UX.esc(item.attempt_count == null ? "-" : item.attempt_count) + "</td>"
                        + "<td>" + UX.esc(item.message || "-") + "</td>"
                        + "<td>" + UX.esc(item.updated_at ? new Date(item.updated_at).toLocaleString() : "-") + "</td>"
                        + "</tr>";
                }).join("");
            }
        }
    }

    function renderServiceTabs(list) {
        var target = UX.qs("#healthServiceTabs", root());
        if (!target) return;
        if (!Array.isArray(list) || !list.length) {
            target.innerHTML = "<a href='javascript:void(0)' class='health-service-tab is-active'>No services</a>";
            return;
        }

        target.innerHTML = list.map(function (row) {
            var serviceCd = row.service_cd || "";
            var active = serviceCd === currentServiceCd ? " is-active" : "";
            var disabled = row.use_yn === "N" ? " is-disabled" : "";
            var badge = row.use_yn === "N" ? "<span class='health-service-use'>OFF</span>" : "";
            return "<a href='javascript:void(0)' class='health-service-tab" + active + disabled + "' data-service-cd='" + UX.esc(serviceCd) + "'>"
                + "<span class='health-service-main'>"
                + "<span class='health-service-name'>" + UX.esc(row.service_nm || serviceCd) + "</span>"
                + "<span class='health-service-code'>" + UX.esc(serviceCd) + "</span>"
                + "</span>"
                + badge
                + "</a>";
        }).join("");
    }

    function ensureCurrentService(list) {
        if (currentServiceCd) return currentServiceCd;
        if (Array.isArray(list) && list.length) {
            currentServiceCd = list[0].service_cd;
        }
        return currentServiceCd;
    }

    function activateContentTab(tabKey) {
        var page = root();
        var key = tabKey || "service";
        UX.qsa("[data-health-tab]", page).forEach(function (tab) {
            if (tab.hidden) {
                tab.classList.remove("is-active");
                return;
            }
            tab.classList.toggle("is-active", tab.getAttribute("data-health-tab") === key);
        });
        UX.qsa("[data-health-pane]", page).forEach(function (pane) {
            var active = pane.getAttribute("data-health-pane") === key;
            pane.classList.toggle("is-active", active);
            pane.hidden = !active;
        });
    }

    function render(data) {
        var summary = data && data.summary ? data.summary : {};
        var db = data && data.db ? data.db : {};
        var server = data && data.server ? data.server : {};
        var cpu = server.cpu || {};
        var memory = server.memory || {};
        var disk = server.disk || {};
        var network = server.network || {};
        var workers = data && data.workers ? data.workers : {};
        var cpuUsage = firstNumber(cpu.system_cpu_load_pct, cpu.process_cpu_load_pct);
        var memoryUsage = firstNumber(memory.physical_used_pct, memory.heap_used_pct, server.heap_used_pct);
        var diskUsage = firstNumber(disk.used_pct);
        var networkAddresses = Array.isArray(network.addresses) ? network.addresses : [];

        updateContentLayout(workers);

        setText("healthOverallStatus", statusText(summary.overall_status));
        setText("healthServiceName", summary.service);
        setText("healthLiveness", statusText(summary.liveness));
        setText("healthReadiness", statusText(summary.readiness));
        setText("healthCheckedAt", summary.checked_at ? new Date(summary.checked_at).toLocaleString() : "-");
        setText("healthDbLatency", fmtMs(db.elapsed_ms));
        setText("healthDbMessage", db.ok ? "DB 연결 정상" : (db.error || "DB 연결 실패"));
        setText("healthBaseUrl", summary.base_url || "-");
        setText("healthUseYn", summary.use_yn === "N" ? "비활성" : "사용 중");
        setText("healthRemark", summary.remark || "-");
        setText("healthServiceLabel", summary.service_nm || summary.service || "-");

        setCardStatus("overall", summary.overall_status);
        setCardStatus("live", summary.liveness);
        setCardStatus("ready", summary.readiness);
        setCardStatus("db", summary.use_yn === "N" ? "DISABLED" : (db.ok ? "UP" : "DOWN"));

        setText("dbStatusText", statusText(db.ok ? "UP" : (summary.use_yn === "N" ? "DISABLED" : "DOWN")));
        setText("dbPing", db.ping);
        setText("dbElapsed", fmtMs(db.elapsed_ms));
        setText("dbError", db.error || "-");
        setText("dbPoolActive", db.pool ? db.pool.active : "-");
        setText("dbPoolIdle", db.pool ? db.pool.idle : "-");
        setText("dbPoolTotal", db.pool ? db.pool.total : "-");
        setText("dbPoolAwaiting", db.pool ? db.pool.threads_awaiting : "-");

        setText("svHost", server.host || "-");
        setText("svJava", server.java_version || "-");
        setText("svOs", [server.os_name, server.os_version, server.os_arch].filter(Boolean).join(" ") || "-");
        setText("svCpu", server.available_processors || "-");
        setText("svUptime", fmtUptime(server.uptime_ms));
        setText("svInfo", server.server_info || "-");
        setText("svThreads", (server.threads_live || "-") + " / peak " + (server.threads_peak || "-"));
        setText("svHeap", fmtBytes(server.heap_used || 0) + " / max " + fmtBytes(server.heap_max));
        setText("svCpuUsage", fmtPct(cpuUsage));
        setText("svCpuDetail", "프로세스 " + fmtPct(cpu.process_cpu_load_pct) + " / 평균 부하 " + (Number.isFinite(Number(cpu.system_load_avg)) ? Number(cpu.system_load_avg).toFixed(2) : "-"));
        setText("svMemoryUsage", fmtPct(memoryUsage));
        setText("svMemoryDetail", fmtBytes(memory.physical_used || memory.heap_used || 0) + " / " + fmtBytes(memory.physical_total || memory.heap_max || server.heap_max || 0));
        setText("svNetworkStatus", statusText(network.status));
        setText("svNetworkDetail", "활성 인터페이스 " + (network.active_interfaces || 0) + "개");
        setText("svActiveUsers", server.active_users == null ? "-" : server.active_users);
        setText("svDisk", fmtPct(diskUsage) + " · " + fmtBytes(disk.used || 0) + " / " + fmtBytes(disk.total || 0));
        setText("svNetworkIp", networkAddresses.length ? networkAddresses.join(", ") : "-");
        setText("svResourceScope", server.resource_scope === "HOST" ? "호스트 기준" : (server.resource_scope === "CONTAINER" ? "컨테이너 기준" : "-"));

        setResourceCardStatus("cpu", usageStatus(cpuUsage));
        setResourceCardStatus("memory", usageStatus(memoryUsage));
        setResourceCardStatus("network", network.status === "UP" ? "UP" : "DEGRADED");
        setResourceCardStatus("users", "UP");

        renderDependencies(data && data.dependencies ? data.dependencies : []);
        if (hasWorkerView(workers)) {
            renderWorkers(workers);
        }
    }

    function refreshServiceList() {
        return app.callJson("/health/service/list.json", {}, function (data) {
            serviceListCache = Array.isArray(data) ? data : [];
            ensureCurrentService(serviceListCache);
            renderServiceTabs(serviceListCache);
        });
    }

    function refresh() {
        return app.callJson("/health/detail.json", { service_cd: currentServiceCd }, function (data) {
            render(data || {});
        });
    }

    function bind() {
        UX.bindOnce(UX.qs("#btnHealthRefresh", root()), "click", function (e) {
            e.preventDefault();
            refreshServiceList().then(refresh);
        });

        UX.bindOnce(UX.qs("#healthServiceTabs", root()), "click", function (e) {
            var button = e.target.closest("[data-service-cd]");
            if (!button) return;
            e.preventDefault();
            currentServiceCd = button.getAttribute("data-service-cd");
            renderServiceTabs(serviceListCache);
            refresh();
        });

        UX.bindOnce(UX.qs("#healthContentTabs", root()), "click", function (e) {
            var button = e.target.closest("[data-health-tab]");
            if (!button) return;
            e.preventDefault();
            activateContentTab(button.getAttribute("data-health-tab"));
        });
    }

    function init() {
        var page = root();
        if (!page || page.dataset.healthInited === "1") return;
        page.dataset.healthInited = "1";
        bind();
        activateContentTab("service");
        refreshServiceList().then(refresh);

        if (timerId) clearInterval(timerId);
        timerId = setInterval(function () {
            if (root()) refreshServiceList().then(refresh);
        }, 15000);
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/health/main.do" || url === "/dashboard/health.do") init();
    });
})(window);
