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

    public static <T> ApiResponse<T> ok(T data, HttpServletRequest req) {
        return ok(data, TraceId.resolve(req));
    }

    public static <T> ApiResponse<T> fail(ApiCode code, String message, String traceId) {
        return fail(code.name(), message == null ? code.defaultMessage() : message, null, traceId);
    }

    public static <T> ApiResponse<T> fail(ApiCode code, String message, HttpServletRequest req) {
        return fail(code, message, TraceId.resolve(req));
    }

    public static <T> ApiResponse<T> fail(String code, String message, T data, String traceId) {
        ApiResponse<T> r = new ApiResponse<>();
        r.ok = false;
        r.code = code;
        r.message = message;
        r.data = data;
        r.meta = ApiMeta.now(traceId);
        return r;
    }

    public static <T> ApiResponse<T> fail(String code, String message, T data, HttpServletRequest req) {
        return fail(code, message, data, TraceId.resolve(req));
    }

    public boolean isOk() { return ok; }
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public ApiMeta getMeta() { return meta; }
}
