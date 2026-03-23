(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;

    if (global.__USER_PAGE_BOUND__) return;
    global.__USER_PAGE_BOUND__ = true;

    var listView = null;

    function root() {
        return UX.qs("#userPage");
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
            rowHeight: 42,
            overscan: 10,
            emptyHtml: "No Data",
            columns: [
                { label: "번호", width: "80px" },
                { label: "로그인 아이디", width: "140px" },
                { label: "사용자명", width: "140px" },
                { label: "사용", width: "80px" },
                { label: "실패", width: "80px" },
                { label: "잠금", width: "90px" },
                { label: "초기화", width: "90px" }
            ],
            renderRow: function (row) {
                var locked = row.lock_yn === "Y" ? "LOCK" : (row.lock_until_at ? "DELAY" : "-");
                var selectedClass = Number(row.user_seq) === selectedUserSeq() ? " is-selected" : "";
                return ""
                    + "<div class='vgrid-row" + selectedClass + "' data-user-seq='" + UX.esc(row.user_seq) + "'>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.user_seq) + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.login_id) + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.user_nm) + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.use_yn || "Y") + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.login_fail_cnt || "0") + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(locked) + "</div>"
                    + "<div class='vgrid-cell'>" + UX.esc(row.pwd_reset_yn || "N") + "</div>"
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

    function renderList(rows) {
        ensureListView();
        if (!listView) return;
        if (!rows.length) clearForm();
        listView.setItems(rows);
    }

    function loadList() {
        return app.callJson("/user/list.json", {
            keyword: UX.getValue("#userMgmtKeyword", root()),
            use_yn: UX.getValue("#userMgmtUseYn", root())
        }, function (data) {
            renderList(Array.isArray(data) ? data : []);
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
        if (!payload.login_id) return alert("LOGIN_ID is required");
        if (!payload.user_nm) return alert("USER_NM is required");
        if (!payload.user_seq && !payload.user_pw) return alert("Password is required");

        app.callJson("/user/save.json", payload, function () {
            loadList().then(clearForm);
        });
    }

    function resetPassword() {
        var seq = UX.numOrNull(UX.getValue("#user_seq", root()));
        if (!seq) return alert("Select a user first");
        if (!confirm("Reset password to LOGIN_ID?")) return;

        app.callJson("/user/resetPassword.json", { user_seq: seq }, function () {
            loadDetail(seq);
            loadList();
        });
    }

    function unlockUser() {
        var seq = UX.numOrNull(UX.getValue("#user_seq", root()));
        if (!seq) return alert("Select a user first");

        app.callJson("/user/unlock.json", { user_seq: seq }, function () {
            loadDetail(seq);
            loadList();
        });
    }

    function deactivateUser() {
        var seq = UX.numOrNull(UX.getValue("#user_seq", root()));
        if (!seq) return alert("Select a user first");
        if (!confirm("Deactivate selected user?")) return;

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
        if (!page || page.dataset.inited === "1") return;
        page.dataset.inited = "1";
        bind();
        ensureListView();
        clearForm();
        loadList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/user/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
