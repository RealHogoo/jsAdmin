(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;

    var listView = null;
    var listLoader = null;
    var eventsBound = false;

    function pageRoot() { return UX.qs("#apiPage") || document; }
    function formRoot() { return UX.qs("#apiForm") || document; }

    function resetViews() {
        if (listView && typeof listView.destroy === "function") listView.destroy();
        if (listLoader && typeof listLoader.destroy === "function") listLoader.destroy();
        listView = null;
        listLoader = null;
    }

    function currentApiType() {
        return UX.getValue("#api_type", formRoot()) || "EXTERNAL";
    }

    function setCurrentApiType(apiType) {
        var type = String(apiType || "EXTERNAL").toUpperCase() === "INTERNAL" ? "INTERNAL" : "EXTERNAL";
        UX.setValue("#api_type", type, formRoot());
        pageRoot().dataset.activeApiType = type;
        UX.qsa(".tab[data-api-type]", pageRoot()).forEach(function (el) {
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
        pageRoot().dataset.selectedApiSeq = apiSeq ? String(apiSeq) : "";
        if (listView) listView.refresh();
    }

    function selectedApiSeq() {
        return UX.numOrNull(pageRoot().dataset.selectedApiSeq);
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
        UX.clearValues([
            "api_seq",
            "api_nm",
            "caller_id",
            "target_service",
            "api_pattern",
            "api_desc"
        ], formRoot());
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

    function ensureListView() {
        var tbody = UX.qs("#apiListBody", pageRoot());
        if (!tbody || listView) return;

        listView = Grid.createVirtualTable({
            tbody: tbody,
            scroller: UX.qs("#apiListWrap", pageRoot()),
            colCount: 8,
            rowHeight: 42,
            emptyHtml: "<tr><td colspan='8'>데이터가 없습니다.</td></tr>",
            renderRow: function (row, index) {
                var apiSeq = UX.value(row, ["api_seq", "apiSeq"], "");
                var selectedClass = String(apiSeq) === String(selectedApiSeq() || "") ? " class='api-row selected'" : " class='api-row'";
                var useYn = UX.value(row, ["use_yn", "useYn"], "") === "Y" ? "\uC0AC\uC6A9" : "\uBBF8\uC0AC\uC6A9";
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
                        var found = listView.getItems().find(function (row) {
                            return String(UX.value(row, ["api_seq", "apiSeq"], "")) === String(apiSeq);
                        });
                        setSelectedApiSeq(apiSeq);
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
                return UX.qs("#apiListWrap", pageRoot());
            },
            onData: function (result) {
                renderTable(result.items || []);
            }
        });
    }

    function renderTable(rows) {
        ensureListView();
        if (!listView) return;
        listView.setItems(rows || []);
    }

    function loadList() {
        ensureListView();
        ensureListLoader();
        return app.callJson("/api/list.json", collectSearchParam(), function (rows) {
            var list = Array.isArray(rows) ? rows : [];
            if (listLoader) listLoader.replaceItems(list);
            else renderTable(list.slice(0, 100));
        });
    }

    function saveApiPolicy() {
        var param = collectFormParam();
        if (!param.api_nm || !param.caller_id || !param.target_service || !param.api_pattern) {
            global.alert("\uD544\uC218 \uD56D\uBAA9\uC744 \uC785\uB825\uD558\uC138\uC694.");
            return;
        }

        app.callJson("/api/save.json", param, function () {
            loadList().then(function () {
                clearForm();
                global.alert("\uC800\uC7A5 \uC644\uB8CC");
            });
        }).catch(function (e) {
            try { console.error("[api] save.error", e); } catch (ignore) {}
            global.alert("\uC800\uC7A5 \uC2E4\uD328: " + (e && e.message ? e.message : e));
        });
    }

    function deleteApiPolicy() {
        var apiSeq = UX.numOrNull(UX.getValue("#api_seq", formRoot()));
        if (!apiSeq) {
            global.alert("\uB300\uC0C1 \uC815\uCC45\uC744 \uC120\uD0DD\uD558\uC138\uC694.");
            return;
        }
        if (!global.confirm("\uBBF8\uC0AC\uC6A9 \uCC98\uB9AC\uD558\uC2DC\uACA0\uC2B5\uB2C8\uAE4C?")) return;

        app.callJson("/api/delete.json", { api_seq: apiSeq }, function () {
            loadList().then(function () {
                clearForm();
                global.alert("\uCC98\uB9AC \uC644\uB8CC");
            });
        }).catch(function (e) {
            global.alert("\uCC98\uB9AC \uC2E4\uD328: " + (e && e.message ? e.message : e));
        });
    }

    function bind() {
        if (!eventsBound) {
            document.addEventListener("click", function (e) {
                var target = e.target && e.target.nodeType === 1 ? e.target : (e.target && e.target.parentElement ? e.target.parentElement : null);
                var tab = target && target.closest ? target.closest("#apiPage .tab[data-api-type]") : null;
                if (!tab) return;
                e.preventDefault();
                setCurrentApiType(tab.getAttribute("data-api-type"));
                clearForm();
                loadList();
            });
            eventsBound = true;
        }
        UX.bindOnce(UX.qs("#btnApiSearch", pageRoot()), "click", function (e) { e.preventDefault(); loadList(); });
        UX.bindOnce(UX.qs("#btnApiSave", pageRoot()), "click", function (e) { e.preventDefault(); saveApiPolicy(); });
        UX.bindOnce(UX.qs("#btnApiDelete", pageRoot()), "click", function (e) { e.preventDefault(); deleteApiPolicy(); });
        UX.bindOnce(UX.qs("#btnApiNew", pageRoot()), "click", function (e) { e.preventDefault(); clearForm(); });
        UX.bindOnce(UX.qs("#btnApiRefresh", pageRoot()), "click", function (e) { e.preventDefault(); loadList(); });
    }

    function init() {
        if (!UX.qs("#apiListBody", pageRoot())) return;
        resetViews();
        bind();
        applyPerm();
        setCurrentApiType(pageRoot().dataset.activeApiType || "EXTERNAL");
        ensureListView();
        ensureListLoader();
        clearForm();
        loadList();
    }

    if (!global.__API_POLICY_PAGE_BOUND__) {
        global.__API_POLICY_PAGE_BOUND__ = true;
        document.addEventListener("jsadmin:pageLoaded", function (e) {
            if (e && e.detail && e.detail.url === "/api/main.do") init();
        });
    }

    try { init(); } catch (e) {}
})(window);
