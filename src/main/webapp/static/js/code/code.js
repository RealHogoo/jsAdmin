(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;
    var listCtrl = null;

    function pageRoot() {
        return UX.qs("#codePage") || document;
    }

    function formRoot() {
        return UX.qs("#codeForm") || document;
    }

    function setSelectedCodeSeq(codeSeq) {
        var page = pageRoot();
        if (!page || !page.dataset) return;
        page.dataset.selectedCodeSeq = codeSeq ? String(codeSeq) : "";
        if (listCtrl) listCtrl.refresh();
    }

    function selectedCodeSeq() {
        var page = pageRoot();
        return page && page.dataset ? UX.numOrNull(page.dataset.selectedCodeSeq) : null;
    }

    function fillForm(row) {
        var root = formRoot();
        UX.setValue("#code_seq", UX.value(row, ["code_seq", "codeSeq"], ""), root);
        UX.setValue("#code_grp_cd", UX.value(row, ["code_grp_cd", "codeGrpCd"], ""), root);
        UX.setValue("#code_cd", UX.value(row, ["code_cd", "codeCd"], ""), root);
        UX.setValue("#code_nm", UX.value(row, ["code_nm", "codeNm"], ""), root);
        UX.setValue("#code_desc", UX.value(row, ["code_desc", "codeDesc"], ""), root);
        UX.setValue("#sort_ord", UX.value(row, ["sort_ord", "sortOrd"], "0"), root);
        UX.setValue("#use_yn", UX.value(row, ["use_yn", "useYn"], "Y"), root);
    }

    function clearForm() {
        fillForm({});
        setSelectedCodeSeq(null);
        UX.setValue("#sort_ord", "0", formRoot());
        UX.setValue("#use_yn", "Y", formRoot());
    }

    function collectFormParam() {
        var root = formRoot();
        var codeSeq = UX.strOrNull(UX.getValue("#code_seq", root));
        var param = {
            code_seq: codeSeq ? Number(codeSeq) : null,
            code_grp_cd: UX.strOrNull(UX.getValue("#code_grp_cd", root)),
            code_cd: UX.strOrNull(UX.getValue("#code_cd", root)),
            code_nm: UX.strOrNull(UX.getValue("#code_nm", root)),
            code_desc: UX.strOrNull(UX.getValue("#code_desc", root)),
            sort_ord: UX.numOrNull(UX.getValue("#sort_ord", root)),
            use_yn: UX.strOrNull(UX.getValue("#use_yn", root)) || "Y"
        };

        if (param.code_seq === null) delete param.code_seq;
        if (param.sort_ord === null) param.sort_ord = 0;
        return param;
    }

    function createListView() {
        var tbody = UX.qs("#codeListBody");
        if (!tbody) return null;

        return Grid.createVirtualTable({
            tbody: tbody,
            colCount: 7,
            emptyHtml: "<tr><td colspan='7'>데이터가 없습니다.</td></tr>",
            renderRow: function (row, index) {
                var codeSeq = UX.value(row, ["code_seq", "codeSeq"], "");
                var selectedClass = String(codeSeq) === String(selectedCodeSeq() || "") ? " class='code-row selected'" : " class='code-row'";
                return ""
                    + "<tr" + selectedClass + " data-code-seq='" + UX.esc(codeSeq) + "'>"
                    + "<td>" + Grid.textCell(index + 1) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["code_grp_cd", "codeGrpCd"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["code_cd", "codeCd"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["code_nm", "codeNm"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["code_desc", "codeDesc"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["sort_ord", "sortOrd"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["use_yn", "useYn"], "") === "Y" ? "사용" : "미사용") + "</td>"
                    + "</tr>";
            },
            onRendered: function () {
                UX.qsa("tr.code-row", tbody).forEach(function (tr) {
                    tr.addEventListener("click", function () {
                        var codeSeq = tr.getAttribute("data-code-seq");
                        var rows = listCtrl && listCtrl.getView() ? listCtrl.getView().getItems() : [];
                        var found = rows.find(function (row) {
                            return String(UX.value(row, ["code_seq", "codeSeq"], "")) === String(codeSeq);
                        });
                        setSelectedCodeSeq(codeSeq);
                        if (found) fillForm(found);
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
        return app.callJson("/code/list.json", {}, function (rows) {
            listCtrl.replaceItems(Array.isArray(rows) ? rows : []);
        });
    }

    function saveCode() {
        var param = collectFormParam();
        if (!param.code_grp_cd || !param.code_cd || !param.code_nm) {
            alert("필수 항목을 입력하세요.");
            return;
        }

        app.callJson("/code/save.json", param, function () {
            loadList().then(clearForm);
            alert("저장 완료");
        }).catch(function (e) {
            alert("저장 실패: " + (e && e.message ? e.message : e));
        });
    }

    function deleteCode() {
        var codeSeq = UX.numOrNull(UX.getValue("#code_seq"));
        if (!codeSeq) {
            alert("코드를 먼저 선택하세요.");
            return;
        }
        if (!confirm("선택한 코드를 삭제하시겠습니까?")) return;

        app.callJson("/code/delete.json", { code_seq: codeSeq }, function () {
            loadList().then(clearForm);
            alert("삭제 완료");
        }).catch(function (e) {
            alert("삭제 실패: " + (e && e.message ? e.message : e));
        });
    }

    function bind() {
        UX.bindOnce(UX.qs("#btnCodeSearch"), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#btnCodeSave"), "click", function (e) { e.preventDefault(); saveCode(); });
        UX.bindOnce(UX.qs("#btnCodeDelete"), "click", function (e) { e.preventDefault(); deleteCode(); });
        UX.bindOnce(UX.qs("#btnCodeNew"), "click", function (e) { e.preventDefault(); clearForm(); });
        UX.bindOnce(UX.qs("#btnCodeRefresh"), "click", function (e) { e.preventDefault(); loadList(); });
    }

    function init() {
        if (!UX.qs("#codeListBody")) return;
        if (listCtrl) listCtrl.destroy();
        listCtrl = app.createChunkListController({
            pageSize: 100,
            threshold: 120,
            createView: createListView,
            getScrollElement: function () {
                return UX.qs("#codeListWrap");
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

    app.bindPage("__CODE_PAGE_BOUND_V2__", "/code/main.do", init);
})(window);
