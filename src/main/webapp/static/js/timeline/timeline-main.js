(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;
    var listCtrl = null;

    function pageRoot() { return UX.qs("#timelinePage") || document; }
    function formRoot() { return UX.qs("#timelineForm") || document; }

    function setSelectedTimelineSeq(seq) {
        var page = pageRoot();
        if (!page || !page.dataset) return;
        page.dataset.selectedTimelineSeq = seq ? String(seq) : "";
        if (listCtrl) listCtrl.refresh();
    }

    function selectedTimelineSeq() {
        var page = pageRoot();
        return page && page.dataset ? UX.numOrNull(page.dataset.selectedTimelineSeq) : null;
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

    function createListView() {
        var tbody = UX.qs("#timelineListBody");
        if (!tbody) return null;

        return Grid.createVirtualTable({
            tbody: tbody,
            colCount: 5,
            emptyHtml: "<tr><td colspan='5'>데이터가 없습니다.</td></tr>",
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
                        }).catch(function (e) {
                            alert("상세 조회 실패: " + (e && e.message ? e.message : e));
                        });
                    });
                });
            }
        });
    }

    function renderTable(list) {
        var listView = listCtrl && listCtrl.ensureView();
        if (listView) listView.setItems(list || []);
    }

    function loadList() {
        return app.callJson("/timeline/list.json", collectSearchParam(), function (rows) {
            listCtrl.replaceItems(Array.isArray(rows) ? rows : []);
        });
    }

    function saveTimeline() {
        var param = collectFormParam();
        if (!param.title) return alert("제목은 필수입니다.");
        if (!param.event_dt) return alert("이벤트 날짜는 필수입니다.");

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
        app.bindEnterAction(UX.qs("#search_title"), loadList);
    }

    function init() {
        if (!UX.qs("#timelineListBody")) return;
        if (listCtrl) listCtrl.destroy();
        listCtrl = app.createChunkListController({
            pageSize: 100,
            threshold: 120,
            createView: createListView,
            getScrollElement: function () {
                return UX.qs("#timelineListWrap");
            },
            applyItems: function (_view, items) {
                renderTable(items);
            }
        });

        bind();
        app.applyPermission(pageRoot());
        listCtrl.ensureView();
        listCtrl.ensureLoader();
        clearForm();
        loadList();
    }

    app.bindPage("__TIMELINE_MAIN_BOUND_V2__", "/timeline/main.do", init);
})(window);
