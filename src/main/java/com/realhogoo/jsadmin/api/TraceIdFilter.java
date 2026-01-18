package com.realhogoo.jsadmin.api;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;

import org.apache.logging.log4j.ThreadContext;

import java.io.IOException;

public class TraceIdFilter implements Filter {

    @Override
    public void init(FilterConfig filterConfig) throws ServletException {
        // no-op
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
        throws IOException, ServletException {
    	String traceId = TraceId.newId();
        if (request instanceof HttpServletRequest) {
            request.setAttribute("trace_id", traceId);
            // ★ 추가: MDC
            ThreadContext.put("traceId", traceId);
        }
        chain.doFilter(request, response);
    }

    @Override
    public void destroy() {
        // no-op
    }
}
