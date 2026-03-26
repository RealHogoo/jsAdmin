package com.realhogoo.jsadmin.common.interceptor;

import org.apache.ibatis.executor.resultset.ResultSetHandler;
import org.apache.ibatis.plugin.*;

import java.sql.Statement;
import java.util.*;

@Intercepts({
    @Signature(type = ResultSetHandler.class, method = "handleResultSets", args = { Statement.class })
})
public class LowercaseMapKeyInterceptor implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        Object result = invocation.proceed();
        return normalize(result);
    }

    @SuppressWarnings("unchecked")
    private Object normalize(Object obj) {
        if (obj == null) return null;

        if (obj instanceof List) {
            List<?> list = (List<?>) obj;
            List<Object> out = new ArrayList<>(list.size());
            for (Object e : list) out.add(normalize(e));
            return out;
        }

        if (obj instanceof Map) {
            Map<Object, Object> map = (Map<Object, Object>) obj;
            Map<Object, Object> out = new LinkedHashMap<>();
            for (Map.Entry<Object, Object> e : map.entrySet()) {
                Object k = e.getKey();
                Object v = e.getValue();

                Object nk = k;
                if (k instanceof String) {
                    nk = ((String) k).toLowerCase(Locale.ROOT);
                }
                out.put(nk, normalize(v));
            }
            return out;
        }

        return obj;
    }

    @Override
    public Object plugin(Object target) {
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {
        // no-op
    }
}
