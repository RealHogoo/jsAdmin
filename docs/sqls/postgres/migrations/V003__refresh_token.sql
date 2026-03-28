CREATE TABLE IF NOT EXISTS adm_refresh_token (
    refresh_seq bigint PRIMARY KEY,
    user_seq bigint NOT NULL,
    login_id varchar(100) NOT NULL,
    session_id varchar(64) NOT NULL,
    token_hash varchar(64) NOT NULL,
    expires_at timestamp(6) NOT NULL,
    revoked_yn char(1) NOT NULL DEFAULT 'N',
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(100),
    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by varchar(100)
);

CREATE SEQUENCE IF NOT EXISTS adm_refresh_token_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS adm_refresh_token_ix1
    ON adm_refresh_token (token_hash, revoked_yn, expires_at);

CREATE INDEX IF NOT EXISTS adm_refresh_token_ix2
    ON adm_refresh_token (session_id, revoked_yn);
