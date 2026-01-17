(function () {
    "use strict";

    function init() {
        // 예: 버튼/이벤트 바인딩
        // document.getElementById("btnRefresh").addEventListener("click", refresh);
        refresh();
    }

    async function refresh() {
        // 예: health status json 호출(당신 프로젝트에 맞는 URL로)
        // JSON 호출은 app.js의 call()을 쓰거나, 여기서 fetch를 직접 써도 됨
        // 여기서는 postText 예시만 든 것
        var html = await window.jsAdminSpa.http.postText("/health/status.do", {});
        // health.jsp가 HTML 조각을 받아 렌더링하는 구조라면 여기서 dom 반영
    }

    // pageLoaded 이벤트 기반으로 health 화면에서만 init
    document.addEventListener("jsadmin:pageLoaded", function (e) {
        var url = e.detail && e.detail.url;
        if (url === "/dashboard/health.do" || url === "/health.do") {
            init();
        }
    });

})();
