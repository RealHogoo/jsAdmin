(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__MY_PAGE_BOUND__) return;
    global.__MY_PAGE_BOUND__ = true;

    function root() {
        return UX.qs("#myPage");
    }

    function setMsg(text, ok) {
        var el = UX.qs("#myPageMsg", root());
        if (!el) return;
        el.textContent = text || "";
        el.style.color = ok ? "#166534" : "#b91c1c";
    }

    function clearPasswordForm() {
        UX.clearValues(["my_current_password", "my_new_password", "my_new_password_confirm"], root());
    }

    function fill(data) {
        var page = root();
        UX.setValue("#my_login_id", data && data.login_id, page);
        UX.setValue("#my_use_yn", data && data.use_yn, page);
        UX.setValue("#my_user_nm", data && data.user_nm, page);
        UX.setValue("#my_last_login_at", data && data.last_login_at, page);
        UX.setValue("#my_pwd_reset_yn", data && data.pwd_reset_yn, page);
    }

    function loadDetail() {
        return app.callJson("/mypage/detail.json", {}, function (data) {
            fill(data || {});
        });
    }

    function syncStoredUserName(userNm) {
        try {
            var user = JSON.parse(UX.localGet("LOGIN_USER", "{}"));
            user.user_nm = userNm;
            UX.localSet("LOGIN_USER", JSON.stringify(user));
            document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
        } catch (e) {}
    }

    function saveProfile() {
        var userNm = UX.getValue("#my_user_nm", root());
        if (!userNm) {
            setMsg("사용자명을 입력하세요.", false);
            return;
        }

        app.callJson("/mypage/save.json", { user_nm: userNm }, function () {
            setMsg("기본 정보가 저장되었습니다.", true);
            loadDetail();
            syncStoredUserName(userNm);
        });
    }

    function changePassword() {
        var currentPassword = UX.getValue("#my_current_password", root());
        var newPassword = UX.getValue("#my_new_password", root());
        var newPasswordConfirm = UX.getValue("#my_new_password_confirm", root());

        if (!currentPassword || !newPassword || !newPasswordConfirm) {
            setMsg("비밀번호 변경 항목을 모두 입력하세요.", false);
            return;
        }
        if (newPassword !== newPasswordConfirm) {
            setMsg("새 비밀번호와 확인 값이 일치하지 않습니다.", false);
            return;
        }

        app.callJson("/mypage/changePassword.json", {
            current_password: currentPassword,
            new_password: newPassword
        }, function () {
            clearPasswordForm();
            setMsg("비밀번호가 변경되었습니다.", true);
            loadDetail();
        });
    }

    function bind() {
        var page = root();
        UX.bindOnce(UX.qs("#btnMyPageSave", page), "click", saveProfile);
        UX.bindOnce(UX.qs("#btnMyPageChangePassword", page), "click", changePassword);
    }

    function init() {
        var page = root();
        if (!page || page.dataset.inited === "1") return;
        page.dataset.inited = "1";
        bind();
        loadDetail();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/mypage/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
