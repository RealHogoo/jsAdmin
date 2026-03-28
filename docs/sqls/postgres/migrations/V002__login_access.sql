CREATE TABLE IF NOT EXISTS adm_login_sesn (
    sesn_seq       bigint        PRIMARY KEY,
    session_id     varchar(64)   NOT NULL UNIQUE,
    user_seq       bigint,
    login_id       varchar(100)  NOT NULL,
    user_nm        varchar(100),
    status_cd      varchar(20)   NOT NULL,
    client_ip      varchar(45),
    user_agent     varchar(500),
    login_at       timestamp(6)  NOT NULL,
    last_access_at timestamp(6),
    expires_at     timestamp(6),
    logout_at      timestamp(6),
    created_at     timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by     varchar(100)  NOT NULL,
    updated_at     timestamp(6),
    updated_by     varchar(100),
    CONSTRAINT ck_adm_login_sesn_01 CHECK (status_cd IN ('ACTIVE', 'EXPIRED', 'REVOKED'))
);

CREATE TABLE IF NOT EXISTS adm_login_hist (
    hist_seq       bigint        PRIMARY KEY,
    user_seq       bigint,
    login_id       varchar(100),
    user_nm        varchar(100),
    result_cd      varchar(30)   NOT NULL,
    result_msg     varchar(400),
    session_id     varchar(64),
    client_ip      varchar(45),
    user_agent     varchar(500),
    login_at       timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at     timestamp(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by     varchar(100)
);

CREATE SEQUENCE IF NOT EXISTS adm_login_sesn_seq START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE IF NOT EXISTS adm_login_hist_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS idx_adm_login_sesn_01
    ON adm_login_sesn (login_id, status_cd, login_at DESC);

CREATE INDEX IF NOT EXISTS idx_adm_login_hist_01
    ON adm_login_hist (login_id, login_at DESC);

ALTER TABLE IF EXISTS adm_login_hist
    DROP CONSTRAINT IF EXISTS ck_adm_login_hist_01;

ALTER TABLE IF EXISTS adm_login_hist
    ADD CONSTRAINT ck_adm_login_hist_01
    CHECK (result_cd IN ('SUCCESS', 'FAIL', 'LOGOUT', 'MYPAGE_UPDATE', 'MYPAGE_PASSWORD_CHANGE'));
