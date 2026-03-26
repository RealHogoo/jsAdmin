(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__HOME_DASHBOARD_BOUND__) return;
    global.__HOME_DASHBOARD_BOUND__ = true;

    function root() {
        return UX.qs("#homePage");
    }

    function formatPeriod(startDt, endDt) {
        var start = startDt ? String(startDt) : "Always";
        return endDt ? (start + " ~ " + endDt) : start;
    }

    function loadIntro(page) {
        return app.callJson("/home/intro.json", {}, function (data) {
            if (!data) return;
            UX.setText("#homeIntroTitle", data.title || "MSA admin-service", page);
            UX.setText("#homeIntroSummary", data.summary || "", page);

            var list = Array.isArray(data.highlights) ? data.highlights : [];
            var listRoot = UX.qs("#homeIntroList", page);
            if (listRoot) {
                listRoot.innerHTML = list.map(function (item) {
                    return "<li>" + UX.esc(item) + "</li>";
                }).join("");
            }

            var raw = UX.qs("#homeIntroRaw", page);
            if (raw) raw.textContent = data.raw_markdown || "";
        });
    }

    function renderNoticeCards(page, rows) {
        var track = UX.qs("#homeNoticeTrack", page);
        if (!track) return;

        if (!rows.length) {
            track.innerHTML = "<div class='home-notice-empty'>No notices found.</div>";
            return;
        }

        track.innerHTML = rows.map(function (row) {
            var pin = (row.pin_yn || "N") === "Y";
            return "<article class='notice-card' data-noti-seq='" + UX.esc(row.noti_seq || "") + "'>"
                + "<div class='notice-card-top'>"
                + "<span class='notice-type'>" + UX.esc(row.noti_type_cd || "GENERAL") + "</span>"
                + (pin ? "<span class='notice-pin'>PIN</span>" : "")
                + "</div>"
                + "<h4 class='notice-title'>" + UX.esc(row.title || "(No title)") + "</h4>"
                + "<p class='notice-period'>Period: " + UX.esc(formatPeriod(row.start_dt, row.end_dt)) + "</p>"
                + "</article>";
        }).join("");
    }

    function loadNotices(page) {
        return app.callJson("/notice/list.json", { use_yn: "Y" }, function (rows) {
            renderNoticeCards(page, (Array.isArray(rows) ? rows : []).slice(0, 8));
        });
    }

    function init() {
        var page = root();
        if (!page) return;
        loadIntro(page);
        loadNotices(page);
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/home.do") init();
    });

    try { init(); } catch (e) {}
})(window);
