(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;

    if (global.__ACCESS_PAGE_BOUND_V5__) return;
    global.__ACCESS_PAGE_BOUND_V5__ = true;

    var sessionListView = null;
    var historyListView = null;

    function resetViews() {
        if (sessionListView && typeof sessionListView.destroy === "function") {
            sessionListView.destroy();
        }
        if (historyListView && typeof historyListView.destroy === "function") {
            historyListView.destroy();
        }
        sessionListView = null;
        historyListView = null;
    }

    function logAccess(step, payload) {
        try {
            if (payload === undefined) {
                console.log("[access]", step);
            } else {
                console.log("[access]", step, payload);
            }
        } catch (e) {}
    }

    function root() { return UX.qs("#accessRoot"); }
    function currentSessionId() { return UX.localGet("LOGIN_SESSION_ID", ""); }

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
                logAccess("tab.click", { target: target });
                UX.qsa(".tab", page).forEach(function (item) { item.classList.remove("is-active"); });
                UX.qsa(".tab-pane", page).forEach(function (pane) {
                    pane.style.display = pane.getAttribute("data-pane") === target ? "" : "none";
                });
                tab.classList.add("is-active");
                if (target === "HISTORY") {
                    global.requestAnimationFrame(function () {
                        logAccess("history.raf.beforeEnsure", {
                            gridExists: !!UX.qs("#historyGrid", page),
                            paneVisible: UX.qs(".tab-pane[data-pane='HISTORY']", page).style.display
                        });
                        ensureHistoryListView();
                        loadHistoryList().then(function () {
                            global.requestAnimationFrame(function () {
                                logAccess("history.raf.afterLoad", {
                                    hasView: !!historyListView
                                });
                                logHistoryLayout();
                                if (historyListView) historyListView.refresh();
                            });
                        });
                    });
                } else if (target === "SESSION" && sessionListView) {
                    global.requestAnimationFrame(function () { sessionListView.refresh(); });
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

    function cleanupHistoryPane() {
        var page = root();
        if (!page) return;
        var historyPane = UX.qs(".tab-pane[data-pane='HISTORY']", page);
        if (!historyPane) return;

        UX.qsa(".panel-title", historyPane).forEach(function (node) {
            node.remove();
        });

        UX.qsa(".grid-scroll", historyPane).forEach(function (node) {
            node.remove();
        });

        UX.qsa("table", historyPane).forEach(function (node) {
            node.remove();
        });
    }

    function logHistoryLayout() {
        var page = root();
        if (!page) return;
        var historyPane = UX.qs(".tab-pane[data-pane='HISTORY']", page);
        var panel = historyPane ? UX.qs(".panel", historyPane) : null;
        var grid = historyPane ? UX.qs("#historyGrid", historyPane) : null;
        var head = grid ? UX.qs(".vgrid-head", grid) : null;
        var body = grid ? UX.qs(".vgrid-body", grid) : null;
        try {
            console.log("[access] history.layout", {
                panelClientWidth: panel ? panel.clientWidth : null,
                gridClientWidth: grid ? grid.clientWidth : null,
                headClientWidth: head ? head.clientWidth : null,
                bodyClientWidth: body ? body.clientWidth : null,
                gridComputedWidth: grid ? global.getComputedStyle(grid).width : null,
                gridColumns: grid ? global.getComputedStyle(grid).getPropertyValue("--vgrid-columns") : null
            });
        } catch (e) {}
    }

    function ensureSessionListView() {
        var tbody = UX.qs("#sessionListBody", root());
        if (!tbody || sessionListView) return;
        sessionListView = Grid.createVirtualTable({
            tbody: tbody,
            colCount: 8,
            emptyHtml: "<tr><td colspan='8'>No Data</td></tr>",
            renderRow: function (row) {
                var sessionId = UX.normalizeText(row.session_id);
                var selectedClass = sessionId && sessionId === selectedSessionId() ? " class='is-selected'" : "";
                var suffix = sessionId && sessionId === currentSessionId() ? " <span class='access-self'>(Current)</span>" : "";
                return ""
                    + "<tr" + selectedClass + " data-session-id='" + UX.esc(sessionId) + "' data-login-id='" + UX.esc(row.login_id) + "'>"
                    + "<td>" + statusBadge(row.view_status_cd || row.status_cd) + "</td>"
                    + "<td>" + UX.esc(row.login_id || "-") + suffix + "</td>"
                    + "<td>" + UX.esc(row.user_nm || "-") + "</td>"
                    + "<td>" + UX.esc(row.client_ip || "-") + "</td>"
                    + "<td>" + UX.esc(row.login_at || "-") + "</td>"
                    + "<td>" + UX.esc(row.last_access_at || "-") + "</td>"
                    + "<td>" + UX.esc(row.expires_at || "-") + "</td>"
                    + "<td title='" + UX.esc(row.user_agent || "") + "'>" + UX.esc(UX.shortText(row.user_agent, 72)) + "</td>"
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

    function ensureHistoryListView() {
        var page = root();
        cleanupHistoryPane();
        var gridRoot = UX.qs("#historyGrid", page);
        if (!gridRoot) {
            var historyPane = UX.qs(".tab-pane[data-pane='HISTORY']", page);
            var panel = historyPane ? UX.qs(".panel", historyPane) : null;
            var oldWrap = UX.qs("#historyListWrap", page);
            if (panel) {
                gridRoot = document.createElement("div");
                gridRoot.id = "historyGrid";
                gridRoot.className = "vgrid";
                if (oldWrap && oldWrap.parentNode) {
                    oldWrap.parentNode.replaceChild(gridRoot, oldWrap);
                } else {
                    panel.appendChild(gridRoot);
                }
            }
        }
        logAccess("history.ensure.enter", {
            hasGridRoot: !!gridRoot,
            hasExistingView: !!historyListView
        });
        if (!gridRoot || historyListView) return;
        historyListView = Grid.createVirtualGrid({
            root: gridRoot,
            rowHeight: 42,
            overscan: 12,
            emptyHtml: "No Data",
            columns: [
                { label: "결과", width: "0.9fr" },
                { label: "LOGIN_ID", width: "1fr" },
                { label: "사용자명", width: "1fr" },
                { label: "IP", width: "1fr" },
                { label: "로그인 시각", width: "1.3fr" },
                { label: "세션 ID", width: "1.2fr" },
                { label: "상세 사유", width: "2fr" }
            ],
            renderRow: function (row) {
                return ""
                    + "<div class='vgrid-row'>"
                    + "<div class='vgrid-cell'>" + statusBadge(row.result_cd) + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.login_id || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.user_nm || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.client_ip || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.login_at || "-") + "</div>"
                    + "<div class='vgrid-cell' title='" + UX.esc(row.session_id || "") + "'>" + UX.esc(UX.shortText(row.session_id, 18)) + "</div>"
                    + "<div class='vgrid-cell' title='" + UX.esc(row.result_msg || "") + "'>" + UX.esc(UX.shortText(row.result_msg, 80)) + "</div>"
                    + "</div>";
            }
        });
        logAccess("history.ensure.created", {
            hasBody: !!(historyListView && historyListView.getBody && historyListView.getBody())
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

    function renderHistoryList(rows) {
        ensureHistoryListView();
        logAccess("history.render", {
            rowCount: Array.isArray(rows) ? rows.length : -1,
            hasView: !!historyListView
        });
        if (historyListView) {
            historyListView.setItems(rows || []);
            global.requestAnimationFrame(function () {
                logAccess("history.refresh.afterSetItems", {
                    rowCount: Array.isArray(rows) ? rows.length : -1
                });
                logHistoryLayout();
                if (historyListView) historyListView.refresh();
            });
        }
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
        var params = {
            keyword: UX.getValue("#historyKeyword", page),
            result_cd: UX.getValue("#historyResult", page),
            from_dt: UX.getValue("#historyFromDt", page),
            to_dt: UX.getValue("#historyToDt", page)
        };
        logAccess("history.load.request", params);
        return app.callJson("/access/history/list.json", {
            keyword: params.keyword,
            result_cd: params.result_cd,
            from_dt: params.from_dt,
            to_dt: params.to_dt
        }, function (data) {
            logAccess("history.load.response", {
                isArray: Array.isArray(data),
                rowCount: Array.isArray(data) ? data.length : -1,
                firstRow: Array.isArray(data) && data.length ? data[0] : null
            });
            renderHistoryList(Array.isArray(data) ? data : []);
        });
    }

    function expireSelectedSession() {
        var sessionId = selectedSessionId();
        if (!sessionId) return alert("만료할 세션을 선택하세요.");
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
        if (!loginId) return alert("사용자 세션을 먼저 선택하세요.");
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
        if (!page) return;
        resetViews();
        page.dataset.inited = "1";
        logAccess("init", { pageFound: !!page });
        bindTabs(page);
        bindButtons(page);
        setDefaultHistoryRange(page);
        ensureSessionListView();
        loadSessionList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/access/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
