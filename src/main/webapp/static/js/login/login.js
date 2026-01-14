(function (global) {
    "use strict";

    function ctx() {
        return global.CTX || "";
    }

    function byId(id) {
        return document.getElementById(id);
    }

    // *.json 규칙: POST 고정 + JSON 응답 표준(ok/message/data)
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
            // JSON 아닐 수도 있으니 안전 처리(406/500에서 HTML 오는 경우 대비)
            var ct = (r.headers && r.headers.get("content-type")) || "";
            if (ct.indexOf("application/json") >= 0) {
                return r.json();
            }
            return r.text().then(function (t) {
                throw new Error("HTTP " + r.status + " (non-json): " + t);
            });
        });
    }

    function setMsg(text, ok) {
        var m = byId("loginMsg");
        if (!m) return;
        m.textContent = text || "";
        m.style.color = ok ? "#0a0" : "#c00";
    }

    function doLogin() {
        var idEl = byId("login_user_id");
        var pwEl = byId("login_user_pw");

        var userId = (idEl && idEl.value ? idEl.value : "").trim();
        var userPw = (pwEl && pwEl.value ? pwEl.value : "");

        if (!userId || !userPw) {
            setMsg("아이디/비밀번호를 입력하세요.", false);
            return;
        }

        postJson("/login.json", { user_id: userId, user_pw: userPw })
            .then(function (res) {
                if (!res || res.ok !== true) {
                    setMsg((res && res.message) ? res.message : "로그인 실패", false);
                    return;
                }

                // 토큰 저장 (프로젝트 표준키로 통일)
                try {
                    localStorage.setItem("JWT", res.data && res.data.token ? res.data.token : "");
                    localStorage.setItem("LOGIN_USER", JSON.stringify((res.data && res.data.user) ? res.data.user : {}));
                } catch (e) {}

                setMsg("로그인 성공", true);

                // 화면 이동은 *.do 규칙 (POST 고정은 load()가 처리)
                if (typeof global.load === "function") {
                    global.load("/main.do");
                }
            })
            .catch(function (e) {
                setMsg(String(e && e.message ? e.message : e), false);
            });
    }

    // doInit()에서 호출할 엔트리
    function init() {
        var btn = byId("btnLogin");
        if (!btn) return; // login.jsp가 아닌 경우

        // 중복 바인딩 방지
        if (btn.getAttribute("data-bound") === "Y") return;
        btn.setAttribute("data-bound", "Y");

        btn.onclick = doLogin;

        var pw = byId("login_user_pw");
        if (pw) {
            pw.onkeydown = function (e) {
                e = e || window.event;
                if (e.key === "Enter") doLogin();
            };
        }
    }

    // 전역 등록: doInit()에서 Page.login.init() 호출
    global.Page = global.Page || {};
    global.Page.login = { init: init };

    // (선택) 스크립트가 먼저 로드되고 DOM이 나중일 수 있어, 즉시 1회 시도
    // 조각 로딩 방식이면 doInit이 주 호출이지만, 안전망으로 둠.
    try { init(); } catch (e) {}

})(window);
