(function (global) {
    "use strict";

    var UX = global.UX;
    var app = global.app;
    var userTabLoaded = false;
    var groupRows = {};

    function root() {
        return UX.qs("#authRoot");
    }

    function page() {
        return root();
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

    function setSelected(targetType, seq, label) {
        var el = page();
        var dataKey = targetType === "group" ? "selectedGroupSeq" : "selectedUserSeq";
        var textKey = targetType === "group" ? "#selectedGroupSeq" : "#selectedUserSeq";
        if (!el) return;
        el.dataset[dataKey] = seq ? String(seq) : "";
        UX.setText(textKey, label || (seq ? String(seq) : "-"), el);
    }

    function selectedSeq(targetType) {
        var el = page();
        var dataKey = targetType === "group" ? "selectedGroupSeq" : "selectedUserSeq";
        if (!el || !el.dataset) return null;
        return UX.numOrNull(el.dataset[dataKey]);
    }

    function groupFormValue(selector) {
        return UX.getValue(selector, page());
    }

    function fillGroupForm(row) {
        UX.setValue("#group_auth_group_seq", row && row.auth_group_seq ? row.auth_group_seq : "", page());
        UX.setValue("#group_auth_group_cd", row && row.auth_group_cd ? row.auth_group_cd : "", page());
        UX.setValue("#group_auth_group_nm", row && row.auth_group_nm ? row.auth_group_nm : "", page());
        UX.setValue("#group_auth_group_desc", row && row.auth_group_desc ? row.auth_group_desc : "", page());
        UX.setValue("#group_use_yn", row && row.use_yn === "N" ? "N" : "Y", page());
    }

    function selectedGroupRow() {
        var seq = selectedSeq("group");
        return seq ? groupRows[String(seq)] : null;
    }

    function makeSelect(options, value, className) {
        var select = document.createElement("select");
        select.className = className;
        options.forEach(function (option) {
            var item = document.createElement("option");
            item.value = option.value;
            item.textContent = option.label;
            select.appendChild(item);
        });
        select.value = String(value);
        return select;
    }

    function markDirty(tr) {
        tr.dataset.dirty = "1";
        tr.classList.add("is-dirty");
    }

    function emptyTable(selector, colspan, message) {
        var tbody = UX.qs(selector, page());
        if (tbody) {
            tbody.innerHTML = "<tr><td colspan='" + colspan + "'>" + UX.esc(message) + "</td></tr>";
        }
    }

    function renderGroupList(list) {
        var tbody = UX.qs("#groupListBody", page());
        if (!tbody) return;
        groupRows = {};

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='4'>No data</td></tr>";
            emptyTable("#menuPermBody", 4, "No data");
            emptyTable("#servicePermBody", 4, "No data");
            setSelected("group", null, "-");
            fillGroupForm(null);
            return;
        }

        list.forEach(function (row) {
            groupRows[String(row.auth_group_seq)] = row;
        });

        tbody.innerHTML = list.map(function (row, index) {
            return "<tr data-auth-group-seq='" + UX.esc(row.auth_group_seq) + "'>"
                + "<td>" + UX.esc(index + 1) + "</td>"
                + "<td>" + UX.esc(row.auth_group_cd || "-") + "</td>"
                + "<td>" + UX.esc(row.auth_group_nm) + "</td>"
                + "<td>" + UX.esc((row.use_yn || "Y") === "Y" ? "Y" : "N") + "</td>"
                + "</tr>";
        }).join("");

        UX.qsa("tr[data-auth-group-seq]", tbody).forEach(function (tr) {
            tr.addEventListener("click", function () {
                UX.qsa("tr", tbody).forEach(function (row) {
                    row.classList.remove("is-selected");
                });
                tr.classList.add("is-selected");
                var seq = Number(tr.getAttribute("data-auth-group-seq"));
                var selected = groupRows[String(seq)] || null;
                setSelected("group", seq, UX.normalizeText(tr.children[2].textContent) || String(seq));
                fillGroupForm(selected);
                loadGroupMenus(seq);
                loadGroupServices(seq);
            });
        });

        var first = tbody.querySelector("tr[data-auth-group-seq]");
        if (first) first.click();
    }

    function loadGroups() {
        emptyTable("#groupListBody", 4, "Loading...");
        return app.callJson("/auth/group/list.json", {}, function (list) {
            renderGroupList(Array.isArray(list) ? list : []);
        });
    }

    function resetGroupEditor() {
        fillGroupForm({
            auth_group_seq: "",
            auth_group_cd: "",
            auth_group_nm: "",
            auth_group_desc: "",
            use_yn: "Y"
        });
        setSelected("group", null, "신규");
        emptyTable("#menuPermBody", 4, "그룹 저장 후 권한을 설정하세요.");
        emptyTable("#servicePermBody", 4, "그룹 저장 후 권한을 설정하세요.");
    }

    function saveGroupMeta() {
        var payload = {
            auth_group_seq: UX.numOrNull(groupFormValue("#group_auth_group_seq")),
            auth_group_cd: UX.normalizeText(groupFormValue("#group_auth_group_cd")),
            auth_group_nm: UX.normalizeText(groupFormValue("#group_auth_group_nm")),
            auth_group_desc: UX.normalizeText(groupFormValue("#group_auth_group_desc")),
            use_yn: groupFormValue("#group_use_yn") === "N" ? "N" : "Y"
        };

        if (!payload.auth_group_cd) return global.alert("그룹 코드는 필수입니다.");
        if (!payload.auth_group_nm) return global.alert("그룹명은 필수입니다.");

        app.callJson("/auth/group/save.json", payload, function (data) {
            var nextSeq = data && data.auth_group_seq ? Number(data.auth_group_seq) : null;
            global.alert("저장 완료");
            loadGroups().then(function () {
                if (!nextSeq) return;
                var tbody = UX.qs("#groupListBody", page());
                var target = tbody ? tbody.querySelector("tr[data-auth-group-seq='" + nextSeq + "']") : null;
                if (target) target.click();
            });
        }, function (e) {
            global.alert("저장 실패: " + (e && e.message ? e.message : e));
        });
    }

    function deleteGroup() {
        var row = selectedGroupRow();
        if (!row || !row.auth_group_seq) return global.alert("삭제할 그룹을 선택하세요.");
        if (!global.confirm((row.auth_group_nm || "선택한 그룹") + "을 미사용 처리하시겠습니까?")) return;

        app.callJson("/auth/group/delete.json", { auth_group_seq: row.auth_group_seq }, function () {
            global.alert("삭제 완료");
            loadGroups();
        }, function (e) {
            global.alert("삭제 실패: " + (e && e.message ? e.message : e));
        });
    }

    function applyFolderToDescendants(folderTr, tbody, perm, useYn) {
        var rows = UX.qsa("tr", tbody);
        var folderLevel = toNum(folderTr.dataset.treeLvl, 1);
        var startIdx = rows.indexOf(folderTr);
        if (startIdx < 0) return;

        for (var i = startIdx + 1; i < rows.length; i++) {
            var tr = rows[i];
            var level = toNum(tr.dataset.treeLvl, 1);
            if (level <= folderLevel) break;
            UX.qs(".permLvl", tr).value = String(perm);
            UX.qs(".useYn", tr).value = String(useYn);
            markDirty(tr);
        }
    }

    function renderGroupMenus(list) {
        var tbody = UX.qs("#menuPermBody", page());
        if (!tbody) return;

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='4'>No data</td></tr>";
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
                "<td>" + UX.esc(indentName(row.menu_nm, row.tree_lvl)) + "</td>" +
                "<td class='permCell'></td>" +
                "<td class='useCell'></td>";

            var permSel = makeSelect([
                { value: "0", label: "0" },
                { value: "1", label: "1" },
                { value: "5", label: "5" },
                { value: "10", label: "10" }
            ], [0, 1, 5, 10].indexOf(toNum(row.perm_lvl, 0)) >= 0 ? toNum(row.perm_lvl, 0) : 0, "permLvl");

            var useSel = makeSelect([
                { value: "Y", label: "Y" },
                { value: "N", label: "N" }
            ], row.map_use_yn === "Y" ? "Y" : "N", "useYn");

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

            UX.qs(".permCell", tr).appendChild(permSel);
            UX.qs(".useCell", tr).appendChild(useSel);
            tbody.appendChild(tr);
        });
    }

    function loadGroupMenus(authGroupSeq) {
        emptyTable("#menuPermBody", 4, "Loading...");
        return app.callJson("/auth/group/menu/list.json", { auth_group_seq: authGroupSeq }, function (list) {
            renderGroupMenus(Array.isArray(list) ? list : []);
        });
    }

    function renderGroupServices(list) {
        var tbody = UX.qs("#servicePermBody", page());
        if (!tbody) return;

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='4'>No data</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        list.forEach(function (row, index) {
            var tr = document.createElement("tr");
            tr.dataset.servicePermSeq = String(row.service_perm_seq);
            tr.innerHTML =
                "<td>" + UX.esc(index + 1) + "</td>" +
                "<td>" + UX.esc(row.service_nm || row.service_cd || "-") + "</td>" +
                "<td>" + UX.esc(row.perm_nm || row.perm_cd || "-") + "</td>" +
                "<td class='useCell'></td>";

            var useSel = makeSelect([
                { value: "Y", label: "Y" },
                { value: "N", label: "N" }
            ], row.map_use_yn === "Y" ? "Y" : "N", "serviceUseYn");

            useSel.addEventListener("change", function () {
                markDirty(tr);
            });

            UX.qs(".useCell", tr).appendChild(useSel);
            tbody.appendChild(tr);
        });
    }

    function loadGroupServices(authGroupSeq) {
        emptyTable("#servicePermBody", 4, "Loading...");
        return app.callJson("/auth/group/service/list.json", { auth_group_seq: authGroupSeq }, function (list) {
            renderGroupServices(Array.isArray(list) ? list : []);
        });
    }

    function saveGroupMenus() {
        var authGroupSeq = selectedSeq("group");
        var tbody = UX.qs("#menuPermBody", page());
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
            alert("No changes");
            return;
        }

        app.callJson("/auth/group/menu/save.json", { auth_group_seq: authGroupSeq, items: items }, function () {
            loadGroupMenus(authGroupSeq);
        });
    }

    function saveGroupServices() {
        var authGroupSeq = selectedSeq("group");
        var tbody = UX.qs("#servicePermBody", page());
        if (!authGroupSeq || !tbody) return;

        var items = UX.qsa("tr", tbody).filter(function (tr) {
            return tr.dataset.dirty === "1";
        }).map(function (tr) {
            return {
                service_perm_seq: Number(tr.dataset.servicePermSeq),
                use_yn: UX.qs(".serviceUseYn", tr).value === "Y" ? "Y" : "N"
            };
        });

        if (!items.length) {
            alert("No changes");
            return;
        }

        app.callJson("/auth/group/service/save.json", { auth_group_seq: authGroupSeq, items: items }, function () {
            loadGroupServices(authGroupSeq);
        });
    }

    function renderUserList(list) {
        var tbody = UX.qs("#userListBody", page());
        if (!tbody) return;

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='3'>No data</td></tr>";
            emptyTable("#userExceptionBody", 4, "No data");
            emptyTable("#userServiceExceptionBody", 5, "No data");
            setSelected("user", null, "-");
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
                UX.qsa("tr", tbody).forEach(function (row) {
                    row.classList.remove("is-selected");
                });
                tr.classList.add("is-selected");
                var seq = Number(tr.getAttribute("data-user-seq"));
                setSelected("user", seq, UX.normalizeText(tr.children[2].textContent) || String(seq));
                loadUserMenuPerms(seq);
                loadUserServicePerms(seq);
            });
        });

        var first = tbody.querySelector("tr[data-user-seq]");
        if (first) first.click();
    }

    function searchUsers() {
        emptyTable("#userListBody", 3, "Loading...");
        return app.callJson("/auth/user/search.json", {
            keyword: UX.getValue("#userKeyword", page())
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

    function renderUserMenuPerms(list) {
        var tbody = UX.qs("#userExceptionBody", page());
        if (!tbody) return;

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='4'>No data</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        list.forEach(function (row, index) {
            var tr = document.createElement("tr");
            var isFolder = isFolderRow(row);
            var state = (row.ex_access_yn === "Y" || row.ex_access_yn === "X") ? row.ex_access_yn : "N";
            tr.dataset.menuSeq = String(row.menu_seq);
            tr.dataset.isFolder = isFolder ? "1" : "0";

            tr.innerHTML =
                "<td>" + UX.esc(index + 1) + "</td>" +
                "<td>" + UX.esc(indentName(row.menu_nm, row.tree_lvl)) + "</td>" +
                "<td>" + UX.esc(basePermLabel(row.base_perm_lvl)) + "</td>" +
                "<td class='stateCell'></td>";

            var stateSel = makeSelect([
                { value: "N", label: "Inherited" },
                { value: "Y", label: "Allow" },
                { value: "X", label: "Deny" }
            ], isFolder ? "N" : state, "exStateSel");

            if (isFolder) stateSel.disabled = true;
            stateSel.addEventListener("change", function () {
                markDirty(tr);
            });

            UX.qs(".stateCell", tr).appendChild(stateSel);
            tbody.appendChild(tr);
        });
    }

    function loadUserMenuPerms(userSeq) {
        emptyTable("#userExceptionBody", 4, "Loading...");
        return app.callJson("/auth/user/menuPermList.json", { user_seq: userSeq }, function (list) {
            renderUserMenuPerms(Array.isArray(list) ? list : []);
        });
    }

    function renderUserServicePerms(list) {
        var tbody = UX.qs("#userServiceExceptionBody", page());
        if (!tbody) return;

        if (!list.length) {
            tbody.innerHTML = "<tr><td colspan='5'>No data</td></tr>";
            return;
        }

        tbody.innerHTML = "";
        list.forEach(function (row, index) {
            var tr = document.createElement("tr");
            var state = (row.ex_access_yn === "Y" || row.ex_access_yn === "X") ? row.ex_access_yn : "N";
            tr.dataset.servicePermSeq = String(row.service_perm_seq);
            tr.innerHTML =
                "<td>" + UX.esc(index + 1) + "</td>" +
                "<td>" + UX.esc(row.service_nm || row.service_cd || "-") + "</td>" +
                "<td>" + UX.esc(row.perm_nm || row.perm_cd || "-") + "</td>" +
                "<td>" + UX.esc(Number(row.base_access || 0) > 0 ? "Allow" : "None") + "</td>" +
                "<td class='stateCell'></td>";

            var stateSel = makeSelect([
                { value: "N", label: "Inherited" },
                { value: "Y", label: "Allow" },
                { value: "X", label: "Deny" }
            ], state, "serviceExStateSel");

            stateSel.addEventListener("change", function () {
                markDirty(tr);
            });

            UX.qs(".stateCell", tr).appendChild(stateSel);
            tbody.appendChild(tr);
        });
    }

    function loadUserServicePerms(userSeq) {
        emptyTable("#userServiceExceptionBody", 5, "Loading...");
        return app.callJson("/auth/user/servicePermList.json", { user_seq: userSeq }, function (list) {
            renderUserServicePerms(Array.isArray(list) ? list : []);
        });
    }

    function saveUserMenuExceptions() {
        var userSeq = selectedSeq("user");
        var tbody = UX.qs("#userExceptionBody", page());
        if (!userSeq || !tbody) return;

        var exceptions = UX.qsa("tr", tbody).filter(function (tr) {
            return tr.dataset.isFolder !== "1";
        }).map(function (tr) {
            var select = UX.qs(".exStateSel", tr);
            return select ? {
                menu_seq: Number(tr.dataset.menuSeq),
                access_yn: select.value,
                perm_lvl: select.value === "Y" ? 1 : 0
            } : null;
        }).filter(function (row) {
            return row && (row.access_yn === "Y" || row.access_yn === "X");
        });

        app.callJson("/auth/user/exception/save.json", {
            user_seq: userSeq,
            exceptions: exceptions
        }, function () {
            loadUserMenuPerms(userSeq);
            document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
            if (typeof global.SIDEBAR_INIT === "function") {
                global.SIDEBAR_INIT();
            }
        });
    }

    function saveUserServiceExceptions() {
        var userSeq = selectedSeq("user");
        var tbody = UX.qs("#userServiceExceptionBody", page());
        if (!userSeq || !tbody) return;

        var exceptions = UX.qsa("tr", tbody).map(function (tr) {
            var select = UX.qs(".serviceExStateSel", tr);
            return select ? {
                service_perm_seq: Number(tr.dataset.servicePermSeq),
                access_yn: select.value
            } : null;
        }).filter(function (row) {
            return row && (row.access_yn === "Y" || row.access_yn === "X");
        });

        app.callJson("/auth/user/serviceException/save.json", {
            user_seq: userSeq,
            exceptions: exceptions
        }, function () {
            loadUserServicePerms(userSeq);
        });
    }

    function ensureUserTabLoaded() {
        if (userTabLoaded) return;
        userTabLoaded = true;
        searchUsers();
    }

    function bindSubTabs(el) {
        UX.qsa("[data-subtab-group]", el).forEach(function (group) {
            UX.qsa("[data-subtab]", group).forEach(function (tab) {
                tab.addEventListener("click", function () {
                    var target = tab.dataset.subtab;
                    UX.qsa("[data-subtab]", group).forEach(function (item) {
                        item.classList.remove("is-active");
                    });
                    tab.classList.add("is-active");
                    var scope = group.parentElement || el;
                    UX.qsa("[data-subtab-pane]", scope).forEach(function (pane) {
                        pane.style.display = pane.dataset.subtabPane === target ? "" : "none";
                    });
                });
            });
        });
    }

    function bindTabs(el) {
        UX.qsa(".tab", el).forEach(function (tab) {
            tab.addEventListener("click", function () {
                var target = tab.dataset.tab;
                UX.qsa(".tab", el).forEach(function (item) {
                    item.classList.remove("is-active");
                });
                tab.classList.add("is-active");
                UX.qsa(".tab-pane", el).forEach(function (pane) {
                    pane.style.display = pane.dataset.pane === target ? "" : "none";
                });
                if (target === "B") {
                    ensureUserTabLoaded();
                }
            });
        });
    }

    function bind(el) {
        UX.bindOnce(UX.qs("#btnGroupNew", el), "click", resetGroupEditor);
        UX.bindOnce(UX.qs("#btnGroupMetaSave", el), "click", saveGroupMeta);
        UX.bindOnce(UX.qs("#btnGroupDelete", el), "click", deleteGroup);
        UX.bindOnce(UX.qs("#btnGroupReload", el), "click", loadGroups);
        UX.bindOnce(UX.qs("#btnGroupSave", el), "click", saveGroupMenus);
        UX.bindOnce(UX.qs("#btnGroupServiceSave", el), "click", saveGroupServices);
        UX.bindOnce(UX.qs("#btnUserSearch", el), "click", searchUsers);
        UX.bindOnce(UX.qs("#btnUserExceptionSave", el), "click", saveUserMenuExceptions);
        UX.bindOnce(UX.qs("#btnUserServiceExceptionSave", el), "click", saveUserServiceExceptions);
        app.bindEnterAction(UX.qs("#userKeyword", el), searchUsers);
    }

    function init() {
        var el = page();
        if (!el) return;
        userTabLoaded = false;
        bindTabs(el);
        bindSubTabs(el);
        bind(el);
        app.applyPermission(el);
        fillGroupForm(null);
        loadGroups();
    }

    app.bindPage("__AUTH_PAGE_BOUND_V4__", "/auth/main.do", init);
})(window);
