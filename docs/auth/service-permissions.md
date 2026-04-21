# Service Permissions

This document describes the service-level permission model added for cross-service authorization.

## Scope

- Service: `schedule-service`
- Permission codes:
  - `DASHBOARD_ACCESS`
  - `WRITE`
  - `DELETE`

## Resolution Order

1. Group service permissions from `adm_auth_service_perm`
2. User-level exceptions from `adm_auth_user_service_perm`
3. The resolved permission map is returned by `/auth/me.json` as `service_permissions`

## Schedule Service Enforcement

- `DASHBOARD_ACCESS`
  - `/dashboard.html`
  - `/dashboard/summary.json`
  - `/dashboard/detail.json`
- `WRITE`
  - `/project/save.json`
  - `/task/save.json`
  - `/node/save.json`
  - `/node/move.json`
  - `/task-type/metric/save.json`
- `DELETE`
  - `/node/delete.json`

## Seed Data

For fresh environments, `docs/sqls/postgres/baseline/V000__baseline.sql` already includes the service permission tables and seeds the three `schedule-service` permissions.
