(function (global) {
    "use strict";

    var symbols = [
        "home", "dashboard", "menu", "apps", "widgets", "grid_view", "table_rows",
        "person", "group", "badge", "manage_accounts", "supervisor_account", "admin_panel_settings",
        "settings", "tune", "build", "construction", "rule_settings",
        "lock", "lock_open", "vpn_key", "verified_user", "security", "shield",
        "search", "filter_alt", "sort", "visibility", "preview", "zoom_in",
        "folder", "folder_open", "description", "draft", "article", "library_books", "book", "note", "sticky_note_2",
        "mail", "mark_email_read", "inbox", "forward_to_inbox", "send", "outbox",
        "campaign", "notifications", "announcement", "flag", "info", "help", "feedback",
        "timeline", "history", "schedule", "event", "calendar_month", "update",
        "bar_chart", "monitoring", "insert_chart", "analytics", "query_stats", "pie_chart",
        "code", "terminal", "data_object", "dns", "storage", "database", "schema",
        "computer", "desktop_windows", "devices", "router", "lan", "hub",
        "login", "logout", "key", "password", "fingerprint", "policy",
        "heart_plus", "monitor_heart", "health_and_safety", "emergency",
        "image", "photo", "palette", "brush", "format_shapes",
        "upload_file", "download", "publish", "sync", "autorenew", "refresh",
        "check_circle", "error", "warning", "report", "task_alt", "done_all",
        "edit", "edit_note", "add", "add_circle", "delete", "content_copy",
        "map", "place", "travel_explore", "public", "language", "explore",
        "star", "bookmark", "favorite", "label", "sell", "tag",
        "receipt_long", "request_quote", "payments", "account_balance", "credit_card",
        "support_agent", "contact_support", "headset_mic", "forum", "chat",
        "newspaper", "new_releases", "bolt", "rocket_launch", "insights"
    ];

    var catalog = [{ value: "", symbol: "" }].concat(symbols.map(function (symbol) {
        return {
            value: "ico-" + symbol.replace(/_/g, "-"),
            symbol: symbol,
            code: symbol
        };
    }));

    function normalize(value) {
        return String(value == null ? "" : value).trim().toLowerCase();
    }

    function find(value) {
        var key = normalize(value);
        for (var i = 0; i < catalog.length; i++) {
            if (catalog[i].value === key) return catalog[i];
        }
        return null;
    }

    function escapeHtml(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function render(value, extraClass) {
        var meta = find(value);
        if (!meta || !meta.value || !meta.symbol) return "";
        var cls = "menu-tree-icon material-symbols-outlined" + (extraClass ? " " + extraClass : "");
        return "<span class='" + cls + "' aria-hidden='true'>" + escapeHtml(meta.symbol) + "</span>";
    }

    global.MenuIconCatalog = {
        list: function () { return catalog.slice(); },
        find: find,
        render: render,
        escapeHtml: escapeHtml
    };
})(window);
