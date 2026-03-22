(function (global) {
    "use strict";

    var UX = global.UX || {};
    global.UX = UX;

    function define(name, fn) {
        UX[name] = fn;
        if (typeof global[name] === "undefined") {
            global[name] = fn;
        }
    }

    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function qsa(sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function esc(value) {
        if (value === null || value === undefined) return "";
        return String(value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function strOrNull(value) {
        if (value === null || value === undefined) return null;
        var text = String(value).trim();
        if (!text || text.toLowerCase() === "null") return null;
        return text;
    }

    function numOrNull(value) {
        var text = strOrNull(value);
        if (text === null) return null;
        var num = Number(text);
        return Number.isFinite(num) ? num : null;
    }

    function normalizeText(value, fallback) {
        var text = strOrNull(value);
        return text === null ? (fallback || "") : text;
    }

    function shortText(value, max) {
        var text = normalizeText(value);
        if (!text) return "-";
        return text.length > max ? text.substring(0, max) + "..." : text;
    }

    function value(obj, keys, fallback) {
        var list = Array.isArray(keys) ? keys : [keys];
        for (var i = 0; i < list.length; i++) {
            var key = list[i];
            if (obj && obj[key] !== undefined && obj[key] !== null) {
                return obj[key];
            }
        }
        return fallback;
    }

    function getValue(selectorOrEl, root) {
        var el = typeof selectorOrEl === "string" ? qs(selectorOrEl, root) : selectorOrEl;
        return el ? normalizeText(el.value) : "";
    }

    function setValue(selectorOrEl, value, root) {
        var el = typeof selectorOrEl === "string" ? qs(selectorOrEl, root) : selectorOrEl;
        if (el) el.value = value == null ? "" : value;
    }

    function setText(selectorOrEl, value, root) {
        var el = typeof selectorOrEl === "string" ? qs(selectorOrEl, root) : selectorOrEl;
        if (el) el.textContent = value == null ? "" : String(value);
    }

    function clearValues(ids, root) {
        (ids || []).forEach(function (id) {
            setValue("#" + id, "", root);
        });
    }

    function bindOnce(el, evt, handler, key) {
        if (!el) return;
        var boundKey = key || ("bound_" + evt);
        if (el.dataset && el.dataset[boundKey] === "1") return;
        if (el.dataset) el.dataset[boundKey] = "1";
        el.addEventListener(evt, handler);
    }

    function setDisabled(el, disabled) {
        if (!el) return;
        if ("disabled" in el) {
            el.disabled = !!disabled;
            return;
        }
        if (disabled) {
            el.setAttribute("aria-disabled", "true");
            el.setAttribute("data-disabled", "true");
            el.classList.add("is-disabled");
        } else {
            el.removeAttribute("aria-disabled");
            el.removeAttribute("data-disabled");
            el.classList.remove("is-disabled");
        }
    }

    function formatDateInput(date) {
        if (!(date instanceof Date) || isNaN(date.getTime())) return "";
        var year = date.getFullYear();
        var month = String(date.getMonth() + 1).padStart(2, "0");
        var day = String(date.getDate()).padStart(2, "0");
        return year + "-" + month + "-" + day;
    }

    function localGet(key, fallback) {
        try {
            var value = localStorage.getItem(key);
            return value == null ? fallback : value;
        } catch (e) {
            return fallback;
        }
    }

    function localSet(key, value) {
        try {
            localStorage.setItem(key, value);
        } catch (e) {}
    }

    function localRemove(keys) {
        (Array.isArray(keys) ? keys : [keys]).forEach(function (key) {
            try { localStorage.removeItem(key); } catch (e) {}
        });
    }

    function sessionGet(key, fallback) {
        try {
            var value = sessionStorage.getItem(key);
            return value == null ? fallback : value;
        } catch (e) {
            return fallback;
        }
    }

    function sessionSet(key, value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {}
    }

    function sessionRemove(keys) {
        (Array.isArray(keys) ? keys : [keys]).forEach(function (key) {
            try { sessionStorage.removeItem(key); } catch (e) {}
        });
    }

    function closestScrollable(el) {
        var node = el ? el.parentElement : null;
        while (node) {
            var style = global.getComputedStyle ? global.getComputedStyle(node) : null;
            var overflowY = style ? style.overflowY : "";
            if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) {
                return node;
            }
            node = node.parentElement;
        }
        return qs(".app-main") || global;
    }

    function createVirtualTable(options) {
        var tbody = options && options.tbody;
        if (!tbody) throw new Error("tbody is required");

        var colCount = Number(options.colCount || 1);
        var rowHeight = Number(options.rowHeight || 44);
        var overscan = Number(options.overscan || 8);
        var emptyHtml = options.emptyHtml || ("<tr><td colspan='" + colCount + "'>No Data</td></tr>");
        var renderRow = options.renderRow;
        var onRendered = typeof options.onRendered === "function" ? options.onRendered : null;
        var scroller = options.scroller || closestScrollable(tbody);
        var items = [];
        var rafId = 0;

        function getScrollTop() {
            if (scroller === global) {
                return global.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
            }
            return scroller.scrollTop;
        }

        function getViewportHeight() {
            if (scroller === global) {
                return global.innerHeight || document.documentElement.clientHeight || 0;
            }
            return scroller.clientHeight;
        }

        function getOffsetTop() {
            var bodyRect = tbody.getBoundingClientRect();
            if (scroller === global) {
                return bodyRect.top + getScrollTop();
            }
            var scrollRect = scroller.getBoundingClientRect();
            return bodyRect.top - scrollRect.top + getScrollTop();
        }

        function spacer(heightPx) {
            if (heightPx <= 0) return "";
            return "<tr class='virtual-spacer' aria-hidden='true'><td colspan='" + colCount + "'><div class='virtual-spacer__block' style='height:" + heightPx + "px;'></div></td></tr>";
        }

        function render() {
            if (!tbody) return;

            if (!Array.isArray(items) || items.length === 0) {
                tbody.innerHTML = emptyHtml;
                if (onRendered) onRendered({ start: 0, end: 0, items: [] });
                return;
            }

            var totalHeight = items.length * rowHeight;
            var tableTop = getOffsetTop();
            var visibleTop = Math.max(getScrollTop() - tableTop, 0);
            var visibleBottom = Math.min(visibleTop + getViewportHeight(), totalHeight);
            var start = Math.max(Math.floor(visibleTop / rowHeight) - overscan, 0);
            var end = Math.min(Math.ceil(visibleBottom / rowHeight) + overscan, items.length);
            if (end <= start) end = Math.min(start + overscan * 2, items.length);

            var html = spacer(start * rowHeight);
            for (var i = start; i < end; i++) {
                html += renderRow(items[i], i);
            }
            html += spacer(Math.max((items.length - end) * rowHeight, 0));
            tbody.innerHTML = html;

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
            if (scroller && scroller.removeEventListener) {
                scroller.removeEventListener("scroll", requestRender);
            }
            global.removeEventListener("resize", requestRender);
        }

        if (scroller && scroller.addEventListener) {
            scroller.addEventListener("scroll", requestRender, { passive: true });
        }
        global.addEventListener("resize", requestRender);

        return {
            setItems: setItems,
            refresh: refresh,
            destroy: destroy,
            getItems: function () { return items.slice(); }
        };
    }

    define("qs", qs);
    define("qsa", qsa);
    define("byId", byId);
    define("esc", esc);
    define("strOrNull", strOrNull);
    define("numOrNull", numOrNull);
    define("normalizeText", normalizeText);
    define("shortText", shortText);
    define("value", value);
    define("getValue", getValue);
    define("setValue", setValue);
    define("setText", setText);
    define("clearValues", clearValues);
    define("bindOnce", bindOnce);
    define("setDisabled", setDisabled);
    define("formatDateInput", formatDateInput);
    define("localGet", localGet);
    define("localSet", localSet);
    define("localRemove", localRemove);
    define("sessionGet", sessionGet);
    define("sessionSet", sessionSet);
    define("sessionRemove", sessionRemove);
    define("closestScrollable", closestScrollable);
    define("createVirtualTable", createVirtualTable);
})(window);
