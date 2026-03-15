(function () {
    "use strict";

    if (window.__jsadminHealthBound === true) return;
    window.__jsadminHealthBound = true;

    var timerId = null;

    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function getRoot() {
        return qs("#healthPage");
    }

    function text(id, value) {
        var el = qs("#" + id, getRoot());
        if (!el) return;
        el.textContent = value == null || value === "" ? "-" : String(value);
    }

    function setCardStatus(cardKey, status) {
        var root = getRoot();
        if (!root) return;
        var card = qs('[data-health-card="' + cardKey + '"]', root);
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
            n = n / 1024;
            idx++;
        }
        return n.toFixed(idx === 0 ? 0 : 1) + " " + units[idx];
    }

    function fmtMs(ms) {
        var n = Number(ms || 0);
        if (!Number.isFinite(n)) return "-";
        return n + " ms";
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
        var root = getRoot();
        var tbody = qs("#healthDependencyBody", root);
        if (!tbody) return;

        if (!Array.isArray(list) || list.length === 0) {
            tbody.innerHTML = "<tr><td colspan='5'>No dependencies</td></tr>";
            return;
        }

        tbody.innerHTML = list.map(function (row) {
            var status = row && row.status ? String(row.status) : "-";
            var statusClass = status === "UP" ? "health-badge up" : (status === "DOWN" ? "health-badge down" : "health-badge degraded");
            return "" +
                "<tr>" +
                "<td>" + esc(row.name) + "</td>" +
                "<td>" + esc(row.type) + "</td>" +
                "<td><span class='" + statusClass + "'>" + esc(status) + "</span></td>" +
                "<td>" + esc(fmtMs(row.latency_ms)) + "</td>" +
                "<td>" + esc(row.message) + "</td>" +
                "</tr>";
        }).join("");
    }

    function esc(v) {
        return String(v == null ? "" : v)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function render(data) {
        var summary = data && data.summary ? data.summary : {};
        var db = data && data.db ? data.db : {};
        var server = data && data.server ? data.server : {};

        text("healthOverallStatus", summary.overall_status);
        text("healthServiceName", summary.service);
        text("healthLiveness", summary.liveness);
        text("healthReadiness", summary.readiness);
        text("healthCheckedAt", summary.checked_at ? new Date(summary.checked_at).toLocaleString() : "-");
        text("healthDbLatency", fmtMs(db.elapsed_ms));
        text("healthDbMessage", db.ok ? "DB connection OK" : (db.error || "DB connection failed"));

        setCardStatus("overall", summary.overall_status);
        setCardStatus("live", summary.liveness);
        setCardStatus("ready", summary.readiness);
        setCardStatus("db", db.ok ? "UP" : "DOWN");

        text("dbStatusText", db.ok ? "UP" : "DOWN");
        text("dbPing", db.ping);
        text("dbElapsed", fmtMs(db.elapsed_ms));
        text("dbError", db.error || "-");
        text("dbPoolActive", db.pool ? db.pool.active : "-");
        text("dbPoolIdle", db.pool ? db.pool.idle : "-");
        text("dbPoolTotal", db.pool ? db.pool.total : "-");
        text("dbPoolAwaiting", db.pool ? db.pool.threads_awaiting : "-");

        text("svHost", server.host || "-");
        text("svJava", server.java_version || "-");
        text("svOs", [server.os_name, server.os_version, server.os_arch].filter(Boolean).join(" "));
        text("svCpu", server.available_processors);
        text("svUptime", fmtUptime(server.uptime_ms));
        text("svInfo", server.server_info || "-");
        text("svThreads", server.threads_live + " / peak " + server.threads_peak);
        text("svHeap", fmtBytes(server.heap_total) + " / max " + fmtBytes(server.heap_max));

        renderDependencies(data && data.dependencies ? data.dependencies : []);
    }

    async function refresh() {
        var data = await window.jsAdminSpa.call("/health/detail.json", {});
        render(data || {});
    }

    function bind() {
        var btn = qs("#btnHealthRefresh", getRoot());
        if (!btn) return;
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            refresh();
        });
    }

    function init() {
        var root = getRoot();
        if (!root) return;
        if (root.dataset.healthInited === "1") return;
        root.dataset.healthInited = "1";

        bind();
        refresh();

        if (timerId) clearInterval(timerId);
        timerId = setInterval(function () {
            if (getRoot()) refresh();
        }, 15000);
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/health/main.do" || url === "/dashboard/health.do") {
            init();
        }
    });
})();
