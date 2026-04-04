(function (global) {
    "use strict";

    var UX = global.UX;
    var Grid = global.Grid;
    var app = global.app;
    var listCtrl = null;

    function root() {
        return UX.qs("#servicePage");
    }

    function setSelectedServiceSeq(serviceSeq) {
        var page = root();
        if (!page) return;
        page.dataset.selectedServiceSeq = serviceSeq ? String(serviceSeq) : "";
        if (listCtrl) listCtrl.refresh();
    }

    function selectedServiceSeq() {
        var page = root();
        return page ? UX.numOrNull(page.dataset.selectedServiceSeq) : null;
    }

    function clearForm() {
        UX.clearValues([
            "service_seq", "service_cd", "service_nm", "base_url", "status_path",
            "live_path", "ready_path", "timeout_ms", "sort_ord", "remark"
        ], root());
        UX.setValue("#service_use_yn", "Y", root());
        UX.setValue("#status_path", "/health/status.json", root());
        UX.setValue("#live_path", "/health/live.json", root());
        UX.setValue("#ready_path", "/health/ready.json", root());
        UX.setValue("#timeout_ms", "3000", root());
        UX.setValue("#sort_ord", "0", root());
        setSelectedServiceSeq(null);
    }

    function fillForm(row) {
        var page = root();
        UX.setValue("#service_seq", row.service_seq || "", page);
        UX.setValue("#service_cd", row.service_cd || "", page);
        UX.setValue("#service_nm", row.service_nm || "", page);
        UX.setValue("#base_url", row.base_url || "", page);
        UX.setValue("#status_path", row.status_path || "/health/status.json", page);
        UX.setValue("#live_path", row.live_path || "/health/live.json", page);
        UX.setValue("#ready_path", row.ready_path || "/health/ready.json", page);
        UX.setValue("#timeout_ms", row.timeout_ms || "3000", page);
        UX.setValue("#sort_ord", row.sort_ord || "0", page);
        UX.setValue("#service_use_yn", row.use_yn || "Y", page);
        UX.setValue("#remark", row.remark || "", page);
    }

    function collectForm() {
        var page = root();
        var seq = UX.strOrNull(UX.getValue("#service_seq", page));
        return {
            service_seq: seq ? Number(seq) : null,
            service_cd: UX.getValue("#service_cd", page),
            service_nm: UX.getValue("#service_nm", page),
            base_url: UX.getValue("#base_url", page),
            status_path: UX.getValue("#status_path", page),
            live_path: UX.getValue("#live_path", page),
            ready_path: UX.getValue("#ready_path", page),
            timeout_ms: UX.numOrNull(UX.getValue("#timeout_ms", page)),
            sort_ord: UX.numOrNull(UX.getValue("#sort_ord", page)),
            use_yn: UX.getValue("#service_use_yn", page) || "Y",
            remark: UX.getValue("#remark", page)
        };
    }

    function createListView() {
        var gridRoot = UX.qs("#serviceMgmtGrid", root());
        if (!gridRoot) return null;

        return Grid.createVirtualGrid({
            root: gridRoot,
            rowHeight: 56,
            overscan: 10,
            emptyHtml: "No services found.",
            renderRow: function (row, index) {
                var selectedClass = Number(row.service_seq) === selectedServiceSeq() ? " is-selected" : "";
                return ""
                    + "<div class='vgrid-row" + selectedClass + "' data-service-seq='" + UX.esc(row.service_seq) + "'>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(index + 1) + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.service_cd || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.service_nm || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.base_url || "-") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell((row.use_yn || "Y") === "Y" ? "Y" : "N") + "</div>"
                    + "<div class='vgrid-cell'>" + Grid.textCell(row.sort_ord || "0") + "</div>"
                    + "</div>";
            },
            onRendered: function () {
                UX.qsa(".vgrid-row[data-service-seq]", gridRoot).forEach(function (rowEl) {
                    rowEl.addEventListener("click", function () {
                        var serviceSeq = Number(rowEl.getAttribute("data-service-seq"));
                        setSelectedServiceSeq(serviceSeq);
                        loadDetail(serviceSeq);
                    });
                });
            }
        });
    }

    function renderList(rows) {
        var listView = listCtrl && listCtrl.ensureView();
        if (!listView) return;
        if (!rows.length) clearForm();
        listView.setItems(rows);
    }

    function loadList() {
        return app.callJson("/service/list.json", {
            keyword: UX.getValue("#serviceMgmtKeyword", root()),
            use_yn: UX.getValue("#serviceMgmtUseYn", root())
        }, function (data) {
            listCtrl.replaceItems(Array.isArray(data) ? data : []);
        });
    }

    function loadDetail(serviceSeq) {
        return app.callJson("/service/detail.json", { service_seq: serviceSeq }, function (data) {
            if (!data) return;
            setSelectedServiceSeq(serviceSeq);
            fillForm(data);
        });
    }

    function saveService() {
        var payload = collectForm();
        if (!payload.service_cd) return global.alert("service_cd is required");
        if (!payload.service_nm) return global.alert("service_nm is required");
        if (!payload.base_url) return global.alert("base_url is required");

        app.callJson("/service/save.json", payload, function () {
            loadList().then(function () {
                if (payload.service_seq) {
                    loadDetail(payload.service_seq);
                    return;
                }
                clearForm();
            });
        });
    }

    function bind() {
        var page = root();
        UX.bindOnce(UX.qs("#btnServiceMgmtSearch", page), "click", loadList);
        UX.bindOnce(UX.qs("#btnServiceMgmtNew", page), "click", clearForm);
        UX.bindOnce(UX.qs("#btnServiceMgmtSave", page), "click", saveService);
        app.bindEnterAction(UX.qs("#serviceMgmtKeyword", page), loadList);
    }

    function init() {
        var page = root();
        if (!page) return;
        if (listCtrl) listCtrl.destroy();
        listCtrl = app.createChunkListController({
            pageSize: 100,
            threshold: 140,
            createView: createListView,
            getScrollElement: function (view) {
                return view && view.getBody ? view.getBody() : null;
            },
            applyItems: function (_view, items) {
                renderList(items);
            }
        });

        bind();
        listCtrl.ensureView();
        listCtrl.ensureLoader();
        clearForm();
        loadList();
    }

    app.bindPage("__SERVICE_PAGE_BOUND_V1__", "/service/main.do", init);
})(window);
