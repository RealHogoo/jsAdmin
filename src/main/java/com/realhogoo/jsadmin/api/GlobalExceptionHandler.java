package com.realhogoo.jsadmin.api;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private String traceId(HttpServletRequest req) {
        Object v = req.getAttribute("trace_id");
        return v != null ? String.valueOf(v) : TraceId.newId();
    }

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApi(ApiException e, HttpServletRequest req) {
        String tid = traceId(req);
        ApiResponse<Object> body = ApiResponse.fail(e.getCode(), e.getMessage(), tid);
        return ResponseEntity.status(e.getStatus()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAny(Exception e, HttpServletRequest req) {
        String tid = traceId(req);
        ApiResponse<Object> body = ApiResponse.fail(ApiCode.SERVER_ERROR, "unexpected error", tid);
        return ResponseEntity.status(500).body(body);
    }
}
