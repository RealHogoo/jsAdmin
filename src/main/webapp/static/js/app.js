(function () {
    "use strict";

    /* =========================
     * 공통 유틸
     * - "DB/백/프론트 동일 함수명" 목적이면 ux.js에서 window.UX 및 Object.assign(window, UX)로 전역 제공
     * - 여기서는 window.UX가 있으면 일부 정규화에 활용
     * ========================= */

    function hasUX() {
        return typeof window.UX === "object" && window.UX !== null;
    }

    // Oracle-like: "" -> null (프론트에서도 파라미터 정규화 일관성 유지)
    function NORM(v) {
        if (v === undefined || v === null) return null;

        if (typeof v === "string") {
            if (hasUX() && typeof window.UX.TRIM === "function") {
                // TRIM 결과가 null일 수 있음(ux.js는 빈 문자열을 null 처리)
                return window.UX.TRIM(v);
            }
            var t = v.trim();
            return t.length === 0 ? null : t;
        }
        return v;
    }

    function toFormBody(data) {
        var params = new URLSearchParams();
        if (!data) return params.toString();

        Object.keys(data).forEach(function (k) {
            var v = data[k];

            // 폼 전송 일관성: undefined는 제외, null은 제외(서버에서 null은 "파라미터 없음"으로 취급)
            if (v === undefined) return;

            v = NORM(v);
            if (v === null) return;

            params.append(k, String(v));
        });

        return params.toString();
    }

    async function postText(url, data) {
        var res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"
            },
            body: toFormBody(data),
            credentials: "same-origin"
        });

        var text = await res.text();

        if (!res.ok) {
            throw new Error("HTTP " + res.status + "\n" + text);
        }

        return text;
    }

    async function postJson(url, data) {
        var res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "Accept": "application/json"
            },
            body: toFormBody(data),
            credentials: "same-origin"
        });

        var text = await res.text();

        if (!res.ok) {
            throw new Error("HTTP " + res.status + "\n" + text);
        }

        // 서버가 빈 문자열 응답할 수도 있으니 방어
        if (!text || text.trim().length === 0) return null;

        return JSON.parse(text);
    }

    function isDo(url) {
        return typeof url === "string" && url.toLowerCase().endsWith(".do");
    }

    function isJson(url) {
        return typeof url === "string" && url.toLowerCase().endsWith(".json");
    }

    function renderHtml(html) {
        var el = document.getElementById("app");
        if (!el) throw new Error("#app not found");
        el.innerHTML = html;
    }

    /* =========================
     * jsAdmin SPA 공개 API
     * - 규칙: *.do, *.json 둘 다 POST 고정
     * ========================= */

    async function load(url, data) {
        if (!isDo(url)) {
            throw new Error("load(url): url must end with .do (got: " + url + ")");
        }
        var html = await postText(url, data);
        renderHtml(html);
    }

	async function call(url, data) {
	    if (!isJson(url)) {
	        throw new Error("call(url): url must end with .json (got: " + url + ")");
	    }
	
	    var res = await fetch(url, {
	        method: "POST",
	        headers: {
	            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
	            "Accept": "application/json"
	        },
	        body: toFormBody(data),
	        credentials: "same-origin"
	    });
	
	    var text = await res.text();
	    var body = text && text.trim().length > 0 ? JSON.parse(text) : null;
	
	    if (res.status === 401) {
	        // 인증 필요: 로그인 조각 로딩 규칙이 있으면 여기서 통일
	        if (window.jsAdminSpa && typeof window.jsAdminSpa.load === "function") {
	            await window.jsAdminSpa.load("/login.do");
	        }
	        throw new Error("AUTH_REQUIRED");
	    }
	
	    if (!res.ok) {
	        throw new Error("HTTP " + res.status + "\n" + text);
	    }
	
	    // 표준 envelope 해석
	    if (!body || typeof body.ok !== "boolean") {
	        throw new Error("INVALID_API_RESPONSE");
	    }
	
	    if (!body.ok) {
	        var msg = (body.code || "ERROR") + ": " + (body.message || "failed");
	        throw new Error(msg);
	    }
	
	    return body.data;
	}


    /* =========================
     * 화면 이벤트 바인딩
     * - <a data-spa="/home.do"> 형태로 화면 전환
     * - (확장 가능) form[data-json="/xxx.json"] 자동 처리
     * ========================= */

    document.addEventListener("click", function (e) {
        var a = e.target.closest("a[data-spa]");
        if (!a) return;

        e.preventDefault();

        var url = a.getAttribute("data-spa");
        if (!url) return;

        load(url);
    });

    document.addEventListener("submit", async function (e) {
        var form = e.target.closest("form[data-json]");
        if (!form) return;

        e.preventDefault();

        var url = form.getAttribute("data-json");
        if (!url) return;

        var fd = new FormData(form);
        var data = {};
        fd.forEach(function (value, key) {
            data[key] = value;
        });

        try {
            var result = await call(url, data);

            // 기본 후처리 훅(필요하면 form에 data-onsuccess="..." 같은 식으로 확장 가능)
            console.log("JSON result:", result);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });

    // 전역 공개
    window.jsAdminSpa = {
        // 화면 조각 로드 (*.do)
        load: load,
        // JSON 호출 (*.json)
        call: call,
        // 내부 유틸도 노출(원하면 사용)
        NORM: NORM
    };
})();
