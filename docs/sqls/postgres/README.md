# PostgreSQL SQL Guide

This directory contains the current PostgreSQL deployment scripts for `admin-service`.

## Main Files

- `apply_all.sql`
- `reset_all.sql`
- `baseline/V000__baseline.sql`
- `sample/dummy_login_history_300.sql`

## Current Policy

- Fresh environments run `apply_all.sql`.
- `apply_all.sql` now executes only `baseline/V000__baseline.sql`.
- `migrations/` remains as historical incremental SQL only.

## Apply Order

1. Run `reset_all.sql` only when a full reset is required.
2. Run `apply_all.sql` for full schema and seed setup.
3. Run `sample/dummy_login_history_300.sql` only when sample history data is needed.

## Example

```bash
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/apply_all.sql
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/sample/dummy_login_history_300.sql
```
