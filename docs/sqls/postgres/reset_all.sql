-- Run with psql.
-- Drops admin-service PostgreSQL objects in dependency-safe order.

DROP TABLE IF EXISTS adm_auth_user CASCADE;
DROP TABLE IF EXISTS adm_auth_menu CASCADE;
DROP TABLE IF EXISTS adm_auth_group_user CASCADE;
DROP TABLE IF EXISTS adm_auth_group_dept CASCADE;
DROP TABLE IF EXISTS adm_refresh_token CASCADE;
DROP TABLE IF EXISTS adm_login_hist CASCADE;
DROP TABLE IF EXISTS adm_login_sesn CASCADE;
DROP TABLE IF EXISTS adm_api_mst CASCADE;
DROP TABLE IF EXISTS adm_timeline_mst CASCADE;
DROP TABLE IF EXISTS adm_noti_mst CASCADE;
DROP TABLE IF EXISTS adm_code_mst CASCADE;
DROP TABLE IF EXISTS adm_menu_mst CASCADE;
DROP TABLE IF EXISTS adm_auth_group CASCADE;
DROP TABLE IF EXISTS adm_user_mst CASCADE;

DROP SEQUENCE IF EXISTS adm_user_mst_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_auth_group_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_menu_mst_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_code_mst_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_noti_mst_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_timeline_mst_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_login_sesn_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_login_hist_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_refresh_token_seq CASCADE;
DROP SEQUENCE IF EXISTS adm_api_mst_seq CASCADE;
