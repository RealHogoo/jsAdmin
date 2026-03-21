(function (global) {
    "use strict";

    if (global.__USER_PAGE_BOUND__) return;
    global.__USER_PAGE_BOUND__ = true;

    function qs(sel, root) { return (root || document).querySelector(sel); }
    function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    function root() { return qs("#userPage"); }

    function esc(v) {
        if (v === null || v === undefined) return "";
        return String(v)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function api(url, body) {
        return global.jsAdminSpa.call(url, body || {});
    }

    function normalize(v) {
        if (v === null || v === undefined) return "";
        return String(v).trim();
    }

    function clearForm() {
        ["user_seq", "login_id", "user_nm", "user_pw", "login_fail_cnt", "lock_yn", "lock_until_at", "pwd_reset_yn", "last_login_at"].forEach(function (id) {
            var el = qs("#" + id, root());
            if (el) el.value = "";
        });
        var useYn = qs("#use_yn", root());
        if (useYn) useYn.value = "Y";
    }

    function fillForm(row) {
        qs("#user_seq", root()).value = row.user_seq || "";
        qs("#login_id", root()).value = row.login_id || "";
        qs("#user_nm", root()).value = row.user_nm || "";
        qs("#user_pw", root()).value = "";
        qs("#use_yn", root()).value = row.use_yn || "Y";
        qs("#login_fail_cnt", root()).value = row.login_fail_cnt || "0";
        qs("#lock_yn", root()).value = row.lock_yn || "N";
        qs("#lock_until_at", root()).value = row.lock_until_at || "";
        qs("#pwd_reset_yn", root()).value = row.pwd_reset_yn || "N";
        qs("#last_login_at", root()).value = row.last_login_at || "";
    }

    function collectForm() {
        var seq = normalize(qs("#user_seq", root()).value);
        return {
            user_seq: seq ? Number(seq) : null,
            login_id: normalize(qs("#login_id", root()).value),
            user_nm: normalize(qs("#user_nm", root()).value),
            user_pw: normalize(qs("#user_pw", root()).value),
            use_yn: normalize(qs("#use_yn", root()).value) || "Y"
        };
    }

    function renderList(rows) {
        var tbody = qs("#userMgmtListBody", root());
        if (!tbody) return;
        if (!rows.length) {
            tbody.innerHTML = "<tr><td colspan='7'>데이터가 없습니다.</td></tr>";
            clearForm();
            return;
        }

        tbody.innerHTML = rows.map(function (row) {
            var locked = row.lock_yn === "Y" ? "잠금" : (row.lock_until_at ? "지연" : "-");
            return ""
                + "<tr data-user-seq='" + esc(row.user_seq) + "'>"
                + "<td>" + esc(row.user_seq) + "</td>"
                + "<td>" + esc(row.login_id) + "</td>"
                + "<td>" + esc(row.user_nm) + "</td>"
                + "<td>" + esc(row.use_yn || "Y") + "</td>"
                + "<td>" + esc(row.login_fail_cnt || "0") + "</td>"
                + "<td>" + esc(locked) + "</td>"
                + "<td>" + esc(row.pwd_reset_yn || "N") + "</td>"
                + "</tr>";
        }).join("");

        qsa("tr[data-user-seq]", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                qsa("tr", tbody).forEach(function (row) { row.classList.remove("is-selected"); });
                tr.classList.add("is-selected");
                loadDetail(Number(tr.getAttribute("data-user-seq")));
            });
        });
    }

    async function loadList() {
        var data = await api("/user/list.json", {
            keyword: normalize(qs("#userMgmtKeyword", root()).value),
            use_yn: normalize(qs("#userMgmtUseYn", root()).value)
        });
        renderList(Array.isArray(data) ? data : []);
    }

    async function loadDetail(userSeq) {
        var data = await api("/user/detail.json", { user_seq: userSeq });
        if (data) fillForm(data);
    }

    async function saveUser() {
        var payload = collectForm();
        if (!payload.login_id) {
            alert("로그인 아이디를 입력하세요.");
            return;
        }
        if (!payload.user_nm) {
            alert("사용자명을 입력하세요.");
            return;
        }
        if (!payload.user_seq && !payload.user_pw) {
            alert("신규 등록 시 비밀번호가 필요합니다.");
            return;
        }
        await api("/user/save.json", payload);
        await loadList();
        clearForm();
    }

    async function resetPassword() {
        var seq = normalize(qs("#user_seq", root()).value);
        if (!seq) {
            alert("비밀번호를 초기화할 사용자를 선택하세요.");
            return;
        }
        if (!confirm("비밀번호를 로그인 아이디와 동일하게 초기화하시겠습니까?")) return;
        await api("/user/resetPassword.json", { user_seq: Number(seq) });
        await loadDetail(Number(seq));
        await loadList();
    }

    async function unlockUser() {
        var seq = normalize(qs("#user_seq", root()).value);
        if (!seq) {
            alert("잠금 해제할 사용자를 선택하세요.");
            return;
        }
        await api("/user/unlock.json", { user_seq: Number(seq) });
        await loadDetail(Number(seq));
        await loadList();
    }

    async function deactivateUser() {
        var seq = normalize(qs("#user_seq", root()).value);
        if (!seq) {
            alert("비활성화할 사용자를 선택하세요.");
            return;
        }
        if (!confirm("선택한 사용자를 비활성화하시겠습니까?")) return;
        await api("/user/delete.json", { user_seq: Number(seq) });
        await loadList();
        clearForm();
    }

    function bind() {
        qs("#btnUserMgmtSearch", root()).addEventListener("click", function () { loadList(); });
        qs("#btnUserMgmtNew", root()).addEventListener("click", function () { clearForm(); });
        qs("#btnUserMgmtSave", root()).addEventListener("click", function () { saveUser(); });
        qs("#btnUserMgmtResetPw", root()).addEventListener("click", function () { resetPassword(); });
        qs("#btnUserMgmtUnlock", root()).addEventListener("click", function () { unlockUser(); });
        qs("#btnUserMgmtDelete", root()).addEventListener("click", function () { deactivateUser(); });

        var keyword = qs("#userMgmtKeyword", root());
        if (keyword) {
            keyword.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    loadList();
                }
            });
        }
    }

    async function init() {
        var page = root();
        if (!page) return;
        if (page.dataset.inited === "1") return;
        page.dataset.inited = "1";
        bind();
        clearForm();
        await loadList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/user/main.do") {
            init();
        }
    });

    try { init(); } catch (e) {}
})(window);
