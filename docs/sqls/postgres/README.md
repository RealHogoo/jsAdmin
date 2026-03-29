# PostgreSQL SQL Guide

PostgreSQL baseline, migration, and sample SQL files for `admin-service`.

Files:

- `apply_all.sql`
- `reset_all.sql`
- `baseline/V000__baseline.sql`
- `migrations/V001__user_security.sql`
- `migrations/V002__login_access.sql`
- `migrations/V003__refresh_token.sql`
- `migrations/V004__timeline.sql`
- `migrations/V005__api_policy.sql`
- `sample/dummy_login_history_300.sql`

Recommended order:

1. Run `reset_all.sql` only when you need a clean rebuild.
2. Run `apply_all.sql` to create the full schema.
3. Run `sample/dummy_login_history_300.sql` if you need test data for login history screens.

Example:

```bash
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/apply_all.sql
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/sample/dummy_login_history_300.sql
```
