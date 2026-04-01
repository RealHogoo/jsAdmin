package com.realhogoo.jsadmin.api;

import javax.servlet.http.HttpServletRequest;
import java.util.UUID;

public class TraceId {
    public static String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }

    public static String resolve(HttpServletRequest req) {
        if (req == null) {
            return newId();
        }

        Object value = req.getAttribute("trace_id");
        if (value == null) {
            value = req.getHeader("X-Trace-Id");
        }
        if (value == null) {
            value = req.getHeader("X-Request-Id");
        }
        return value != null ? String.valueOf(value) : newId();
    }
}
