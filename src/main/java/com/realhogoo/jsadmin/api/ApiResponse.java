package com.realhogoo.jsadmin.api;

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

    public boolean isOk() { return ok; }
    public String getCode() { return code; }
    public String getMessage() { return message; }
    public T getData() { return data; }
    public ApiMeta getMeta() { return meta; }
}
