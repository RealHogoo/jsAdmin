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

    function renderIntroMarkdown(markdown) {
        var lines = String(markdown || "").split(/\r?\n/);
        var html = [];
        var listOpen = false;

        function closeList() {
            if (!listOpen) return;
            html.push("</ul>");
            listOpen = false;
        }

        lines.forEach(function (raw) {
            var line = raw == null ? "" : String(raw).trim();

            if (!line || line === "---") {
                closeList();
                return;
            }

            if (line.indexOf("```") === 0) {
                closeList();
                return;
            }

            if (line.indexOf("# ") === 0) {
                closeList();
                html.push("<h3 class='home-intro-title'>" + UX.esc(line.substring(2).trim()) + "</h3>");
                return;
            }

            if (line.indexOf("## ") === 0) {
                closeList();
                html.push("<h4 class='home-intro-section'>" + UX.esc(line.substring(3).replace(/^\d+(?:\.\d+)*\.\s*/, "").trim()) + "</h4>");
                return;
            }

            if (line.indexOf("### ") === 0) {
                closeList();
                html.push("<h5 class='home-intro-subsection'>" + UX.esc(line.substring(4).trim()) + "</h5>");
                return;
            }

            if (line.indexOf("- ") === 0) {
                if (!listOpen) {
                    html.push("<ul class='home-intro-list'>");
                    listOpen = true;
                }
                html.push("<li>" + UX.esc(line.substring(2).trim()) + "</li>");
                return;
            }

            closeList();
            html.push("<p class='home-intro-summary'>" + UX.esc(line) + "</p>");
        });

        closeList();
        return html.join("");
    }

    function loadIntro(page) {
        return app.callJson("/home/intro.json", {}, function (data) {
            if (!data) return;
            var markdownRoot = UX.qs("#homeIntroMarkdown", page);
            if (markdownRoot) {
                markdownRoot.innerHTML = renderIntroMarkdown(data.raw_markdown || "");
            }
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
