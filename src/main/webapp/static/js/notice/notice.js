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
        return qs("#noticePage") || document;
    }

    function getFormRoot() {
        return qs("#noticeForm") || document;
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
            noti_seq: "",
            noti_type_cd: "",
            title: "",
            content: "",
            start_dt: "",
            end_dt: "",
            pin_yn: "N",
            popup_yn: "N",
            use_yn: "Y",
            view_cnt: "0"
        };
        Object.keys(defaults).forEach(function (k) {
            var el = qs("#" + k, root);
            if (el) el.value = defaults[k];
        });
    }

    function fillForm(row) {
        var root = getFormRoot();
        var keys = [
            "noti_seq", "noti_type_cd", "title", "content",
            "start_dt", "end_dt", "pin_yn", "popup_yn", "use_yn", "view_cnt"
        ];
        keys.forEach(function (k) {
            var el = qs("#" + k, root);
            if (!el) return;
            el.value = v(row, [k], "");
        });

        if (!qs("#pin_yn", root).value) qs("#pin_yn", root).value = "N";
        if (!qs("#popup_yn", root).value) qs("#popup_yn", root).value = "N";
        if (!qs("#use_yn", root).value) qs("#use_yn", root).value = "Y";
        if (!qs("#view_cnt", root).value) qs("#view_cnt", root).value = "0";
    }

    function collectFormParam() {
        var root = getFormRoot();
        var seq = strOrNull(qs("#noti_seq", root) ? qs("#noti_seq", root).value : null);
        var param = {
            noti_type_cd: strOrNull(qs("#noti_type_cd", root) ? qs("#noti_type_cd", root).value : null),
            title: strOrNull(qs("#title", root) ? qs("#title", root).value : null),
            content: strOrNull(qs("#content", root) ? qs("#content", root).value : null),
            start_dt: strOrNull(qs("#start_dt", root) ? qs("#start_dt", root).value : null),
            end_dt: strOrNull(qs("#end_dt", root) ? qs("#end_dt", root).value : null),
            pin_yn: strOrNull(qs("#pin_yn", root) ? qs("#pin_yn", root).value : "N"),
            popup_yn: strOrNull(qs("#popup_yn", root) ? qs("#popup_yn", root).value : "N"),
            use_yn: strOrNull(qs("#use_yn", root) ? qs("#use_yn", root).value : "Y")
        };
        if (seq) {
            param.noti_seq = Number(seq);
        }
        return param;
    }

    function renderTable(list) {
        var tbody = qs("#noticeListBody");
        if (!tbody) return;

        tbody.innerHTML = list.map(function (r) {
            var seq = v(r, ["noti_seq", "notiSeq"], "");
            var type = v(r, ["noti_type_cd", "notiTypeCd"], "");
            var title = v(r, ["title"], "");
            var startDt = v(r, ["start_dt", "startDt"], "");
            var endDt = v(r, ["end_dt", "endDt"], "");
            var pin = v(r, ["pin_yn", "pinYn"], "");
            var popup = v(r, ["popup_yn", "popupYn"], "");
            var view = v(r, ["view_cnt", "viewCnt"], 0);
            var use = v(r, ["use_yn", "useYn"], "");
            var period = (startDt || "") + (endDt ? " ~ " + endDt : "");

            return (
                '<tr class="notice-row" data-noti-seq="' + esc(seq) + '">' +
                '<td>' + esc(seq) + '</td>' +
                '<td>' + esc(type) + '</td>' +
                '<td>' + esc(title) + '</td>' +
                '<td>' + esc(period) + '</td>' +
                '<td>' + esc(pin) + '</td>' +
                '<td>' + esc(popup) + '</td>' +
                '<td>' + esc(view) + '</td>' +
                '<td>' + esc(use) + '</td>' +
                '</tr>'
            );
        }).join("");

        qsa("tr.notice-row", tbody).forEach(function (tr) {
            tr.addEventListener("click", async function () {
                qsa("tr.notice-row.selected", tbody).forEach(function (x) {
                    x.classList.remove("selected");
                });
                tr.classList.add("selected");

                var seq = Number(tr.getAttribute("data-noti-seq"));
                if (!seq) return;

                try {
                    var data = await global.jsAdminSpa.call("/notice/detail.json", { noti_seq: seq });
                    if (data) fillForm(data);
                } catch (e) {
                    alert("상세 조회 실패: " + (e && e.message ? e.message : e));
                }
            });
        });
    }

    async function loadList() {
        var rows = await global.jsAdminSpa.call("/notice/list.json", {});
        if (!Array.isArray(rows)) rows = [];
        renderTable(rows);
    }

    async function saveNotice() {
        try {
            var param = collectFormParam();
            if (!param.title) {
                alert("TITLE은 필수입니다.");
                return;
            }
            if (param.start_dt && param.end_dt && param.start_dt > param.end_dt) {
                alert("START_DT는 END_DT보다 클 수 없습니다.");
                return;
            }

            await global.jsAdminSpa.call("/notice/save.json", param);
            await loadList();
            clearForm();
            alert("저장 완료");
        } catch (e) {
            alert("저장 실패: " + (e && e.message ? e.message : e));
        }
    }

    async function deleteNotice() {
        try {
            var seq = Number((qs("#noti_seq") && qs("#noti_seq").value) || 0);
            if (!seq) {
                alert("삭제할 공지를 선택하세요.");
                return;
            }
            if (!confirm("삭제하시겠습니까?")) return;

            await global.jsAdminSpa.call("/notice/delete.json", { noti_seq: seq });
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
        bindOnce("#btnNoticeSearch", "click", function (e) { e.preventDefault(); loadList(); });
        bindOnce("#btnNoticeSave", "click", function (e) { e.preventDefault(); saveNotice(); });
        bindOnce("#btnNoticeDelete", "click", function (e) { e.preventDefault(); deleteNotice(); });
        bindOnce("#btnNoticeNew", "click", function (e) { e.preventDefault(); clearForm(); });
        bindOnce("#btnNoticeRefresh", "click", function (e) { e.preventDefault(); loadList(); });
    }

    function init() {
        if (!qs("#noticeListBody")) return;
        bindButtonsOnce();
        applyPerm();
        clearForm();
        loadList();
    }

    if (!window.__NOTICE_PAGELOADED_BOUND__) {
        window.__NOTICE_PAGELOADED_BOUND__ = true;
        document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (url === "/notice/main.do") {
                init();
            }
        });
    }

    try { init(); } catch (e) {}

})(window);
