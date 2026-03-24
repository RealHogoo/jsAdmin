(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;
    var MENU_TYPE_GROUP_CD = "MENU_TYPE";

    if (global.__MENU_PAGE_BOUND__) return;
    global.__MENU_PAGE_BOUND__ = true;

    var listView = null;
    var listLoader = null;

    function pageRoot() { return UX.qs("#menuPage") || document; }
    function formRoot() { return UX.qs("#menuForm") || document; }

    function resetViews() {
        if (listView && typeof listView.destroy === "function") listView.destroy();
        if (listLoader && typeof listLoader.destroy === "function") listLoader.destroy();
        listView = null;
        listLoader = null;
    }

    function setSelectedMenuSeq(menuSeq) {
        var page = pageRoot();
        page.dataset.selectedMenuSeq = menuSeq ? String(menuSeq) : "";
        if (listView) listView.refresh();
    }

    function selectedMenuSeq() {
        return UX.numOrNull(pageRoot().dataset.selectedMenuSeq);
    }

    function getPermLvl() {
        var level = UX.numOrNull(pageRoot().getAttribute("data-perm-lvl"));
        return !level ? null : level;
    }

    function applyPerm() {
        var permLvl = getPermLvl();
        if (permLvl === null) return;
        UX.qsa("[data-perm-lvl]", pageRoot()).forEach(function (el) {
            var need = UX.numOrNull(el.getAttribute("data-perm-lvl"));
            if (need !== null) UX.setDisabled(el, permLvl < need);
        });
    }

    function ensureSelectValue(selectEl, value) {
        if (!selectEl) return;
        var target = value == null ? "" : String(value);
        var exists = Array.prototype.some.call(selectEl.options, function (opt) { return opt.value === target; });
        if (!exists && target !== "") {
            var opt = document.createElement("option");
            opt.value = target;
            opt.textContent = target;
            selectEl.appendChild(opt);
        }
        selectEl.value = target;
    }

    function appendOption(selectEl, value, label) {
        if (!selectEl || !value) return;
        var exists = Array.prototype.some.call(selectEl.options, function (opt) { return opt.value === String(value); });
        if (exists) return;
        var opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label || value;
        selectEl.appendChild(opt);
    }

    function loadMenuTypeOptions() {
        var selectEl = UX.qs("#menu_type_cd", formRoot());
        if (!selectEl) return Promise.resolve();

        var currentValue = selectEl.value;
        selectEl.innerHTML = "";
        appendOption(selectEl, "", "선택");

        return app.callJson("/code/list.json", {}, function (rows) {
            (Array.isArray(rows) ? rows : [])
                .filter(function (row) {
                    return String(UX.value(row, ["code_grp_cd", "codeGrpCd"], "")).toUpperCase() === MENU_TYPE_GROUP_CD;
                })
                .sort(function (a, b) {
                    var ao = Number(UX.value(a, ["sort_ord", "sortOrd"], 0)) || 0;
                    var bo = Number(UX.value(b, ["sort_ord", "sortOrd"], 0)) || 0;
                    if (ao !== bo) return ao - bo;
                    return String(UX.value(a, ["code_cd", "codeCd"], "")).localeCompare(String(UX.value(b, ["code_cd", "codeCd"], "")));
                })
                .forEach(function (row) {
                    appendOption(selectEl, UX.value(row, ["code_cd", "codeCd"], ""), UX.value(row, ["code_nm", "codeNm"], ""));
                });
            ensureSelectValue(selectEl, currentValue);
        });
    }

    function fillForm(row) {
        var root = formRoot();
        UX.setValue("#menu_seq", UX.value(row, ["menu_seq", "menuSeq"], ""), root);
        UX.setValue("#up_menu_seq", UX.value(row, ["up_menu_seq", "upMenuSeq"], ""), root);
        UX.setValue("#menu_nm", UX.value(row, ["menu_nm", "menuNm"], ""), root);
        UX.setValue("#menu_url", UX.value(row, ["menu_url", "menuUrl"], ""), root);
        ensureSelectValue(UX.qs("#menu_type_cd", root), UX.value(row, ["menu_type_cd", "menuTypeCd"], ""));
        UX.setValue("#icon_class", UX.value(row, ["icon_class", "iconClass"], ""), root);
        UX.setValue("#sort_ord", UX.value(row, ["sort_ord", "sort_no", "sortNo"], ""), root);
        UX.setValue("#use_yn", UX.value(row, ["use_yn", "useYn"], "Y"), root);
    }

    function clearForm() {
        fillForm({});
        UX.setValue("#use_yn", "Y", formRoot());
        setSelectedMenuSeq(null);
    }

    function collectFormParam() {
        var root = formRoot();
        var menuSeq = UX.numOrNull(UX.getValue("#menu_seq", root));
        var upMenuSeq = UX.numOrNull(UX.getValue("#up_menu_seq", root));
        var param = {
            menu_seq: menuSeq,
            up_menu_seq: upMenuSeq,
            menu_nm: UX.strOrNull(UX.getValue("#menu_nm", root)),
            menu_url: UX.strOrNull(UX.getValue("#menu_url", root)),
            menu_type_cd: UX.strOrNull(UX.getValue("#menu_type_cd", root)),
            icon_class: UX.strOrNull(UX.getValue("#icon_class", root)),
            sort_ord: UX.numOrNull(UX.getValue("#sort_ord", root)) || 0,
            use_yn: UX.getValue("#use_yn", root) || "Y"
        };
        if (!param.menu_seq) delete param.menu_seq;
        if (!param.up_menu_seq) param.up_menu_seq = null;
        return param;
    }

    function collectSearchParam() {
        return { use_yn: UX.strOrNull(UX.getValue("#search_use_yn", pageRoot())) };
    }

    function ensureListView() {
        var tbody = UX.qs("#menuListBody");
        if (!tbody || listView) return;
        listView = Grid.createVirtualTable({
            tbody: tbody,
            scroller: UX.qs("#menuListWrap"),
            colCount: 8,
            rowHeight: 42,
            emptyHtml: "<tr><td colspan='8'>No Data</td></tr>",
            renderRow: function (row, index) {
                var menuSeq = UX.value(row, ["menu_seq", "menuSeq"], "");
                var selectedClass = String(menuSeq) === String(selectedMenuSeq() || "") ? " class='menu-row selected'" : " class='menu-row'";
                return "<tr" + selectedClass + " data-menu-seq='" + UX.esc(menuSeq) + "'>"
                    + "<td>" + Grid.textCell(index + 1) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["up_menu_seq", "upMenuSeq"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["menu_nm", "menuNm"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["menu_url", "menuUrl"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["menu_type_cd", "menuTypeCd"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["icon_class", "iconClass"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["sort_ord", "sort_no", "sortNo"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["use_yn", "useYn"], "") === "Y" ? "사용" : "미사용") + "</td>"
                    + "</tr>";
            },
            onRendered: function () {
                UX.qsa("tr.menu-row", tbody).forEach(function (tr) {
                    tr.addEventListener("click", function () {
                        var menuSeq = tr.getAttribute("data-menu-seq");
                        var found = listView.getItems().find(function (row) {
                            return String(UX.value(row, ["menu_seq", "menuSeq"], "")) === String(menuSeq);
                        });
                        setSelectedMenuSeq(menuSeq);
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
                return UX.qs("#menuListWrap");
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
        return app.callJson("/menu/list.json", collectSearchParam(), function (list) {
            var rows = Array.isArray(list) ? list : [];
            if (listLoader) listLoader.replaceItems(rows);
            else renderTable(rows.slice(0, 100));
        });
    }

    function refreshSidebar() {
        document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
        if (typeof global.SIDEBAR_INIT === "function") { try { global.SIDEBAR_INIT(); } catch (e) {} }
    }

    function saveMenu() {
        var param = collectFormParam();
        if (!param.menu_nm) return alert("메뉴명은 필수입니다.");
        app.callJson("/menu/save.json", param, function () {
            loadList();
            refreshSidebar();
            clearForm();
            alert("저장 완료");
        }).catch(function (e) { alert("저장 실패: " + (e && e.message ? e.message : e)); });
    }

    function deleteMenu() {
        var menuSeq = UX.numOrNull(UX.getValue("#menu_seq", formRoot()));
        if (!menuSeq) return alert("삭제할 메뉴를 선택하세요.");
        if (!confirm("삭제하시겠습니까?")) return;
        app.callJson("/menu/delete.json", { menu_seq: menuSeq }, function () {
            loadList();
            refreshSidebar();
            clearForm();
            alert("삭제 완료");
        }).catch(function (e) { alert("삭제 실패: " + (e && e.message ? e.message : e)); });
    }

    function bind() {
        UX.bindOnce(UX.qs("#btnSearch"), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#btnSave"), "click", function (e) { e.preventDefault(); saveMenu(); });
        UX.bindOnce(UX.qs("#btnDelete"), "click", function (e) { e.preventDefault(); deleteMenu(); });
        UX.bindOnce(UX.qs("#btnNew"), "click", function (e) { e.preventDefault(); clearForm(); });
        UX.bindOnce(UX.qs("#btnMenuRefresh"), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#search_use_yn"), "change", function () { loadList(); });
    }

    function init() {
        if (!UX.qs("#menuListBody")) return;
        resetViews();
        bind();
        applyPerm();
        ensureListView();
        ensureListLoader();
        loadMenuTypeOptions().then(function () { clearForm(); loadList(); });
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/menu/main.do") init();
    });

    try { init(); } catch (e) {}
})(window);
