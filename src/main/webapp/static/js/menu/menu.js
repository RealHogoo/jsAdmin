(function (global) {
    "use strict";
    var MENU_TYPE_GROUP_CD = "MENU_TYPE";

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
            .replace(/"/g, "&quot;")
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

    function ensureSelectValue(selectEl, value) {
        if (!selectEl) return;
        var target = value == null ? "" : String(value);
        var exists = Array.prototype.some.call(selectEl.options, function (opt) {
            return opt.value === target;
        });
        if (!exists && target !== "") {
            var opt = document.createElement("option");
            opt.value = target;
            opt.textContent = target;
            selectEl.appendChild(opt);
        }
        selectEl.value = target;
    }

    function normalizeText(v) {
        if (v === undefined || v === null) return "";
        return String(v).trim();
    }

    function appendMenuTypeOption(selectEl, value, label) {
        if (!selectEl) return;
        var val = normalizeText(value);
        if (!val) return;

        var exists = Array.prototype.some.call(selectEl.options, function (opt) {
            return opt.value === val;
        });
        if (exists) return;

        var opt = document.createElement("option");
        opt.value = val;
        opt.textContent = normalizeText(label) || val;
        selectEl.appendChild(opt);
    }

    async function loadMenuTypeOptions() {
        var selectEl = qs("#menu_type_cd", getFormRoot());
        if (!selectEl || !global.jsAdminSpa || typeof global.jsAdminSpa.call !== "function") return;

        var currentValue = selectEl.value;
        selectEl.innerHTML = "";
        appendMenuTypeOption(selectEl, "", "선택");

        var rows = await global.jsAdminSpa.call("/code/list.json", {});
        if (!Array.isArray(rows)) {
            ensureSelectValue(selectEl, currentValue);
            return;
        }

        rows
            .filter(function (r) {
                return normalizeText(v(r, ["code_grp_cd", "codeGrpCd"], "")).toUpperCase() === MENU_TYPE_GROUP_CD;
            })
            .sort(function (a, b) {
                var ao = Number(v(a, ["sort_ord", "sortOrd"], 0)) || 0;
                var bo = Number(v(b, ["sort_ord", "sortOrd"], 0)) || 0;
                if (ao !== bo) return ao - bo;
                var ac = normalizeText(v(a, ["code_cd", "codeCd"], ""));
                var bc = normalizeText(v(b, ["code_cd", "codeCd"], ""));
                return ac.localeCompare(bc);
            })
            .forEach(function (r) {
                appendMenuTypeOption(
                    selectEl,
                    v(r, ["code_cd", "codeCd"], ""),
                    v(r, ["code_nm", "codeNm"], "")
                );
            });

        ensureSelectValue(selectEl, currentValue);
    }

    function getPageRoot() {
        return qs("#menuPage") || document;
    }

    function getFormRoot() {
        return qs("#menuForm") || document;
    }

    function getPermLvlFromPage() {
	    var root = getPageRoot();
	    var lvl = root ? root.getAttribute("data-perm-lvl") : null;
	
	    if (lvl === null || lvl === undefined || String(lvl).trim() === "") {
	        return null;
	    }
	
	    var n = Number(lvl);
	    if (!Number.isFinite(n)) {
	        return null;
	    }
	
	    // 여기 추가: 0은 "권한 미세팅" 상태로 취급(현재 단계에서만)
	    if (n === 0) {
	        return null;
	    }
	
	    return n;
    }
    
	function setDisabled(el, disabled) {
	    var tag = (el.tagName || "").toUpperCase();
	
	    // button/input/select/textarea 등은 disabled 속성이 실제 동작
	    if ("disabled" in el) {
	        el.disabled = !!disabled;
	        return;
	    }
	
	    // 나머지(예: a/div/span)는 aria-disabled + class + data-disabled로 통일
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

        // data-perm-lvl 요구치가 달린 요소는 자동 disable
        qsa("[data-perm-lvl]", getPageRoot()).forEach(function (el) {
            var need = Number(el.getAttribute("data-perm-lvl"));
            if (!Number.isFinite(need)) return;
            
        	setDisabled(el, permLvl < need);
        });
    }

    function fillForm(row) {
        var root = getFormRoot();

        var menuSeqEl = qs("#menu_seq", root);
        if (menuSeqEl) menuSeqEl.value = v(row, ["menu_seq", "menuSeq"], "");

        var upMenuSeqEl = qs("#up_menu_seq", root);
        if (upMenuSeqEl) upMenuSeqEl.value = v(row, ["up_menu_seq", "upMenuSeq"], "");

        var menuNmEl = qs("#menu_nm", root);
        if (menuNmEl) menuNmEl.value = v(row, ["menu_nm", "menuNm"], "");

        var menuUrlEl = qs("#menu_url", root);
        if (menuUrlEl) menuUrlEl.value = v(row, ["menu_url", "menuUrl"], "");

        var menuTypeEl = qs("#menu_type_cd", root);
        if (menuTypeEl) ensureSelectValue(menuTypeEl, v(row, ["menu_type_cd", "menuTypeCd"], ""));

        var iconEl = qs("#icon_class", root);
        if (iconEl) iconEl.value = v(row, ["icon_class", "iconClass"], "");

        var sortEl = qs("#sort_ord", root);
        if (sortEl) sortEl.value = v(row, ["sort_ord", "sort_no", "sortNo"], "");

        var useEl = qs("#use_yn", root);
        if (useEl) useEl.value = v(row, ["use_yn", "useYn"], "Y");
    }

    function clearForm() {
        fillForm({
            menu_seq: "",
            up_menu_seq: "",
            menu_nm: "",
            menu_url: "",
            menu_type_cd: "",
            icon_class: "",
            sort_ord: "",
            use_yn: "Y"
        });
    }

    function readForm() {
        var root = getFormRoot();

        var menuSeq = strOrNull(qs("#menu_seq", root) ? qs("#menu_seq", root).value : null);
        var upMenuSeq = numOrNull(qs("#up_menu_seq", root) ? qs("#up_menu_seq", root).value : null);

        var param = {
            // 서버가 Map으로 받는 전제: snake_case 유지
            menu_seq: menuSeq ? Number(menuSeq) : null,
            up_menu_seq: upMenuSeq,
            menu_nm: strOrNull(qs("#menu_nm", root) ? qs("#menu_nm", root).value : null),
            menu_url: strOrNull(qs("#menu_url", root) ? qs("#menu_url", root).value : null),
            menu_type_cd: strOrNull(qs("#menu_type_cd", root) ? qs("#menu_type_cd", root).value : null),
            icon_class: strOrNull(qs("#icon_class", root) ? qs("#icon_class", root).value : null),
            sort_ord: numOrNull(qs("#sort_ord", root) ? qs("#sort_ord", root).value : null),
            use_yn: strOrNull(qs("#use_yn", root) ? qs("#use_yn", root).value : "Y")
        };

        // menu_seq가 null이면 insert로 해석
        if (param.menu_seq === null) delete param.menu_seq;

        return param;
    }

    function renderTable(list) {
        var tbody = qs("#menuListBody");
        if (!tbody) return;

        tbody.innerHTML = list.map(function (r) {
            var menuSeq = v(r, ["menu_seq", "menuSeq"], "");
            var upMenuSeq = v(r, ["up_menu_seq", "upMenuSeq"], "");
            var menuNm = v(r, ["menu_nm", "menuNm"], "");
            var menuUrl = v(r, ["menu_url", "menuUrl"], "");
            var menuTypeCd = v(r, ["menu_type_cd", "menuTypeCd"], "");
            var iconClass = v(r, ["icon_class", "iconClass"], "");
            var sortOrd = v(r, ["sort_ord", "sort_no", "sortNo"], "");
            var useYn = v(r, ["use_yn", "useYn"], "");

            return (
                "<tr class=\"menu-row\" data-menu-seq=\"" + esc(menuSeq) + "\">" +
                "<td>" + esc(menuSeq) + "</td>" +
                "<td>" + esc(upMenuSeq) + "</td>" +
                "<td>" + esc(menuNm) + "</td>" +
                "<td>" + esc(menuUrl) + "</td>" +
                "<td>" + esc(menuTypeCd) + "</td>" +
                "<td>" + esc(iconClass) + "</td>" +
                "<td>" + esc(sortOrd) + "</td>" +
                "<td>" + esc(useYn) + "</td>" +
                "</tr>"
            );
        }).join("");

        // row click → form fill
        qsa("tr.menu-row", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                qsa("tr.menu-row.selected", tbody).forEach(function (x) {
                    x.classList.remove("selected");
                });
                tr.classList.add("selected");

                var menuSeq = tr.getAttribute("data-menu-seq");
                var found = null;

                for (var i = 0; i < list.length; i++) {
                    if (String(v(list[i], ["menu_seq", "menuSeq"], "")) === String(menuSeq)) {
                        found = list[i];
                        break;
                    }
                }
                if (found) fillForm(found);
            });
        });
    }

    async function loadList() {
        var tbody = qs("#menuListBody");
        if (!tbody) return;

        // jsAdminSpa.call은 data만 반환한다는 점 주의(현재 코드 전제 유지)
        var list = await global.jsAdminSpa.call("/menu/list.json", {});
        if (!Array.isArray(list)) list = [];

        renderTable(list);
    }
    
    function bindMenuButtonsOnce() {
	    bindOnce("#btnSearch", "click", function (e) { e.preventDefault(); loadList(); });
	    bindOnce("#btnSave", "click", function (e) { e.preventDefault(); saveMenu(); });
	    bindOnce("#btnDelete", "click", function (e) { e.preventDefault(); deleteMenu(); });
	    bindOnce("#btnNew", "click", function (e) { e.preventDefault(); clearForm(); });
	    bindOnce("#btnMenuRefresh", "click", function (e) { e.preventDefault(); loadList(); });
	}
	
	function bindOnce(sel, evt, handler) {
	    var el = qs(sel);
	    if (!el) return;
	
	    // 이미 바인딩했으면 스킵
	    var key = "bound_" + evt;
	    if (el.dataset[key] === "1") return;
	    el.dataset[key] = "1";
	
	    el.addEventListener(evt, handler);
	}
	
	async function saveMenu() {
	    try {
	        var param = collectFormParam();
	
	        if (!param.menu_nm) {
	            alert("메뉴명(menu_nm)은 필수입니다.");
	            return;
	        }
	
	        // 서버에서 insert/update 판단: menu_seq 없으면 insert
	        // collectFormParam이 menu_seq를 숫자로 넣고 있으니, 0/NaN이면 제거
	        if (!param.menu_seq) {
	            delete param.menu_seq;
	        }
	
	        await window.jsAdminSpa.call("/menu/save.json", param);
	
	        await loadList();
	        clearForm();
	        alert("저장 완료");
	    } catch (e) {
	        alert("저장 실패: " + (e && e.message ? e.message : e));
	    }
	}
	
	async function deleteMenu() {
	    try {
	        var menuSeq = Number((qs("#menu_seq") && qs("#menu_seq").value) || 0);
	        if (!menuSeq) {
	            alert("삭제할 메뉴를 선택하세요.");
	            return;
	        }
	        if (!confirm("삭제하시겠습니까?")) return;
	
	        await window.jsAdminSpa.call("/menu/delete.json", { menu_seq: menuSeq });
	
	        await loadList();
	        clearForm();
	        alert("삭제 완료");
	    } catch (e) {
	        alert("삭제 실패: " + (e && e.message ? e.message : e));
	    }
	}
	
	function collectFormParam() {
	    // 화면 input id 기준: main.jsp에 이미 있는 구성
	    var menuSeq = Number((qs("#menu_seq") && qs("#menu_seq").value) || 0);
	    var upMenuSeqRaw = (qs("#up_menu_seq") && qs("#up_menu_seq").value) || "";
	    var upMenuSeq = Number(String(upMenuSeqRaw).trim() || 0);
	
	    var param = {
	        menu_seq: menuSeq ? menuSeq : null,
	        up_menu_seq: upMenuSeq ? upMenuSeq : null,
	        menu_nm: String((qs("#menu_nm") && qs("#menu_nm").value) || "").trim(),
	        menu_url: String((qs("#menu_url") && qs("#menu_url").value) || "").trim() || null,
	        menu_type_cd: String((qs("#menu_type_cd") && qs("#menu_type_cd").value) || "").trim() || null,
	        icon_class: String((qs("#icon_class") && qs("#icon_class").value) || "").trim() || null,
	        sort_ord: Number((qs("#sort_ord") && qs("#sort_ord").value) || 0) || 0,
	        use_yn: (qs("#use_yn") && qs("#use_yn").value) ? qs("#use_yn").value : "Y"
	    };
	
	    // null 정리(서버 Map 바인딩 깔끔하게)
	    if (!param.menu_seq) delete param.menu_seq;
	    if (!param.up_menu_seq) param.up_menu_seq = null;
	
	    return param;
	}

    async function init() {
        if (!qs("#menuListBody")) return;

        bindMenuButtonsOnce();
        applyPerm();
        await loadMenuTypeOptions();
        clearForm();
        await loadList();
    }
	if (!window.__MENU_PAGELOADED_BOUND__) {
	    window.__MENU_PAGELOADED_BOUND__ = true;
	    // SPA 조각 로딩 완료 시점에 init
	    document.addEventListener("jsadmin:pageLoaded", function (e) {
	        var url = e && e.detail ? e.detail.url : "";
	        if (url === "/menu/main.do") {
	            init();
	        }
	    });
	}

    // 안전망
    try { init(); } catch (e) {}

})(window);
