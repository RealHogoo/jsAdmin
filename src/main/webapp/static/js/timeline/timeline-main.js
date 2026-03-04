(function (global) {
    "use strict";

    function qs(sel, root) {
        return (root || document).querySelector(sel);
    }

    function qsa(sel, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(sel));
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

    function strOrNull(s) {
        if (s === undefined || s === null) return null;
        var t = String(s).trim();
        if (!t || t.toLowerCase() === "null") return null;
        return t;
    }

    function getPageRoot() {
        return qs("#timelinePage") || document;
    }

    function getFormRoot() {
        return qs("#timelineForm") || document;
    }

    function getPermLvlFromPage() {
        var root = getPageRoot();
        var lvl = root ? root.getAttribute("data-perm-lvl") : null;
        if (lvl === null || lvl === undefined || String(lvl).trim() === "") return null;
        var n = Number(lvl);
        if (!Number.isFinite(n) || n === 0) return null;
        return n;
    }

    function setDisabled(el, disabled) {
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

    function applyPerm() {
        var permLvl = getPermLvlFromPage();
        if (permLvl === null) return;
        qsa("[data-perm-lvl]", getPageRoot()).forEach(function (el) {
            var need = Number(el.getAttribute("data-perm-lvl"));
            if (!Number.isFinite(need)) return;
            setDisabled(el, permLvl < need);
        });
    }

    function clearForm() {
        var root = getFormRoot();
        var defaults = {
            timeline_seq: "",
            timeline_type_cd: "",
            title: "",
            content: "",
            event_dt: "",
            use_yn: "Y"
        };
        Object.keys(defaults).forEach(function (k) {
            var el = qs("#" + k, root);
            if (el) el.value = defaults[k];
        });
    }

    function fillForm(row) {
        var root = getFormRoot();
        var keys = ["timeline_seq", "timeline_type_cd", "title", "content", "event_dt", "use_yn"];
        keys.forEach(function (k) {
            var el = qs("#" + k, root);
            if (!el) return;
            el.value = v(row, [k], "");
        });
        if (!qs("#use_yn", root).value) qs("#use_yn", root).value = "Y";
    }

    function collectFormParam() {
        var root = getFormRoot();
        var seq = strOrNull(qs("#timeline_seq", root) ? qs("#timeline_seq", root).value : null);
        var param = {
            timeline_type_cd: strOrNull(qs("#timeline_type_cd", root) ? qs("#timeline_type_cd", root).value : null),
            title: strOrNull(qs("#title", root) ? qs("#title", root).value : null),
            content: strOrNull(qs("#content", root) ? qs("#content", root).value : null),
            event_dt: strOrNull(qs("#event_dt", root) ? qs("#event_dt", root).value : null),
            use_yn: strOrNull(qs("#use_yn", root) ? qs("#use_yn", root).value : "Y")
        };
        if (seq) param.timeline_seq = Number(seq);
        return param;
    }

    function collectSearchParam() {
        return {
            event_dt_from: strOrNull(qs("#event_dt_from") ? qs("#event_dt_from").value : null),
            event_dt_to: strOrNull(qs("#event_dt_to") ? qs("#event_dt_to").value : null),
            title: strOrNull(qs("#search_title") ? qs("#search_title").value : null)
        };
    }

    function renderTable(list) {
        var tbody = qs("#timelineListBody");
        if (!tbody) return;

        tbody.innerHTML = list.map(function (r) {
            var seq = v(r, ["timeline_seq", "timelineSeq"], "");
            var type = v(r, ["timeline_type_cd", "timelineTypeCd"], "");
            var title = v(r, ["title"], "");
            var eventDt = v(r, ["event_dt", "eventDt"], "");
            var useYn = v(r, ["use_yn", "useYn"], "");

            return (
                '<tr class="timeline-row" data-timeline-seq="' + esc(seq) + '">' +
                "<td>" + esc(seq) + "</td>" +
                "<td>" + esc(type) + "</td>" +
                "<td>" + esc(title) + "</td>" +
                "<td>" + esc(eventDt) + "</td>" +
                "<td>" + esc(useYn) + "</td>" +
                "</tr>"
            );
        }).join("");

        qsa("tr.timeline-row", tbody).forEach(function (tr) {
            tr.addEventListener("click", async function () {
                qsa("tr.timeline-row.selected", tbody).forEach(function (x) {
                    x.classList.remove("selected");
                });
                tr.classList.add("selected");

                var seq = Number(tr.getAttribute("data-timeline-seq"));
                if (!seq) return;

                try {
                    var data = await global.jsAdminSpa.call("/timeline/detail.json", { timeline_seq: seq });
                    if (data) fillForm(data);
                } catch (e) {
                    alert("상세 조회 실패: " + (e && e.message ? e.message : e));
                }
            });
        });
    }

    async function loadList() {
        var rows = await global.jsAdminSpa.call("/timeline/list.json", collectSearchParam());
        if (!Array.isArray(rows)) rows = [];
        renderTable(rows);
    }

    async function saveTimeline() {
        try {
            var param = collectFormParam();
            if (!param.title) {
                alert("TITLE은 필수입니다.");
                return;
            }
            if (!param.event_dt) {
                alert("EVENT_DT는 필수입니다.");
                return;
            }

            await global.jsAdminSpa.call("/timeline/save.json", param);
            await loadList();
            clearForm();
            alert("저장 완료");
        } catch (e) {
            alert("저장 실패: " + (e && e.message ? e.message : e));
        }
    }

    async function deleteTimeline() {
        try {
            var seq = Number((qs("#timeline_seq") && qs("#timeline_seq").value) || 0);
            if (!seq) {
                alert("삭제할 타임라인을 선택하세요.");
                return;
            }
            if (!confirm("삭제하시겠습니까?")) return;

            await global.jsAdminSpa.call("/timeline/delete.json", { timeline_seq: seq });
            await loadList();
            clearForm();
            alert("삭제 완료");
        } catch (e) {
            alert("삭제 실패: " + (e && e.message ? e.message : e));
        }
    }

    function bindOnce(sel, evt, handler) {
        var el = qs(sel);
        if (!el) return;
        var key = "bound_" + evt;
        if (el.dataset[key] === "1") return;
        el.dataset[key] = "1";
        el.addEventListener(evt, handler);
    }

    function bindButtonsOnce() {
        bindOnce("#btnTimelineSearch", "click", function (e) { e.preventDefault(); loadList(); });
        bindOnce("#btnTimelineSave", "click", function (e) { e.preventDefault(); saveTimeline(); });
        bindOnce("#btnTimelineDelete", "click", function (e) { e.preventDefault(); deleteTimeline(); });
        bindOnce("#btnTimelineNew", "click", function (e) { e.preventDefault(); clearForm(); });
        bindOnce("#btnTimelineRefresh", "click", function (e) { e.preventDefault(); loadList(); });
    }

    function init() {
        if (!qs("#timelineListBody")) return;
        bindButtonsOnce();
        applyPerm();
        clearForm();
        loadList();
    }

    if (!window.__TIMELINE_MAIN_PAGELOADED_BOUND__) {
        window.__TIMELINE_MAIN_PAGELOADED_BOUND__ = true;
        document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (url === "/timeline/main.do") init();
        });
    }

    try { init(); } catch (e) {}

})(window);
