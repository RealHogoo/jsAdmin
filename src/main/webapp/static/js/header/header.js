(function () {
    "use strict";

    function hasToken() {
        try {
            var t = localStorage.getItem("JWT");
            return !!(t && t.trim().length > 0);
        } catch (e) {
            return false;
        }
    }

    function updateAuthButton() {
        var btn = document.getElementById("authBtn");
        if (!btn) return;

        if (hasToken()) {
            btn.textContent = "Logout";
            btn.setAttribute("data-action", "logout");
            btn.removeAttribute("data-spa");
        } else {
            btn.textContent = "Login";
            btn.removeAttribute("data-action");
            btn.setAttribute("data-spa", "/login.do");
        }
    }

    async function doLogout() {
        try { localStorage.removeItem("JWT"); } catch (e) {}
        try { localStorage.removeItem("LOGIN_USER"); } catch (e) {}

        // auth 변경 알림 (header.js 자체도 이 이벤트로 갱신)
        document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));

        // 로그인 화면으로 이동
        if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
            await window.jsAdminSpa.load("/login.do");
        }
    }

    // Logout 클릭 처리 (Login은 data-spa로 app.js가 처리)
    document.addEventListener("click", function (e) {
        var logoutA = e.target.closest("a[data-action='logout']");
        if (!logoutA) return;

        e.preventDefault();
        doLogout();
    });

    // app.js가 쏘는 공통 이벤트에 반응
    document.addEventListener("jsadmin:pageLoaded", function () {
        updateAuthButton();
    });
    document.addEventListener("jsadmin:authChanged", function () {
        updateAuthButton();
    });

    // 최초 1회
    try { updateAuthButton(); } catch (e) {}
})();
