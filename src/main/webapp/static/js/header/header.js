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

    function findBrandEl() {
        var byId = document.getElementById("brandHome");
        if (byId) return byId;

        var strongs = Array.prototype.slice.call(document.querySelectorAll("strong"));
        for (var i = 0; i < strongs.length; i++) {
            if (String(strongs[i].textContent || "").trim() === "jsAdmin") {
                return strongs[i];
            }
        }
        return null;
    }

    function bindBrandClick() {
        var el = findBrandEl();
        if (!el) return;
        if (el.dataset.brandBound === "1") return;

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
