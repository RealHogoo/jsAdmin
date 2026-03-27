(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;
    var MenuIconCatalog = global.MenuIconCatalog;
    var MENU_TYPE_GROUP_CD = "MENU_TYPE";
    var listCtrl = null;
    var pickerBound = false;

    function pageRoot() { return UX.qs("#menuPage") || document; }
    function formRoot() { return UX.qs("#menuForm") || document; }

    function setSelectedMenuSeq(menuSeq) {
        var page = pageRoot();
        if (!page || !page.dataset) return;
        page.dataset.selectedMenuSeq = menuSeq ? String(menuSeq) : "";
        if (listCtrl) listCtrl.refresh();
    }

    function selectedMenuSeq() {
        var page = pageRoot();
        return page && page.dataset ? UX.numOrNull(page.dataset.selectedMenuSeq) : null;
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
        if (!selectEl) return;
        var exists = Array.prototype.some.call(selectEl.options, function (opt) { return opt.value === String(value); });
        if (exists) return;
        var opt = document.createElement("option");
        opt.value = value;
        opt.textContent = label || value;
        selectEl.appendChild(opt);
    }

    function iconMeta(value) {
        return MenuIconCatalog && typeof MenuIconCatalog.find === "function" ? MenuIconCatalog.find(value) : null;
    }

    function updateIconPreview() {
        var preview = UX.qs("#menuIconPreview", pageRoot());
        var input = UX.qs("#icon_class", formRoot());
        if (!preview || !input) return;

        var meta = iconMeta(input.value);
        if (!meta || !meta.value) {
            preview.innerHTML = "-";
            preview.classList.add("is-empty");
            return;
        }

        preview.innerHTML = MenuIconCatalog.render(meta.value);
        preview.classList.remove("is-empty");
    }

    function renderIconPicker() {
        var grid = UX.qs("#menuIconPickerGrid", pageRoot());
        if (!grid || !MenuIconCatalog) return;

        var selected = UX.getValue("#icon_class", formRoot());
        var keyword = String(UX.getValue("#menuIconFilter", pageRoot()) || "").trim().toLowerCase();
        var items = MenuIconCatalog.list().filter(function (item) {
            if (!keyword) return true;
            var text = [item.value, item.label, item.code, item.symbol].join(" ").toLowerCase();
            return text.indexOf(keyword) >= 0;
        });

        if (!items.length) {
            grid.innerHTML = "<div class='icon-picker__empty'>검색 결과가 없습니다.</div>";
            return;
        }

        grid.innerHTML = items.map(function (item) {
            var isSelected = String(item.value || "") === String(selected || "");
            var glyphHtml = item.value
                ? MenuIconCatalog.render(item.value, "icon-picker__glyph")
                : "<span class='icon-picker__glyph'>-</span>";
            return ""
                + "<button type='button' class='icon-picker__item" + (isSelected ? " is-selected" : "") + "'"
                + " title='" + UX.esc(item.code || item.value || "") + "'"
                + " data-icon-value='" + UX.esc(item.value || "") + "'>"
                + glyphHtml
                + "</button>";
        }).join("");
    }

    function openIconPicker() {
        var picker = UX.qs("#menuIconPicker", pageRoot());
        if (!picker) return;
        UX.setValue("#menuIconFilter", "", pageRoot());
        renderIconPicker();
        picker.classList.add("is-open");
        picker.setAttribute("aria-hidden", "false");
        var filterInput = UX.qs("#menuIconFilter", pageRoot());
        if (filterInput) {
            global.requestAnimationFrame(function () { filterInput.focus(); });
        }
    }

    function closeIconPicker() {
        var picker = UX.qs("#menuIconPicker", pageRoot());
        if (!picker) return;
        picker.classList.remove("is-open");
        picker.setAttribute("aria-hidden", "true");
    }

    function bindIconPicker() {
        if (pickerBound) return;
        pickerBound = true;

        document.addEventListener("click", function (e) {
            var page = pageRoot();
            if (!page || !page.contains(e.target)) return;

            var closeBtn = e.target.closest("[data-icon-picker-close='1']");
            if (closeBtn) {
                e.preventDefault();
                closeIconPicker();
                return;
            }

            var item = e.target.closest(".icon-picker__item");
            if (item) {
                e.preventDefault();
                UX.setValue("#icon_class", item.getAttribute("data-icon-value") || "", formRoot());
                updateIconPreview();
                closeIconPicker();
            }
        });
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
        updateIconPreview();
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

    function createListView() {
        var tbody = UX.qs("#menuListBody", pageRoot());
        if (!tbody) return null;

        return Grid.createVirtualTable({
            tbody: tbody,
            colCount: 8,
            emptyHtml: "<tr><td colspan='8'>데이터가 없습니다.</td></tr>",
            renderRow: function (row, index) {
                var menuSeq = UX.value(row, ["menu_seq", "menuSeq"], "");
                var selectedClass = String(menuSeq) === String(selectedMenuSeq() || "") ? " class='menu-row selected'" : " class='menu-row'";
                var useYn = UX.value(row, ["use_yn", "useYn"], "") === "Y" ? "사용" : "미사용";
                return "<tr" + selectedClass + " data-menu-seq='" + UX.esc(menuSeq) + "'>"
                    + "<td>" + Grid.textCell(index + 1) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["up_menu_seq", "upMenuSeq"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["menu_nm", "menuNm"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["menu_url", "menuUrl"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["menu_type_cd", "menuTypeCd"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["icon_class", "iconClass"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["sort_ord", "sort_no", "sortNo"], "")) + "</td>"
                    + "<td>" + Grid.textCell(useYn) + "</td>"
                    + "</tr>";
            },
            onRendered: function () {
                UX.qsa("tr.menu-row", tbody).forEach(function (tr) {
                    tr.addEventListener("click", function () {
                        var menuSeq = tr.getAttribute("data-menu-seq");
                        var rows = listCtrl && listCtrl.getView() ? listCtrl.getView().getItems() : [];
                        var found = rows.find(function (row) {
                            return String(UX.value(row, ["menu_seq", "menuSeq"], "")) === String(menuSeq);
                        });
                        setSelectedMenuSeq(menuSeq);
                        if (found) fillForm(found);
                    });
                });
            }
        });
    }

    function renderTable(items) {
        var listView = listCtrl && listCtrl.ensureView();
        if (listView) listView.setItems(items || []);
    }

    function loadList() {
        return app.callJson("/menu/list.json", collectSearchParam(), function (list) {
            listCtrl.replaceItems(Array.isArray(list) ? list : []);
        });
    }

    function refreshSidebar() {
        document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
        if (typeof global.SIDEBAR_INIT === "function") {
            try { global.SIDEBAR_INIT(); } catch (ignore) {}
        }
    }

    function saveMenu() {
        var param = collectFormParam();
        if (!param.menu_nm) return global.alert("메뉴명은 필수입니다.");
        app.callJson("/menu/save.json", param, function () {
            loadList();
            refreshSidebar();
            clearForm();
            global.alert("저장 완료");
        }).catch(function (e) {
            global.alert("저장 실패: " + (e && e.message ? e.message : e));
        });
    }

    function deleteMenu() {
        var menuSeq = UX.numOrNull(UX.getValue("#menu_seq", formRoot()));
        if (!menuSeq) return global.alert("삭제할 메뉴를 선택하세요.");
        if (!global.confirm("삭제하시겠습니까?")) return;
        app.callJson("/menu/delete.json", { menu_seq: menuSeq }, function () {
            loadList();
            refreshSidebar();
            clearForm();
            global.alert("삭제 완료");
        }).catch(function (e) {
            global.alert("삭제 실패: " + (e && e.message ? e.message : e));
        });
    }

    function bind() {
        var page = pageRoot();
        UX.bindOnce(UX.qs("#btnSearch", page), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#btnSave", page), "click", function (e) { e.preventDefault(); saveMenu(); });
        UX.bindOnce(UX.qs("#btnDelete", page), "click", function (e) { e.preventDefault(); deleteMenu(); });
        UX.bindOnce(UX.qs("#btnNew", page), "click", function (e) { e.preventDefault(); clearForm(); });
        UX.bindOnce(UX.qs("#btnMenuRefresh", page), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#search_use_yn", page), "change", function () { loadList(); });
        UX.bindOnce(UX.qs("#btnSelectIcon", page), "click", function (e) {
            e.preventDefault();
            openIconPicker();
        });
        UX.bindOnce(UX.qs("#icon_class", page), "input", updateIconPreview);
        UX.bindOnce(UX.qs("#menuIconFilter", page), "input", renderIconPicker);
        bindIconPicker();
    }

    function init() {
        if (!UX.qs("#menuListBody", pageRoot())) return;
        if (listCtrl) listCtrl.destroy();
        listCtrl = app.createChunkListController({
            pageSize: 100,
            threshold: 120,
            createView: createListView,
            getScrollElement: function () {
                return UX.qs("#menuListWrap", pageRoot());
            },
            applyItems: function (_view, items) {
                renderTable(items);
            }
        });

        bind();
        app.applyPermission(pageRoot());
        listCtrl.ensureView();
        listCtrl.ensureLoader();
        loadMenuTypeOptions().then(function () {
            clearForm();
            loadList();
        });
    }

    app.bindPage("__MENU_PAGE_BOUND_V3__", "/menu/main.do", init);
})(window);
