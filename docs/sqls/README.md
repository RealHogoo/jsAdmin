# SQL Deployment Guide

## Structure

```text
docs/sqls/
|- oracle/
|  |- baseline/
|  `- migrations/
`- postgres/
   |- baseline/
   `- migrations/
```

## Current Rule

- PostgreSQL is the current deployment target.
- Fresh setup uses `baseline/V000__baseline.sql` as the single initial script.
- `migrations/` is retained only as historical change reference.

## PostgreSQL

- Initial schema and seed data: `postgres/baseline/V000__baseline.sql`
- Full apply entrypoint: `postgres/apply_all.sql`
- Reset helper: `postgres/reset_all.sql`

`V000__baseline.sql` now includes:

- users, menus, groups, menu permissions
- codes, notices, timeline
- login history, session, refresh token
- API policy
- service registry
- service permission definitions and mappings

## Oracle

- Oracle files are kept only for legacy reference.
- New deployment work should use PostgreSQL scripts.
