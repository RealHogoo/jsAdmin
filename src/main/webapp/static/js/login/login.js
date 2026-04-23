(function (global) {
    "use strict";

    var UX = global.UX;
    var returnUrl = null;

    var countdownTimer = null;
    var retryUntilMs = 0;
    var MSG_READY = "\uB2E4\uC2DC \uB85C\uADF8\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
    var MSG_RETRY_SUFFIX = "\uCD08 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    var MSG_REQUIRED = "\uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694.";
    var MSG_FAIL = "\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
    var MSG_SUCCESS = "\uB85C\uADF8\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
    var MSG_SERVER_ERROR = "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";

    function clearAuthStorage() {
        UX.localRemove(["JWT", "REFRESH_TOKEN", "LOGIN_USER", "LOGIN_SESSION_ID"]);
    }

    function setMsg(text, type) {
        var el = UX.byId("loginMsg");
        if (!el) return;
        el.textContent = text || "";
        el.className = "login-msg" + (type ? " is-" + type : "");
    }

    function setDisabled(disabled) {
        UX.setDisabled(UX.byId("btnLogin"), disabled);
        UX.setDisabled(UX.byId("login_user_id"), disabled);
        UX.setDisabled(UX.byId("login_user_pw"), disabled);
    }

    function stopCountdown() {
        if (countdownTimer) {
            global.clearInterval(countdownTimer);
            countdownTimer = null;
        }
        retryUntilMs = 0;
        UX.sessionRemove("LOGIN_RETRY_UNTIL_MS");
    }

    function startCountdown(untilMs) {
        stopCountdown();
        retryUntilMs = untilMs || 0;
        if (!retryUntilMs || retryUntilMs <= Date.now()) {
            setDisabled(false);
            return;
        }

        UX.sessionSet("LOGIN_RETRY_UNTIL_MS", String(retryUntilMs));
        setDisabled(true);

        function tick() {
            var remain = Math.max(0, Math.ceil((retryUntilMs - Date.now()) / 1000));
            if (remain <= 0) {
                stopCountdown();
                setDisabled(false);
                setMsg(MSG_READY, "info");
                return;
            }
            setMsg(remain + MSG_RETRY_SUFFIX, "warn");
        }

        tick();
        countdownTimer = global.setInterval(tick, 1000);
    }

    function restoreCountdown() {
        var untilMs = Number(UX.sessionGet("LOGIN_RETRY_UNTIL_MS", "0"));
        if (untilMs > Date.now()) startCountdown(untilMs);
        else stopCountdown();
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
        var pw = UX.byId("login_user_pw");
        if (pw && !pw.disabled) {
            pw.focus();
            pw.select();
        }
    }

    function postLogin(body) {
        var full = (global.CTX || "") + "/login.json";
        return fetch(full, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body || {})
        }).then(function (response) {
            var ct = (response.headers && response.headers.get("content-type")) || "";
            if (ct.indexOf("application/json") >= 0) {
                return response.json();
            }
            return response.text().then(function (text) {
                throw new Error("HTTP " + response.status + " (non-json): " + text);
            });
        });
    }

    function resolveReturnUrl() {
        try {
            var params = new URLSearchParams(global.location.search || "");
            var value = params.get("return_url");
            if (!value) return null;
            var decoded = value.trim();
            if (!decoded) return null;
            if (/^https?:\/\//i.test(decoded)) {
                var parsed = new URL(decoded, global.location.origin);
                if (parsed.hostname !== global.location.hostname) {
                    return null;
                }
                return parsed.toString();
            }
            if (decoded.charAt(0) === "/") {
                return decoded;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function doLogin() {
        var userId = UX.normalizeText(UX.byId("login_user_id") && UX.byId("login_user_id").value);
        var userPw = (UX.byId("login_user_pw") && UX.byId("login_user_pw").value) || "";

        if (!userId || !userPw) {
            setMsg(MSG_REQUIRED, "error");
            return;
        }

        postLogin({ user_id: userId, user_pw: userPw })
            .then(function (res) {
                if (!res || res.ok !== true) {
                    clearAuthStorage();
                    if (!applyDelayInfo(res && res.data ? res.data : null)) {
                        setDisabled(false);
                        setMsg((res && res.message) ? res.message : MSG_FAIL, "error");
                    }
                    focusPassword();
                    return;
                }

                stopCountdown();
                if (global.app && typeof global.app.storeAuthState === "function") {
                    global.app.storeAuthState(res.data || {});
                }

                setMsg(MSG_SUCCESS, "success");
                document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));

                if (returnUrl) {
                    location.href = returnUrl;
                } else if (global.app && typeof global.app.loadPage === "function") {
                    global.app.loadPage("/home.do");
                } else {
                    location.href = (global.CTX || "") + "/";
                }
            })
            .catch(function (e) {
                clearAuthStorage();
                setDisabled(false);
                setMsg(MSG_SERVER_ERROR, "error");
            });
    }

    function init() {
        var btn = UX.byId("btnLogin");
        if (!btn || btn.getAttribute("data-bound") === "Y") return;
        btn.setAttribute("data-bound", "Y");

        btn.onclick = doLogin;

        function handleEnter(e) {
            if (e.key === "Enter" && !(btn && btn.disabled)) {
                doLogin();
            }
        }

        var userId = UX.byId("login_user_id");
        var pw = UX.byId("login_user_pw");
        if (userId) userId.onkeydown = handleEnter;
        if (pw) pw.onkeydown = handleEnter;

        returnUrl = resolveReturnUrl();
        restoreCountdown();
    }

    global.Page = global.Page || {};
    global.Page.login = { init: init };

    try { init(); } catch (e) {}
})(window);
