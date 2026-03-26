(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__TIMELINE_HOME_BOUND__) return;
    global.__TIMELINE_HOME_BOUND__ = true;

    var state = {
        page: 1,
        size: 18,
        loading: false,
        hasMore: true,
        rows: [],
        observer: null
    };

    function setLoading(show) {
        var el = UX.qs("#timelineHomeLoading");
        if (el) el.style.display = show ? "" : "none";
    }

    function setEmpty(show) {
        var el = UX.qs("#timelineHomeEmpty");
        if (el) el.style.display = show ? "" : "none";
    }

    function cardHtml(row) {
        return "<article class='timeline-card' data-timeline-seq='" + UX.esc(UX.value(row, ["timeline_seq", "timelineSeq"], "")) + "'>"
            + "<div class='timeline-card-top'>"
            + "<span class='timeline-card-type'>" + UX.esc(UX.value(row, ["timeline_type_cd", "timelineTypeCd"], "") || "NO-TYPE") + "</span>"
            + "<span class='timeline-card-date'>" + UX.esc(UX.value(row, ["event_dt", "eventDt"], "")) + "</span>"
            + "</div>"
            + "<h4 class='timeline-card-title'>" + UX.esc(UX.value(row, ["title"], "")) + "</h4>"
            + "<p class='timeline-card-content'>" + UX.esc(UX.value(row, ["content_preview", "contentPreview"], "")) + "</p>"
            + "<div class='timeline-card-meta'>SEQ " + UX.esc(UX.value(row, ["timeline_seq", "timelineSeq"], "")) + " | USE " + UX.esc(UX.value(row, ["use_yn", "useYn"], "")) + "</div>"
            + "</article>";
    }

    function renderCards() {
        var root = UX.qs("#timelineHomeCardList");
        if (!root) return;
        if (!state.rows.length) {
            root.innerHTML = "";
            setEmpty(true);
            return;
        }
        setEmpty(false);
        root.innerHTML = state.rows.map(cardHtml).join("");
    }

    function loadNextPage() {
        if (state.loading || !state.hasMore) return Promise.resolve();
        state.loading = true;
        setLoading(true);

        return app.callJson("/timeline/list.json", {
            page: state.page,
            size: state.size
        }, function (rows) {
            rows = Array.isArray(rows) ? rows : [];
            state.rows = state.rows.concat(rows);
            renderCards();
            state.hasMore = rows.length === state.size;
            if (state.hasMore) state.page += 1;
        }).finally(function () {
            state.loading = false;
            setLoading(false);
        });
    }

    function disconnectObserver() {
        if (state.observer) {
            state.observer.disconnect();
            state.observer = null;
        }
    }

    function setupInfiniteScroll() {
        disconnectObserver();
        var sentinel = UX.qs("#timelineHomeSentinel");
        var scrollRoot = UX.qs("#timelineHomeScroll");
        if (!sentinel) return;
        state.observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) loadNextPage();
            });
        }, { root: scrollRoot || null, rootMargin: "200px 0px 200px 0px", threshold: 0 });
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
        if (!UX.qs("#timelineHomeCardList")) return;
        setupInfiniteScroll();
        resetAndLoad();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/timeline/home.do") init();
    });

    try { init(); } catch (e) {}
})(window);
