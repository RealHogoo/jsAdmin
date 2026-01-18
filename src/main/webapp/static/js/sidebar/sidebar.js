(function (global) {
    "use strict";

    // 중복 로드/초기화 방지
    if (global.__SIDEBAR_LOADED__) return;
    global.__SIDEBAR_LOADED__ = true;

    var loadedOnce = false;
    var inFlight = false;

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

    // sidebar.jspf에 id가 없더라도 동작하도록
    // 1) #sidebarMenu가 있으면 그걸 사용
    // 2) 없으면 기존 sidebar.jspf의 a[data-spa]가 들어있는 ul을 컨테이너로 사용
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
        var url = node.menuUrl; // 폴더면 null
        var children = Array.isArray(node.children) ? node.children : [];

        // app.js가 a[data-spa] 클릭을 공통 처리하므로 그 규칙에 맞춘다
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

    async function loadMenuTree() {
        var container = resolveContainer();
        if (!container) return;

        // 인증 전이면 호출하지 않음(불필요한 401/리다이렉트 방지)
        var token = "";
        try { token = localStorage.getItem("JWT") || ""; } catch (e) {}
        if (!token) {
            loadedOnce = false;
            clearMenu(container);
            return;
        }

        // app.js 로딩 전이면 조금 기다린다
        if (!global.jsAdminSpa || typeof global.jsAdminSpa.call !== "function") return;

        if (inFlight) return;
        inFlight = true;
        try {
            // ★ 중요: jsAdminSpa.call()은 표준응답 envelope가 아니라 data만 반환한다(app.js 기준)
            var tree = await global.jsAdminSpa.call("/menu/tree.json", {});
            if (!Array.isArray(tree)) tree = [];

            // 컨테이너가 ul이면 li만 넣어야 함
            if (container.tagName && container.tagName.toLowerCase() === "ul") {
                container.classList.add("menu-root");
                container.innerHTML = tree.map(renderNode).join("");
            } else {
                container.innerHTML = '<ul class="menu-root">' + tree.map(renderNode).join("") + "</ul>";
            }

            loadedOnce = true;
        } finally {
            inFlight = false;
        }
    }

    // 같은 탭에서 localStorage.setItem은 storage 이벤트가 안 뜸.
    // 그래서 "짧은 폴링"으로 토큰 생긴 시점에 1회 로드.
    function bootstrapAfterLogin() {
        var tries = 0;
        var maxTries = 80; // 80 * 250ms = 20초

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

    // 외부에서도 필요하면 호출 가능
    global.SIDEBAR_INIT = loadMenuTree;

    function init() {
        loadMenuTree();          // 토큰 이미 있으면 즉시 1회 호출
        bootstrapAfterLogin();   // 로그인 후 토큰 생기면 1회 호출
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

})(window);
