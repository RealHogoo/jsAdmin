(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__TIMELINE_MAIN_BOUND__) return;
    global.__TIMELINE_MAIN_BOUND__ = true;

    function pageRoot() {
        return UX.qs("#timelinePage") || document;
    }

    function formRoot() {
        return UX.qs("#timelineForm") || document;
    }

    function applyPerm() {
        var permLvl = UX.numOrNull(pageRoot().getAttribute("data-perm-lvl"));
        if (!permLvl) return;
        UX.qsa("[data-perm-lvl]", pageRoot()).forEach(function (el) {
            var need = UX.numOrNull(el.getAttribute("data-perm-lvl"));
            if (need !== null) UX.setDisabled(el, permLvl < need);
        });
    }

    function clearForm() {
        var root = formRoot();
        UX.setValue("#timeline_seq", "", root);
        UX.setValue("#timeline_type_cd", "", root);
        UX.setValue("#title", "", root);
        UX.setValue("#content", "", root);
        UX.setValue("#event_dt", "", root);
        UX.setValue("#use_yn", "Y", root);
    }

    function fillForm(row) {
        var root = formRoot();
        ["timeline_seq", "timeline_type_cd", "title", "content", "event_dt", "use_yn"].forEach(function (key) {
            UX.setValue("#" + key, UX.value(row, [key], ""), root);
        });
        if (!UX.getValue("#use_yn", root)) UX.setValue("#use_yn", "Y", root);
    }

    function collectFormParam() {
        var root = formRoot();
        var seq = UX.numOrNull(UX.getValue("#timeline_seq", root));
        var param = {
            timeline_type_cd: UX.strOrNull(UX.getValue("#timeline_type_cd", root)),
            title: UX.strOrNull(UX.getValue("#title", root)),
            content: UX.strOrNull(UX.getValue("#content", root)),
            event_dt: UX.strOrNull(UX.getValue("#event_dt", root)),
            use_yn: UX.getValue("#use_yn", root) || "Y"
        };
        if (seq) param.timeline_seq = seq;
        return param;
    }

    function collectSearchParam() {
        return {
            event_dt_from: UX.strOrNull(UX.getValue("#event_dt_from")),
            event_dt_to: UX.strOrNull(UX.getValue("#event_dt_to")),
            title: UX.strOrNull(UX.getValue("#search_title"))
        };
    }

    function renderTable(list) {
        var tbody = UX.qs("#timelineListBody");
        if (!tbody) return;
        tbody.innerHTML = (list || []).map(function (row) {
            return "<tr class='timeline-row' data-timeline-seq='" + UX.esc(UX.value(row, ["timeline_seq", "timelineSeq"], "")) + "'>"
                + "<td>" + UX.esc(UX.value(row, ["timeline_seq", "timelineSeq"], "")) + "</td>"
                + "<td>" + UX.esc(UX.value(row, ["timeline_type_cd", "timelineTypeCd"], "")) + "</td>"
                + "<td>" + UX.esc(UX.value(row, ["title"], "")) + "</td>"
                + "<td>" + UX.esc(UX.value(row, ["event_dt", "eventDt"], "")) + "</td>"
                + "<td>" + UX.esc(UX.value(row, ["use_yn", "useYn"], "")) + "</td>"
                + "</tr>";
        }).join("");

        UX.qsa("tr.timeline-row", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                UX.qsa("tr.timeline-row.selected", tbody).forEach(function (row) { row.classList.remove("selected"); });
                tr.classList.add("selected");
                var seq = UX.numOrNull(tr.getAttribute("data-timeline-seq"));
                if (!seq) return;
                app.callJson("/timeline/detail.json", { timeline_seq: seq }, function (data) {
                    if (data) fillForm(data);
                }).catch(function (e) {
                    alert("상세 조회 실패: " + (e && e.message ? e.message : e));
                });
            });
        });
    }

    function loadList() {
        return app.callJson("/timeline/list.json", collectSearchParam(), function (rows) {
            renderTable(Array.isArray(rows) ? rows : []);
        });
    }

    function saveTimeline() {
        var param = collectFormParam();
        if (!param.title) return alert("제목은 필수입니다.");
        if (!param.event_dt) return alert("이벤트 일자는 필수입니다.");

        app.callJson("/timeline/save.json", param, function () {
            loadList();
            clearForm();
            alert("저장 완료");
        }).catch(function (e) {
            alert("저장 실패: " + (e && e.message ? e.message : e));
        });
    }

    function deleteTimeline() {
        var seq = UX.numOrNull(UX.getValue("#timeline_seq", formRoot()));
        if (!seq) return alert("삭제할 타임라인을 선택하세요.");
        if (!confirm("삭제하시겠습니까?")) return;

        app.callJson("/timeline/delete.json", { timeline_seq: seq }, function () {
            loadList();
            clearForm();
            alert("삭제 완료");
        }).catch(function (e) {
            alert("삭제 실패: " + (e && e.message ? e.message : e));
        });
    }

    function bind() {
        UX.bindOnce(UX.qs("#btnTimelineSearch"), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#btnTimelineSave"), "click", function (e) { e.preventDefault(); saveTimeline(); });
        UX.bindOnce(UX.qs("#btnTimelineDelete"), "click", function (e) { e.preventDefault(); deleteTimeline(); });
        UX.bindOnce(UX.qs("#btnTimelineNew"), "click", function (e) { e.preventDefault(); clearForm(); });
        UX.bindOnce(UX.qs("#btnTimelineRefresh"), "click", function (e) { e.preventDefault(); loadList(); });
    }

    function init() {
        if (!UX.qs("#timelineListBody")) return;
        bind();
        applyPerm();
        clearForm();
        loadList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/timeline/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
