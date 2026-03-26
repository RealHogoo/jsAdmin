(function (global) {
    "use strict";

    var UX = global.UX || {};
    var Grid = global.Grid || {};
    var viewerBound = false;

    function escapeAttr(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function toHtmlWithLineBreaks(value) {
        return escapeHtml(value).replace(/\r?\n/g, "<br>");
    }

    function ensureViewer() {
        var modal = document.getElementById("gridTextViewer");
        if (!modal) {
            modal = document.createElement("div");
            modal.id = "gridTextViewer";
            modal.className = "grid-viewer";
            modal.innerHTML =
                "<div class='grid-viewer__backdrop' data-grid-viewer-close='1'></div>" +
                "<div class='grid-viewer__dialog' role='dialog' aria-modal='true' aria-labelledby='gridViewerTitle'>" +
                    "<div class='grid-viewer__head'>" +
                        "<strong id='gridViewerTitle'>상세 내용</strong>" +
                        "<button type='button' class='grid-viewer__close' data-grid-viewer-close='1'>닫기</button>" +
                    "</div>" +
                    "<div class='grid-viewer__body'></div>" +
                "</div>";
            document.body.appendChild(modal);
        }

        if (!viewerBound) {
            viewerBound = true;

            document.addEventListener("click", function (e) {
                var trigger = e.target.closest(".grid-text.is-truncated");
                if (trigger) {
                    e.preventDefault();
                    e.stopPropagation();
                    openViewer(trigger.getAttribute("data-grid-fulltext") || "");
                    return;
                }

                var closer = e.target.closest("[data-grid-viewer-close='1']");
                if (closer) {
                    e.preventDefault();
                    closeViewer();
                }
            });

            document.addEventListener("keydown", function (e) {
                var trigger = e.target.closest && e.target.closest(".grid-text.is-truncated");
                if (trigger && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    openViewer(trigger.getAttribute("data-grid-fulltext") || "");
                    return;
                }

                if (e.key === "Escape") {
                    closeViewer();
                }
            });
        }

        return modal;
    }

    function openViewer(text) {
        var modal = ensureViewer();
        var body = modal.querySelector(".grid-viewer__body");
        body.innerHTML = toHtmlWithLineBreaks(text || "");
        modal.classList.add("is-open");
    }

    function closeViewer() {
        var modal = document.getElementById("gridTextViewer");
        if (!modal) return;
        modal.classList.remove("is-open");
    }

    function applyOverflowState(root) {
        if (!root) return;
        var nodes = root.querySelectorAll(".grid-text[data-grid-fulltext]");
        Array.prototype.forEach.call(nodes, function (node) {
            var overflowY = node.scrollHeight > node.clientHeight + 1;
            var overflowX = node.scrollWidth > node.clientWidth + 1;
            var truncated = overflowX || overflowY;

            node.classList.toggle("is-truncated", truncated);
            if (truncated) {
                node.setAttribute("role", "button");
                node.setAttribute("tabindex", "0");
            } else {
                node.removeAttribute("role");
                node.removeAttribute("tabindex");
            }
        });
    }

    function syncHeadScroll(head, body) {
        if (!head || !body) return;
        head.style.transform = "translateX(" + (-body.scrollLeft) + "px)";
    }

    function normalizeAlign(value) {
        var align = String(value || "").toLowerCase();
        if (align === "right") return "right";
        if (align === "center") return "center";
        return "left";
    }

    function inferColumnsFromHead(head) {
        if (!head) return [];
        return Array.prototype.map.call(head.children || [], function (cell) {
            return {
                label: (cell.textContent || "").trim(),
                width: cell.getAttribute("data-width") || cell.style.width || "minmax(0, 1fr)",
                align: normalizeAlign(cell.getAttribute("data-align") || cell.style.textAlign || "left"),
                className: cell.getAttribute("data-class") || ""
            };
        });
    }

    function applyAlignClass(node, align) {
        if (!node) return;
        node.classList.remove("is-align-left", "is-align-center", "is-align-right");
        node.classList.add("is-align-" + normalizeAlign(align));
    }

    function decorateGridRows(rowsRoot, columns, startIndex) {
        if (!rowsRoot) return;
        Array.prototype.forEach.call(rowsRoot.children || [], function (rowEl, rowOffset) {
            rowEl.classList.toggle("is-odd", ((startIndex + rowOffset) % 2) === 1);
            Array.prototype.forEach.call(rowEl.children || [], function (cell, cellIndex) {
                applyAlignClass(cell, columns[cellIndex] && columns[cellIndex].align);
            });
        });
    }

    function textCell(value, options) {
        var text = value == null ? "" : String(value);
        var hasNewLine = /\r?\n/.test(text);
        var className = options && options.className ? " " + options.className : "";
        return "<div class='grid-text " + (hasNewLine ? "grid-text--multi" : "grid-text--single") + className
            + "' data-grid-fulltext=\"" + escapeAttr(text) + "\">"
            + toHtmlWithLineBreaks(text || "-")
            + "</div>";
    }

    function createVirtualTable(options) {
        var tbody = options && options.tbody;
        if (!tbody) throw new Error("tbody is required");

        var colCount = Number(options.colCount || 1);
        var emptyHtml = options.emptyHtml || ("<tr><td colspan='" + colCount + "'>데이터가 없습니다.</td></tr>");
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
            global.requestAnimationFrame(function () {
                applyOverflowState(tbody);
            });

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
        var emptyHtml = options.emptyHtml || "<div class='vgrid-empty'>데이터가 없습니다.</div>";
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

        function renderHead() {
            if (!columns.length) {
                columns = inferColumnsFromHead(head);
            }
            root.style.setProperty("--vgrid-columns", columnTemplate());
            root.style.setProperty("--vgrid-row-height", rowHeight + "px");
            if (!head.children.length) {
                head.innerHTML = columns.map(function (col) {
                    var extraClass = col.className ? " " + col.className : "";
                    return "<div class='vgrid-cell vgrid-head-cell" + extraClass + "'>" + escapeAttr(col.label || "") + "</div>";
                }).join("");
            }
            Array.prototype.forEach.call(head.children || [], function (cell, index) {
                applyAlignClass(cell, columns[index] && columns[index].align);
            });
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
            global.requestAnimationFrame(function () {
                decorateGridRows(rowsRoot, columns, start);
                applyOverflowState(rowsRoot);
                syncHeadScroll(head, body);
            });

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

        function setItems(nextItems, options) {
            items = Array.isArray(nextItems) ? nextItems.slice() : [];
            if (!(options && options.preserveScroll)) {
                body.scrollTop = 0;
            }
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

    function createPagedLoader(options) {
        var loadPage = options && options.loadPage;
        var onData = options && options.onData;
        var getScrollElement = options && options.getScrollElement;
        var onStateChange = options && options.onStateChange;
        var pageSize = Number((options && options.pageSize) || 100);
        var threshold = Number((options && options.threshold) || 160);
        var state = {
            items: [],
            params: {},
            offset: 0,
            hasMore: true,
            loading: false,
            requestSeq: 0
        };
        var scrollEl = null;

        if (typeof loadPage !== "function") throw new Error("loadPage is required");
        if (typeof onData !== "function") throw new Error("onData is required");

        function notifyState() {
            if (typeof onStateChange === "function") {
                onStateChange({
                    items: state.items.slice(),
                    params: state.params,
                    offset: state.offset,
                    hasMore: state.hasMore,
                    loading: state.loading
                });
            }
        }

        function resolveScrollElement() {
            scrollEl = typeof getScrollElement === "function" ? getScrollElement() : null;
            return scrollEl;
        }

        function maybeLoadMore() {
            var el = scrollEl || resolveScrollElement();
            if (!el || state.loading || !state.hasMore) return;
            var remain = el.scrollHeight - el.clientHeight - el.scrollTop;
            if (remain <= threshold) {
                loadMore();
            }
        }

        function afterDataApplied() {
            global.requestAnimationFrame(function () {
                maybeLoadMore();
            });
        }

        async function loadMore() {
            if (state.loading || !state.hasMore) return state.items.slice();

            state.loading = true;
            state.requestSeq += 1;
            var requestSeq = state.requestSeq;
            notifyState();

            try {
                var page = await loadPage({
                    offset: state.offset,
                    limit: pageSize,
                    params: state.params
                });

                if (requestSeq !== state.requestSeq) {
                    return state.items.slice();
                }

                var rows = Array.isArray(page && page.rows) ? page.rows : [];
                state.items = state.items.concat(rows);
                state.offset = Number(page && page.next_offset);
                if (!Number.isFinite(state.offset)) {
                    state.offset = state.items.length;
                }
                state.hasMore = !!(page && (page.has_more || page.hasMore));
                onData({
                    items: state.items.slice(),
                    append: true,
                    page: page || {}
                });
                afterDataApplied();
                return state.items.slice();
            } finally {
                state.loading = false;
                notifyState();
            }
        }

        async function reload(nextParams) {
            state.params = nextParams || {};
            state.items = [];
            state.offset = 0;
            state.hasMore = true;
            state.loading = true;
            state.requestSeq += 1;
            var requestSeq = state.requestSeq;
            notifyState();

            try {
                var page = await loadPage({
                    offset: 0,
                    limit: pageSize,
                    params: state.params
                });

                if (requestSeq !== state.requestSeq) {
                    return state.items.slice();
                }

                var rows = Array.isArray(page && page.rows) ? page.rows : [];
                state.items = rows.slice();
                state.offset = Number(page && page.next_offset);
                if (!Number.isFinite(state.offset)) {
                    state.offset = state.items.length;
                }
                state.hasMore = !!(page && (page.has_more || page.hasMore));
                onData({
                    items: state.items.slice(),
                    append: false,
                    page: page || {}
                });
                afterDataApplied();
                return state.items.slice();
            } finally {
                state.loading = false;
                notifyState();
            }
        }

        function bindScroll() {
            var el = resolveScrollElement();
            if (!el || el.dataset.vgridPagedBound === "1") return;
            el.dataset.vgridPagedBound = "1";
            el.addEventListener("scroll", maybeLoadMore, { passive: true });
        }

        function destroy() {
            if (scrollEl) {
                scrollEl.removeEventListener("scroll", maybeLoadMore);
                if (scrollEl.dataset) delete scrollEl.dataset.vgridPagedBound;
            }
        }

        bindScroll();

        return {
            reload: reload,
            loadMore: loadMore,
            destroy: destroy,
            getItems: function () { return state.items.slice(); },
            getState: function () {
                return {
                    items: state.items.slice(),
                    params: state.params,
                    offset: state.offset,
                    hasMore: state.hasMore,
                    loading: state.loading
                };
            }
        };
    }

    function createChunkLoader(options) {
        var onData = options && options.onData;
        var getScrollElement = options && options.getScrollElement;
        var onStateChange = options && options.onStateChange;
        var pageSize = Number((options && options.pageSize) || 100);
        var threshold = Number((options && options.threshold) || 160);
        var state = {
            allItems: [],
            visibleItems: [],
            cursor: 0,
            loading: false,
            hasMore: false
        };
        var scrollEl = null;

        if (typeof onData !== "function") throw new Error("onData is required");

        function notifyState() {
            if (typeof onStateChange === "function") {
                onStateChange({
                    allItems: state.allItems.slice(),
                    visibleItems: state.visibleItems.slice(),
                    cursor: state.cursor,
                    loading: state.loading,
                    hasMore: state.hasMore
                });
            }
        }

        function resolveScrollElement() {
            scrollEl = typeof getScrollElement === "function" ? getScrollElement() : null;
            return scrollEl;
        }

        function applyVisibleItems(append) {
            onData({
                items: state.visibleItems.slice(),
                append: !!append,
                hasMore: state.hasMore
            });
            notifyState();
        }

        function appendNext() {
            if (!state.hasMore || state.loading) return state.visibleItems.slice();

            state.loading = true;
            var nextCursor = Math.min(state.cursor + pageSize, state.allItems.length);
            state.visibleItems = state.allItems.slice(0, nextCursor);
            state.cursor = nextCursor;
            state.hasMore = state.cursor < state.allItems.length;
            state.loading = false;
            applyVisibleItems(true);
            return state.visibleItems.slice();
        }

        function maybeAppend() {
            var el = scrollEl || resolveScrollElement();
            if (!el || state.loading || !state.hasMore) return;
            var remain = el.scrollHeight - el.clientHeight - el.scrollTop;
            if (remain <= threshold) {
                appendNext();
            }
        }

        function bindScroll() {
            var el = resolveScrollElement();
            if (!el || el.dataset.vgridChunkBound === "1") return;
            el.dataset.vgridChunkBound = "1";
            el.addEventListener("scroll", maybeAppend, { passive: true });
        }

        function replaceItems(items) {
            state.allItems = Array.isArray(items) ? items.slice() : [];
            state.cursor = Math.min(pageSize, state.allItems.length);
            state.visibleItems = state.allItems.slice(0, state.cursor);
            state.hasMore = state.cursor < state.allItems.length;
            state.loading = false;
            applyVisibleItems(false);
            global.requestAnimationFrame(function () {
                maybeAppend();
            });
            return state.visibleItems.slice();
        }

        function destroy() {
            if (scrollEl) {
                scrollEl.removeEventListener("scroll", maybeAppend);
                if (scrollEl.dataset) delete scrollEl.dataset.vgridChunkBound;
            }
        }

        bindScroll();

        return {
            replaceItems: replaceItems,
            appendNext: appendNext,
            destroy: destroy,
            getVisibleItems: function () { return state.visibleItems.slice(); },
            getAllItems: function () { return state.allItems.slice(); },
            getState: function () {
                return {
                    allItems: state.allItems.slice(),
                    visibleItems: state.visibleItems.slice(),
                    cursor: state.cursor,
                    loading: state.loading,
                    hasMore: state.hasMore
                };
            }
        };
    }

    Grid.createVirtualTable = createVirtualTable;
    Grid.createVirtualGrid = createVirtualGrid;
    Grid.createPagedLoader = createPagedLoader;
    Grid.createChunkLoader = createChunkLoader;
    Grid.textCell = textCell;
    global.Grid = Grid;
})(window);
