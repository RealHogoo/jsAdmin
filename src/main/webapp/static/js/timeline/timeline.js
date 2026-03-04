(function () {
    "use strict";

    function load(src) {
        var s = document.createElement("script");
        s.src = src;
        s.async = false;
        document.body.appendChild(s);
    }

    var base = (window.CTX || "") + "/static/js/timeline/";
    if (document.querySelector("#timelineHomePage")) {
        load(base + "timeline-home.js");
        return;
    }
    if (document.querySelector("#timelinePage")) {
        load(base + "timeline-main.js");
    }
})();
