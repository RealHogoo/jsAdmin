package com.realhogoo.jsadmin.api;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import javax.servlet.http.HttpServletRequest;

@RestControllerAdvice
public class GlobalExceptionHandler {
    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);


    private String traceId(HttpServletRequest req) {
        Object v = req.getAttribute("trace_id");
        return v != null ? String.valueOf(v) : TraceId.newId();
    }
    
    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApi(ApiException e, HttpServletRequest req) {
        String tid = traceId(req);
        log.error("[SERVER_ERROR] traceId={}, uri={}", tid, req.getRequestURI(), e);
        ApiResponse<Object> body = ApiResponse.fail(e.getCode(), e.getMessage(), tid);
        return ResponseEntity.status(e.getStatus()).body(body);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleAny(Exception e, HttpServletRequest req) {
        String tid = traceId(req);
        log.error("[SERVER_ERROR] traceId={}, uri={}", tid, req.getRequestURI(), e);
        ApiResponse<Object> body = ApiResponse.fail(ApiCode.SERVER_ERROR, "unexpected error", tid);
        return ResponseEntity.status(500).body(body);
    }
}
