(function (global) {
    "use strict";

    var UX = global.UX;
    var returnUrl = null;
    var adminServicePublicBaseUrl = normalizeBaseUrl(global.ADMIN_SERVICE_PUBLIC_BASE_URL || "");

    var countdownTimer = null;
    var retryUntilMs = 0;
    var MSG_READY = "\uB2E4\uC2DC \uB85C\uADF8\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4.";
    var MSG_RETRY_SUFFIX = "\uCD08 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    var MSG_REQUIRED = "\uC544\uC774\uB514\uC640 \uBE44\uBC00\uBC88\uD638\uB97C \uC785\uB825\uD558\uC138\uC694.";
    var MSG_FAIL = "\uB85C\uADF8\uC778\uC5D0 \uC2E4\uD328\uD588\uC2B5\uB2C8\uB2E4.";
    var MSG_SUCCESS = "\uB85C\uADF8\uC778\uB418\uC5C8\uC2B5\uB2C8\uB2E4.";
    var MSG_SERVER_ERROR = "\uC11C\uBC84 \uC624\uB958\uAC00 \uBC1C\uC0DD\uD588\uC2B5\uB2C8\uB2E4. \uC7A0\uC2DC \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    var MSG_CRYPTO_ERROR = "\uB85C\uADF8\uC778 \uC554\uD638\uD654\uB97C \uC900\uBE44\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4. \uC0C8\uB85C\uACE0\uCE68 \uD6C4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    var loginKeyCache = null;

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

    function postJson(path, body) {
        return fetch((global.CTX || "") + path, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(body || {})
        }).then(function (response) {
            return response.json();
        });
    }

    function fetchLoginKey() {
        if (loginKeyCache) {
            return Promise.resolve(loginKeyCache);
        }
        return postJson("/auth/login-key.json", {}).then(function (res) {
            if (!res || res.ok !== true || !res.data || !res.data.public_key || !res.data.key_id) {
                throw new Error("login key is unavailable");
            }
            loginKeyCache = res.data;
            return loginKeyCache;
        });
    }

    function encryptLoginPayload(userId, userPw) {
        if (!global.crypto || !global.crypto.subtle || typeof TextEncoder === "undefined") {
            return Promise.reject(new Error("web crypto is unavailable"));
        }
        return fetchLoginKey().then(function (keyInfo) {
            return global.crypto.subtle.importKey(
                "spki",
                base64ToArrayBuffer(keyInfo.public_key),
                { name: "RSA-OAEP", hash: "SHA-256" },
                false,
                ["encrypt"]
            ).then(function (publicKey) {
                var payload = JSON.stringify({ user_id: userId, user_pw: userPw });
                return global.crypto.subtle.encrypt(
                    { name: "RSA-OAEP" },
                    publicKey,
                    new TextEncoder().encode(payload)
                );
            }).then(function (cipherBuffer) {
                return {
                    login_key_id: keyInfo.key_id,
                    login_payload_enc: arrayBufferToBase64(cipherBuffer)
                };
            });
        });
    }

    function base64ToArrayBuffer(value) {
        var binary = global.atob(String(value || ""));
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes.buffer;
    }

    function arrayBufferToBase64(buffer) {
        var bytes = new Uint8Array(buffer);
        var chunkSize = 8192;
        var binary = "";
        for (var i = 0; i < bytes.length; i += chunkSize) {
            binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
        }
        return global.btoa(binary);
    }

    function normalizeBaseUrl(value) {
        var normalized = (value || "").trim();
        while (normalized.length > 1 && normalized.charAt(normalized.length - 1) === "/") {
            normalized = normalized.substring(0, normalized.length - 1);
        }
        return normalized;
    }

    function resolveDefaultTarget() {
        return adminServicePublicBaseUrl ? normalizeRedirectUrl(adminServicePublicBaseUrl + "/") : ((global.CTX || "") + "/");
    }

    function isAllowedAbsoluteReturnUrl(value) {
        try {
            var parsed = new URL(value, global.location.origin);
            if (!/^https?:$/i.test(parsed.protocol)) {
                return false;
            }
            if (parsed.username || parsed.password) {
                return false;
            }
            return isAllowedReturnHost(parsed.hostname);
        } catch (e) {
            return false;
        }
    }

    function isAllowedReturnHost(hostname) {
        var host = normalizeHostname(hostname);
        if (!host) return false;

        var currentHost = normalizeHostname(global.location.hostname);
        if (host === currentHost) return true;

        var adminHost = configuredAdminHost();
        if (adminHost && host === adminHost) return true;

        if (isLocalHost(host) || isLocalHost(currentHost)) {
            return host === currentHost;
        }

        var currentBase = siteBaseDomain(currentHost);
        return !!currentBase && siteBaseDomain(host) === currentBase;
    }

    function configuredAdminHost() {
        if (!adminServicePublicBaseUrl) return "";
        try {
            return normalizeHostname(new URL(adminServicePublicBaseUrl, global.location.origin).hostname);
        } catch (e) {
            return "";
        }
    }

    function normalizeHostname(hostname) {
        return String(hostname || "").trim().toLowerCase().replace(/^\[|\]$/g, "");
    }

    function isLocalHost(hostname) {
        var host = normalizeHostname(hostname);
        return host === "localhost" || host === "127.0.0.1" || host === "::1";
    }

    function siteBaseDomain(hostname) {
        var host = normalizeHostname(hostname);
        if (!host || isLocalHost(host) || /^\d+\.\d+\.\d+\.\d+$/.test(host)) return "";
        var parts = host.split(".").filter(Boolean);
        if (parts.length < 3) return host;
        return parts.slice(parts.length - 3).join(".");
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
                if (!isAllowedAbsoluteReturnUrl(parsed.toString())) {
                    return null;
                }
                return normalizeRedirectUrl(parsed.toString());
            }
            if (decoded.indexOf("//") === 0 || decoded.charAt(0) === "\\") {
                return null;
            }
            if (decoded.charAt(0) === "/") {
                return decoded;
            }
            return null;
        } catch (e) {
            return null;
        }
    }

    function normalizeRedirectUrl(value) {
        if (!value || global.location.protocol !== "https:") {
            return value;
        }
        try {
            var parsed = new URL(value, global.location.origin);
            if (parsed.protocol === "http:" && isPublicHost(parsed.hostname)) {
                parsed.protocol = "https:";
                if (parsed.port === "80") {
                    parsed.port = "";
                }
                return parsed.toString();
            }
        } catch (e) {
            return value;
        }
        return value;
    }

    function isPublicHost(hostname) {
        var host = (hostname || "").toLowerCase();
        if (!host || host === "localhost" || host === "127.0.0.1" || host === "::1") return false;
        if (/^10\./.test(host) || /^192\.168\./.test(host)) return false;
        if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return false;
        return true;
    }

    function doLogin() {
        var userId = UX.normalizeText(UX.byId("login_user_id") && UX.byId("login_user_id").value);
        var userPw = (UX.byId("login_user_pw") && UX.byId("login_user_pw").value) || "";

        if (!userId || !userPw) {
            setMsg(MSG_REQUIRED, "error");
            return;
        }

        encryptLoginPayload(userId, userPw)
            .then(postLogin)
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
                } else {
                    location.href = resolveDefaultTarget();
                }
            })
            .catch(function (e) {
                clearAuthStorage();
                setDisabled(false);
                setMsg(e && /crypto|key|encrypt/i.test(e.message || "") ? MSG_CRYPTO_ERROR : MSG_SERVER_ERROR, "error");
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
