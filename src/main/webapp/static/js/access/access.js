(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__ACCESS_PAGE_BOUND__) return;
    global.__ACCESS_PAGE_BOUND__ = true;

    function root() {
        return UX.qs("#accessRoot");
    }

    function currentSessionId() {
        return UX.localGet("LOGIN_SESSION_ID", "");
    }

    function statusBadge(status) {
        var normalized = String(status || "").toUpperCase();
        var cls = "status-muted";
        if (normalized === "ACTIVE") cls = "status-active";
        else if (normalized === "EXPIRED") cls = "status-expired";
        else if (normalized === "REVOKED") cls = "status-revoked";
        else if (normalized === "LOGOUT") cls = "status-logout";
        return "<span class='status-chip " + cls + "'>" + UX.esc(normalized || "-") + "</span>";
    }

    function setSelectedSession(sessionId, loginId) {
        var page = root();
        if (!page) return;
        page.dataset.selectedSessionId = sessionId || "";
        page.dataset.selectedLoginId = loginId || "";
        UX.setText("#selectedSessionId", sessionId || "-", page);
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
        UX.qsa(".tab", page).forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.getAttribute("data-tab");
                UX.qsa(".tab", page).forEach(function (item) { item.classList.remove("is-active"); });
                UX.qsa(".tab-pane", page).forEach(function (pane) {
                    pane.style.display = pane.getAttribute("data-pane") === target ? "" : "none";
                });
                tab.classList.add("is-active");
                if (target === "HISTORY") loadHistoryList();
            });
        });
    }

    function setDefaultHistoryRange(page) {
        var fromEl = UX.qs("#historyFromDt", page);
        var toEl = UX.qs("#historyToDt", page);
        if (!fromEl || !toEl) return;
        if (UX.normalizeText(fromEl.value) && UX.normalizeText(toEl.value)) return;

        var today = new Date();
        var monthAgo = new Date(today.getTime());
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        if (!UX.normalizeText(fromEl.value)) fromEl.value = UX.formatDateInput(monthAgo);
        if (!UX.normalizeText(toEl.value)) toEl.value = UX.formatDateInput(today);
    }

    function renderSessionList(rows) {
        var tbody = UX.qs("#sessionListBody", root());
        if (!tbody) return;

        if (!rows.length) {
            tbody.innerHTML = "<tr><td colspan='8'>No Data</td></tr>";
            setSelectedSession("", "");
            return;
        }

        var currentId = currentSessionId();
        tbody.innerHTML = rows.map(function (row) {
            var sessionId = UX.normalizeText(row.session_id);
            var rowClass = sessionId && sessionId === currentId ? " class='is-selected'" : "";
            var suffix = sessionId && sessionId === currentId ? " <span class='access-self'>(Current)</span>" : "";
            return ""
                + "<tr" + rowClass + " data-session-id='" + UX.esc(sessionId) + "' data-login-id='" + UX.esc(row.login_id) + "'>"
                + "<td>" + statusBadge(row.view_status_cd || row.status_cd) + "</td>"
                + "<td>" + UX.esc(row.login_id || "-") + suffix + "</td>"
                + "<td>" + UX.esc(row.user_nm || "-") + "</td>"
                + "<td>" + UX.esc(row.client_ip || "-") + "</td>"
                + "<td>" + UX.esc(row.login_at || "-") + "</td>"
                + "<td>" + UX.esc(row.last_access_at || "-") + "</td>"
                + "<td>" + UX.esc(row.expires_at || "-") + "</td>"
                + "<td title='" + UX.esc(row.user_agent || "") + "'>" + UX.esc(UX.shortText(row.user_agent, 72)) + "</td>"
                + "</tr>";
        }).join("");

        UX.qsa("tr[data-session-id]", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                UX.qsa("tr", tbody).forEach(function (row) { row.classList.remove("is-selected"); });
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
        var tbody = UX.qs("#historyListBody", root());
        if (!tbody) return;

        if (!rows.length) {
            tbody.innerHTML = "<tr><td colspan='7'>No Data</td></tr>";
            return;
        }

        tbody.innerHTML = rows.map(function (row) {
            return ""
                + "<tr>"
                + "<td>" + statusBadge(row.result_cd) + "</td>"
                + "<td>" + UX.esc(row.login_id || "-") + "</td>"
                + "<td>" + UX.esc(row.user_nm || "-") + "</td>"
                + "<td>" + UX.esc(row.client_ip || "-") + "</td>"
                + "<td>" + UX.esc(row.login_at || "-") + "</td>"
                + "<td title='" + UX.esc(row.session_id || "") + "'>" + UX.esc(UX.shortText(row.session_id, 18)) + "</td>"
                + "<td title='" + UX.esc(row.result_msg || "") + "'>" + UX.esc(UX.shortText(row.result_msg, 80)) + "</td>"
                + "</tr>";
        }).join("");
    }

    function loadSessionList() {
        var page = root();
        if (!page) return Promise.resolve();
        return app.callJson("/access/session/list.json", {
            keyword: UX.getValue("#sessionKeyword", page),
            status_cd: UX.getValue("#sessionStatus", page)
        }, function (data) {
            renderSessionList(Array.isArray(data) ? data : []);
        });
    }

    function loadHistoryList() {
        var page = root();
        if (!page) return Promise.resolve();
        return app.callJson("/access/history/list.json", {
            keyword: UX.getValue("#historyKeyword", page),
            result_cd: UX.getValue("#historyResult", page),
            from_dt: UX.getValue("#historyFromDt", page),
            to_dt: UX.getValue("#historyToDt", page)
        }, function (data) {
            renderHistoryList(Array.isArray(data) ? data : []);
        });
    }

    function expireSelectedSession() {
        var sessionId = selectedSessionId();
        if (!sessionId) {
            alert("만료할 세션을 선택하세요.");
            return;
        }
        if (!confirm("선택한 세션을 만료 처리하시겠습니까?")) return;

        app.callJson("/access/session/expire.json", { session_id: sessionId }, function () {
            if (sessionId === currentSessionId()) {
                UX.localRemove(["JWT", "LOGIN_USER", "LOGIN_SESSION_ID"]);
                document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
                app.loadPage("/login.do");
                return;
            }
            loadSessionList();
        });
    }

    function expireUserSessions() {
        var loginId = selectedLoginId();
        if (!loginId) {
            alert("사용자 세션을 먼저 선택하세요.");
            return;
        }
        if (!confirm(loginId + " 사용자의 활성 세션을 모두 만료 처리하시겠습니까?")) return;

        app.callJson("/access/session/expireUser.json", { login_id: loginId }, function () {
            try {
                var parsed = JSON.parse(UX.localGet("LOGIN_USER", "{}"));
                if (parsed && parsed.user_id === loginId) {
                    UX.localRemove(["JWT", "LOGIN_USER", "LOGIN_SESSION_ID"]);
                    document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
                    app.loadPage("/login.do");
                    return;
                }
            } catch (e) {}
            loadSessionList();
        });
    }

    function bindButtons(page) {
        UX.bindOnce(UX.qs("#btnSessionSearch", page), "click", function () { loadSessionList(); });
        UX.bindOnce(UX.qs("#btnSessionExpire", page), "click", function () { expireSelectedSession(); });
        UX.bindOnce(UX.qs("#btnSessionExpireUser", page), "click", function () { expireUserSessions(); });
        UX.bindOnce(UX.qs("#btnHistorySearch", page), "click", function () { loadHistoryList(); });

        ["#sessionKeyword", "#historyKeyword"].forEach(function (sel) {
            var input = UX.qs(sel, page);
            if (!input) return;
            input.addEventListener("keydown", function (e) {
                if (e.key !== "Enter") return;
                e.preventDefault();
                if (sel === "#sessionKeyword") loadSessionList();
                else loadHistoryList();
            });
        });
    }

    function init() {
        var page = root();
        if (!page || page.dataset.inited === "1") return;
        page.dataset.inited = "1";
        bindTabs(page);
        bindButtons(page);
        setDefaultHistoryRange(page);
        loadSessionList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/access/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
