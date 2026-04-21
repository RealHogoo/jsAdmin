package com.realhogoo.jsadmin.auth;

import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

public final class ServicePermissionSupport {
    public static final String SCHEDULE_SERVICE = "schedule-service";
    public static final String DASHBOARD_ACCESS = "DASHBOARD_ACCESS";
    public static final String WRITE = "WRITE";
    public static final String DELETE = "DELETE";

    private ServicePermissionSupport() {
    }

    public static Map<String, List<String>> toPermissionMap(List<Map<String, Object>> rows) {
        if (rows == null || rows.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<String, Set<String>> grouped = new LinkedHashMap<String, Set<String>>();
        for (Map<String, Object> row : rows) {
            if (row == null) {
                continue;
            }
            String serviceCode = normalizeCode(row.get("service_cd"));
            String permissionCode = normalizeCode(row.get("perm_cd"));
            if (serviceCode == null || permissionCode == null) {
                continue;
            }
            Set<String> permissions = grouped.get(serviceCode);
            if (permissions == null) {
                permissions = new LinkedHashSet<String>();
                grouped.put(serviceCode, permissions);
            }
            permissions.add(permissionCode);
        }

        Map<String, List<String>> result = new LinkedHashMap<String, List<String>>();
        for (Map.Entry<String, Set<String>> entry : grouped.entrySet()) {
            result.put(entry.getKey(), new ArrayList<String>(entry.getValue()));
        }
        return result;
    }

    public static String normalizeCode(Object value) {
        if (value == null) {
            return null;
        }
        String text = String.valueOf(value).trim();
        if (text.isEmpty()) {
            return null;
        }
        return text.replace('-', '_').replace(' ', '_').toUpperCase(Locale.ROOT);
    }
}
