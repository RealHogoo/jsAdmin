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
        if (status === "DOWN") return "health-badge down";
        if (status === "DISABLED") return "health-badge disabled";
        return "health-badge degraded";
    }

    function renderStatusBadge(status) {
        var value = status || "-";
        return "<span class='" + statusClass(value) + "'>" + UX.esc(value) + "</span>";
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

    function renderServiceTabs(list) {
        var target = UX.qs("#healthServiceTabs", root());
        if (!target) return;
        if (!Array.isArray(list) || !list.length) {
            target.innerHTML = "<a href='javascript:void(0)' class='tab health-service-tab is-active'>No services</a>";
            return;
        }

        target.innerHTML = list.map(function (row) {
            var serviceCd = row.service_cd || "";
            var active = serviceCd === currentServiceCd ? " is-active" : "";
            var disabled = row.use_yn === "N" ? " is-disabled" : "";
            var badge = row.use_yn === "N" ? "<span class='health-service-use'>OFF</span>" : "";
            return "<a href='javascript:void(0)' class='tab health-service-tab" + active + disabled + "' data-service-cd='" + UX.esc(serviceCd) + "'>"
                + "<span>" + UX.esc(row.service_nm || serviceCd) + "</span>"
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
        var cpuUsage = firstNumber(cpu.system_cpu_load_pct, cpu.process_cpu_load_pct);
        var memoryUsage = firstNumber(memory.physical_used_pct, memory.heap_used_pct, server.heap_used_pct);
        var diskUsage = firstNumber(disk.used_pct);
        var networkAddresses = Array.isArray(network.addresses) ? network.addresses : [];

        setText("healthOverallStatus", summary.overall_status);
        setText("healthServiceName", summary.service);
        setText("healthLiveness", summary.liveness);
        setText("healthReadiness", summary.readiness);
        setText("healthCheckedAt", summary.checked_at ? new Date(summary.checked_at).toLocaleString() : "-");
        setText("healthDbLatency", fmtMs(db.elapsed_ms));
        setText("healthDbMessage", db.ok ? "DB connection OK" : (db.error || "DB connection failed"));
        setText("healthBaseUrl", summary.base_url || "-");
        setText("healthUseYn", summary.use_yn === "N" ? "DISABLED" : "ENABLED");
        setText("healthRemark", summary.remark || "-");
        setText("healthServiceLabel", summary.service_nm || summary.service || "-");

        setCardStatus("overall", summary.overall_status);
        setCardStatus("live", summary.liveness);
        setCardStatus("ready", summary.readiness);
        setCardStatus("db", summary.use_yn === "N" ? "DISABLED" : (db.ok ? "UP" : "DOWN"));

        setText("dbStatusText", db.ok ? "UP" : (summary.use_yn === "N" ? "DISABLED" : "DOWN"));
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
        setText("svCpuDetail", "process " + fmtPct(cpu.process_cpu_load_pct) + " / load avg " + (Number.isFinite(Number(cpu.system_load_avg)) ? Number(cpu.system_load_avg).toFixed(2) : "-"));
        setText("svMemoryUsage", fmtPct(memoryUsage));
        setText("svMemoryDetail", fmtBytes(memory.physical_used || memory.heap_used || 0) + " / " + fmtBytes(memory.physical_total || memory.heap_max || server.heap_max || 0));
        setText("svNetworkStatus", network.status || "-");
        setText("svNetworkDetail", (network.active_interfaces || 0) + " active interface(s)");
        setText("svActiveUsers", server.active_users == null ? "-" : server.active_users);
        setText("svDisk", fmtPct(diskUsage) + " · " + fmtBytes(disk.used || 0) + " / " + fmtBytes(disk.total || 0));
        setText("svNetworkIp", networkAddresses.length ? networkAddresses.join(", ") : "-");

        setResourceCardStatus("cpu", usageStatus(cpuUsage));
        setResourceCardStatus("memory", usageStatus(memoryUsage));
        setResourceCardStatus("network", network.status === "UP" ? "UP" : "DEGRADED");
        setResourceCardStatus("users", "UP");

        renderDependencies(data && data.dependencies ? data.dependencies : []);
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
