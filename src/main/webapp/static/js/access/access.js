(function (global) {
    "use strict";

    if (global.__ACCESS_PAGE_BOUND__) return;
    global.__ACCESS_PAGE_BOUND__ = true;

    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function qsa(sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    }

    function esc(v) {
        if (v === null || v === undefined) return "";
        return String(v)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function root() {
        return qs("#accessRoot");
    }

    function api(url, body) {
        return global.jsAdminSpa.call(url, body || {});
    }

    function currentSessionId() {
        try {
            return localStorage.getItem("LOGIN_SESSION_ID") || "";
        } catch (e) {
            return "";
        }
    }

    function statusBadge(status) {
        var normalized = String(status || "").toUpperCase();
        var cls = "status-muted";
        if (normalized === "ACTIVE") cls = "status-active";
        else if (normalized === "EXPIRED") cls = "status-expired";
        else if (normalized === "REVOKED") cls = "status-revoked";
        else if (normalized === "LOGOUT") cls = "status-logout";

        return "<span class='status-chip " + cls + "'>" + esc(normalized || "-") + "</span>";
    }

    function normalizeText(v) {
        if (v === null || v === undefined) return "";
        return String(v).trim();
    }

    function shortText(v, max) {
        var text = normalizeText(v);
        if (!text) return "-";
        return text.length > max ? text.substring(0, max) + "..." : text;
    }

    function setSelectedSession(sessionId, loginId) {
        var page = root();
        if (!page) return;
        page.dataset.selectedSessionId = sessionId || "";
        page.dataset.selectedLoginId = loginId || "";
        var label = qs("#selectedSessionId", page);
        if (label) label.textContent = sessionId || "-";
    }

    function selectedSessionId() {
        var page = root();
        return page && page.dataset ? (page.dataset.selectedSessionId || "") : "";
    }

    function selectedLoginId() {
        var page = root();
        return page && page.dataset ? (page.dataset.selectedLoginId || "") : "";
    }

    function bindTabs(page) {
        qsa(".tab", page).forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.getAttribute("data-tab");
                qsa(".tab", page).forEach(function (item) { item.classList.remove("is-active"); });
                qsa(".tab-pane", page).forEach(function (pane) {
                    pane.style.display = pane.getAttribute("data-pane") === target ? "" : "none";
                });
                tab.classList.add("is-active");
                if (target === "HISTORY") {
                    loadHistoryList();
                }
            });
        });
    }

    function formatDateInput(date) {
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }

    function setDefaultHistoryRange(page) {
        var fromEl = qs("#historyFromDt", page);
        var toEl = qs("#historyToDt", page);
        if (!fromEl || !toEl) return;
        if (normalizeText(fromEl.value) && normalizeText(toEl.value)) return;

        var today = new Date();
        var monthAgo = new Date(today.getTime());
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        if (!normalizeText(fromEl.value)) {
            fromEl.value = formatDateInput(monthAgo);
        }
        if (!normalizeText(toEl.value)) {
            toEl.value = formatDateInput(today);
        }
    }

    function renderSessionList(rows) {
        var tbody = qs("#sessionListBody", root());
        if (!tbody) return;

        if (!rows.length) {
            tbody.innerHTML = "<tr><td colspan='8'>No Data</td></tr>";
            setSelectedSession("", "");
            return;
        }

        var currentId = currentSessionId();
        tbody.innerHTML = rows.map(function (row) {
            var sessionId = normalizeText(row.session_id);
            var rowClass = sessionId && sessionId === currentId ? " class='is-selected'" : "";
            var suffix = sessionId && sessionId === currentId ? " <span class='access-self'>(내 세션)</span>" : "";

            return ""
                + "<tr" + rowClass + " data-session-id='" + esc(sessionId) + "' data-login-id='" + esc(row.login_id) + "'>"
                + "  <td>" + statusBadge(row.view_status_cd || row.status_cd) + "</td>"
                + "  <td>" + esc(row.login_id || "-") + suffix + "</td>"
                + "  <td>" + esc(row.user_nm || "-") + "</td>"
                + "  <td>" + esc(row.client_ip || "-") + "</td>"
                + "  <td>" + esc(row.login_at || "-") + "</td>"
                + "  <td>" + esc(row.last_access_at || "-") + "</td>"
                + "  <td>" + esc(row.expires_at || "-") + "</td>"
                + "  <td title='" + esc(row.user_agent || "") + "'>" + esc(shortText(row.user_agent, 72)) + "</td>"
                + "</tr>";
        }).join("");

        qsa("tr[data-session-id]", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                qsa("tr", tbody).forEach(function (row) { row.classList.remove("is-selected"); });
                tr.classList.add("is-selected");
                setSelectedSession(tr.getAttribute("data-session-id"), tr.getAttribute("data-login-id"));
            });
        });

        var initial = tbody.querySelector("tr[data-session-id].is-selected") || tbody.querySelector("tr[data-session-id]");
        if (initial) {
            setSelectedSession(initial.getAttribute("data-session-id"), initial.getAttribute("data-login-id"));
        }
    }

    function renderHistoryList(rows) {
        var tbody = qs("#historyListBody", root());
        if (!tbody) return;

        if (!rows.length) {
            tbody.innerHTML = "<tr><td colspan='7'>No Data</td></tr>";
            return;
        }

        tbody.innerHTML = rows.map(function (row) {
            return ""
                + "<tr>"
                + "  <td>" + statusBadge(row.result_cd) + "</td>"
                + "  <td>" + esc(row.login_id || "-") + "</td>"
                + "  <td>" + esc(row.user_nm || "-") + "</td>"
                + "  <td>" + esc(row.client_ip || "-") + "</td>"
                + "  <td>" + esc(row.login_at || "-") + "</td>"
                + "  <td title='" + esc(row.session_id || "") + "'>" + esc(shortText(row.session_id, 18)) + "</td>"
                + "  <td title='" + esc(row.result_msg || "") + "'>" + esc(shortText(row.result_msg, 80)) + "</td>"
                + "</tr>";
        }).join("");
    }

    async function loadSessionList() {
        var page = root();
        if (!page) return;

        var data = await api("/access/session/list.json", {
            keyword: normalizeText(qs("#sessionKeyword", page).value),
            status_cd: normalizeText(qs("#sessionStatus", page).value)
        });
        renderSessionList(Array.isArray(data) ? data : []);
    }

    async function loadHistoryList() {
        var page = root();
        if (!page) return;

        var data = await api("/access/history/list.json", {
            keyword: normalizeText(qs("#historyKeyword", page).value),
            result_cd: normalizeText(qs("#historyResult", page).value),
            from_dt: normalizeText(qs("#historyFromDt", page).value),
            to_dt: normalizeText(qs("#historyToDt", page).value)
        });
        renderHistoryList(Array.isArray(data) ? data : []);
    }

    async function expireSelectedSession() {
        var sessionId = selectedSessionId();
        if (!sessionId) {
            alert("만료할 세션을 선택하세요.");
            return;
        }
        if (!confirm("선택한 세션을 만료 처리하시겠습니까?")) return;

        await api("/access/session/expire.json", { session_id: sessionId });
        if (sessionId === currentSessionId()) {
            try {
                localStorage.removeItem("JWT");
                localStorage.removeItem("LOGIN_USER");
                localStorage.removeItem("LOGIN_SESSION_ID");
            } catch (e) {}
            document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
            await global.jsAdminSpa.load("/login.do");
            return;
        }
        await loadSessionList();
    }

    async function expireUserSessions() {
        var loginId = selectedLoginId();
        if (!loginId) {
            alert("사용자 세션을 먼저 선택하세요.");
            return;
        }
        if (!confirm(loginId + " 사용자의 활성 세션을 모두 만료 처리하시겠습니까?")) return;

        await api("/access/session/expireUser.json", { login_id: loginId });

        try {
            var raw = localStorage.getItem("LOGIN_USER");
            var parsed = raw ? JSON.parse(raw) : {};
            if (parsed && parsed.user_id && parsed.user_id === loginId) {
                localStorage.removeItem("JWT");
                localStorage.removeItem("LOGIN_USER");
                localStorage.removeItem("LOGIN_SESSION_ID");
                document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
                await global.jsAdminSpa.load("/login.do");
                return;
            }
        } catch (e) {}

        await loadSessionList();
    }

    function bindButtons(page) {
        qs("#btnSessionSearch", page).addEventListener("click", function () { loadSessionList(); });
        qs("#btnSessionExpire", page).addEventListener("click", function () { expireSelectedSession(); });
        qs("#btnSessionExpireUser", page).addEventListener("click", function () { expireUserSessions(); });
        qs("#btnHistorySearch", page).addEventListener("click", function () { loadHistoryList(); });

        ["#sessionKeyword", "#historyKeyword"].forEach(function (sel) {
            var input = qs(sel, page);
            if (!input) return;
            input.addEventListener("keydown", function (e) {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (sel === "#sessionKeyword") loadSessionList();
                else loadHistoryList();
            });
        });
    }

    async function init() {
        var page = root();
        if (!page) return;
        if (page.dataset.inited === "1") return;
        page.dataset.inited = "1";

        bindTabs(page);
        bindButtons(page);
        setDefaultHistoryRange(page);
        await loadSessionList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/access/main.do") {
            init();
        }
    });

    try { init(); } catch (e) {}
})(window);
