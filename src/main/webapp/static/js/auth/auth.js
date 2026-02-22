(function () {
    "use strict";

    // 중복 등록 방지 (SPA 조각 로딩/스크립트 재평가 대비)
    if (window.__jsadminAuthBound === true) return;
    window.__jsadminAuthBound = true;

    function qs(sel, root) { return (root || document).querySelector(sel); }
    function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

    function getPageRoot() {
        return qs("#authRoot");
    }

    function getSelectedGroupSeq() {
        var root = getPageRoot();
        return root && root.dataset && root.dataset.selectedGroupSeq ? Number(root.dataset.selectedGroupSeq) : null;
    }

    function setSelectedGroupSeq(seq) {
        var root = getPageRoot();
        if (!root) return;
        root.dataset.selectedGroupSeq = String(seq || "");
        var el = qs("#selectedGroupSeq", root);
        if (el) el.textContent = seq ? String(seq) : "-";
    }

    function isFolderRow(rowData) {
        // menu_url 없으면 폴더 취급(권한 저장 대상 아님)
        var url = rowData && rowData.menu_url != null ? String(rowData.menu_url).trim() : "";
        return url === "";
    }

    function safeText(v) {
        if (v === null || v === undefined) return "";
        return String(v);
    }

    function indentName(name, lvl) {
        var n = safeText(name);
        var depth = Number(lvl || 1);
        if (!Number.isFinite(depth) || depth < 1) depth = 1;
        var pad = "";
        for (var i = 1; i < depth; i++) pad += "\u00A0\u00A0\u00A0\u00A0";
        return pad + n;
    }

    function applyPermA(root) {
        // 네 공통 applyPerm()이 있으면 그대로 사용
        if (typeof window.applyPerm === "function") {
            window.applyPerm();
            return;
        }

        // fallback: data-perm-lvl 가진 a.btn는 is-disabled 처리
        var permLvl = 10; // fallback (페이지에서 permLvl 못 구하면 전체)
        qsa("[data-perm-lvl]", root).forEach(function (el) {
            var need = Number(el.getAttribute("data-perm-lvl"));
            if (!Number.isFinite(need)) return;
            var disabled = permLvl < need;
            if (disabled) {
                el.classList.add("is-disabled");
                el.setAttribute("aria-disabled", "true");
            } else {
                el.classList.remove("is-disabled");
                el.removeAttribute("aria-disabled");
            }
        });
    }

    async function api(url, body) {
        // jsAdminSpa.call 은 data만 반환한다는 전제
        return await window.jsAdminSpa.call(url, body || {});
    }

    /* =========================
     * TAB / UI
     * ========================= */
    function bindTabs(root) {
        qsa(".tab", root).forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.dataset.tab;
                qsa(".tab", root).forEach(function (t) { t.classList.remove("is-active"); });
                tab.classList.add("is-active");

                qsa(".tab-pane", root).forEach(function (p) {
                    p.style.display = (p.dataset.pane === target) ? "" : "none";
                });
            });
        });
    }

    function bindToolbar(root) {
        var btnReload = qs("#btnGroupReload", root);
        var btnSave = qs("#btnGroupSave", root);

        if (btnReload) {
            btnReload.addEventListener("click", function (e) {
                if (btnReload.classList.contains("is-disabled")) return;
                loadGroups(true);
            });
        }

        if (btnSave) {
            btnSave.addEventListener("click", function (e) {
                if (btnSave.classList.contains("is-disabled")) return;
                saveGroupMenus();
            });
        }
    }

    /* =========================
     * 그룹 목록
     * ========================= */
    async function loadGroups(forceSelectFirst) {
        var root = getPageRoot();
        var tbody = qs("#groupListBody", root);
        if (!tbody) return;

        tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

        var list = await api("/auth/group/list.json", {});
        if (!Array.isArray(list)) list = [];

        tbody.innerHTML = "";
        if (list.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3'>No Data</td></tr>";
            setSelectedGroupSeq(null);
            qs("#menuPermBody", root).innerHTML = "";
            return;
        }

        list.forEach(function (g) {
            var tr = document.createElement("tr");
            tr.dataset.authGroupSeq = String(g.auth_group_seq);

            tr.innerHTML =
                "<td>" + safeText(g.auth_group_seq) + "</td>" +
                "<td>" + safeText(g.auth_group_nm) + "</td>" +
                "<td>" + safeText(g.use_yn || "Y") + "</td>";

            tr.addEventListener("click", function () {
                qsa("#groupListBody tr", root).forEach(function (r) { r.classList.remove("is-selected"); });
                tr.classList.add("is-selected");

                var seq = Number(tr.dataset.authGroupSeq);
                setSelectedGroupSeq(seq);
                loadGroupMenus(seq);
            });

            tbody.appendChild(tr);
        });

        if (forceSelectFirst === true) {
            // 첫 행 자동 선택
            tbody.querySelector("tr").click();
        }
    }

    /* =========================
     * 그룹-메뉴 권한
     * ========================= */
    function makePermSelect(val, isFolder) {
        // 폴더는 UI용이므로 선택은 가능(일괄 적용에 쓸 것)
        var v = Number(val || 0);
        if (![0, 1, 5, 10].includes(v)) v = 0;

        var html = "<select class='permLvl'>" +
            "<option value='0'>없음</option>" +
            "<option value='1'>1(조회)</option>" +
            "<option value='5'>5(등록/수정)</option>" +
            "<option value='10'>10(삭제)</option>" +
            "</select>";
        var wrap = document.createElement("div");
        wrap.innerHTML = html;
        var sel = wrap.firstChild;
        sel.value = String(v);

        if (isFolder) sel.classList.add("is-folder-perm");
        return sel;
    }

    function makeUseSelect(val) {
        var v = (val || "Y") === "Y" ? "Y" : "N";
        var html = "<select class='useYn'>" +
            "<option value='Y'>Y</option>" +
            "<option value='N'>N</option>" +
            "</select>";
        var wrap = document.createElement("div");
        wrap.innerHTML = html;
        var sel = wrap.firstChild;
        sel.value = v;
        return sel;
    }

    function markDirty(tr) {
        tr.dataset.dirty = "1";
        tr.classList.add("is-dirty");
    }

    function applyFolderToDescendants(folderTr, tbody, newPerm, newUse) {
        // 계층형 평면 결과 규칙:
        // 폴더 row 이후, tree_lvl이 더 큰 row들은 자식/후손.
        var folderLvl = Number(folderTr.dataset.treeLvl || 1);
        var rows = qsa("tr", tbody);
        var idx = rows.indexOf(folderTr);
        if (idx < 0) return;

        for (var i = idx + 1; i < rows.length; i++) {
            var tr = rows[i];
            var lvl = Number(tr.dataset.treeLvl || 1);
            if (lvl <= folderLvl) break;

            // 자식/후손에게 적용
            qs(".permLvl", tr).value = String(newPerm);
            qs(".useYn", tr).value = String(newUse);
            markDirty(tr);
        }
    }

    async function loadGroupMenus(authGroupSeq) {
        var root = getPageRoot();
        var tbody = qs("#menuPermBody", root);
        if (!tbody) return;

        tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";

        var list = await api("/auth/group/menu/list.json", { auth_group_seq: authGroupSeq });
        if (!Array.isArray(list)) list = [];

        tbody.innerHTML = "";
        if (list.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>No Data</td></tr>";
            return;
        }

        list.forEach(function (m) {
            var isFolder = isFolderRow(m);

            var tr = document.createElement("tr");
            tr.dataset.menuSeq = String(m.menu_seq);
            tr.dataset.treeLvl = String(m.tree_lvl || 1);
            tr.dataset.isFolder = isFolder ? "1" : "0";

            var permSel = makePermSelect(m.perm_lvl, isFolder);
            var useSel = makeUseSelect(m.map_use_yn || "N");

            // 초기 매핑이 없으면 perm=0, use=N일 수 있음. UI는 그대로.
            tr.innerHTML =
                "<td>" + safeText(m.menu_seq) + "</td>" +
                "<td class='menuNm'>" + indentName(m.menu_nm, m.tree_lvl) + "</td>" +
                "<td class='permCell'></td>" +
                "<td class='useCell'></td>";

            qs(".permCell", tr).appendChild(permSel);
            qs(".useCell", tr).appendChild(useSel);

            // 변경 시 더티
            permSel.addEventListener("change", function () {
                markDirty(tr);

                // 폴더면 자식에게 일괄 적용 (추천 규칙)
                if (tr.dataset.isFolder === "1") {
                    applyFolderToDescendants(tr, tbody, Number(permSel.value), useSel.value);
                }
            });

            useSel.addEventListener("change", function () {
                markDirty(tr);
                if (tr.dataset.isFolder === "1") {
                    applyFolderToDescendants(tr, tbody, Number(permSel.value), useSel.value);
                }
            });

            tbody.appendChild(tr);
        });
    }

    async function saveGroupMenus() {
        var root = getPageRoot();
        var authGroupSeq = getSelectedGroupSeq();
        if (!authGroupSeq) return;

        var tbody = qs("#menuPermBody", root);
        if (!tbody) return;

        // IMPORTANT:
        // 서비스가 "disableAll -> merge" 방식이면, dirty만 보내면 기존 권한이 날아감.
        // 그래서 "현재 화면의 활성 권한 전체 스냅샷"으로 보냄.
        var items = [];
        qsa("tr", tbody).forEach(function (tr) {
            var isFolder = tr.dataset.isFolder === "1";
            if (isFolder) return; // 폴더는 저장하지 않음

            var perm = Number(qs(".permLvl", tr).value);
            var useYn = qs(".useYn", tr).value;

            if (useYn !== "Y") return;
            if (!Number.isFinite(perm) || perm <= 0) return;

            items.push({
                menu_seq: Number(tr.dataset.menuSeq),
                perm_lvl: perm,
                use_yn: "Y"
            });
        });

        var res = await api("/auth/group/menu/save.json", {
            auth_group_seq: authGroupSeq,
            items: items
        });

        // 저장 후 재조회
        await loadGroupMenus(authGroupSeq);
    }

    /* =========================
     * init
     * ========================= */
    function init() {
        var root = getPageRoot();
        if (!root) return;

        if (root.dataset.authInited === "1") return;
        root.dataset.authInited = "1";

        bindTabs(root);
        bindToolbar(root);
        applyPermA(root);

        // TAB A 기본 진입: 그룹 조회부터
        loadGroups(true);
    }

    // SPA 조각 로딩 완료 시점에 init
    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/auth/main.do") {
            init();
        }
    });
})();
