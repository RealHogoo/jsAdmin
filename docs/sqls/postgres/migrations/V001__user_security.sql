ALTER TABLE IF EXISTS adm_user_mst
    ADD COLUMN IF NOT EXISTS login_fail_cnt numeric(5,0) NOT NULL DEFAULT 0;

ALTER TABLE IF EXISTS adm_user_mst
    ADD COLUMN IF NOT EXISTS lock_until_at timestamp(6);

ALTER TABLE IF EXISTS adm_user_mst
    ADD COLUMN IF NOT EXISTS lock_yn char(1) NOT NULL DEFAULT 'N';

ALTER TABLE IF EXISTS adm_user_mst
    ADD COLUMN IF NOT EXISTS last_login_at timestamp(6);

ALTER TABLE IF EXISTS adm_user_mst
    ADD COLUMN IF NOT EXISTS pwd_reset_yn char(1) NOT NULL DEFAULT 'N';

CREATE SEQUENCE IF NOT EXISTS adm_user_mst_seq
    START WITH 1
    INCREMENT BY 1;
