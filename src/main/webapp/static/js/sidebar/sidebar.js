(function (global) {
    "use strict";

    var UX = global.UX;

    if (global.__SIDEBAR_LOADED__) return;
    global.__SIDEBAR_LOADED__ = true;

    var loadedOnce = false;
    var inFlight = false;
    var retryTimer = null;
    var activeSpaUrl = "";
    var menuTree = [];
    var MenuIconCatalog = global.MenuIconCatalog;

    function hasToken() {
        return !!(global.app && typeof global.app.getAuthState === "function" && global.app.getAuthState().user);
    }

    function toSpaUrl(url) {
        if (!url) return "";
        var s = String(url).trim();
        if (!s) return "";
        if (s.charAt(0) !== "/") s = "/" + s;
        if (s.toLowerCase().endsWith(".json")) {
            var segs = s.split("/").filter(Boolean);
            if (segs.length > 0) {
                return "/" + segs[0] + "/main.do";
            }
            return "/home.do";
        }
        return s;
    }

    function resolveContainer() {
        var el = UX.qs("#sidebarMenu");
        if (el) return el;

        var link = UX.qs("a[data-spa]");
        if (!link) return null;
        return link.closest("ul");
    }

    function renderNode(node) {
        var name = UX.esc(UX.value(node, ["menuNm", "menu_nm"], ""));
        var url = toSpaUrl(UX.value(node, ["menuUrl", "menu_url"], ""));
        var children = Array.isArray(UX.value(node, ["children"], [])) ? UX.value(node, ["children"], []) : [];
        var iconHtml = MenuIconCatalog && typeof MenuIconCatalog.render === "function"
            ? MenuIconCatalog.render(UX.value(node, ["iconClass", "icon_class"], ""))
            : "";

        var label = url
            ? '<a href="#" data-spa="' + UX.esc(url) + '">' + iconHtml + "<span class='menu-link-label'>" + name + "</span></a>"
            : "<span>" + iconHtml + "<span class='menu-link-label'>" + name + "</span></span>";

        var childrenHtml = children.length
            ? '<ul class="menu-children">' + children.map(renderNode).join("") + "</ul>"
            : "";

        return '<li class="menu-item" data-menu-seq="' + UX.esc(UX.value(node, ["menuSeq", "menu_seq"], "")) + '">' + label + childrenHtml + "</li>";
    }

    function normalizePageUrl(url) {
        if (!url) return "";
        var s = String(url).trim();
        if (!s) return "";
        if (s.charAt(0) !== "/") s = "/" + s;
        return s;
    }

    function findMenuPath(nodes, targetUrl, trail) {
        var list = Array.isArray(nodes) ? nodes : [];
        var prefix = Array.isArray(trail) ? trail : [];
        for (var i = 0; i < list.length; i++) {
            var node = list[i];
            var nextTrail = prefix.concat([UX.value(node, ["menuNm", "menu_nm"], "")]);
            var spaUrl = normalizePageUrl(toSpaUrl(UX.value(node, ["menuUrl", "menu_url"], "")));
            if (spaUrl && spaUrl === targetUrl) {
                return nextTrail;
            }
            var found = findMenuPath(node.children, targetUrl, nextTrail);
            if (found) return found;
        }
        return null;
    }

    function updatePageTitle(url) {
        var pageRoot = UX.qs(".page-root");
        var titleEl = UX.qs(".page-title");
        if (!pageRoot || !titleEl) return;

        var targetUrl = normalizePageUrl(url || pageRoot.getAttribute("data-page-url") || activeSpaUrl);
        if (!targetUrl) return;

        var path = findMenuPath(menuTree, targetUrl, []);
        if (!path || !path.length) return;

        titleEl.textContent = path.join(" > ");
        titleEl.classList.add("page-breadcrumb");
    }

    function clearMenu(container) {
        if (!container) return;
        container.innerHTML = "";
    }

    function hasRenderedMenu(container) {
        var el = container || resolveContainer();
        if (!el) return false;
        return !!el.querySelector("a[data-spa], .menu-item");
    }

    function scheduleReload(delay) {
        if (retryTimer) clearTimeout(retryTimer);
        retryTimer = setTimeout(function () {
            retryTimer = null;
            loadMenuTree();
        }, delay || 500);
    }

    function normalizeSpaUrl(url) {
        if (!url) return "";
        var s = String(url).trim();
        if (!s) return "";
        var q = s.indexOf("?");
        if (q >= 0) s = s.substring(0, q);
        if (s.charAt(0) !== "/") s = "/" + s;
        return s;
    }

    function markActive(url) {
        activeSpaUrl = normalizeSpaUrl(url);
        var links = UX.qsa("#sidebarMenu a[data-spa]");
        var matched = false;
        links.forEach(function (link) {
            var spa = normalizeSpaUrl(link.getAttribute("data-spa"));
            var active = !matched && !!activeSpaUrl && spa === activeSpaUrl;
            if (active) {
                matched = true;
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
                return;
            }
            link.classList.remove("is-active");
            link.removeAttribute("aria-current");
        });
    }

    function markActiveElement(el) {
        UX.qsa("#sidebarMenu a[data-spa]").forEach(function (link) {
            var active = link === el;
            if (active) {
                link.classList.add("is-active");
                link.setAttribute("aria-current", "page");
                activeSpaUrl = normalizeSpaUrl(link.getAttribute("data-spa"));
                return;
            }
            link.classList.remove("is-active");
            link.removeAttribute("aria-current");
        });
    }

    async function loadMenuTree() {
        var container = resolveContainer();
        if (!container || !global.jsAdminSpa || typeof global.jsAdminSpa.call !== "function" || inFlight) return;

        inFlight = true;
        try {
            var tree = await global.jsAdminSpa.call("/menu/tree.json", {});
            if (!Array.isArray(tree)) {
                loadedOnce = false;
                clearMenu(container);
                scheduleReload(700);
                return;
            }

            if (container.tagName && container.tagName.toLowerCase() === "ul") {
                container.classList.add("menu-root");
                container.innerHTML = tree.map(renderNode).join("");
            } else {
                container.innerHTML = '<ul class="menu-root">' + tree.map(renderNode).join("") + "</ul>";
            }

            menuTree = tree.slice();
            if (activeSpaUrl) markActive(activeSpaUrl);
            updatePageTitle(activeSpaUrl);

            loadedOnce = true;
            if (retryTimer) {
                clearTimeout(retryTimer);
                retryTimer = null;
            }
        } catch (e) {
            loadedOnce = false;
            if (!hasRenderedMenu(container)) clearMenu(container);
            try { console.warn("[sidebar] loadMenuTree failed", e); } catch (ignore) {}
            if (!global.__JSADMIN_AUTH_REDIRECTING) scheduleReload(900);
        } finally {
            inFlight = false;
        }
    }

    function bootstrapAfterLogin() {
        var tries = 0;
        var maxTries = 80;

        function tick() {
            tries += 1;
            if (loadedOnce) return;

            if (hasToken() && global.jsAdminSpa && typeof global.jsAdminSpa.call === "function") {
                loadMenuTree();
                return;
            }

            if (tries < maxTries) setTimeout(tick, 250);
        }

        setTimeout(tick, 0);
    }

    global.SIDEBAR_INIT = loadMenuTree;

    function init() {
        loadMenuTree();
        bootstrapAfterLogin();

        global.document.addEventListener("jsadmin:authChanged", function () {
            loadedOnce = false;
            menuTree = [];
            if (retryTimer) {
                clearTimeout(retryTimer);
                retryTimer = null;
            }
            loadMenuTree();
        });

        global.document.addEventListener("jsadmin:pageLoaded", function () {
            if (!loadedOnce || !hasRenderedMenu()) loadMenuTree();
        });

        global.document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (!url) return;
            markActive(url);
            updatePageTitle(url);
        });

        global.document.addEventListener("click", function (e) {
            var link = e.target && e.target.closest ? e.target.closest("#sidebarMenu a[data-spa]") : null;
            if (!link) return;
            markActiveElement(link);
        });
    }

    if (global.document.readyState === "loading") {
        global.document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})(window);
