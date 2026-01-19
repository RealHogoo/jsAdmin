(function (global) {
    "use strict";

    function qs(sel) { return document.querySelector(sel); }

    async function loadList() {
        // 메뉴관리 화면에만 있는 엘리먼트로 가드(다른 화면에서 오작동 방지)
        var tbody = qs("#menuListBody");
        if (!tbody) return;

        // jsAdminSpa.call은 data만 반환한다는 점 주의
        var list = await global.jsAdminSpa.call("/menu/list.json", {});
        if (!Array.isArray(list)) list = [];

        tbody.innerHTML = list.map(function (r) {
            return (
                "<tr>" +
                "<td>" + (r.menu_seq ?? "") + "</td>" +
                "<td>" + (r.up_menu_seq ?? "") + "</td>" +
                "<td>" + (r.menu_nm ?? "") + "</td>" +
                "<td>" + (r.menu_url ?? "") + "</td>" +
                "<td>" + (r.use_yn ?? "") + "</td>" +
                "</tr>"
            );
        }).join("");
    }

    // 1) SPA 조각 로딩 완료 시점에 init
    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/menu/main.do") {
            loadList();
        }
    });

    // 2) 안전망: 혹시 직접 렌더링된 경우도 대비
    try { loadList(); } catch (e) {}

})(window);
