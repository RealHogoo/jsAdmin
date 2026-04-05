-- Run with psql.
-- Example:
-- psql -h localhost -U postgres -d admin -f docs/sqls/postgres/apply_all.sql

\i ./baseline/V000__baseline.sql
\i ./migrations/V001__user_security.sql
\i ./migrations/V002__login_access.sql
\i ./migrations/V003__refresh_token.sql
\i ./migrations/V004__timeline.sql
\i ./migrations/V005__api_policy.sql
\i ./migrations/V006__user_options_api_policy.sql
