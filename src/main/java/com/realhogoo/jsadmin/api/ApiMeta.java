package com.realhogoo.jsadmin.api;

public class ApiMeta {
    private long ts;
    private String traceId;

    public static ApiMeta now(String traceId) {
        ApiMeta m = new ApiMeta();
        m.ts = System.currentTimeMillis();
        m.traceId = traceId;
        return m;
    }

    public long getTs() { return ts; }
    public String getTraceId() { return traceId; }
}
