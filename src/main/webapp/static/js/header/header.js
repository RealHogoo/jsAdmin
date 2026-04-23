(function (global) {
    "use strict";

    var UX = global.UX;
    var LABEL_LOGIN = "\uB85C\uADF8\uC778";
    var LABEL_LOGOUT = "\uB85C\uADF8\uC544\uC6C3";

    function getLoginUser() {
        return global.app && typeof global.app.getAuthState === "function"
            ? global.app.getAuthState().user
            : null;
    }

    function hasLoginState() {
        var user = getLoginUser();
        return !!(user && user.user_id);
    }

    function updateAuthButton() {
        var btn = UX.byId("authBtn");
        var myPageBtn = UX.byId("myPageBtn");
        var userLabel = UX.byId("authUserLabel");
        var loginUser = getLoginUser();

        if (!btn) return;

        if (hasLoginState()) {
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
            return;
        }

        btn.textContent = LABEL_LOGIN;
        btn.removeAttribute("data-action");
        btn.setAttribute("data-spa", "/login.do");
        btn.className = "header-chip header-chip-active";
        if (myPageBtn) myPageBtn.style.display = "none";
        if (userLabel) userLabel.textContent = "";
    }

    async function syncAuthState(url) {
        var targetUrl = String(url || "").trim();
        var onHome = targetUrl === "/home.do" || targetUrl === "/" || !targetUrl;

        if (!onHome) {
            updateAuthButton();
            return;
        }

        if (global.app && typeof global.app.verifyAuth === "function") {
            var valid = await global.app.verifyAuth();
            if (!valid) {
                updateAuthButton();
                return;
            }
        }

        if (global.app && typeof global.app.syncAuthProfile === "function") {
            await global.app.syncAuthProfile();
        }

        updateAuthButton();
    }

    async function doLogout() {
        try {
            if (global.jsAdminSpa && typeof global.jsAdminSpa.call === "function") {
                await global.jsAdminSpa.call("/logout.json", {});
            }
        } catch (e) {}

        if (global.app && typeof global.app.clearAuthState === "function") {
            global.app.clearAuthState();
        }

        if (global.jsAdminSpa && typeof global.jsAdminSpa.load === "function") {
            await global.jsAdminSpa.load("/login.do");
        }
    }

    async function goMain() {
        if (global.jsAdminSpa && typeof global.jsAdminSpa.load === "function") {
            await global.jsAdminSpa.load("/home.do");
            return;
        }
        global.location.href = "/";
    }

    function bindBrandClick() {
        var el = UX.byId("brandHome");
        if (!el || el.dataset.brandBound === "1") return;

        el.dataset.brandBound = "1";
        el.style.cursor = "pointer";
        el.addEventListener("click", function (e) {
            e.preventDefault();
            goMain();
        });
    }

    global.document.addEventListener("click", function (e) {
        var logoutA = e.target.closest("a[data-action='logout']");
        if (!logoutA) return;

        e.preventDefault();
        doLogout();
    });

    global.document.addEventListener("jsadmin:pageLoaded", function (e) {
        syncAuthState(e && e.detail ? e.detail.url : "");
        bindBrandClick();
    });

    global.document.addEventListener("jsadmin:authChanged", function () {
        updateAuthButton();
        bindBrandClick();
    });

    try {
        syncAuthState("");
        bindBrandClick();
    } catch (e) {}
})(window);
