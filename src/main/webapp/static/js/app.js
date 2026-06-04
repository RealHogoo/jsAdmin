(function (global) {
    "use strict";

    var UX = global.UX || {};
    var app = global.app || {};
    var SPA = global.jsAdminSpa || {};
    var authState = {
        user: null,
        session_id: ""
    };
    var loadingDepth = 0;
    var refreshPromise = null;

    function ensureFavicon() {
        var head = document.head || document.getElementsByTagName("head")[0];
        if (!head) return;

        var link = head.querySelector("link[rel='icon']") || document.createElement("link");
        link.rel = "icon";
        link.type = "image/svg+xml";

        var svg = ""
            + "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>"
            + "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>"
            + "<stop offset='0%' stop-color='%232563eb'/>"
            + "<stop offset='100%' stop-color='%230f766e'/>"
            + "</linearGradient></defs>"
            + "<rect width='64' height='64' rx='14' fill='url(%23g)'/>"
            + "<text x='50%' y='54%' dominant-baseline='middle' text-anchor='middle'"
            + " font-family='Segoe UI, Arial, sans-serif' font-size='30' font-weight='700' fill='white'>A</text>"
            + "</svg>";

        link.href = "data:image/svg+xml," + svg;
        if (!link.parentNode) {
            head.appendChild(link);
        }
    }

    function destroyComponent(component) {
        if (component && typeof component.destroy === "function") {
            component.destroy();
        }
    }

    function ensureLoadingBar() {
        var bar = document.getElementById("appLoadingBar");
        if (bar) return bar;

        bar = document.createElement("div");
        bar.id = "appLoadingBar";
        bar.className = "app-loading-bar";
        bar.innerHTML = "<span class='app-loading-bar__inner'></span>";
        document.body.appendChild(bar);
        return bar;
    }

    function showLoadingBar() {
        loadingDepth += 1;
        ensureLoadingBar().classList.add("is-active");
    }

    function hideLoadingBar() {
        loadingDepth = Math.max(loadingDepth - 1, 0);
        if (loadingDepth > 0) return;
        ensureLoadingBar().classList.remove("is-active");
    }

    function normalizePayload(data) {
        var obj = {};
        Object.keys(data || {}).forEach(function (key) {
            var value = data[key];
            if (value === undefined) return;

            if (typeof UX.strOrNull === "function" && typeof value === "string") {
                value = UX.strOrNull(value);
            }
            if (value === null) return;
            obj[key] = value;
        });
        return JSON.stringify(obj);
    }

    function authHeaders() {
        return {
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json"
        };
    }

    function storeAuthState(data) {
        var payload = data || {};
        authState.session_id = payload.session_id || authState.session_id || "";
        authState.user = payload.user || authState.user || null;
    }

    function clearAuthState() {
        authState.user = null;
        authState.session_id = "";
        if (UX.localRemove) {
            UX.localRemove(["JWT", "REFRESH_TOKEN", "LOGIN_USER", "LOGIN_SESSION_ID"]);
        }
        document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
    }

    function getAuthState() {
        return {
            user: authState.user,
            session_id: authState.session_id || ""
        };
    }

    async function executeScripts(rootEl) {
        var scripts = Array.from(rootEl.querySelectorAll("script"));
        for (var i = 0; i < scripts.length; i++) {
            var oldScript = scripts[i];
            var newScript = document.createElement("script");
            if (oldScript.type) newScript.type = oldScript.type;

            if (oldScript.src) {
                newScript.src = oldScript.src;
                newScript.async = false;

                await new Promise(function (resolve) {
                    newScript.onload = resolve;
                    newScript.onerror = resolve;
                    oldScript.parentNode.removeChild(oldScript);
                    rootEl.appendChild(newScript);
                });
            } else {
                newScript.text = oldScript.textContent;
                oldScript.parentNode.removeChild(oldScript);
                rootEl.appendChild(newScript);
            }
        }
    }

    function isDo(url) {
        return typeof url === "string" && url.toLowerCase().endsWith(".do");
    }

    function isJson(url) {
        return typeof url === "string" && url.toLowerCase().endsWith(".json");
    }

    function isRefreshUrl(url) {
        return String(url || "").toLowerCase().indexOf("/auth/refresh.json") >= 0;
    }

    function isLoginUrl(url) {
        return String(url || "").toLowerCase().indexOf("/login.json") >= 0;
    }

    function isLoginPageUrl(url) {
        return String(url || "").toLowerCase().indexOf("/login.do") >= 0;
    }

    async function handleUnauthorized() {
        clearAuthState();

        if (global.__JSADMIN_AUTH_REDIRECTING) return null;

        var appRoot = document.getElementById("app");
        var isLoginFragment = appRoot && appRoot.querySelector("#loginForm, form[data-page='login'], [data-page='login']");
        if (!isLoginFragment) {
            global.__JSADMIN_AUTH_REDIRECTING = true;
            try {
                alertSessionExpired();
                await loadPage("/login.do");
            } finally {
                global.__JSADMIN_AUTH_REDIRECTING = false;
            }
        }
        return null;
    }

    function alertSessionExpired() {
        if (global.__JSADMIN_AUTH_ALERTED) return;
        global.__JSADMIN_AUTH_ALERTED = true;
        global.alert("로그인 정보가 유효하지 않습니다. 다시 로그인해 주세요.");
    }

    async function refreshAuth() {
        if (refreshPromise) {
            return refreshPromise;
        }

        refreshPromise = fetch("/auth/refresh.json", {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
                "Accept": "application/json"
            },
            body: JSON.stringify({}),
            credentials: "same-origin"
        }).then(async function (response) {
            var text = await response.text();
            var body = text && text.trim() ? JSON.parse(text) : null;

            if (!response.ok || !body || body.ok !== true || !body.data || !body.data.token) {
                clearAuthState();
                return false;
            }

            storeAuthState(body.data);
            document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
            return true;
        }).catch(function () {
            clearAuthState();
            return false;
        }).finally(function () {
            refreshPromise = null;
        });

        return refreshPromise;
    }

    async function requestHtml(url, data) {
        var response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: normalizePayload(data || {}),
            credentials: "same-origin"
        });

        var text = await response.text();
        if (response.status === 401 && !isLoginPageUrl(url)) {
            await handleUnauthorized();
            return "";
        }
        if (!response.ok) {
            throw new Error("HTTP " + response.status + "\n" + text);
        }
        return text;
    }

    async function requestJson(url, data, options) {
        var opts = options || {};
        var response = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
            body: normalizePayload(data || {}),
            credentials: "same-origin"
        });

        var text = await response.text();
        var body = text && text.trim() ? JSON.parse(text) : null;

        if (response.status === 401) {
            if (!opts.skipRefresh && !isRefreshUrl(url) && !isLoginUrl(url)) {
                var refreshed = await refreshAuth();
                if (refreshed) {
                    return requestJson(url, data, {
                        skipRefresh: true
                    });
                }
            }
            return handleUnauthorized();
        }
        if (!response.ok) {
            throw new Error("HTTP " + response.status + "\n" + text);
        }
        if (!body || typeof body.ok !== "boolean") {
            throw new Error("INVALID_API_RESPONSE");
        }
        if (!body.ok) {
            throw new Error((body.code || "ERROR") + ": " + (body.message || "failed"));
        }
        return body.data;
    }

    async function verifyAuth() {
        try {
            var response = await fetch("/auth/ping.json", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({}),
                credentials: "same-origin"
            });

            if (response.status === 401) {
                await handleUnauthorized();
                return false;
            }
            if (!response.ok) {
                return false;
            }

            var text = await response.text();
            var body = text && text.trim() ? JSON.parse(text) : null;
            return !!(body && body.ok && body.data && body.data.user_id);
        } catch (e) {
            return false;
        }
    }

    async function syncAuthProfile() {
        try {
            var response = await fetch("/auth/me.json", {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({}),
                credentials: "same-origin"
            });

            if (response.status === 401) {
                await handleUnauthorized();
                return null;
            }
            if (!response.ok) {
                return null;
            }

            var text = await response.text();
            var body = text && text.trim() ? JSON.parse(text) : null;
            if (!body || body.ok !== true || !body.data) {
                return null;
            }

            storeAuthState({
                session_id: body.data.session_id || "",
                user: {
                    user_id: body.data.user_id || "",
                    user_nm: body.data.user_nm || "",
                    roles: body.data.roles || [],
                    super_admin: body.data.super_admin === true
                }
            });
            document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
            return body.data;
        } catch (e) {
            return null;
        }
    }

    async function loadPage(url, data, callback) {
        if (url === "/main.do" || url === "main.do") {
            url = "/home.do";
        }
        if (!isDo(url)) {
            throw new Error("loadPage(url): url must end with .do");
        }

        showLoadingBar();
        try {
            var html = await requestHtml(url, data);
            var appRoot = document.getElementById("app");
            if (!appRoot) throw new Error("#app not found");

            appRoot.innerHTML = html;
            await executeScripts(appRoot);
            document.dispatchEvent(new CustomEvent("jsadmin:pageLoaded", { detail: { url: url } }));

            if (typeof callback === "function") {
                callback(html);
            }
            return html;
        } finally {
            hideLoadingBar();
        }
    }

    async function callJson(arg1, arg2, arg3) {
        var url;
        var data;
        var callback;

        if (typeof arg1 === "string") {
            url = arg1;
            data = arg2 || {};
            callback = arg3;
        } else {
            url = arg1 && arg1.url;
            data = (arg1 && arg1.data) || {};
            callback = arg2 || (arg1 && arg1.callback);
        }

        if (!isJson(url)) {
            throw new Error("callJson(url): url must end with .json");
        }

        var result = await requestJson(url, data);
        if (result === null) return null;

        if (typeof callback === "function") {
            callback(result);
        }
        return result;
    }

    function bindPage(flagKey, url, init) {
        if (flagKey && global[flagKey]) {
            return;
        }
        if (flagKey) {
            global[flagKey] = true;
        }

        document.addEventListener("jsadmin:pageLoaded", function (e) {
            if (e && e.detail && e.detail.url === url) {
                init();
            }
        });

        try {
            init();
        } catch (ignore) {}
    }

    function createChunkListController(options) {
        var createView = options && options.createView;
        var getScrollElement = options && options.getScrollElement;
        var applyItems = options && options.applyItems;
        var pageSize = Number((options && options.pageSize) || 100);
        var threshold = Number((options && options.threshold) || 120);
        var view = null;
        var loader = null;

        if (typeof createView !== "function") {
            throw new Error("createView is required");
        }
        if (typeof applyItems !== "function") {
            throw new Error("applyItems is required");
        }

        function ensureView() {
            if (!view) {
                view = createView();
            }
            return view;
        }

        function ensureLoader() {
            ensureView();
            if (loader || !global.Grid || !global.Grid.createChunkLoader) {
                return loader;
            }
            loader = global.Grid.createChunkLoader({
                pageSize: pageSize,
                threshold: threshold,
                getScrollElement: function () {
                    return typeof getScrollElement === "function"
                        ? getScrollElement(ensureView())
                        : null;
                },
                onData: function (result) {
                    applyItems(ensureView(), result.items || []);
                }
            });
            return loader;
        }

        function replaceItems(items) {
            var safeItems = Array.isArray(items) ? items : [];
            ensureView();
            ensureLoader();
            if (loader) {
                loader.replaceItems(safeItems);
            } else {
                applyItems(view, safeItems.slice(0, pageSize));
            }
        }

        function refresh() {
            if (view && typeof view.refresh === "function") {
                view.refresh();
            }
        }

        function destroy() {
            destroyComponent(loader);
            destroyComponent(view);
            loader = null;
            view = null;
        }

        return {
            ensureView: ensureView,
            ensureLoader: ensureLoader,
            replaceItems: replaceItems,
            refresh: refresh,
            destroy: destroy,
            getView: function () { return view; },
            getLoader: function () { return loader; }
        };
    }

    function getPermLevel(root) {
        var page = root || document;
        var value = page && page.getAttribute ? page.getAttribute("data-perm-lvl") : null;
        var num = UX && typeof UX.numOrNull === "function" ? UX.numOrNull(value) : null;
        return num === null || num === 0 ? null : num;
    }

    function applyPermission(root) {
        var page = root || document;
        var permLvl = getPermLevel(page);
        if (permLvl === null || !UX || typeof UX.qsa !== "function") {
            return;
        }
        UX.qsa("[data-perm-lvl]", page).forEach(function (el) {
            var need = UX.numOrNull(el.getAttribute("data-perm-lvl"));
            if (need !== null && typeof UX.setDisabled === "function") {
                UX.setDisabled(el, permLvl < need);
            }
        });
    }

    function bindEnterAction(input, handler) {
        if (!input || input.dataset.enterBound === "1") {
            return;
        }
        input.dataset.enterBound = "1";
        input.addEventListener("keydown", function (e) {
            if (e.key === "Enter") {
                e.preventDefault();
                handler();
            }
        });
    }

    ensureFavicon();

    document.addEventListener("click", function (e) {
        var target = e.target;
        var base = target && target.nodeType === 1 ? target : (target && target.parentElement ? target.parentElement : null);
        var link = base && base.closest ? base.closest("a[data-spa]") : null;
        if (!link) return;
        e.preventDefault();
        loadPage(link.getAttribute("data-spa"));
    });

    document.addEventListener("submit", function (e) {
        var form = e.target.closest("form[data-json]");
        if (!form) return;

        e.preventDefault();

        var data = {};
        new FormData(form).forEach(function (value, key) {
            data[key] = value;
        });

        callJson(form.getAttribute("data-json"), data).catch(function (err) {
            alert(err.message);
        });
    });

    global.__JSADMIN_AUTH_REDIRECTING = global.__JSADMIN_AUTH_REDIRECTING || false;

    app.loadPage = loadPage;
    app.callJson = callJson;
    app.requestJson = requestJson;
    app.requestHtml = requestHtml;
    app.verifyAuth = verifyAuth;
    app.syncAuthProfile = syncAuthProfile;
    app.clearAuthState = clearAuthState;
    app.storeAuthState = storeAuthState;
    app.getAuthState = getAuthState;
    app.refreshAuth = refreshAuth;
    app.bindPage = bindPage;
    app.createChunkListController = createChunkListController;
    app.destroyComponent = destroyComponent;
    app.getPermLevel = getPermLevel;
    app.applyPermission = applyPermission;
    app.bindEnterAction = bindEnterAction;

    SPA.load = loadPage;
    SPA.call = callJson;
    SPA.http = SPA.http || {};
    SPA.http.postText = requestHtml;

    global.app = app;
    global.jsAdminSpa = SPA;
})(window);
