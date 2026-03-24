(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;

    if (global.__USER_PAGE_BOUND_V3__) return;
    global.__USER_PAGE_BOUND_V3__ = true;

    var listView = null;
    var listLoader = null;

    function root() {
        return UX.qs("#userPage");
    }

    function resetViews() {
        if (listView && typeof listView.destroy === "function") listView.destroy();
        if (listLoader && typeof listLoader.destroy === "function") listLoader.destroy();
        listView = null;
        listLoader = null;
    }

    function setSelectedUserSeq(userSeq) {
        var page = root();
        if (!page) return;
        page.dataset.selectedUserSeq = userSeq ? String(userSeq) : "";
        if (listView) listView.refresh();
    }

    function selectedUserSeq() {
        var page = root();
        return page ? UX.numOrNull(page.dataset.selectedUserSeq) : null;
    }

    function clearForm() {
        UX.clearValues(["user_seq", "login_id", "user_nm", "user_pw", "login_fail_cnt", "lock_yn", "lock_until_at", "pwd_reset_yn", "last_login_at"], root());
        UX.setValue("#use_yn", "Y", root());
        setSelectedUserSeq(null);
    }

    function fillForm(row) {
        var page = root();
        UX.setValue("#user_seq", row.user_seq || "", page);
        UX.setValue("#login_id", row.login_id || "", page);
        UX.setValue("#user_nm", row.user_nm || "", page);
        UX.setValue("#user_pw", "", page);
        UX.setValue("#use_yn", row.use_yn || "Y", page);
        UX.setValue("#login_fail_cnt", row.login_fail_cnt || "0", page);
        UX.setValue("#lock_yn", row.lock_yn || "N", page);
        UX.setValue("#lock_until_at", row.lock_until_at || "", page);
        UX.setValue("#pwd_reset_yn", row.pwd_reset_yn || "N", page);
        UX.setValue("#last_login_at", row.last_login_at || "", page);
    }

    function collectForm() {
        var page = root();
        var seq = UX.strOrNull(UX.getValue("#user_seq", page));
        return {
            user_seq: seq ? Number(seq) : null,
            login_id: UX.getValue("#login_id", page),
            user_nm: UX.getValue("#user_nm", page),
            user_pw: UX.getValue("#user_pw", page),
            use_yn: UX.getValue("#use_yn", page) || "Y"
        };
    }

    function ensureListView() {
        var gridRoot = UX.qs("#userMgmtGrid", root());
        if (!gridRoot || listView) return;

        listView = Grid.createVirtualGrid({
            root: gridRoot,
            rowHeight: 56,
            overscan: 10,
            emptyHtml: "No Data",
            columns: [
                { label: "No.", width: "30px" },
                { label: "로그인 아이디", width: "160px" },
                { label: "사용자명", width: "160px" },
                { label: "사용여부", width: "90px" },
                { label: "실패", width: "90px" },
                { label: "잠금", width: "120px" },
                { label: "초기화여부", width: "110px" }
            ],
            renderRow: function (row, index) {
                var locked = row.lock_yn === "Y" ? "LOCK" : (row.lock_until_at ? "DELAY" : "-");
                var selectedClass = Number(row.user_seq) === selectedUserSeq() ? " is-selected" : "";
                return ""
                    + "<div class='vgrid-row" + selectedClass + "' data-user-seq='" + UX.esc(row.user_seq) + "'>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(index + 1) + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.login_id || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.user_nm || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell((row.use_yn || "Y") === "Y" ? "사용" : "미사용") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.login_fail_cnt || "0") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(locked) + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell((row.pwd_reset_yn || "N") === "Y" ? "예" : "아니오") + "</div>"
                    + "</div>";
            },
            onRendered: function () {
                UX.qsa(".vgrid-row[data-user-seq]", gridRoot).forEach(function (rowEl) {
                    rowEl.addEventListener("click", function () {
                        var userSeq = Number(rowEl.getAttribute("data-user-seq"));
                        setSelectedUserSeq(userSeq);
                        loadDetail(userSeq);
                    });
                });
            }
        });
    }

    function ensureListLoader() {
        if (listLoader || !listView || !Grid.createChunkLoader) return;
        listLoader = Grid.createChunkLoader({
            pageSize: 100,
            threshold: 140,
            getScrollElement: function () {
                return listView && listView.getBody ? listView.getBody() : null;
            },
            onData: function (result) {
                renderList(result.items || []);
            }
        });
    }

    function renderList(rows) {
        ensureListView();
        if (!listView) return;
        if (!rows.length) clearForm();
        listView.setItems(rows);
    }

    function loadList() {
        ensureListView();
        ensureListLoader();
        return app.callJson("/user/list.json", {
            keyword: UX.getValue("#userMgmtKeyword", root()),
            use_yn: UX.getValue("#userMgmtUseYn", root())
        }, function (data) {
            var rows = Array.isArray(data) ? data : [];
            if (listLoader) listLoader.replaceItems(rows);
            else renderList(rows.slice(0, 100));
        });
    }

    function loadDetail(userSeq) {
        return app.callJson("/user/detail.json", { user_seq: userSeq }, function (data) {
            if (data) {
                setSelectedUserSeq(userSeq);
                fillForm(data);
            }
        });
    }

    function saveUser() {
        var payload = collectForm();
        if (!payload.login_id) return global.alert("LOGIN_ID is required");
        if (!payload.user_nm) return global.alert("USER_NM is required");
        if (!payload.user_seq && !payload.user_pw) return global.alert("Password is required");

        app.callJson("/user/save.json", payload, function () {
            loadList().then(clearForm);
        });
    }

    function resetPassword() {
        var seq = UX.numOrNull(UX.getValue("#user_seq", root()));
        if (!seq) return global.alert("Select a user first");
        if (!global.confirm("Reset password to LOGIN_ID?")) return;

        app.callJson("/user/resetPassword.json", { user_seq: seq }, function () {
            loadDetail(seq);
            loadList();
        });
    }

    function unlockUser() {
        var seq = UX.numOrNull(UX.getValue("#user_seq", root()));
        if (!seq) return global.alert("Select a user first");

        app.callJson("/user/unlock.json", { user_seq: seq }, function () {
            loadDetail(seq);
            loadList();
        });
    }

    function deactivateUser() {
        var seq = UX.numOrNull(UX.getValue("#user_seq", root()));
        if (!seq) return global.alert("Select a user first");
        if (!global.confirm("Deactivate selected user?")) return;

        app.callJson("/user/delete.json", { user_seq: seq }, function () {
            loadList().then(clearForm);
        });
    }

    function bind() {
        var page = root();
        UX.bindOnce(UX.qs("#btnUserMgmtSearch", page), "click", loadList);
        UX.bindOnce(UX.qs("#btnUserMgmtNew", page), "click", clearForm);
        UX.bindOnce(UX.qs("#btnUserMgmtSave", page), "click", saveUser);
        UX.bindOnce(UX.qs("#btnUserMgmtResetPw", page), "click", resetPassword);
        UX.bindOnce(UX.qs("#btnUserMgmtUnlock", page), "click", unlockUser);
        UX.bindOnce(UX.qs("#btnUserMgmtDelete", page), "click", deactivateUser);

        var keyword = UX.qs("#userMgmtKeyword", page);
        if (keyword) {
            keyword.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    loadList();
                }
            });
        }
    }

    function init() {
        var page = root();
        if (!page) return;
        resetViews();
        bind();
        ensureListView();
        ensureListLoader();
        clearForm();
        loadList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/user/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
