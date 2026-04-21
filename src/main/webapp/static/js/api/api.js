(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;
    var listCtrl = null;
    var tabEventsBound = false;

    function pageRoot() { return UX.qs("#apiPage"); }
    function formRoot() { return UX.qs("#apiForm") || document; }

    function currentApiType() {
        return UX.getValue("#api_type", formRoot()) || "EXTERNAL";
    }

    function setCurrentApiType(apiType) {
        var root = pageRoot();
        var type = String(apiType || "EXTERNAL").toUpperCase() === "INTERNAL" ? "INTERNAL" : "EXTERNAL";
        UX.setValue("#api_type", type, formRoot());
        if (root && root.dataset) {
            root.dataset.activeApiType = type;
        }
        UX.qsa(".tab[data-api-type]", root || document).forEach(function (el) {
            el.classList.toggle("is-active", el.getAttribute("data-api-type") === type);
        });
        applyTypeDefaults();
    }

    function applyTypeDefaults() {
        var apiType = currentApiType();
        var authType = UX.qs("#auth_type", formRoot());
        if (!authType) return;
        if (apiType === "INTERNAL" && (!authType.value || authType.value === "SESSION")) {
            authType.value = "SERVICE_TOKEN";
        }
        if (apiType === "EXTERNAL" && (!authType.value || authType.value === "SERVICE_TOKEN")) {
            authType.value = "SESSION";
        }
    }

    function setSelectedApiSeq(apiSeq) {
        var root = pageRoot();
        if (root && root.dataset) {
            root.dataset.selectedApiSeq = apiSeq ? String(apiSeq) : "";
        }
        if (listCtrl) listCtrl.refresh();
    }

    function selectedApiSeq() {
        var root = pageRoot();
        if (!root || !root.dataset) return null;
        return UX.numOrNull(root.dataset.selectedApiSeq);
    }

    function fillForm(row) {
        var root = formRoot();
        UX.setValue("#api_seq", UX.value(row, ["api_seq", "apiSeq"], ""), root);
        UX.setValue("#api_type", UX.value(row, ["api_type", "apiType"], "EXTERNAL"), root);
        UX.setValue("#api_nm", UX.value(row, ["api_nm", "apiNm"], ""), root);
        UX.setValue("#caller_id", UX.value(row, ["caller_id", "callerId"], ""), root);
        UX.setValue("#target_service", UX.value(row, ["target_service", "targetService"], ""), root);
        UX.setValue("#http_method", UX.value(row, ["http_method", "httpMethod"], "GET"), root);
        UX.setValue("#api_pattern", UX.value(row, ["api_pattern", "apiPattern"], ""), root);
        UX.setValue("#auth_type", UX.value(row, ["auth_type", "authType"], ""), root);
        UX.setValue("#use_yn", UX.value(row, ["use_yn", "useYn"], "Y"), root);
        UX.setValue("#api_desc", UX.value(row, ["api_desc", "apiDesc"], ""), root);
        setCurrentApiType(UX.getValue("#api_type", root));
    }

    function clearForm() {
        UX.clearValues(["api_seq", "api_nm", "caller_id", "target_service", "api_pattern", "api_desc"], formRoot());
        UX.setValue("#use_yn", "Y", formRoot());
        UX.setValue("#http_method", "GET", formRoot());
        UX.setValue("#api_type", currentApiType(), formRoot());
        setSelectedApiSeq(null);
        applyTypeDefaults();
    }

    function collectSearchParam() {
        return {
            api_type: currentApiType(),
            use_yn: UX.strOrNull(UX.getValue("#api_search_use_yn", pageRoot())),
            keyword: UX.strOrNull(UX.getValue("#api_search_keyword", pageRoot()))
        };
    }

    function collectFormParam() {
        var root = formRoot();
        var apiSeq = UX.numOrNull(UX.getValue("#api_seq", root));
        var param = {
            api_seq: apiSeq,
            api_type: currentApiType(),
            api_nm: UX.strOrNull(UX.getValue("#api_nm", root)),
            caller_id: UX.strOrNull(UX.getValue("#caller_id", root)),
            target_service: UX.strOrNull(UX.getValue("#target_service", root)),
            http_method: UX.strOrNull(UX.getValue("#http_method", root)) || "GET",
            api_pattern: UX.strOrNull(UX.getValue("#api_pattern", root)),
            auth_type: UX.strOrNull(UX.getValue("#auth_type", root)),
            use_yn: UX.strOrNull(UX.getValue("#use_yn", root)) || "Y",
            api_desc: UX.strOrNull(UX.getValue("#api_desc", root))
        };
        if (param.api_seq === null) delete param.api_seq;
        return param;
    }

    function createListView() {
        var tbody = UX.qs("#apiListBody", pageRoot());
        if (!tbody) return null;

        return Grid.createVirtualTable({
            tbody: tbody,
            colCount: 8,
            emptyHtml: "<tr><td colspan='8'>데이터가 없습니다.</td></tr>",
            renderRow: function (row, index) {
                var apiSeq = UX.value(row, ["api_seq", "apiSeq"], "");
                var selectedClass = String(apiSeq) === String(selectedApiSeq() || "") ? " class='api-row selected'" : " class='api-row'";
                var useYn = UX.value(row, ["use_yn", "useYn"], "") === "Y" ? "사용" : "미사용";
                return ""
                    + "<tr" + selectedClass + " data-api-seq='" + UX.esc(apiSeq) + "'>"
                    + "<td>" + Grid.textCell(index + 1) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["api_nm", "apiNm"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["caller_id", "callerId"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["target_service", "targetService"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["http_method", "httpMethod"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["api_pattern", "apiPattern"], "")) + "</td>"
                    + "<td>" + Grid.textCell(UX.value(row, ["auth_type", "authType"], "")) + "</td>"
                    + "<td>" + Grid.textCell(useYn) + "</td>"
                    + "</tr>";
            },
            onRendered: function () {
                UX.qsa("tr.api-row", tbody).forEach(function (tr) {
                    tr.addEventListener("click", function () {
                        var apiSeq = tr.getAttribute("data-api-seq");
                        var rows = listCtrl && listCtrl.getView() ? listCtrl.getView().getItems() : [];
                        var found = rows.find(function (row) {
                            return String(UX.value(row, ["api_seq", "apiSeq"], "")) === String(apiSeq);
                        });
                        setSelectedApiSeq(apiSeq);
                        if (found) fillForm(found);
                    });
                });
            }
        });
    }

    function renderTable(rows) {
        var listView = listCtrl && listCtrl.ensureView();
        if (listView) listView.setItems(rows || []);
    }

    function loadList() {
        return app.callJson("/api/list.json", collectSearchParam(), function (rows) {
            listCtrl.replaceItems(Array.isArray(rows) ? rows : []);
        });
    }

    function saveApiPolicy() {
        var param = collectFormParam();
        if (!param.api_nm || !param.caller_id || !param.target_service || !param.api_pattern) {
            global.alert("필수 항목을 입력하세요.");
            return;
        }

        app.callJson("/api/save.json", param, function () {
            loadList().then(function () {
                clearForm();
                global.alert("저장 완료");
            });
        }).catch(function (e) {
            try { console.error("[api] save.error", e); } catch (ignore) {}
            global.alert("저장 실패: " + (e && e.message ? e.message : e));
        });
    }

    function deleteApiPolicy() {
        var apiSeq = UX.numOrNull(UX.getValue("#api_seq", formRoot()));
        if (!apiSeq) {
            global.alert("대상 정책을 선택하세요.");
            return;
        }
        if (!global.confirm("미사용 처리하시겠습니까?")) return;

        app.callJson("/api/delete.json", { api_seq: apiSeq }, function () {
            loadList().then(function () {
                clearForm();
                global.alert("처리 완료");
            });
        }).catch(function (e) {
            global.alert("처리 실패: " + (e && e.message ? e.message : e));
        });
    }

    function bind() {
        if (!tabEventsBound) {
            document.addEventListener("click", function (e) {
                var target = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement ? e.target.parentElement : null);
                var tab = target && target.closest ? target.closest("#apiPage .tab[data-api-type]") : null;
                if (!tab) return;
                e.preventDefault();
                setCurrentApiType(tab.getAttribute("data-api-type"));
                clearForm();
                loadList();
            });
            tabEventsBound = true;
        }

        UX.bindOnce(UX.qs("#btnApiSearch", pageRoot()), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#btnApiSave", pageRoot()), "click", function (e) { e.preventDefault(); saveApiPolicy(); });
        UX.bindOnce(UX.qs("#btnApiDelete", pageRoot()), "click", function (e) { e.preventDefault(); deleteApiPolicy(); });
        UX.bindOnce(UX.qs("#btnApiNew", pageRoot()), "click", function (e) { e.preventDefault(); clearForm(); });
        UX.bindOnce(UX.qs("#btnApiRefresh", pageRoot()), "click", function (e) { e.preventDefault(); loadList(); });
        app.bindEnterAction(UX.qs("#api_search_keyword", pageRoot()), loadList);
    }

    function init() {
        var root = pageRoot();
        if (!root || !UX.qs("#apiListBody", root)) return;
        if (listCtrl) listCtrl.destroy();
        listCtrl = app.createChunkListController({
            pageSize: 100,
            threshold: 120,
            createView: createListView,
            getScrollElement: function () {
                return UX.qs("#apiListWrap", pageRoot());
            },
            applyItems: function (_view, items) {
                renderTable(items);
            }
        });

        bind();
        app.applyPermission(root);
        setCurrentApiType((root.dataset && root.dataset.activeApiType) || "EXTERNAL");
        listCtrl.ensureView();
        listCtrl.ensureLoader();
        clearForm();
        loadList();
    }

    app.bindPage("__API_POLICY_PAGE_BOUND_V2__", "/api/main.do", init);
})(window);
