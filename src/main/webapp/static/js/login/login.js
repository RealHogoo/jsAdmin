(function (global) {
    "use strict";

    var countdownTimer = null;
    var retryUntilMs = 0;

    function ctx() {
        return global.CTX || "";
    }

    function byId(id) {
        return document.getElementById(id);
    }

    function postJson(url, body) {
        var full = url.indexOf("/") === 0 ? (ctx() + url) : (ctx() + "/" + url);
        return fetch(full, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body || {})
        }).then(function (r) {
            var ct = (r.headers && r.headers.get("content-type")) || "";
            if (ct.indexOf("application/json") >= 0) {
                return r.json();
            }
            return r.text().then(function (t) {
                throw new Error("HTTP " + r.status + " (non-json): " + t);
            });
        });
    }

    function clearAuthStorage() {
        try { localStorage.removeItem("JWT"); } catch (e) {}
        try { localStorage.removeItem("LOGIN_USER"); } catch (e) {}
        try { localStorage.removeItem("LOGIN_SESSION_ID"); } catch (e) {}
    }

    function setMsg(text, type) {
        var el = byId("loginMsg");
        if (!el) return;
        el.textContent = text || "";
        el.className = "login-msg" + (type ? " is-" + type : "");
    }

    function setDisabled(disabled) {
        var btn = byId("btnLogin");
        var userId = byId("login_user_id");
        var userPw = byId("login_user_pw");

        if (btn) btn.disabled = !!disabled;
        if (userId) userId.disabled = !!disabled;
        if (userPw) userPw.disabled = !!disabled;
    }

    function stopCountdown() {
        if (countdownTimer) {
            global.clearInterval(countdownTimer);
            countdownTimer = null;
        }
        retryUntilMs = 0;
        try { sessionStorage.removeItem("LOGIN_RETRY_UNTIL_MS"); } catch (e) {}
    }

    function startCountdown(untilMs) {
        stopCountdown();
        retryUntilMs = untilMs || 0;
        if (!retryUntilMs || retryUntilMs <= Date.now()) {
            setDisabled(false);
            return;
        }

        try { sessionStorage.setItem("LOGIN_RETRY_UNTIL_MS", String(retryUntilMs)); } catch (e) {}
        setDisabled(true);

        function tick() {
            var remain = Math.max(0, Math.ceil((retryUntilMs - Date.now()) / 1000));
            if (remain <= 0) {
                stopCountdown();
                setDisabled(false);
                setMsg("다시 로그인할 수 있습니다.", "info");
                return;
            }
            setMsg(remain + "초 후 다시 시도하세요.", "warn");
        }

        tick();
        countdownTimer = global.setInterval(tick, 1000);
    }

    function restoreCountdown() {
        try {
            var saved = sessionStorage.getItem("LOGIN_RETRY_UNTIL_MS");
            if (!saved) return;
            var untilMs = Number(saved);
            if (untilMs > Date.now()) {
                startCountdown(untilMs);
            } else {
                stopCountdown();
            }
        } catch (e) {}
    }

    function applyDelayInfo(data) {
        var retryAfterSeconds = data && Number(data.retry_after_seconds);
        var retryAvailableAt = data && Number(data.retry_available_at);
        if (retryAvailableAt > Date.now()) {
            startCountdown(retryAvailableAt);
            return true;
        }
        if (retryAfterSeconds > 0) {
            startCountdown(Date.now() + (retryAfterSeconds * 1000));
            return true;
        }
        return false;
    }

    function focusPassword() {
        var pw = byId("login_user_pw");
        if (pw && !pw.disabled) {
            pw.focus();
            pw.select();
        }
    }

    function doLogin() {
        var userId = ((byId("login_user_id") && byId("login_user_id").value) || "").trim();
        var userPw = ((byId("login_user_pw") && byId("login_user_pw").value) || "");

        if (!userId || !userPw) {
            setMsg("아이디와 비밀번호를 입력하세요.", "error");
            return;
        }

        postJson("/login.json", { user_id: userId, user_pw: userPw })
            .then(function (res) {
                if (!res || res.ok !== true) {
                    clearAuthStorage();

                    if (!applyDelayInfo(res && res.data ? res.data : null)) {
                        setDisabled(false);
                        setMsg((res && res.message) ? res.message : "로그인에 실패했습니다.", "error");
                    }
                    focusPassword();
                    return;
                }

                stopCountdown();

                try {
                    localStorage.setItem("JWT", res.data && res.data.token ? res.data.token : "");
                    localStorage.setItem("LOGIN_USER", JSON.stringify((res.data && res.data.user) ? res.data.user : {}));
                    localStorage.setItem("LOGIN_SESSION_ID", res.data && res.data.session_id ? res.data.session_id : "");
                } catch (e) {}

                setMsg("로그인되었습니다.", "success");
                try { document.dispatchEvent(new CustomEvent("jsadmin:authChanged")); } catch (e) {}

                if (global.jsAdminSpa && typeof global.jsAdminSpa.load === "function") {
                    global.jsAdminSpa.load("/home.do");
                } else {
                    location.href = ctx() + "/main.do";
                }
            })
            .catch(function (e) {
                clearAuthStorage();
                setDisabled(false);
                setMsg(String(e && e.message ? e.message : e), "error");
            });
    }

    function init() {
        var btn = byId("btnLogin");
        if (!btn) return;
        if (btn.getAttribute("data-bound") === "Y") return;
        btn.setAttribute("data-bound", "Y");

        btn.onclick = doLogin;

        var userId = byId("login_user_id");
        var pw = byId("login_user_pw");

        function handleEnter(e) {
            e = e || global.event;
            if (e.key === "Enter" && !(btn && btn.disabled)) {
                doLogin();
            }
        }

        if (userId) userId.onkeydown = handleEnter;
        if (pw) pw.onkeydown = handleEnter;

        restoreCountdown();
    }

    global.Page = global.Page || {};
    global.Page.login = { init: init };

    try { init(); } catch (e) {}
})(window);
