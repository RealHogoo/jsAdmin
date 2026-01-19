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
	    // 실수 방지: main.do는 SPA 조각 대상이 아니므로 home.do로 치환
	    if (url === "/main.do" || url === "main.do") {
	        url = "/home.do";
	    }
	    
        if (!isDo(url)) {
            throw new Error("load(url): url must end with .do (got: " + url + ")");
        }
        var html = await postText(url, data);
        renderHtml(html);
		await executeScripts(document.getElementById("app"));
		// 화면 로드 완료 이벤트(화면별 JS/헤더가 여기서 반응)
		document.dispatchEvent(new CustomEvent("jsadmin:pageLoaded", {
		    detail: { url: url }
		}));
    }

	async function call(url, data) {
	    if (!isJson(url)) {
	        throw new Error("call(url): url must end with .json (got: " + url + ")");
	    }
		var headers = {
		    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
		    "Accept": "application/json"
		};

		var token = localStorage.getItem("JWT");
		if (token) {
		    headers["Authorization"] = "Bearer " + token;
		}
	    var res = await fetch(url, {
		    method: "POST",
		    headers: headers,
		    body: toFormBody(data),
		    credentials: "same-origin"
		});
	
	    var text = await res.text();
	    var body = text && text.trim().length > 0 ? JSON.parse(text) : null;
	
		if (res.status === 401) {
		    try { localStorage.removeItem("JWT"); } catch (e) {}
		    try { localStorage.removeItem("LOGIN_USER"); } catch (e) {}
		
		    // auth 변경 이벤트(헤더/화면별 JS가 반응)
		    document.dispatchEvent(new CustomEvent("jsadmin:authChanged"));
		    
		    // 이미 리다이렉트 중이면 추가 처리 금지(무한루프 방지)
		    if (window.__JSADMIN_AUTH_REDIRECTING) return null;
		    
			// 현재 화면이 로그인 조각이면 다시 login.do 로드하지 않기
		    var app = document.getElementById("app");
		    var isLoginFragment = app && app.querySelector("#loginForm, form[data-page='login']");
		
		    if (!isLoginFragment) {
		        window.__JSADMIN_AUTH_REDIRECTING = true;
		        try {
		            await load("/login.do");
		        } finally {
		            // login.do 로드 완료 후 플래그 해제
		            window.__JSADMIN_AUTH_REDIRECTING = false;
		        }
		    }
		
		    return null;
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
			if (result === null) return;
            // 기본 후처리 훅(필요하면 form에 data-onsuccess="..." 같은 식으로 확장 가능)
            console.log("JSON result:", result);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    });
    
	async function executeScripts(rootEl) {
	    const scripts = Array.from(rootEl.querySelectorAll("script"));
	
	    for (const oldScript of scripts) {
	        const newScript = document.createElement("script");
	        if (oldScript.type) newScript.type = oldScript.type;
	
	        if (oldScript.src) {
	            newScript.src = oldScript.src;
	            newScript.async = false;
	
	            const p = new Promise((resolve) => {
	                newScript.onload = resolve;
	                newScript.onerror = resolve;
	            });
	
	            oldScript.parentNode.removeChild(oldScript);
	            rootEl.appendChild(newScript);
	
	            await p; // ★ src 로딩 완료 대기
	        } else {
	            newScript.text = oldScript.textContent;
	            oldScript.parentNode.removeChild(oldScript);
	            rootEl.appendChild(newScript);
	        }
	    }
	}
	window.__JSADMIN_AUTH_REDIRECTING = window.__JSADMIN_AUTH_REDIRECTING || false;
	
	// 전역 공개(기존 객체 재사용)
	window.jsAdminSpa = window.jsAdminSpa || {};
	window.jsAdminSpa.load = load;   // 화면 조각 로드 (*.do)
	window.jsAdminSpa.call = call;   // JSON 호출 (*.json)
	window.jsAdminSpa.NORM = NORM;   // 내부 유틸
	
	// 공통 http 유틸(필요한 것만 노출)
	window.jsAdminSpa.http = window.jsAdminSpa.http || {};
	window.jsAdminSpa.http.postText = postText;
})();

