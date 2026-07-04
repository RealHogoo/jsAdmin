CREATE TABLE IF NOT EXISTS adm_qr_login_req (
    qr_login_seq bigint PRIMARY KEY,
    request_id varchar(64) NOT NULL UNIQUE,
    request_token_hash varchar(64) NOT NULL UNIQUE,
    status_cd varchar(20) NOT NULL,
    approved_user_seq bigint,
    approved_login_id varchar(100),
    approved_user_nm varchar(100),
    approved_session_id varchar(64),
    mobile_session_id varchar(64),
    client_ip varchar(45),
    user_agent varchar(500),
    expires_at timestamp(6) NOT NULL,
    approved_at timestamp(6),
    consumed_at timestamp(6),
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by varchar(100),
    CONSTRAINT ck_adm_qr_login_req_01 CHECK (status_cd IN ('WAITING', 'APPROVED', 'CONSUMED', 'EXPIRED', 'CANCELLED'))
);

CREATE SEQUENCE IF NOT EXISTS adm_qr_login_req_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS idx_adm_qr_login_req_01
    ON adm_qr_login_req (request_id, status_cd, expires_at);

CREATE INDEX IF NOT EXISTS idx_adm_qr_login_req_02
    ON adm_qr_login_req (request_token_hash, status_cd, expires_at);

ALTER TABLE adm_login_hist DROP CONSTRAINT IF EXISTS ck_adm_login_hist_result;

ALTER TABLE adm_login_hist
    ADD CONSTRAINT ck_adm_login_hist_result
    CHECK (result_cd IN ('SUCCESS', 'FAIL', 'LOGOUT', 'MYPAGE_UPDATE', 'MYPAGE_PASSWORD_CHANGE', 'QR_LOGIN_SUCCESS'));
