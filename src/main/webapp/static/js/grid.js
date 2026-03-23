(function (global) {
    "use strict";

    var UX = global.UX || {};
    var Grid = global.Grid || {};

    function createVirtualTable(options) {
        var tbody = options && options.tbody;
        if (!tbody) throw new Error("tbody is required");

        var colCount = Number(options.colCount || 1);
        var emptyHtml = options.emptyHtml || ("<tr><td colspan='" + colCount + "'>No Data</td></tr>");
        var renderRow = options.renderRow;
        var onRendered = typeof options.onRendered === "function" ? options.onRendered : null;
        var items = [];
        var rafId = 0;

        function render() {
            if (!tbody) return;

            if (!Array.isArray(items) || items.length === 0) {
                tbody.innerHTML = emptyHtml;
                if (onRendered) onRendered({ start: 0, end: 0, items: [] });
                return;
            }

            var html = "";
            for (var i = 0; i < items.length; i++) {
                html += renderRow(items[i], i);
            }
            tbody.innerHTML = html;

            if (onRendered) {
                onRendered({ start: 0, end: items.length, items: items.slice() });
            }
        }

        function requestRender() {
            if (rafId) return;
            rafId = global.requestAnimationFrame(function () {
                rafId = 0;
                render();
            });
        }

        function setItems(nextItems) {
            items = Array.isArray(nextItems) ? nextItems.slice() : [];
            requestRender();
        }

        function refresh() {
            requestRender();
        }

        function destroy() {
            if (rafId) {
                global.cancelAnimationFrame(rafId);
                rafId = 0;
            }
            global.removeEventListener("resize", requestRender);
        }

        global.addEventListener("resize", requestRender);

        return {
            setItems: setItems,
            refresh: refresh,
            destroy: destroy,
            getItems: function () { return items.slice(); }
        };
    }

    function createVirtualGrid(options) {
        var root = options && options.root;
        if (!root) throw new Error("root is required");

        var columns = Array.isArray(options.columns) ? options.columns.slice() : [];
        var rowHeight = Number(options.rowHeight || 44);
        var overscan = Number(options.overscan || 8);
        var emptyHtml = options.emptyHtml || "<div class='vgrid-empty'>No Data</div>";
        var renderRow = typeof options.renderRow === "function" ? options.renderRow : null;
        var onRendered = typeof options.onRendered === "function" ? options.onRendered : null;
        var items = [];
        var rafId = 0;
        var destroyed = false;

        if (!renderRow) throw new Error("renderRow is required");

        var head = root.querySelector(".vgrid-head");
        var body = root.querySelector(".vgrid-body");
        var spacer = root.querySelector(".vgrid-spacer");
        var rowsRoot = root.querySelector(".vgrid-rows");
        var empty = root.querySelector(".vgrid-empty");

        if (!head || !body || !spacer || !rowsRoot || !empty) {
            root.innerHTML =
                "<div class='vgrid-head'></div>" +
                "<div class='vgrid-body'>" +
                    "<div class='vgrid-spacer' aria-hidden='true'></div>" +
                    "<div class='vgrid-rows'></div>" +
                    "<div class='vgrid-empty' style='display:none;'></div>" +
                "</div>";
            head = root.querySelector(".vgrid-head");
            body = root.querySelector(".vgrid-body");
            spacer = root.querySelector(".vgrid-spacer");
            rowsRoot = root.querySelector(".vgrid-rows");
            empty = root.querySelector(".vgrid-empty");
        }

        function columnTemplate() {
            return columns.map(function (col) {
                return col.width || "minmax(0, 1fr)";
            }).join(" ");
        }

        function escapeAttr(value) {
            return String(value == null ? "" : value)
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        }

        function renderHead() {
            root.style.setProperty("--vgrid-columns", columnTemplate());
            if (!head.children.length) {
                head.innerHTML = columns.map(function (col) {
                    var extraClass = col.className ? " " + col.className : "";
                    return "<div class='vgrid-cell vgrid-head-cell" + extraClass + "'>" + escapeAttr(col.label || "") + "</div>";
                }).join("");
            }
        }

        function render() {
            if (destroyed) return;

            if (!items.length) {
                spacer.style.height = "0px";
                rowsRoot.style.transform = "translateY(0px)";
                rowsRoot.innerHTML = "";
                empty.style.display = "";
                empty.innerHTML = emptyHtml;
                if (onRendered) onRendered({ start: 0, end: 0, items: [] });
                return;
            }

            empty.style.display = "none";
            empty.innerHTML = "";

            var viewportHeight = Math.max(body.clientHeight || 0, root.clientHeight || 0, rowHeight * 6);
            var scrollTop = body.scrollTop;
            var totalHeight = items.length * rowHeight;
            var start = Math.max(Math.floor(scrollTop / rowHeight) - overscan, 0);
            var visibleCount = Math.ceil(viewportHeight / rowHeight) + (overscan * 2);
            var end = Math.min(start + visibleCount, items.length);

            if (end <= start) {
                start = 0;
                end = Math.min(Math.max(visibleCount, 1), items.length);
            }

            spacer.style.height = totalHeight + "px";
            rowsRoot.style.transform = "translateY(" + (start * rowHeight) + "px)";
            rowsRoot.style.display = "";

            var html = "";
            for (var i = start; i < end; i++) {
                html += renderRow(items[i], i);
            }
            rowsRoot.innerHTML = html;

            if (onRendered) {
                onRendered({ start: start, end: end, items: items.slice(start, end) });
            }
        }

        function requestRender() {
            if (rafId) return;
            rafId = global.requestAnimationFrame(function () {
                rafId = 0;
                render();
            });
        }

        function setItems(nextItems) {
            items = Array.isArray(nextItems) ? nextItems.slice() : [];
            body.scrollTop = 0;
            requestRender();
        }

        function refresh() {
            requestRender();
        }

        function destroy() {
            destroyed = true;
            if (rafId) {
                global.cancelAnimationFrame(rafId);
                rafId = 0;
            }
            body.removeEventListener("scroll", requestRender);
            global.removeEventListener("resize", requestRender);
        }

        renderHead();
        body.addEventListener("scroll", requestRender, { passive: true });
        global.addEventListener("resize", requestRender);

        return {
            setItems: setItems,
            refresh: refresh,
            destroy: destroy,
            getItems: function () { return items.slice(); },
            getBody: function () { return body; }
        };
    }

    Grid.createVirtualTable = createVirtualTable;
    Grid.createVirtualGrid = createVirtualGrid;
    global.Grid = Grid;
})(window);
