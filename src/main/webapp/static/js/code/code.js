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

    function numOrNull(s) {
        if (s === undefined || s === null) return null;
        var t = String(s).trim();
        if (!t || t.toLowerCase() === "null") return null;
        var n = Number(t);
        if (Number.isNaN(n)) return null;
        return n;
    }

    function strOrNull(s) {
        if (s === undefined || s === null) return null;
        var t = String(s).trim();
        if (!t || t.toLowerCase() === "null") return null;
        return t;
    }

    function getPageRoot() {
        return qs("#codePage") || document;
    }

    function getFormRoot() {
        return qs("#codeForm") || document;
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

    function fillForm(row) {
        var root = getFormRoot();
        var codeSeqEl = qs("#code_seq", root);
        if (codeSeqEl) codeSeqEl.value = v(row, ["code_seq", "codeSeq"], "");
        var grpEl = qs("#code_grp_cd", root);
        if (grpEl) grpEl.value = v(row, ["code_grp_cd", "codeGrpCd"], "");
        var codeEl = qs("#code_cd", root);
        if (codeEl) codeEl.value = v(row, ["code_cd", "codeCd"], "");
        var nmEl = qs("#code_nm", root);
        if (nmEl) nmEl.value = v(row, ["code_nm", "codeNm"], "");
        var descEl = qs("#code_desc", root);
        if (descEl) descEl.value = v(row, ["code_desc", "codeDesc"], "");
        var sortEl = qs("#sort_ord", root);
        if (sortEl) sortEl.value = v(row, ["sort_ord", "sortOrd"], "0");
        var useEl = qs("#use_yn", root);
        if (useEl) useEl.value = v(row, ["use_yn", "useYn"], "Y");
    }

    function clearForm() {
        fillForm({
            code_seq: "",
            code_grp_cd: "",
            code_cd: "",
            code_nm: "",
            code_desc: "",
            sort_ord: "0",
            use_yn: "Y"
        });
    }

    function collectFormParam() {
        var root = getFormRoot();
        var codeSeq = strOrNull(qs("#code_seq", root) ? qs("#code_seq", root).value : null);
        var param = {
            code_seq: codeSeq ? Number(codeSeq) : null,
            code_grp_cd: strOrNull(qs("#code_grp_cd", root) ? qs("#code_grp_cd", root).value : null),
            code_cd: strOrNull(qs("#code_cd", root) ? qs("#code_cd", root).value : null),
            code_nm: strOrNull(qs("#code_nm", root) ? qs("#code_nm", root).value : null),
            code_desc: strOrNull(qs("#code_desc", root) ? qs("#code_desc", root).value : null),
            sort_ord: numOrNull(qs("#sort_ord", root) ? qs("#sort_ord", root).value : null),
            use_yn: strOrNull(qs("#use_yn", root) ? qs("#use_yn", root).value : "Y")
        };
        if (param.code_seq === null) delete param.code_seq;
        if (param.sort_ord === null) param.sort_ord = 0;
        return param;
    }

    function renderTable(list) {
        var tbody = qs("#codeListBody");
        if (!tbody) return;

        tbody.innerHTML = list.map(function (r) {
            var codeSeq = v(r, ["code_seq", "codeSeq"], "");
            var grp = v(r, ["code_grp_cd", "codeGrpCd"], "");
            var cd = v(r, ["code_cd", "codeCd"], "");
            var nm = v(r, ["code_nm", "codeNm"], "");
            var desc = v(r, ["code_desc", "codeDesc"], "");
            var sort = v(r, ["sort_ord", "sortOrd"], "");
            var useYn = v(r, ["use_yn", "useYn"], "");

            return (
                '<tr class="code-row" data-code-seq="' + esc(codeSeq) + '">' +
                '<td>' + esc(codeSeq) + '</td>' +
                '<td>' + esc(grp) + '</td>' +
                '<td>' + esc(cd) + '</td>' +
                '<td>' + esc(nm) + '</td>' +
                '<td>' + esc(desc) + '</td>' +
                '<td>' + esc(sort) + '</td>' +
                '<td>' + esc(useYn) + '</td>' +
                '</tr>'
            );
        }).join("");

        qsa("tr.code-row", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                qsa("tr.code-row.selected", tbody).forEach(function (x) {
                    x.classList.remove("selected");
                });
                tr.classList.add("selected");

                var codeSeq = tr.getAttribute("data-code-seq");
                var found = null;
                for (var i = 0; i < list.length; i++) {
                    if (String(v(list[i], ["code_seq", "codeSeq"], "")) === String(codeSeq)) {
                        found = list[i];
                        break;
                    }
                }
                if (found) fillForm(found);
            });
        });
    }

    async function loadList() {
        var rows = await global.jsAdminSpa.call("/code/list.json", {});
        if (!Array.isArray(rows)) rows = [];
        renderTable(rows);
    }

    async function saveCode() {
        try {
            var param = collectFormParam();
            if (!param.code_grp_cd || !param.code_cd || !param.code_nm) {
                alert("CODE_GRP_CD, CODE_CD, CODE_NM은 필수입니다.");
                return;
            }

            if (!param.code_seq) delete param.code_seq;

            await global.jsAdminSpa.call("/code/save.json", param);
            await loadList();
            clearForm();
            alert("저장 완료");
        } catch (e) {
            alert("저장 실패: " + (e && e.message ? e.message : e));
        }
    }

    async function deleteCode() {
        try {
            var codeSeq = Number((qs("#code_seq") && qs("#code_seq").value) || 0);
            if (!codeSeq) {
                alert("삭제할 코드를 선택하세요.");
                return;
            }
            if (!confirm("삭제하시겠습니까?")) return;

            await global.jsAdminSpa.call("/code/delete.json", { code_seq: codeSeq });
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
        bindOnce("#btnCodeSearch", "click", function (e) { e.preventDefault(); loadList(); });
        bindOnce("#btnCodeSave", "click", function (e) { e.preventDefault(); saveCode(); });
        bindOnce("#btnCodeDelete", "click", function (e) { e.preventDefault(); deleteCode(); });
        bindOnce("#btnCodeNew", "click", function (e) { e.preventDefault(); clearForm(); });
        bindOnce("#btnCodeRefresh", "click", function (e) { e.preventDefault(); loadList(); });
    }

    function init() {
        if (!qs("#codeListBody")) return;
        bindButtonsOnce();
        applyPerm();
        clearForm();
        loadList();
    }

    if (!window.__CODE_PAGELOADED_BOUND__) {
        window.__CODE_PAGELOADED_BOUND__ = true;
        document.addEventListener("jsadmin:pageLoaded", function (e) {
            var url = e && e.detail ? e.detail.url : "";
            if (url === "/code/main.do") {
                init();
            }
        });
    }

    try { init(); } catch (e) {}

})(window);
