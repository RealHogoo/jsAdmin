(function (global) {
    "use strict";

    var state = {
        page: 1,
        size: 18,
        loading: false,
        hasMore: true,
        rows: [],
        observer: null
    };

    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function v(obj, keys, fallback) {
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (obj && obj[k] !== undefined && obj[k] !== null) return obj[k];
        }
        return fallback;
    }

    function esc(s) {
        if (s === undefined || s === null) return "";
        return String(s)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setLoading(show) {
        var el = qs("#timelineHomeLoading");
        if (!el) return;
        el.style.display = show ? "" : "none";
    }

    function setEmpty(show) {
        var el = qs("#timelineHomeEmpty");
        if (!el) return;
        el.style.display = show ? "" : "none";
    }

    function cardHtml(r) {
        var seq = v(r, ["timeline_seq", "timelineSeq"], "");
        var type = v(r, ["timeline_type_cd", "timelineTypeCd"], "");
        var title = v(r, ["title"], "");
        var eventDt = v(r, ["event_dt", "eventDt"], "");
        var useYn = v(r, ["use_yn", "useYn"], "");
        var preview = v(r, ["content_preview", "contentPreview"], "");

        return (
            '<article class="timeline-card" data-timeline-seq="' + esc(seq) + '">' +
            '<div class="timeline-card-top">' +
            '<span class="timeline-card-type">' + esc(type || "NO-TYPE") + "</span>" +
            '<span class="timeline-card-date">' + esc(eventDt) + "</span>" +
            "</div>" +
            '<h4 class="timeline-card-title">' + esc(title) + "</h4>" +
            '<p class="timeline-card-content">' + esc(preview || "") + "</p>" +
            '<div class="timeline-card-meta">SEQ ' + esc(seq) + " | USE " + esc(useYn) + "</div>" +
            "</article>"
        );
    }

    function renderCards() {
        var root = qs("#timelineHomeCardList");
        if (!root) return;
        if (state.rows.length === 0) {
            root.innerHTML = "";
            setEmpty(true);
            return;
        }
        setEmpty(false);
        root.innerHTML = state.rows.map(cardHtml).join("");
    }

    async function loadNextPage() {
        if (state.loading || !state.hasMore) return;
        state.loading = true;
        setLoading(true);
        try {
            var rows = await global.jsAdminSpa.call("/timeline/list.json", {
                page: state.page,
                size: state.size
            });
            if (!Array.isArray(rows)) rows = [];
            state.rows = state.rows.concat(rows);
            renderCards();
            state.hasMore = rows.length === state.size;
            if (state.hasMore) state.page += 1;
        } finally {
            state.loading = false;
            setLoading(false);
        }
    }

    function disconnectObserver() {
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }
    }

    function setupInfiniteScroll() {
        disconnectObserver();
        var sentinel = qs("#timelineHomeSentinel");
        if (!sentinel) return;
        state.observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) loadNextPage();
            });
        }, { root: null, rootMargin: "200px 0px 200px 0px", threshold: 0 });
        state.observer.observe(sentinel);
    }

    function resetAndLoad() {
        state.page = 1;
        state.hasMore = true;
        state.rows = [];
        renderCards();
        loadNextPage();
    }

    function init() {
        if (!qs("#timelineHomeCardList")) return;
        setupInfiniteScroll();
        resetAndLoad();
    }

    if (!window.__TIMELINE_HOME_PAGELOADED_BOUND__) {
        window.__TIMELINE_HOME_PAGELOADED_BOUND__ = true;
        document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (url === "/timeline/home.do") init();
        });
    }

    try { init(); } catch (e) {}
})(window);
