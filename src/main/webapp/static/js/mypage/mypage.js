(function (global) {
    "use strict";

    if (global.__MY_PAGE_BOUND__) return;
    global.__MY_PAGE_BOUND__ = true;

    function qs(sel, root) { return (root || document).querySelector(sel); }
    function root() { return qs("#myPage"); }

    function api(url, body) {
        return global.jsAdminSpa.call(url, body || {});
    }

    function val(id) {
        var el = qs("#" + id, root());
        return el ? String(el.value || "").trim() : "";
    }

    function setValue(id, value) {
        var el = qs("#" + id, root());
        if (el) el.value = value == null ? "" : value;
    }

    function setMsg(text, ok) {
        var el = qs("#myPageMsg", root());
        if (!el) return;
        el.textContent = text || "";
        el.style.color = ok ? "#166534" : "#b91c1c";
    }

    function clearPasswordForm() {
        setValue("my_current_password", "");
        setValue("my_new_password", "");
        setValue("my_new_password_confirm", "");
    }

    function fill(data) {
        setValue("my_login_id", data && data.login_id);
        setValue("my_use_yn", data && data.use_yn);
        setValue("my_user_nm", data && data.user_nm);
        setValue("my_last_login_at", data && data.last_login_at);
        setValue("my_pwd_reset_yn", data && data.pwd_reset_yn);
    }

    async function loadDetail() {
        var data = await api("/mypage/detail.json", {});
        fill(data || {});
    }

    async function saveProfile() {
        var userNm = val("my_user_nm");
        if (!userNm) {
            setMsg("사용자명을 입력하세요.", false);
            return;
        }
        await api("/mypage/save.json", { user_nm: userNm });
        setMsg("기본 정보가 저장되었습니다.", true);
        await loadDetail();
        syncStoredUserName(userNm);
    }

    async function changePassword() {
        var currentPassword = val("my_current_password");
        var newPassword = val("my_new_password");
        var newPasswordConfirm = val("my_new_password_confirm");

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            setMsg("비밀번호 변경 항목을 모두 입력하세요.", false);
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setMsg("새 비밀번호와 확인 값이 일치하지 않습니다.", false);
            return;
        }

        await api("/mypage/changePassword.json", {
            current_password: currentPassword,
            new_password: newPassword
        });
        clearPasswordForm();
        setMsg("비밀번호가 변경되었습니다.", true);
        await loadDetail();
    }

    function syncStoredUserName(userNm) {
        try {
            var raw = localStorage.getItem("LOGIN_USER");
            var user = raw ? JSON.parse(raw) : {};
            user.user_nm = userNm;
            localStorage.setItem("LOGIN_USER", JSON.stringify(user));
            document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
        } catch (e) {}
    }

    function bind() {
        qs("#btnMyPageSave", root()).addEventListener("click", function () { saveProfile(); });
        qs("#btnMyPageChangePassword", root()).addEventListener("click", function () { changePassword(); });
    }

    async function init() {
        var page = root();
        if (!page) return;
        if (page.dataset.inited === "1") return;
        page.dataset.inited = "1";
        bind();
        await loadDetail();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/mypage/main.do") {
            init();
        }
    });

    try { init(); } catch (e) {}
})(window);
