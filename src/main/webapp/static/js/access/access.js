(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;

    var sessionListView = null;
    var historyListView = null;
    var sessionLoader = null;
    var historyLoader = null;

    function root() {
        return UX.qs("#accessRoot");
    }

    function currentSessionId() {
        return UX.localGet("LOGIN_SESSION_ID", "");
    }

    function resetViews() {
        if (sessionListView && typeof sessionListView.destroy === "function") sessionListView.destroy();
        if (historyListView && typeof historyListView.destroy === "function") historyListView.destroy();
        if (sessionLoader && typeof sessionLoader.destroy === "function") sessionLoader.destroy();
        if (historyLoader && typeof historyLoader.destroy === "function") historyLoader.destroy();
        sessionListView = null;
        historyListView = null;
        sessionLoader = null;
        historyLoader = null;
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
        if (sessionListView) sessionListView.refresh();
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

                if (target === "HISTORY") {
                    global.requestAnimationFrame(function () {
                        ensureHistoryListView();
                        ensureHistoryLoader();
                        loadHistoryList().then(function () {
                            global.requestAnimationFrame(function () {
                                if (historyListView) historyListView.refresh();
                            });
                        });
                    });
                } else if (target === "SESSION" && sessionListView) {
                    global.requestAnimationFrame(function () {
                        sessionListView.refresh();
                    });
                }
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

    function ensureSessionListView() {
        var tbody = UX.qs("#sessionListBody", root());
        if (!tbody || sessionListView) return;

        sessionListView = Grid.createVirtualTable({
            tbody: tbody,
            colCount: 9,
            emptyHtml: "<tr><td colspan='9'>데이터가 없습니다.</td></tr>",
            renderRow: function (row, index) {
                var sessionId = UX.normalizeText(row.session_id);
                var selectedClass = sessionId && sessionId === selectedSessionId() ? " class='is-selected'" : "";
                var loginText = row.login_id || "-";
                if (sessionId && sessionId === currentSessionId()) {
                    loginText += "\n(현재 세션)";
                }

                return ""
                    + "<tr" + selectedClass + " data-session-id='" + UX.esc(sessionId) + "' data-login-id='" + UX.esc(row.login_id) + "'>"
                    + "<td>" + Grid.textCell(index + 1) + "</td>"
                    + "<td>" + statusBadge(row.view_status_cd || row.status_cd) + "</td>"
                    + "<td>" + Grid.textCell(loginText) + "</td>"
                    + "<td>" + Grid.textCell(row.user_nm || "-") + "</td>"
                    + "<td>" + Grid.textCell(row.client_ip || "-") + "</td>"
                    + "<td>" + Grid.textCell(row.login_at || "-") + "</td>"
                    + "<td>" + Grid.textCell(row.last_access_at || "-") + "</td>"
                    + "<td>" + Grid.textCell(row.expires_at || "-") + "</td>"
                    + "<td>" + Grid.textCell(row.user_agent || "-") + "</td>"
                    + "</tr>";
            },
            onRendered: function () {
                UX.qsa("tr[data-session-id]", tbody).forEach(function (tr) {
                    tr.addEventListener("click", function () {
                        setSelectedSession(tr.getAttribute("data-session-id"), tr.getAttribute("data-login-id"));
                    });
                });
            }
        });
    }

    function ensureSessionLoader() {
        if (sessionLoader || !sessionListView || !Grid.createChunkLoader) return;
        sessionLoader = Grid.createChunkLoader({
            pageSize: 100,
            threshold: 120,
            getScrollElement: function () {
                return UX.qs("#sessionListWrap", root());
            },
            onData: function (result) {
                renderSessionList(result.items || []);
            }
        });
    }

    function ensureHistoryListView() {
        var gridRoot = UX.qs("#historyGrid", root());
        if (!gridRoot || historyListView) return;

        historyListView = Grid.createVirtualGrid({
            root: gridRoot,
            rowHeight: 72,
            overscan: 12,
            emptyHtml: "데이터가 없습니다.",
            renderRow: function (row, index) {
                return ""
                    + "<div class='vgrid-row'>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(index + 1) + "</div>"
                    + "<div class='vgrid-cell'>" + statusBadge(row.result_cd) + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.login_id || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.user_nm || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.client_ip || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.login_at || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.session_id || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.result_msg || "-") + "</div>"
                    + "</div>";
            }
        });
    }

    function ensureHistoryLoader() {
        if (historyLoader || !historyListView || !Grid.createChunkLoader) return;
        historyLoader = Grid.createChunkLoader({
            pageSize: 100,
            threshold: 140,
            getScrollElement: function () {
                return historyListView && historyListView.getBody ? historyListView.getBody() : null;
            },
            onData: function (result) {
                renderHistoryList(result.items || [], !!result.append);
            }
        });
    }

    function renderSessionList(rows) {
        ensureSessionListView();
        if (!sessionListView) return;
        sessionListView.setItems(rows || []);
        if (!rows.length) {
            setSelectedSession("", "");
            return;
        }
        if (!selectedSessionId()) {
            setSelectedSession(rows[0].session_id || "", rows[0].login_id || "");
        }
    }

    function renderHistoryList(rows, append) {
        ensureHistoryListView();
        if (!historyListView) return;
        historyListView.setItems(rows || [], { preserveScroll: !!append });
        global.requestAnimationFrame(function () {
            if (historyListView) historyListView.refresh();
        });
    }

    function loadSessionList() {
        var page = root();
        if (!page) return Promise.resolve();
        ensureSessionListView();
        ensureSessionLoader();
        return app.callJson("/access/session/list.json", {
            keyword: UX.getValue("#sessionKeyword", page),
            status_cd: UX.getValue("#sessionStatus", page)
        }, function (data) {
            var rows = Array.isArray(data) ? data : [];
            if (sessionLoader) sessionLoader.replaceItems(rows);
            else renderSessionList(rows.slice(0, 100));
        });
    }

    function loadHistoryList() {
        var page = root();
        if (!page) return Promise.resolve();
        ensureHistoryListView();
        ensureHistoryLoader();
        return app.callJson("/access/history/list.json", {
            keyword: UX.getValue("#historyKeyword", page),
            result_cd: UX.getValue("#historyResult", page),
            from_dt: UX.getValue("#historyFromDt", page),
            to_dt: UX.getValue("#historyToDt", page)
        }, function (data) {
            var rows = Array.isArray(data) ? data : [];
            if (historyLoader) historyLoader.replaceItems(rows);
            else renderHistoryList(rows.slice(0, 100), false);
        });
    }

    function expireSelectedSession() {
        var sessionId = selectedSessionId();
        if (!sessionId) return alert("만료할 세션을 선택하세요.");
        if (!global.confirm("선택한 세션을 만료 처리하시겠습니까?")) return;

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
        if (!loginId) return alert("사용자 세션을 먼저 선택하세요.");
        if (!global.confirm(loginId + " 사용자의 활성 세션을 모두 만료 처리하시겠습니까?")) return;

        app.callJson("/access/session/expireUser.json", { login_id: loginId }, function () {
            try {
                var parsed = JSON.parse(UX.localGet("LOGIN_USER", "{}"));
                if (parsed && parsed.user_id === loginId) {
                    UX.localRemove(["JWT", "LOGIN_USER", "LOGIN_SESSION_ID"]);
                    document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
                    app.loadPage("/login.do");
                    return;
                }
            } catch (ignore) {}
            loadSessionList();
        });
    }

    function bindButtons(page) {
        UX.bindOnce(UX.qs("#btnSessionSearch", page), "click", function () { loadSessionList(); });
        UX.bindOnce(UX.qs("#btnSessionExpire", page), "click", function () { expireSelectedSession(); });
        UX.bindOnce(UX.qs("#btnSessionExpireUser", page), "click", function () { expireUserSessions(); });
        UX.bindOnce(UX.qs("#btnHistorySearch", page), "click", function () { loadHistoryList(); });
        app.bindEnterAction(UX.qs("#sessionKeyword", page), loadSessionList);
        app.bindEnterAction(UX.qs("#historyKeyword", page), loadHistoryList);
    }

    function init() {
        var page = root();
        if (!page) return;
        resetViews();
        bindTabs(page);
        bindButtons(page);
        setDefaultHistoryRange(page);
        ensureSessionListView();
        ensureSessionLoader();
        loadSessionList();
    }

    app.bindPage("__ACCESS_PAGE_BOUND_V13__", "/access/main.do", init);
})(window);
