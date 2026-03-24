(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;
    var listView = null;
    var listLoader = null;

    function pageRoot() {
        return UX.qs("#codePage") || document;
    }

    function formRoot() {
        return UX.qs("#codeForm") || document;
    }

    function resetViews() {
        if (listView && typeof listView.destroy === "function") listView.destroy();
        if (listLoader && typeof listLoader.destroy === "function") listLoader.destroy();
        listView = null;
        listLoader = null;
    }

    function setSelectedCodeSeq(codeSeq) {
        var page = pageRoot();
        page.dataset.selectedCodeSeq = codeSeq ? String(codeSeq) : "";
        if (listView) listView.refresh();
    }

    function selectedCodeSeq() {
        return UX.numOrNull(pageRoot().dataset.selectedCodeSeq);
    }

    function getPermLvl() {
        var lvl = pageRoot().getAttribute("data-perm-lvl");
        var num = UX.numOrNull(lvl);
        return num === null || num === 0 ? null : num;
    }

    function applyPerm() {
        var permLvl = getPermLvl();
        if (permLvl === null) return;

        UX.qsa("[data-perm-lvl]", pageRoot()).forEach(function (el) {
            var need = UX.numOrNull(el.getAttribute("data-perm-lvl"));
            if (need !== null) UX.setDisabled(el, permLvl < need);
        });
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

    function ensureListView() {
        var tbody = UX.qs("#codeListBody");
        if (!tbody || listView) return;

        listView = Grid.createVirtualTable({
            tbody: tbody,
            scroller: UX.qs("#codeListWrap"),
            colCount: 7,
            rowHeight: 42,
            emptyHtml: "<tr><td colspan='7'>No Data</td></tr>",
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
                        var rows = listView.getItems();
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

    function ensureListLoader() {
        if (listLoader || !listView || !Grid.createChunkLoader) return;
        listLoader = Grid.createChunkLoader({
            pageSize: 100,
            threshold: 120,
            getScrollElement: function () {
                return UX.qs("#codeListWrap");
            },
            onData: function (result) {
                renderTable(result.items || []);
            }
        });
    }

    function renderTable(list) {
        ensureListView();
        if (!listView) return;
        listView.setItems(list || []);
    }

    function loadList() {
        ensureListView();
        ensureListLoader();
        return app.callJson("/code/list.json", {}, function (rows) {
            var list = Array.isArray(rows) ? rows : [];
            if (listLoader) listLoader.replaceItems(list);
            else renderTable(list.slice(0, 100));
        });
    }

    function saveCode() {
        var param = collectFormParam();
        if (!param.code_grp_cd || !param.code_cd || !param.code_nm) {
            alert("Required fields are missing");
            return;
        }

        app.callJson("/code/save.json", param, function () {
            loadList().then(clearForm);
            alert("Saved");
        }).catch(function (e) {
            alert("Save failed: " + (e && e.message ? e.message : e));
        });
    }

    function deleteCode() {
        var codeSeq = UX.numOrNull(UX.getValue("#code_seq"));
        if (!codeSeq) {
            alert("Select a code first");
            return;
        }
        if (!confirm("Delete selected code?")) return;

        app.callJson("/code/delete.json", { code_seq: codeSeq }, function () {
            loadList().then(clearForm);
            alert("Deleted");
        }).catch(function (e) {
            alert("Delete failed: " + (e && e.message ? e.message : e));
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
        resetViews();
        bind();
        applyPerm();
        ensureListView();
        ensureListLoader();
        clearForm();
        loadList();
    }

    if (!global.__CODE_PAGELOADED_BOUND__) {
        global.__CODE_PAGELOADED_BOUND__ = true;
        document.addEventListener("jsadmin:pageLoaded", function (e) {
            if (e && e.detail && e.detail.url === "/code/main.do") init();
        });
    }

    try { init(); } catch (e) {}
})(window);
