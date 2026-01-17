package com.realhogoo.jsadmin.api;

import javax.servlet.http.HttpServletRequest;

public class ApiResponse<T> {

    private boolean ok;
    private String code;
    private String message;
    private T data;
    private ApiMeta meta;

    public static <T> ApiResponse<T> ok(T data, String traceId) {
        ApiResponse<T> r = new ApiResponse<>();
        r.ok = true;
        r.code = ApiCode.OK.name();
        r.message = "success";
        r.data = data;
        r.meta = ApiMeta.now(traceId);
        return r;
    }

    public static <T> ApiResponse<T> fail(ApiCode code, String message, String traceId) {
        ApiResponse<T> r = new ApiResponse<>();
        r.ok = false;
        r.code = code.name();
        r.message = message == null ? code.defaultMessage() : message;
        r.data = null;
        r.meta = ApiMeta.now(traceId);
        return r;
    }
    
    private String getTraceId(HttpServletRequest req) {
        Object v = req.getAttribute("traceId");
        if (v == null) v = req.getAttribute("TRACE_ID");
        if (v == null) v = req.getHeader("X-Trace-Id");
        if (v == null) v = req.getHeader("X-Request-Id");
        return v != null ? String.valueOf(v) : java.util.UUID.randomUUID().toString();
    }

    public boolean isOk() { return ok; }
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public ApiMeta getMeta() { return meta; }
}
