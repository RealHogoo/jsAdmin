(function (global) {
    "use strict";

    if (global.__CODE_JS_LOADED__) return;
    global.__CODE_JS_LOADED__ = true;

    function qs(sel) { return document.querySelector(sel); }
    function esc(s) {
        return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) {
            return ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[m];
        });
    }

    async function loadList() {
        var tbody = qs("#codeListBody");
        if (!tbody) return;

        // jsAdminSpa.call이 표준응답을 그대로 주는지 / data만 주는지 혼선 방지용
        var resp = await global.jsAdminSpa.call("/code/list.json", {});
        var rows;

        if (resp && resp.ok === true) rows = Array.isArray(resp.data) ? resp.data : [];
        else if (Array.isArray(resp)) rows = resp;
        else rows = [];

        tbody.innerHTML = rows.map(function (r) {
            // 너가 map 키 소문자 인터셉터를 깔아뒀으면 code_seq로 들어올 수도 있고,
            // 지금처럼 jackson이 camel로 바꾸면 codeSeq일 수도 있음 → 둘 다 방어
            var codeSeq = r.code_seq ?? r.codeSeq ?? "";
            var grp = r.code_grp_cd ?? r.codeGrpCd ?? "";
            var cd = r.code_cd ?? r.codeCd ?? "";
            var nm = r.code_nm ?? r.codeNm ?? "";
            var sort = r.sort_ord ?? r.sortOrd ?? "";
            var useYn = r.use_yn ?? r.useYn ?? "";

            return (
                "<tr>" +
                "<td>" + esc(codeSeq) + "</td>" +
                "<td>" + esc(grp) + "</td>" +
                "<td>" + esc(cd) + "</td>" +
                "<td>" + esc(nm) + "</td>" +
                "<td>" + esc(sort) + "</td>" +
                "<td>" + esc(useYn) + "</td>" +
                "</tr>"
            );
        }).join("");
    }

    global.CODE_INIT = function () {
        var btn = qs("#btnCodeRefresh");
        if (btn && !btn.__bound__) {
            btn.__bound__ = true;
            btn.addEventListener("click", loadList);
        }
        loadList();
    };

    // SPA 조각 로딩 완료 이벤트 기반 init (너희 app.js가 jsadmin:pageLoaded 쏘는 방식)
    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
		if (url && url.endsWith("/code/main.do")) {
            global.CODE_INIT();
        }
    });

})(window);
