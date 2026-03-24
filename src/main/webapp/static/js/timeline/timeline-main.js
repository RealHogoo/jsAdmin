(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;

    if (global.__TIMELINE_MAIN_BOUND__) return;
    global.__TIMELINE_MAIN_BOUND__ = true;

    var listView = null;
    var listLoader = null;

    function pageRoot() { return UX.qs("#timelinePage") || document; }
    function formRoot() { return UX.qs("#timelineForm") || document; }

    function resetViews() {
        if (listView && typeof listView.destroy === "function") listView.destroy();
        if (listLoader && typeof listLoader.destroy === "function") listLoader.destroy();
        listView = null;
        listLoader = null;
    }

    function setSelectedTimelineSeq(seq) {
        pageRoot().dataset.selectedTimelineSeq = seq ? String(seq) : "";
        if (listView) listView.refresh();
    }

    function selectedTimelineSeq() {
        return UX.numOrNull(pageRoot().dataset.selectedTimelineSeq);
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
        setSelectedTimelineSeq(null);
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

    function ensureListView() {
        var tbody = UX.qs("#timelineListBody");
        if (!tbody || listView) return;
        listView = Grid.createVirtualTable({
            tbody: tbody,
            scroller: UX.qs("#timelineListWrap"),
            colCount: 5,
            rowHeight: 42,
            emptyHtml: "<tr><td colspan='5'>No Data</td></tr>",
            renderRow: function (row, index) {
                var seq = UX.value(row, ["timeline_seq", "timelineSeq"], "");
                var selectedClass = String(seq) === String(selectedTimelineSeq() || "") ? " class='timeline-row selected'" : " class='timeline-row'";
                return "<tr" + selectedClass + " data-timeline-seq='" + UX.esc(seq) + "'>"
                    + "<td>" + Grid.textCell(index + 1) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["timeline_type_cd", "timelineTypeCd"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["title"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["event_dt", "eventDt"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["use_yn", "useYn"], "") === "Y" ? "사용" : "미사용") + "</td>"
                    + "</tr>";
            },
            onRendered: function () {
                UX.qsa("tr.timeline-row", tbody).forEach(function (tr) {
                    tr.addEventListener("click", function () {
                        var seq = UX.numOrNull(tr.getAttribute("data-timeline-seq"));
                        if (!seq) return;
                        setSelectedTimelineSeq(seq);
                        app.callJson("/timeline/detail.json", { timeline_seq: seq }, function (data) {
                            if (data) fillForm(data);
                        }).catch(function (e) { alert("상세 조회 실패: " + (e && e.message ? e.message : e)); });
                    });
                });
            }
        });
    }

    function ensureListLoader() {
        if (listLoader || !listView || !Grid.createChunkLoader) return;
        listLoader = Grid.createChunkLoader({
            pageSize: 100,
            threshold: 120,
            getScrollElement: function () {
                return UX.qs("#timelineListWrap");
            },
            onData: function (result) {
                renderTable(result.items || []);
            }
        });
    }

    function renderTable(list) { ensureListView(); if (listView) listView.setItems(list || []); }

    function loadList() {
        ensureListView();
        ensureListLoader();
        return app.callJson("/timeline/list.json", collectSearchParam(), function (rows) {
            var list = Array.isArray(rows) ? rows : [];
            if (listLoader) listLoader.replaceItems(list);
            else renderTable(list.slice(0, 100));
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
        }).catch(function (e) { alert("저장 실패: " + (e && e.message ? e.message : e)); });
    }

    function deleteTimeline() {
        var seq = UX.numOrNull(UX.getValue("#timeline_seq", formRoot()));
        if (!seq) return alert("삭제할 타임라인을 선택하세요.");
        if (!confirm("삭제하시겠습니까?")) return;
        app.callJson("/timeline/delete.json", { timeline_seq: seq }, function () {
            loadList();
            clearForm();
            alert("삭제 완료");
        }).catch(function (e) { alert("삭제 실패: " + (e && e.message ? e.message : e)); });
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
        resetViews();
        bind();
        applyPerm();
        ensureListView();
        ensureListLoader();
        clearForm();
        loadList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/timeline/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
