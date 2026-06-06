-- Run with psql.
-- Example:
-- psql -h localhost -U postgres -d admin -f docs/sqls/postgres/apply_all.sql

\i ./baseline/V000__baseline.sql
\i ./migrations/V008__default_service_seed.sql
\i ./migrations/V009__webhard_media_service_seed.sql
