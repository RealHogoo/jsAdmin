(function () {
    "use strict";

    if (window.__jsadminAuthBound === true) return;
    window.__jsadminAuthBound = true;

    function qs(sel, root) { return (root || document).querySelector(sel); }
    function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    function getPageRoot() { return qs("#authRoot"); }
    function safeText(v) { return (v === null || v === undefined) ? "" : String(v); }

    function toNum(v, d) {
        var n = Number(v);
        return Number.isFinite(n) ? n : d;
    }

    function indentName(name, lvl) {
        var depth = toNum(lvl, 1);
        if (depth < 1) depth = 1;
        var pad = "";
        for (var i = 1; i < depth; i++) pad += "\u00A0\u00A0\u00A0\u00A0";
        return pad + safeText(name);
    }

    function isFolderRow(rowData) {
        var url = rowData && rowData.menu_url != null ? String(rowData.menu_url).trim() : "";
        return url === "";
    }

    async function api(url, body) {
        return await window.jsAdminSpa.call(url, body || {});
    }

    function applyPerm(root) {
        if (typeof window.applyPerm === "function") {
            window.applyPerm();
            return;
        }

        var permLvl = 10;
        qsa("[data-perm-lvl]", root).forEach(function (el) {
            var need = Number(el.getAttribute("data-perm-lvl"));
            if (!Number.isFinite(need)) return;

            if (permLvl < need) {
                el.classList.add("is-disabled");
                el.setAttribute("aria-disabled", "true");
            } else {
                el.classList.remove("is-disabled");
                el.removeAttribute("aria-disabled");
            }
        });
    }

    function getSelectedGroupSeq() {
        var root = getPageRoot();
        return root && root.dataset && root.dataset.selectedGroupSeq ? Number(root.dataset.selectedGroupSeq) : null;
    }

    function setSelectedGroupSeq(seq) {
        var root = getPageRoot();
        if (!root) return;
        root.dataset.selectedGroupSeq = seq ? String(seq) : "";
        var el = qs("#selectedGroupSeq", root);
        if (el) el.textContent = seq ? String(seq) : "-";
    }

    function getSelectedUserSeq() {
        var root = getPageRoot();
        return root && root.dataset && root.dataset.selectedUserSeq ? Number(root.dataset.selectedUserSeq) : null;
    }

    function setSelectedUserSeq(seq) {
        var root = getPageRoot();
        if (!root) return;
        root.dataset.selectedUserSeq = seq ? String(seq) : "";
        var el = qs("#selectedUserSeq", root);
        if (el) el.textContent = seq ? String(seq) : "-";
    }

    function bindTabs(root) {
        qsa(".tab", root).forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.dataset.tab;
                qsa(".tab", root).forEach(function (t) { t.classList.remove("is-active"); });
                tab.classList.add("is-active");

                qsa(".tab-pane", root).forEach(function (p) {
                    p.style.display = (p.dataset.pane === target) ? "" : "none";
                });

                if (target === "B") ensureUserTabLoaded();
            });
        });
    }

    function bindToolbarA(root) {
        var btnReload = qs("#btnGroupReload", root);
        var btnSave = qs("#btnGroupSave", root);

        if (btnReload) {
            btnReload.addEventListener("click", function () {
                if (btnReload.classList.contains("is-disabled")) return;
                loadGroups(true);
            });
        }

        if (btnSave) {
            btnSave.addEventListener("click", function () {
                if (btnSave.classList.contains("is-disabled")) return;
                saveGroupMenus();
            });
        }
    }

    function bindToolbarB(root) {
        var btnSearch = qs("#btnUserSearch", root);
        var btnSave = qs("#btnUserExceptionSave", root);
        var kwInput = qs("#userKeyword", root);

        if (kwInput) {
            kwInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    searchUsers(true);
                }
            });
        }

        if (btnSearch) {
            btnSearch.addEventListener("click", function () {
                if (btnSearch.classList.contains("is-disabled")) return;
                searchUsers(true);
            });
        }

        if (btnSave) {
            btnSave.addEventListener("click", function () {
                if (btnSave.classList.contains("is-disabled")) return;
                saveUserExceptions();
            });
        }
    }

    async function loadGroups(forceSelectFirst) {
        var root = getPageRoot();
        var tbody = qs("#groupListBody", root);
        var menuBody = qs("#menuPermBody", root);
        if (!tbody || !menuBody) return;

        tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
        var list = await api("/auth/group/list.json", {});
        if (!Array.isArray(list)) list = [];

        tbody.innerHTML = "";
        if (list.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3'>No Data</td></tr>";
            menuBody.innerHTML = "";
            setSelectedGroupSeq(null);
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
            var first = tbody.querySelector("tr");
            if (first) first.click();
        }
    }

    function makePermSelect(val) {
        var v = toNum(val, 0);
        if (![0, 1, 5, 10].includes(v)) v = 0;

        var wrap = document.createElement("div");
        wrap.innerHTML = "" +
            "<select class='permLvl'>" +
            "<option value='0'>없음</option>" +
            "<option value='1'>1(조회)</option>" +
            "<option value='5'>5(등록/수정)</option>" +
            "<option value='10'>10(삭제)</option>" +
            "</select>";

        var sel = wrap.firstChild;
        sel.value = String(v);
        return sel;
    }

    function makeUseSelect(val) {
        var v = (val === "Y") ? "Y" : "N";

        var wrap = document.createElement("div");
        wrap.innerHTML = "" +
            "<select class='useYn'>" +
            "<option value='Y'>Y</option>" +
            "<option value='N'>N</option>" +
            "</select>";

        var sel = wrap.firstChild;
        sel.value = v;
        return sel;
    }

    function markDirty(tr) {
        tr.dataset.dirty = "1";
        tr.classList.add("is-dirty");
    }

    function applyFolderToDescendants(folderTr, tbody, newPerm, newUse) {
        var folderLvl = toNum(folderTr.dataset.treeLvl, 1);
        var rows = qsa("tr", tbody);
        var idx = rows.indexOf(folderTr);
        if (idx < 0) return;

        for (var i = idx + 1; i < rows.length; i++) {
            var tr = rows[i];
            var lvl = toNum(tr.dataset.treeLvl, 1);
            if (lvl <= folderLvl) break;

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

            var permSel = makePermSelect(m.perm_lvl);
            var useSel = makeUseSelect(m.map_use_yn || "N");

            tr.innerHTML =
                "<td>" + safeText(m.menu_seq) + "</td>" +
                "<td class='menuNm'>" + indentName(m.menu_nm, m.tree_lvl) + "</td>" +
                "<td class='permCell'></td>" +
                "<td class='useCell'></td>";

            qs(".permCell", tr).appendChild(permSel);
            qs(".useCell", tr).appendChild(useSel);

            permSel.addEventListener("change", function () {
                markDirty(tr);
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
        var tbody = qs("#menuPermBody", root);
        if (!authGroupSeq || !tbody) return;

        var items = [];
        qsa("tr", tbody).forEach(function (tr) {
            if (tr.dataset.isFolder === "1") return;
            if (tr.dataset.dirty !== "1") return;

            var perm = Number(qs(".permLvl", tr).value);
            var useYn = qs(".useYn", tr).value;
            if (!Number.isFinite(perm)) perm = 0;

            items.push({
                menu_seq: Number(tr.dataset.menuSeq),
                perm_lvl: perm,
                use_yn: useYn === "Y" ? "Y" : "N"
            });
        });

        if (items.length === 0) {
            alert("변경된 항목이 없습니다.");
            return;
        }

        await api("/auth/group/menu/save.json", { auth_group_seq: authGroupSeq, items: items });
        await loadGroupMenus(authGroupSeq);
    }

    var userTabLoaded = false;

    function ensureUserTabLoaded() {
        if (userTabLoaded) return;
        userTabLoaded = true;
        searchUsers(true);
    }

    async function searchUsers(selectFirst) {
        var root = getPageRoot();
        var tbody = qs("#userListBody", root);
        if (!tbody) return;

        var keyword = safeText(qs("#userKeyword", root).value).trim();
        tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

        var list = await api("/auth/user/search.json", { keyword: keyword });
        if (!Array.isArray(list)) list = [];

        tbody.innerHTML = "";
        if (list.length === 0) {
            tbody.innerHTML = "<tr><td colspan='3'>No Data</td></tr>";
            setSelectedUserSeq(null);
            qs("#userExceptionBody", root).innerHTML = "";
            return;
        }

        list.forEach(function (u) {
            var tr = document.createElement("tr");
            tr.dataset.userSeq = String(u.user_seq);
            tr.innerHTML =
                "<td>" + safeText(u.user_seq) + "</td>" +
                "<td>" + safeText(u.login_id) + "</td>" +
                "<td>" + safeText(u.user_nm) + "</td>";

            tr.addEventListener("click", function () {
                qsa("#userListBody tr", root).forEach(function (r) { r.classList.remove("is-selected"); });
                tr.classList.add("is-selected");

                var userSeq = Number(tr.dataset.userSeq);
                setSelectedUserSeq(userSeq);
                loadUserMenuPermList(userSeq);
            });

            tbody.appendChild(tr);
        });

        if (selectFirst) {
            var first = tbody.querySelector("tr");
            if (first) first.click();
        }
    }

    function basePermLabel(v) {
        var n = toNum(v, 0);
        if (n >= 10) return "10";
        if (n >= 5) return "5";
        if (n >= 1) return "1";
        return "0";
    }

    function makeExceptionStateSelect(state) {
        var v = (state === "Y" || state === "X") ? state : "N";
        var wrap = document.createElement("div");
        wrap.innerHTML = "" +
            "<select class='exStateSel'>" +
            "<option value='N'>설정없음</option>" +
            "<option value='Y'>Y(접근가능)</option>" +
            "<option value='X'>X(접근불가)</option>" +
            "</select>";
        var sel = wrap.firstChild;
        sel.value = v;
        return sel;
    }

    async function loadUserMenuPermList(userSeq) {
        var root = getPageRoot();
        var tbody = qs("#userExceptionBody", root);
        if (!tbody) return;

        tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
        var list = await api("/auth/user/menuPermList.json", { user_seq: userSeq });
        if (!Array.isArray(list)) list = [];

        tbody.innerHTML = "";
        if (list.length === 0) {
            tbody.innerHTML = "<tr><td colspan='4'>No Data</td></tr>";
            return;
        }

        list.forEach(function (m) {
            var folder = isFolderRow(m);
            var tr = document.createElement("tr");
            tr.dataset.menuSeq = String(m.menu_seq);
            tr.dataset.treeLvl = String(m.tree_lvl || 1);
            tr.dataset.isFolder = folder ? "1" : "0";

            var state = (m.ex_access_yn === "Y" || m.ex_access_yn === "X") ? m.ex_access_yn : "N";
            if (folder) state = "N";
            var stateSel = makeExceptionStateSelect(state);

            tr.innerHTML =
                "<td>" + safeText(m.menu_seq) + "</td>" +
                "<td>" + indentName(m.menu_nm, m.tree_lvl) + "</td>" +
                "<td>" + basePermLabel(m.base_perm_lvl) + "</td>" +
                "<td class='exStateCell'></td>";

            qs(".exStateCell", tr).appendChild(stateSel);
            if (folder) {
                stateSel.disabled = true;
            }
            stateSel.addEventListener("change", function () {
                markDirty(tr);
            });

            tbody.appendChild(tr);
        });
    }

    async function saveUserExceptions() {
        var root = getPageRoot();
        var userSeq = getSelectedUserSeq();
        var tbody = qs("#userExceptionBody", root);
        if (!userSeq || !tbody) return;

        var exceptions = [];
        qsa("tr", tbody).forEach(function (tr) {
            if (tr.dataset.isFolder === "1") return;
            var stateSel = qs(".exStateSel", tr);
            if (!stateSel) return;
            var state = stateSel.value;
            if (state !== "Y" && state !== "X") return;

            exceptions.push({
                menu_seq: Number(tr.dataset.menuSeq),
                access_yn: state,
                perm_lvl: state === "Y" ? 1 : 0
            });
        });

        await api("/auth/user/exception/save.json", {
            user_seq: userSeq,
            exceptions: exceptions
        });

        await loadUserMenuPermList(userSeq);
        document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
        if (typeof window.SIDEBAR_INIT === "function") {
            window.SIDEBAR_INIT();
        }
    }

    function init() {
        var root = getPageRoot();
        if (!root) return;

        if (root.dataset.authInited === "1") return;
        root.dataset.authInited = "1";

        bindTabs(root);
        bindToolbarA(root);
        bindToolbarB(root);
        applyPerm(root);
        loadGroups(true);
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e && e.detail ? e.detail.url : "";
        if (url === "/auth/main.do") {
            userTabLoaded = false;
            init();
        }
    });
})();
