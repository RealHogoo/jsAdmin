(function (global) {
    "use strict";

    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function esc(v) {
        if (v === null || v === undefined) return "";
        return String(v)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function formatPeriod(startDt, endDt) {
        var s = startDt ? String(startDt) : "Always";
        var e = endDt ? String(endDt) : "";
        return e ? (s + " ~ " + e) : s;
    }

    async function loadIntro(root) {
        var data = await global.jsAdminSpa.call("/home/intro.json", {});
        if (!data) return;

        qs("#homeIntroTitle", root).textContent = data.title || "MSA admin-service";
        qs("#homeIntroSummary", root).textContent = data.summary || "";

        var list = Array.isArray(data.highlights) ? data.highlights : [];
        qs("#homeIntroList", root).innerHTML = list.map(function (item) {
            return "<li>" + esc(item) + "</li>";
        }).join("");

        var raw = qs("#homeIntroRaw", root);
        if (raw) {
            raw.textContent = data.raw_markdown || "";
        }
    }

    function renderNoticeCards(root, rows) {
        var track = qs("#homeNoticeTrack", root);
        if (!track) return;

        if (!rows.length) {
            track.innerHTML = "<div class='home-notice-empty'>No notices found.</div>";
            return;
        }

        track.innerHTML = rows.map(function (r) {
            var seq = r.noti_seq || "";
            var title = r.title || "(No title)";
            var period = formatPeriod(r.start_dt, r.end_dt);
            var pin = (r.pin_yn || "N") === "Y";
            var typeCd = r.noti_type_cd || "GENERAL";

            return ""
                + "<article class='notice-card' data-noti-seq='" + esc(seq) + "'>"
                + "  <div class='notice-card-top'>"
                + "    <span class='notice-type'>" + esc(typeCd) + "</span>"
                + (pin ? "    <span class='notice-pin'>PIN</span>" : "")
                + "  </div>"
                + "  <h4 class='notice-title'>" + esc(title) + "</h4>"
                + "  <p class='notice-period'>Period: " + esc(period) + "</p>"
                + "</article>";
        }).join("");
    }

    async function loadNotices(root) {
        var rows = await global.jsAdminSpa.call("/notice/list.json", { use_yn: "Y" });
        if (!Array.isArray(rows)) rows = [];
        renderNoticeCards(root, rows.slice(0, 8));
    }

    async function init() {
        var root = qs("#homePage");
        if (!root) return;

        await loadIntro(root);
        await loadNotices(root);
    }

    if (!global.__HOME_DASHBOARD_BOUND__) {
        global.__HOME_DASHBOARD_BOUND__ = true;
        document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (url === "/home.do") {
                init();
            }
        });
    }

    try { init(); } catch (e) {}
})(window);
