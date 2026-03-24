(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;

    if (global.__NOTICE_PAGE_BOUND__) return;
    global.__NOTICE_PAGE_BOUND__ = true;

    var listView = null;
    var listLoader = null;

    function pageRoot() { return UX.qs("#noticePage") || document; }
    function formRoot() { return UX.qs("#noticeForm") || document; }

    function resetViews() {
        if (listView && typeof listView.destroy === "function") listView.destroy();
        if (listLoader && typeof listLoader.destroy === "function") listLoader.destroy();
        listView = null;
        listLoader = null;
    }

    function setSelectedNoticeSeq(seq) {
        pageRoot().dataset.selectedNoticeSeq = seq ? String(seq) : "";
        if (listView) listView.refresh();
    }

    function selectedNoticeSeq() {
        return UX.numOrNull(pageRoot().dataset.selectedNoticeSeq);
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
        setSelectedNoticeSeq(null);
        UX.setValue("#noti_seq", "", root);
        UX.setValue("#noti_type_cd", "", root);
        UX.setValue("#title", "", root);
        UX.setValue("#content", "", root);
        UX.setValue("#start_dt", "", root);
        UX.setValue("#end_dt", "", root);
        UX.setValue("#pin_yn", "N", root);
        UX.setValue("#popup_yn", "N", root);
        UX.setValue("#use_yn", "Y", root);
        UX.setValue("#view_cnt", "0", root);
    }

    function fillForm(row) {
        var root = formRoot();
        ["noti_seq", "noti_type_cd", "title", "content", "start_dt", "end_dt", "pin_yn", "popup_yn", "use_yn", "view_cnt"].forEach(function (key) {
            UX.setValue("#" + key, UX.value(row, [key], ""), root);
        });
        if (!UX.getValue("#pin_yn", root)) UX.setValue("#pin_yn", "N", root);
        if (!UX.getValue("#popup_yn", root)) UX.setValue("#popup_yn", "N", root);
        if (!UX.getValue("#use_yn", root)) UX.setValue("#use_yn", "Y", root);
        if (!UX.getValue("#view_cnt", root)) UX.setValue("#view_cnt", "0", root);
    }

    function collectFormParam() {
        var root = formRoot();
        var seq = UX.numOrNull(UX.getValue("#noti_seq", root));
        var param = {
            noti_type_cd: UX.strOrNull(UX.getValue("#noti_type_cd", root)),
            title: UX.strOrNull(UX.getValue("#title", root)),
            content: UX.strOrNull(UX.getValue("#content", root)),
            start_dt: UX.strOrNull(UX.getValue("#start_dt", root)),
            end_dt: UX.strOrNull(UX.getValue("#end_dt", root)),
            pin_yn: UX.getValue("#pin_yn", root) || "N",
            popup_yn: UX.getValue("#popup_yn", root) || "N",
            use_yn: UX.getValue("#use_yn", root) || "Y"
        };
        if (seq) param.noti_seq = seq;
        return param;
    }

    function ensureListView() {
        var tbody = UX.qs("#noticeListBody");
        if (!tbody || listView) return;
        listView = Grid.createVirtualTable({
            tbody: tbody,
            scroller: UX.qs("#noticeListWrap"),
            colCount: 8,
            rowHeight: 42,
            emptyHtml: "<tr><td colspan='8'>No Data</td></tr>",
            renderRow: function (row) {
                var seq = UX.value(row, ["noti_seq", "notiSeq"], "");
                var period = (UX.value(row, ["start_dt", "startDt"], "") || "") + (UX.value(row, ["end_dt", "endDt"], "") ? " ~ " + UX.value(row, ["end_dt", "endDt"], "") : "");
                var selectedClass = String(seq) === String(selectedNoticeSeq() || "") ? " class='notice-row selected'" : " class='notice-row'";
                return "<tr" + selectedClass + " data-noti-seq='" + UX.esc(seq) + "'>"
                    + "<td>" + Grid.textCell(seq) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["noti_type_cd", "notiTypeCd"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["title"], "")) + "</td>"
                    + "<td>" + Grid.textCell(period) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["pin_yn", "pinYn"], "") === "Y" ? "예" : "아니오") + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["popup_yn", "popupYn"], "") === "Y" ? "예" : "아니오") + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["view_cnt", "viewCnt"], 0)) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["use_yn", "useYn"], "") === "Y" ? "사용" : "미사용") + "</td>"
                    + "</tr>";
            },
            onRendered: function () {
                UX.qsa("tr.notice-row", tbody).forEach(function (tr) {
                    tr.addEventListener("click", function () {
                        var seq = UX.numOrNull(tr.getAttribute("data-noti-seq"));
                        if (!seq) return;
                        setSelectedNoticeSeq(seq);
                        app.callJson("/notice/detail.json", { noti_seq: seq }, function (data) {
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
                return UX.qs("#noticeListWrap");
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
        return app.callJson("/notice/list.json", {}, function (rows) {
            var list = Array.isArray(rows) ? rows : [];
            if (listLoader) listLoader.replaceItems(list);
            else renderTable(list.slice(0, 100));
        });
    }

    function saveNotice() {
        var param = collectFormParam();
        if (!param.title) return alert("제목은 필수입니다.");
        if (param.start_dt && param.end_dt && param.start_dt > param.end_dt) return alert("시작일은 종료일보다 늦을 수 없습니다.");
        app.callJson("/notice/save.json", param, function () {
            loadList();
            clearForm();
            alert("저장 완료");
        }).catch(function (e) { alert("저장 실패: " + (e && e.message ? e.message : e)); });
    }

    function deleteNotice() {
        var seq = UX.numOrNull(UX.getValue("#noti_seq", formRoot()));
        if (!seq) return alert("삭제할 공지를 선택하세요.");
        if (!confirm("삭제하시겠습니까?")) return;
        app.callJson("/notice/delete.json", { noti_seq: seq }, function () {
            loadList();
            clearForm();
            alert("삭제 완료");
        }).catch(function (e) { alert("삭제 실패: " + (e && e.message ? e.message : e)); });
    }

    function bind() {
        UX.bindOnce(UX.qs("#btnNoticeSearch"), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#btnNoticeSave"), "click", function (e) { e.preventDefault(); saveNotice(); });
        UX.bindOnce(UX.qs("#btnNoticeDelete"), "click", function (e) { e.preventDefault(); deleteNotice(); });
        UX.bindOnce(UX.qs("#btnNoticeNew"), "click", function (e) { e.preventDefault(); clearForm(); });
        UX.bindOnce(UX.qs("#btnNoticeRefresh"), "click", function (e) { e.preventDefault(); loadList(); });
    }

    function init() {
        if (!UX.qs("#noticeListBody")) return;
        resetViews();
        bind();
        applyPerm();
        ensureListView();
        ensureListLoader();
        clearForm();
        loadList();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/notice/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
