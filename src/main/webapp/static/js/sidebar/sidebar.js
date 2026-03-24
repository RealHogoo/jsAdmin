(function (global) {
    "use strict";

    // 중복 로드/초기화 방지
    if (global.__SIDEBAR_LOADED__) return;
    global.__SIDEBAR_LOADED__ = true;

    var loadedOnce = false;
    var inFlight = false;
    var activeSpaUrl = "";
    var menuTree = [];

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

        // 메뉴 URL이 API(.json)인 경우 화면 URL(.do)로 변환
        if (s.toLowerCase().endsWith(".json")) {
            var segs = s.split("/").filter(Boolean);
            if (segs.length > 0) {
                return "/" + segs[0] + "/main.do";
            }
            return "/home.do";
        }
        return s;
    }

    // sidebar.jspf 구조가 달라도 컨테이너를 찾아 렌더링
    // 1) #sidebarMenu 우선 사용
    // 2) 없으면 a[data-spa]가 포함된 ul 사용
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
        var url = toSpaUrl(node.menuUrl);
        var children = Array.isArray(node.children) ? node.children : [];

        // app.js 규칙에 맞춰 a[data-spa] 링크 생성
        var label = url
            ? '<a href="#" data-spa="' + esc(url) + '">' + name + "</a>"
            : "<span>" + name + "</span>";

        var childrenHtml = "";
        if (children.length > 0) {
            childrenHtml = '<ul class="menu-children">' + children.map(renderNode).join("") + "</ul>";
        }

        return '<li class="menu-item" data-menu-seq="' + esc(node.menuSeq) + '">' + label + childrenHtml + "</li>";
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
            var nextTrail = prefix.concat([node.menuNm]);
            var spaUrl = normalizePageUrl(toSpaUrl(node.menuUrl));
            if (spaUrl && spaUrl === targetUrl) {
                return nextTrail;
            }
            var found = findMenuPath(node.children, targetUrl, nextTrail);
            if (found) return found;
        }
        return null;
    }

    function updatePageTitle(url) {
        var pageRoot = document.querySelector(".page-root");
        var titleEl = document.querySelector(".page-title");
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

        // 공통 SPA API 래퍼가 준비되지 않았으면 종료
        if (!global.jsAdminSpa || typeof global.jsAdminSpa.call !== "function") return;

        if (inFlight) return;
        inFlight = true;
        try {
            // jsAdminSpa.call()은 envelope가 아니라 data만 반환
            var tree = await global.jsAdminSpa.call("/menu/tree.json", {});

            // 비정상 응답이면 메뉴 비움
            if (!Array.isArray(tree)) {
                loadedOnce = false;
                clearMenu(container);
                return;
            }

            // 컨테이너가 ul이면 li만, 아니면 ul 래핑
            if (container.tagName && container.tagName.toLowerCase() === "ul") {
                container.classList.add("menu-root");
                container.innerHTML = tree.map(renderNode).join("");
            } else {
                container.innerHTML = '<ul class="menu-root">' + tree.map(renderNode).join("") + "</ul>";
            }

            menuTree = tree.slice();

            if (activeSpaUrl) {
                markActive(activeSpaUrl);
            }
            updatePageTitle(activeSpaUrl);

            loadedOnce = true;
        } finally {
            inFlight = false;
        }
    }

    // 같은 탭에서는 storage 이벤트가 발생하지 않아서 짧은 폴링으로 로그인 직후 1회 로드
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

    // 외부에서 메뉴 재로딩이 필요할 때 사용
    global.SIDEBAR_INIT = loadMenuTree;

    function init() {
        loadMenuTree();
        bootstrapAfterLogin();

        // 권한 변경 저장 후 즉시 메뉴 동기화
        document.addEventListener("jsadmin:authChanged", function () {
            loadedOnce = false;
            loadMenuTree();
        });

        // 화면 전환 시 컨테이너 재렌더링 대비
        document.addEventListener("jsadmin:pageLoaded", function () {
            if (!loadedOnce) loadMenuTree();
        });

        document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (url) {
                markActive(url);
                updatePageTitle(url);
            }
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
