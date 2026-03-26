package com.realhogoo.jsadmin.api;

import java.util.UUID;

public class TraceId {
    public static String newId() {
        return UUID.randomUUID().toString().replace("-", "").substring(0, 16);
    }
}
