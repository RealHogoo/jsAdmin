(function () {
    "use strict";

    var LABEL_LOGIN = "\uB85C\uADF8\uC778";
    var LABEL_LOGOUT = "\uB85C\uADF8\uC544\uC6C3";

    function getToken() {
        try {
            return localStorage.getItem("JWT") || "";
        } catch (e) {
            return "";
        }
    }

    function getLoginUser() {
        try {
            var raw = localStorage.getItem("LOGIN_USER");
            return raw ? JSON.parse(raw) : null;
        } catch (e) {
            return null;
        }
    }

    function hasToken() {
        return !!getToken().trim();
    }

    function updateAuthButton() {
        var btn = document.getElementById("authBtn");
        var myPageBtn = document.getElementById("myPageBtn");
        var userLabel = document.getElementById("authUserLabel");
        var loginUser = getLoginUser();

        if (!btn) return;

        if (hasToken()) {
            btn.textContent = LABEL_LOGOUT;
            btn.setAttribute("data-action", "logout");
            btn.removeAttribute("data-spa");
            btn.className = "header-chip header-chip-revoked";
            if (myPageBtn) {
                myPageBtn.className = "header-chip header-chip-expired";
                myPageBtn.style.display = "";
                myPageBtn.style.textDecoration = "none";
                myPageBtn.style.color = "#92400e";
                myPageBtn.style.background = "#fef3c7";
                myPageBtn.style.borderRadius = "999px";
                myPageBtn.style.padding = "5px 14px";
                myPageBtn.style.fontSize = "13px";
                myPageBtn.style.fontWeight = "700";
            }
            if (userLabel) {
                userLabel.textContent = loginUser && loginUser.user_nm
                    ? (loginUser.user_nm + " (" + (loginUser.user_id || "") + ")")
                    : (loginUser && loginUser.user_id ? loginUser.user_id : "");
            }
        } else {
            btn.textContent = LABEL_LOGIN;
            btn.removeAttribute("data-action");
            btn.setAttribute("data-spa", "/login.do");
            btn.className = "header-chip header-chip-active";
            if (myPageBtn) myPageBtn.style.display = "none";
            if (userLabel) userLabel.textContent = "";
        }
    }

    async function doLogout() {
        try {
            if (window.jsAdminSpa && typeof window.jsAdminSpa.call === "function") {
                await window.jsAdminSpa.call("/logout.json", {});
            }
        } catch (e) {}

        try { localStorage.removeItem("JWT"); } catch (e) {}
        try { localStorage.removeItem("LOGIN_USER"); } catch (e) {}
        try { localStorage.removeItem("LOGIN_SESSION_ID"); } catch (e) {}

        document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));

        if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
            await window.jsAdminSpa.load("/login.do");
        }
    }

    async function goMain() {
        if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
            await window.jsAdminSpa.load("/main.do");
            return;
        }
        window.location.href = "/main.do";
    }

    function bindBrandClick() {
        var el = document.getElementById("brandHome");
        if (!el || el.dataset.brandBound === "1") return;

        el.dataset.brandBound = "1";
        el.style.cursor = "pointer";
        el.addEventListener("click", function (e) {
            e.preventDefault();
            goMain();
        });
    }

    document.addEventListener("click", function (e) {
        var logoutA = e.target.closest("a[data-action='logout']");
        if (!logoutA) return;

        e.preventDefault();
        doLogout();
    });

    document.addEventListener("jsadmin:pageLoaded", function () {
        updateAuthButton();
        bindBrandClick();
    });

    document.addEventListener("jsadmin:authChanged", function () {
        updateAuthButton();
        bindBrandClick();
    });

    try {
        updateAuthButton();
        bindBrandClick();
    } catch (e) {}
})();
