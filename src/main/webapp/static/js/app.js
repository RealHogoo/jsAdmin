(function (global) {
    "use strict";

    var UX = global.UX || {};
    var app = global.app || {};
    var SPA = global.jsAdminSpa || {};
    var loadingDepth = 0;

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
        var headers = {
            "Content-Type": "application/json; charset=UTF-8",
            "Accept": "application/json"
        };
        var token = UX.localGet ? UX.localGet("JWT", "") : "";
        if (token) {
            headers.Authorization = "Bearer " + token;
        }
        return headers;
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

    async function handleUnauthorized() {
        if (UX.localRemove) {
            UX.localRemove(["JWT", "LOGIN_USER", "LOGIN_SESSION_ID"]);
        }

        document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));

        if (global.__JSADMIN_AUTH_REDIRECTING) return null;

        var appRoot = document.getElementById("app");
        var isLoginFragment = appRoot && appRoot.querySelector("#loginForm, form[data-page='login'], [data-page='login']");
        if (!isLoginFragment) {
            global.__JSADMIN_AUTH_REDIRECTING = true;
            try {
                await loadPage("/login.do");
            } finally {
                global.__JSADMIN_AUTH_REDIRECTING = false;
            }
        }
        return null;
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
        if (!response.ok) {
            throw new Error("HTTP " + response.status + "\n" + text);
        }
        return text;
    }

    async function requestJson(url, data) {
        var response = await fetch(url, {
            method: "POST",
            headers: authHeaders(),
            body: normalizePayload(data || {}),
            credentials: "same-origin"
        });

        var text = await response.text();
        var body = text && text.trim() ? JSON.parse(text) : null;

        if (response.status === 401) {
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

    SPA.load = loadPage;
    SPA.call = callJson;
    SPA.http = SPA.http || {};
    SPA.http.postText = requestHtml;

    global.app = app;
    global.jsAdminSpa = SPA;
})(window);
