(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;
    var showingPopupSeqs = global.__HOME_NOTICE_POPUP_SHOWING__ || {};
    global.__HOME_NOTICE_POPUP_SHOWING__ = showingPopupSeqs;

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

    function isActiveNotice(row) {
        if (!row || (row.use_yn || "Y") !== "Y") return false;
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        if (row.start_dt) {
            var start = new Date(String(row.start_dt) + "T00:00:00");
            if (!isNaN(start.getTime()) && start > today) return false;
        }
        if (row.end_dt) {
            var end = new Date(String(row.end_dt) + "T23:59:59");
            if (!isNaN(end.getTime()) && end < new Date()) return false;
        }
        return true;
    }

    function suppressKey(row) {
        return "jsadmin.notice.popup.hide." + String(row && row.noti_seq || "");
    }

    function isSuppressedToday(row) {
        try {
            return global.localStorage.getItem(suppressKey(row)) === new Date().toISOString().slice(0, 10);
        } catch (e) {
            return false;
        }
    }

    function suppressToday(row) {
        try {
            global.localStorage.setItem(suppressKey(row), new Date().toISOString().slice(0, 10));
        } catch (e) {}
    }

    function closeNoticePopup(modal) {
        var seq = modal && modal.getAttribute ? modal.getAttribute("data-noti-seq") : null;
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
        if (seq) {
            delete showingPopupSeqs[seq];
        }
    }

    function showNoticePopup(detail) {
        if (!detail || !detail.noti_seq || isSuppressedToday(detail)) return;
        var popupSeq = String(detail.noti_seq);
        if (showingPopupSeqs[popupSeq] || document.querySelector(".notice-popup-backdrop[data-noti-seq='" + popupSeq + "']")) {
            return;
        }
        showingPopupSeqs[popupSeq] = true;

        var modal = document.createElement("div");
        modal.className = "notice-popup-backdrop";
        modal.setAttribute("data-noti-seq", popupSeq);

        var panel = document.createElement("section");
        panel.className = "notice-popup-panel";

        var head = document.createElement("div");
        head.className = "notice-popup-head";

        var titleWrap = document.createElement("div");
        var type = document.createElement("span");
        type.className = "notice-type";
        type.textContent = detail.noti_type_cd || "GENERAL";
        var title = document.createElement("h3");
        title.className = "notice-popup-title";
        title.textContent = detail.title || "공지사항";
        titleWrap.appendChild(type);
        titleWrap.appendChild(title);

        var closeButton = document.createElement("button");
        closeButton.type = "button";
        closeButton.className = "notice-popup-close";
        closeButton.setAttribute("aria-label", "닫기");
        closeButton.textContent = "×";

        head.appendChild(titleWrap);
        head.appendChild(closeButton);

        var period = document.createElement("div");
        period.className = "notice-popup-period";
        period.textContent = formatPeriod(detail.start_dt, detail.end_dt);

        var body = document.createElement("div");
        body.className = "notice-popup-body";
        body.textContent = detail.content || "";

        var actions = document.createElement("div");
        actions.className = "notice-popup-actions";

        var hideTodayButton = document.createElement("button");
        hideTodayButton.type = "button";
        hideTodayButton.className = "btn";
        hideTodayButton.textContent = "오늘 하루 보지 않기";

        var okButton = document.createElement("button");
        okButton.type = "button";
        okButton.className = "btn primary";
        okButton.textContent = "확인";

        actions.appendChild(hideTodayButton);
        actions.appendChild(okButton);

        panel.appendChild(head);
        panel.appendChild(period);
        panel.appendChild(body);
        panel.appendChild(actions);
        modal.appendChild(panel);
        document.body.appendChild(modal);

        closeButton.addEventListener("click", function () {
            closeNoticePopup(modal);
        });
        okButton.addEventListener("click", function () {
            closeNoticePopup(modal);
        });
        hideTodayButton.addEventListener("click", function () {
            suppressToday(detail);
            closeNoticePopup(modal);
        });
    }

    function showNoticePopups() {
        app.callJson("/notice/popup/list.json", {}, function (rows) {
            (Array.isArray(rows) ? rows : []).filter(function (row) {
                return (row.popup_yn || "N") === "Y" && isActiveNotice(row) && !isSuppressedToday(row);
            }).slice(0, 1).forEach(showNoticePopup);
        }).catch(function () {});
    }

    function loadNotices(page) {
        return app.callJson("/notice/list.json", { use_yn: "Y" }, function (rows) {
            var notices = Array.isArray(rows) ? rows : [];
            renderNoticeCards(page, notices.slice(0, 8));
            showNoticePopups();
        });
    }

    function init() {
        var page = root();
        if (!page) return;
        if (page.dataset.homeInited === "1") return;
        page.dataset.homeInited = "1";
        loadIntro(page);
        loadNotices(page);
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/home.do") init();
    });

    try { init(); } catch (e) {}
})(window);
