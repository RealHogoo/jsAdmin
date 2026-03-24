(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;

    if (global.__jsadminAuthBound === true) return;
    global.__jsadminAuthBound = true;

    var userTabLoaded = false;

    function root() {
        return UX.qs("#authRoot");
    }

    function toNum(value, fallback) {
        var num = Number(value);
        return Number.isFinite(num) ? num : fallback;
    }

    function indentName(name, level) {
        var depth = Math.max(toNum(level, 1), 1);
        return new Array(depth).join("\u00A0\u00A0\u00A0\u00A0") + (name == null ? "" : String(name));
    }

    function isFolderRow(row) {
        return !UX.normalizeText(row && row.menu_url);
    }

    function applyPerm() {
        var page = root();
        if (!page) return;
        var permLvl = toNum(page.getAttribute("data-perm-lvl"), 0);
        if (!permLvl) return;
        UX.qsa("[data-perm-lvl]", page).forEach(function (el) {
            var need = toNum(el.getAttribute("data-perm-lvl"), 0);
            if (need) UX.setDisabled(el, permLvl < need);
        });
    }

    function setSelected(groupOrUser, seq) {
        var page = root();
        if (!page) return;
        var dataKey = groupOrUser === "group" ? "selectedGroupSeq" : "selectedUserSeq";
        var textKey = groupOrUser === "group" ? "#selectedGroupSeq" : "#selectedUserSeq";
        page.dataset[dataKey] = seq ? String(seq) : "";
        UX.setText(textKey, seq ? String(seq) : "-", page);
    }

    function selectedSeq(groupOrUser) {
        var page = root();
        if (!page || !page.dataset) return null;
        var dataKey = groupOrUser === "group" ? "selectedGroupSeq" : "selectedUserSeq";
        return UX.numOrNull(page.dataset[dataKey]);
    }

    function makeSelect(options, value, className) {
        var select = document.createElement("select");
        select.className = className;
        options.forEach(function (option) {
            var el = document.createElement("option");
            el.value = option.value;
            el.textContent = option.label;
            select.appendChild(el);
        });
        select.value = String(value);
        return select;
    }

    function markDirty(tr) {
        tr.dataset.dirty = "1";
        tr.classList.add("is-dirty");
    }

    function renderGroupList(list) {
        var tbody = UX.qs("#groupListBody", root());
        var menuBody = UX.qs("#menuPermBody", root());
        if (!tbody || !menuBody) return;

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='3'>No Data</td></tr>";
            menuBody.innerHTML = "";
            setSelected("group", null);
            return;
        }

        tbody.innerHTML = list.map(function (row, index) {
            return "<tr data-auth-group-seq='" + UX.esc(row.auth_group_seq) + "'>"
                + "<td>" + UX.esc(index + 1) + "</td>"
                + "<td>" + UX.esc(row.auth_group_nm) + "</td>"
                + "<td>" + UX.esc((row.use_yn || "Y") === "Y" ? "사용" : "미사용") + "</td>"
                + "</tr>";
        }).join("");

        UX.qsa("tr[data-auth-group-seq]", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                UX.qsa("tr", tbody).forEach(function (row) { row.classList.remove("is-selected"); });
                tr.classList.add("is-selected");
                var seq = Number(tr.getAttribute("data-auth-group-seq"));
                setSelected("group", seq);
                loadGroupMenus(seq);
            });
        });

        var first = tbody.querySelector("tr[data-auth-group-seq]");
        if (first) first.click();
    }

    function loadGroups() {
        var tbody = UX.qs("#groupListBody", root());
        if (tbody) tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";
        return app.callJson("/auth/group/list.json", {}, function (list) {
            renderGroupList(Array.isArray(list) ? list : []);
        });
    }

    function applyFolderToDescendants(folderTr, tbody, perm, useYn) {
        var rows = UX.qsa("tr", tbody);
        var folderLvl = toNum(folderTr.dataset.treeLvl, 1);
        var startIdx = rows.indexOf(folderTr);
        if (startIdx < 0) return;

        for (var i = startIdx + 1; i < rows.length; i++) {
            var tr = rows[i];
            var level = toNum(tr.dataset.treeLvl, 1);
            if (level <= folderLvl) break;
            UX.qs(".permLvl", tr).value = String(perm);
            UX.qs(".useYn", tr).value = String(useYn);
            markDirty(tr);
        }
    }

    function renderGroupMenus(list) {
        var tbody = UX.qs("#menuPermBody", root());
        if (!tbody) return;
        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='4'>No Data</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        list.forEach(function (row, index) {
            var tr = document.createElement("tr");
            var isFolder = isFolderRow(row);
            tr.dataset.menuSeq = String(row.menu_seq);
            tr.dataset.treeLvl = String(row.tree_lvl || 1);
            tr.dataset.isFolder = isFolder ? "1" : "0";

            tr.innerHTML =
                "<td>" + UX.esc(index + 1) + "</td>" +
                "<td class='menuNm'>" + UX.esc(indentName(row.menu_nm, row.tree_lvl)) + "</td>" +
                "<td class='permCell'></td>" +
                "<td class='useCell'></td>";

            var permSel = makeSelect([
                { value: "0", label: "없음" },
                { value: "1", label: "1(조회)" },
                { value: "5", label: "5(등록/수정)" },
                { value: "10", label: "10(삭제)" }
            ], [0, 1, 5, 10].indexOf(toNum(row.perm_lvl, 0)) >= 0 ? toNum(row.perm_lvl, 0) : 0, "permLvl");

            var useSel = makeSelect([
                { value: "Y", label: "Y" },
                { value: "N", label: "N" }
            ], row.map_use_yn === "Y" ? "Y" : "N", "useYn");

            UX.qs(".permCell", tr).appendChild(permSel);
            UX.qs(".useCell", tr).appendChild(useSel);

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

    function loadGroupMenus(authGroupSeq) {
        var tbody = UX.qs("#menuPermBody", root());
        if (tbody) tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
        return app.callJson("/auth/group/menu/list.json", { auth_group_seq: authGroupSeq }, function (list) {
            renderGroupMenus(Array.isArray(list) ? list : []);
        });
    }

    function saveGroupMenus() {
        var authGroupSeq = selectedSeq("group");
        var tbody = UX.qs("#menuPermBody", root());
        if (!authGroupSeq || !tbody) return;

        var items = UX.qsa("tr", tbody).filter(function (tr) {
            return tr.dataset.isFolder !== "1" && tr.dataset.dirty === "1";
        }).map(function (tr) {
            return {
                menu_seq: Number(tr.dataset.menuSeq),
                perm_lvl: toNum(UX.qs(".permLvl", tr).value, 0),
                use_yn: UX.qs(".useYn", tr).value === "Y" ? "Y" : "N"
            };
        });

        if (!items.length) {
            alert("변경된 항목이 없습니다.");
            return;
        }

        app.callJson("/auth/group/menu/save.json", { auth_group_seq: authGroupSeq, items: items }, function () {
            loadGroupMenus(authGroupSeq);
        });
    }

    function renderUserList(list) {
        var tbody = UX.qs("#userListBody", root());
        var exBody = UX.qs("#userExceptionBody", root());
        if (!tbody || !exBody) return;

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='3'>No Data</td></tr>";
            exBody.innerHTML = "";
            setSelected("user", null);
            return;
        }

        tbody.innerHTML = list.map(function (row, index) {
            return "<tr data-user-seq='" + UX.esc(row.user_seq) + "'>"
                + "<td>" + UX.esc(index + 1) + "</td>"
                + "<td>" + UX.esc(row.login_id) + "</td>"
                + "<td>" + UX.esc(row.user_nm) + "</td>"
                + "</tr>";
        }).join("");

        UX.qsa("tr[data-user-seq]", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                UX.qsa("tr", tbody).forEach(function (row) { row.classList.remove("is-selected"); });
                tr.classList.add("is-selected");
                var seq = Number(tr.getAttribute("data-user-seq"));
                setSelected("user", seq);
                loadUserMenuPermList(seq);
            });
        });

        var first = tbody.querySelector("tr[data-user-seq]");
        if (first) first.click();
    }

    function searchUsers() {
        var tbody = UX.qs("#userListBody", root());
        if (tbody) tbody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

        return app.callJson("/auth/user/search.json", {
            keyword: UX.getValue("#userKeyword", root())
        }, function (list) {
            renderUserList(Array.isArray(list) ? list : []);
        });
    }

    function basePermLabel(value) {
        var num = toNum(value, 0);
        if (num >= 10) return "10";
        if (num >= 5) return "5";
        if (num >= 1) return "1";
        return "0";
    }

    function renderUserExceptions(list) {
        var tbody = UX.qs("#userExceptionBody", root());
        if (!tbody) return;
        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='4'>No Data</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        list.forEach(function (row, index) {
            var tr = document.createElement("tr");
            var isFolder = isFolderRow(row);
            var state = (row.ex_access_yn === "Y" || row.ex_access_yn === "X") ? row.ex_access_yn : "N";
            tr.dataset.menuSeq = String(row.menu_seq);
            tr.dataset.treeLvl = String(row.tree_lvl || 1);
            tr.dataset.isFolder = isFolder ? "1" : "0";

            tr.innerHTML =
                "<td>" + UX.esc(index + 1) + "</td>" +
                "<td>" + UX.esc(indentName(row.menu_nm, row.tree_lvl)) + "</td>" +
                "<td>" + UX.esc(basePermLabel(row.base_perm_lvl)) + "</td>" +
                "<td class='exStateCell'></td>";

            var stateSel = makeSelect([
                { value: "N", label: "설정없음" },
                { value: "Y", label: "Y(접근허용)" },
                { value: "X", label: "X(접근불가)" }
            ], isFolder ? "N" : state, "exStateSel");

            if (isFolder) stateSel.disabled = true;
            stateSel.addEventListener("change", function () { markDirty(tr); });
            UX.qs(".exStateCell", tr).appendChild(stateSel);
            tbody.appendChild(tr);
        });
    }

    function loadUserMenuPermList(userSeq) {
        var tbody = UX.qs("#userExceptionBody", root());
        if (tbody) tbody.innerHTML = "<tr><td colspan='4'>Loading...</td></tr>";
        return app.callJson("/auth/user/menuPermList.json", { user_seq: userSeq }, function (list) {
            renderUserExceptions(Array.isArray(list) ? list : []);
        });
    }

    function saveUserExceptions() {
        var userSeq = selectedSeq("user");
        var tbody = UX.qs("#userExceptionBody", root());
        if (!userSeq || !tbody) return;

        var exceptions = UX.qsa("tr", tbody).filter(function (tr) {
            return tr.dataset.isFolder !== "1";
        }).map(function (tr) {
            var sel = UX.qs(".exStateSel", tr);
            return sel ? {
                menu_seq: Number(tr.dataset.menuSeq),
                access_yn: sel.value,
                perm_lvl: sel.value === "Y" ? 1 : 0
            } : null;
        }).filter(function (row) {
            return row && (row.access_yn === "Y" || row.access_yn === "X");
        });

        app.callJson("/auth/user/exception/save.json", {
            user_seq: userSeq,
            exceptions: exceptions
        }, function () {
            loadUserMenuPermList(userSeq);
            document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
            if (typeof global.SIDEBAR_INIT === "function") {
                global.SIDEBAR_INIT();
            }
        });
    }

    function ensureUserTabLoaded() {
        if (userTabLoaded) return;
        userTabLoaded = true;
        searchUsers();
    }

    function bindTabs(page) {
        UX.qsa(".tab", page).forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.dataset.tab;
                UX.qsa(".tab", page).forEach(function (el) { el.classList.remove("is-active"); });
                tab.classList.add("is-active");
                UX.qsa(".tab-pane", page).forEach(function (pane) {
                    pane.style.display = pane.dataset.pane === target ? "" : "none";
                });
                if (target === "B") ensureUserTabLoaded();
            });
        });
    }

    function bind(page) {
        UX.bindOnce(UX.qs("#btnGroupReload", page), "click", function () { loadGroups(); });
        UX.bindOnce(UX.qs("#btnGroupSave", page), "click", saveGroupMenus);
        UX.bindOnce(UX.qs("#btnUserSearch", page), "click", searchUsers);
        UX.bindOnce(UX.qs("#btnUserExceptionSave", page), "click", saveUserExceptions);

        var kwInput = UX.qs("#userKeyword", page);
        if (kwInput) {
            kwInput.addEventListener("keydown", function (e) {
                if (e.key === "Enter") {
                    e.preventDefault();
                    searchUsers();
                }
            });
        }
    }

    function init() {
        var page = root();
        if (!page || page.dataset.authInited === "1") return;
        page.dataset.authInited = "1";
        userTabLoaded = false;
        bindTabs(page);
        bind(page);
        applyPerm();
        loadGroups();
    }

    document.addEventListener("jsadmin:pageLoaded", function (e) {
        if (e && e.detail && e.detail.url === "/auth/main.do") init();
    });
})(window);
