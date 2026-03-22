(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__jsadminHealthBound === true) return;
    global.__jsadminHealthBound = true;

    var timerId = null;

    function root() {
        return UX.qs("#healthPage");
    }

    function setText(id, value) {
        UX.setText("#" + id, value == null || value === "" ? "-" : String(value), root());
    }

    function setCardStatus(cardKey, status) {
        var card = UX.qs("[data-health-card='" + cardKey + "']", root());
        if (!card) return;
        card.classList.remove("health-up", "health-down", "health-degraded");
        if (status === "UP") card.classList.add("health-up");
        else if (status === "DOWN") card.classList.add("health-down");
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

    function renderDependencies(list) {
        var tbody = UX.qs("#healthDependencyBody", root());
        if (!tbody) return;
        if (!Array.isArray(list) || !list.length) {
            tbody.innerHTML = "<tr><td colspan='5'>No dependencies</td></tr>";
            return;
        }

        tbody.innerHTML = list.map(function (row) {
            var status = row && row.status ? String(row.status) : "-";
            var statusClass = status === "UP" ? "health-badge up" : (status === "DOWN" ? "health-badge down" : "health-badge degraded");
            return "<tr>"
                + "<td>" + UX.esc(row.name) + "</td>"
                + "<td>" + UX.esc(row.type) + "</td>"
                + "<td><span class='" + statusClass + "'>" + UX.esc(status) + "</span></td>"
                + "<td>" + UX.esc(fmtMs(row.latency_ms)) + "</td>"
                + "<td>" + UX.esc(row.message) + "</td>"
                + "</tr>";
        }).join("");
    }

    function render(data) {
        var summary = data && data.summary ? data.summary : {};
        var db = data && data.db ? data.db : {};
        var server = data && data.server ? data.server : {};

        setText("healthOverallStatus", summary.overall_status);
        setText("healthServiceName", summary.service);
        setText("healthLiveness", summary.liveness);
        setText("healthReadiness", summary.readiness);
        setText("healthCheckedAt", summary.checked_at ? new Date(summary.checked_at).toLocaleString() : "-");
        setText("healthDbLatency", fmtMs(db.elapsed_ms));
        setText("healthDbMessage", db.ok ? "DB connection OK" : (db.error || "DB connection failed"));

        setCardStatus("overall", summary.overall_status);
        setCardStatus("live", summary.liveness);
        setCardStatus("ready", summary.readiness);
        setCardStatus("db", db.ok ? "UP" : "DOWN");

        setText("dbStatusText", db.ok ? "UP" : "DOWN");
        setText("dbPing", db.ping);
        setText("dbElapsed", fmtMs(db.elapsed_ms));
        setText("dbError", db.error || "-");
        setText("dbPoolActive", db.pool ? db.pool.active : "-");
        setText("dbPoolIdle", db.pool ? db.pool.idle : "-");
        setText("dbPoolTotal", db.pool ? db.pool.total : "-");
        setText("dbPoolAwaiting", db.pool ? db.pool.threads_awaiting : "-");

        setText("svHost", server.host || "-");
        setText("svJava", server.java_version || "-");
        setText("svOs", [server.os_name, server.os_version, server.os_arch].filter(Boolean).join(" "));
        setText("svCpu", server.available_processors);
        setText("svUptime", fmtUptime(server.uptime_ms));
        setText("svInfo", server.server_info || "-");
        setText("svThreads", server.threads_live + " / peak " + server.threads_peak);
        setText("svHeap", fmtBytes(server.heap_total) + " / max " + fmtBytes(server.heap_max));

        renderDependencies(data && data.dependencies ? data.dependencies : []);
    }

    function refresh() {
        return app.callJson("/health/detail.json", {}, function (data) {
            render(data || {});
        });
    }

    function bind() {
        UX.bindOnce(UX.qs("#btnHealthRefresh", root()), "click", function (e) {
            e.preventDefault();
            refresh();
        });
    }

    function init() {
        var page = root();
        if (!page || page.dataset.healthInited === "1") return;
        page.dataset.healthInited = "1";
        bind();
        refresh();

        if (timerId) clearInterval(timerId);
        timerId = setInterval(function () {
            if (root()) refresh();
        }, 15000);
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/health/main.do" || url === "/dashboard/health.do") init();
    });
})(window);
