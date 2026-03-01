(function (global) {
    "use strict";

    // 以묐났 濡쒕뱶/珥덇린??諛⑹?
    if (global.__SIDEBAR_LOADED__) return;
    global.__SIDEBAR_LOADED__ = true;

    var loadedOnce = false;
    var inFlight = false;
    var activeSpaUrl = "";

    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
            return ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;"
            })[m];
        });
    }

    function toSpaUrl(url) {
        if (!url) return "";
        var s = String(url).trim();
        if (!s) return "";
        if (s.charAt(0) !== "/") s = "/" + s;

        // 메뉴 URL에 API(.json)가 들어온 경우 화면 URL(.do)로 변환
        if (s.toLowerCase().endsWith(".json")) {
            var segs = s.split("/").filter(Boolean);
            if (segs.length > 0) {
                return "/" + segs[0] + "/main.do";
            }
            return "/home.do";
        }
        return s;
    }
    // sidebar.jspf??id媛 ?녿뜑?쇰룄 ?숈옉?섎룄濡?
    // 1) #sidebarMenu媛 ?덉쑝硫?洹멸구 ?ъ슜
    // 2) ?놁쑝硫?湲곗〈 sidebar.jspf??a[data-spa]媛 ?ㅼ뼱?덈뒗 ul??而⑦뀒?대꼫濡??ъ슜
    function resolveContainer() {
        var el = document.querySelector("#sidebarMenu");
        if (el) return el;

        var a = document.querySelector("a[data-spa]");
        if (a) {
            var ul = a.closest("ul");
            if (ul) return ul;
        }
        return null;
    }

    function renderNode(node) {
        var name = esc(node.menuNm);
        var url = toSpaUrl(node.menuUrl); // ?대뜑硫?null
        var children = Array.isArray(node.children) ? node.children : [];

        // app.js媛 a[data-spa] ?대┃??怨듯넻 泥섎━?섎?濡?洹?洹쒖튃??留욎텣??
        var label = url
            ? '<a href="#" data-spa="' + esc(url) + '">' + name + "</a>"
            : "<span>" + name + "</span>";

        var childrenHtml = "";
        if (children.length > 0) {
            childrenHtml = '<ul class="menu-children">' + children.map(renderNode).join("") + "</ul>";
        }

        return '<li class="menu-item" data-menu-seq="' + esc(node.menuSeq) + '">' + label + childrenHtml + "</li>";
    }

    function clearMenu(container) {
        if (!container) return;
        if (container.tagName && container.tagName.toLowerCase() === "ul") {
            container.innerHTML = "";
            return;
        }
        container.innerHTML = "";
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
        var links = document.querySelectorAll("#sidebarMenu a[data-spa]");
        var matched = false;
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            var spa = normalizeSpaUrl(a.getAttribute("data-spa"));
            var active = false;
            if (!matched && !!activeSpaUrl && spa === activeSpaUrl) {
                active = true;
                matched = true;
            }
            if (active) {
                a.classList.add("is-active");
                a.setAttribute("aria-current", "page");
            } else {
                a.classList.remove("is-active");
                a.removeAttribute("aria-current");
            }
        }
    }

    function markActiveElement(el) {
        var links = document.querySelectorAll("#sidebarMenu a[data-spa]");
        for (var i = 0; i < links.length; i++) {
            var a = links[i];
            var active = (a === el);
            if (active) {
                a.classList.add("is-active");
                a.setAttribute("aria-current", "page");
                activeSpaUrl = normalizeSpaUrl(a.getAttribute("data-spa"));
            } else {
                a.classList.remove("is-active");
                a.removeAttribute("aria-current");
            }
        }
    }

    async function loadMenuTree() {
        var container = resolveContainer();
        if (!container) return;

        // ?몄쬆 ?꾩씠硫??몄텧?섏? ?딆쓬(遺덊븘?뷀븳 401/由щ떎?대젆??諛⑹?)
        var token = "";
        try { token = localStorage.getItem("JWT") || ""; } catch (e) {}
        if (!token) {
            loadedOnce = false;
            clearMenu(container);
            return;
        }

        // app.js 濡쒕뵫 ?꾩씠硫?議곌툑 湲곕떎由곕떎
        if (!global.jsAdminSpa || typeof global.jsAdminSpa.call !== "function") return;

        if (inFlight) return;
        inFlight = true;
        try {
            // ??以묒슂: jsAdminSpa.call()? ?쒖??묐떟 envelope媛 ?꾨땲??data留?諛섑솚?쒕떎(app.js 湲곗?)
            var tree = await global.jsAdminSpa.call("/menu/tree.json", {});
            // 401 ?깆쑝濡?call()??null??諛섑솚??寃쎌슦:
            // 鍮?硫붾돱瑜?"?깃났"?쇰줈 ?뺤젙?섎㈃ 濡쒓렇???꾩뿉???ъ떆?꾧? 留됲옄 ???덉쓬
            if (!Array.isArray(tree)) {
                loadedOnce = false;
                clearMenu(container);
                return;
            }

            // 而⑦뀒?대꼫媛 ul?대㈃ li留??ｌ뼱????
            if (container.tagName && container.tagName.toLowerCase() === "ul") {
                container.classList.add("menu-root");
                container.innerHTML = tree.map(renderNode).join("");
            } else {
                container.innerHTML = '<ul class="menu-root">' + tree.map(renderNode).join("") + "</ul>";
            }

            if (activeSpaUrl) {
                markActive(activeSpaUrl);
            }

            loadedOnce = true;
        } finally {
            inFlight = false;
        }
    }

    // 媛숈? ??뿉??localStorage.setItem? storage ?대깽?멸? ????
    // 洹몃옒??"吏㏃? ?대쭅"?쇰줈 ?좏겙 ?앷릿 ?쒖젏??1??濡쒕뱶.
    function bootstrapAfterLogin() {
        var tries = 0;
        var maxTries = 80; // 80 * 250ms = 20珥?

        function tick() {
            tries++;

            if (loadedOnce) return;

            try {
                var token = localStorage.getItem("JWT");
                if (token && global.jsAdminSpa && typeof global.jsAdminSpa.call === "function") {
                    loadMenuTree();
                    return;
                }
            } catch (e) {}

            if (tries < maxTries) setTimeout(tick, 250);
        }

        setTimeout(tick, 0);
    }

    // ?몃??먯꽌???꾩슂?섎㈃ ?몄텧 媛??
    global.SIDEBAR_INIT = loadMenuTree;

    function init() {
        loadMenuTree();          // ?좏겙 ?대? ?덉쑝硫?利됱떆 1???몄텧
        bootstrapAfterLogin();   // 濡쒓렇?????좏겙 ?앷린硫?1???몄텧
        
        // 濡쒓렇??濡쒓렇?꾩썐 ?쒖젏??硫붾돱瑜?利됱떆 ?숆린??
        document.addEventListener("jsadmin:authChanged", function () {
            loadedOnce = false;
            loadMenuTree();
        });

        // ?붾㈃ ?꾪솚 ?꾩뿉???ъ씠?쒕컮 而⑦뀒?대꼫媛 ?ㅼ떆 洹몃젮吏????덉뼱 ?ы솗??
        document.addEventListener("jsadmin:pageLoaded", function () {
            if (!loadedOnce) loadMenuTree();
        });

        document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (url) markActive(url);
        });

        document.addEventListener("click", function (e) {
            var a = e.target && e.target.closest ? e.target.closest("#sidebarMenu a[data-spa]") : null;
            if (!a) return;
            markActiveElement(a);
        });
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})(window);

