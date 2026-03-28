CREATE TABLE adm_user_mst (
    user_seq         BIGINT PRIMARY KEY,
    login_id         VARCHAR(100) NOT NULL UNIQUE,
    user_nm          VARCHAR(100) NOT NULL,
    pwd_hash         VARCHAR(255) NOT NULL,
    dept_seq         BIGINT,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    login_fail_cnt   INTEGER NOT NULL DEFAULT 0,
    lock_yn          CHAR(1) NOT NULL DEFAULT 'N',
    pwd_reset_yn     CHAR(1) NOT NULL DEFAULT 'N',
    lock_until_at    TIMESTAMP,
    last_login_at    TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_user_mst_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT ck_adm_user_mst_lock_yn CHECK (lock_yn IN ('Y', 'N')),
    CONSTRAINT ck_adm_user_mst_pwd_reset CHECK (pwd_reset_yn IN ('Y', 'N'))
);

CREATE TABLE adm_auth_group (
    auth_group_seq   BIGINT PRIMARY KEY,
    auth_group_cd    VARCHAR(100) NOT NULL UNIQUE,
    auth_group_nm    VARCHAR(100) NOT NULL,
    auth_group_desc  VARCHAR(500),
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_auth_group_use_yn CHECK (use_yn IN ('Y', 'N'))
);

CREATE TABLE adm_menu_mst (
    menu_seq         BIGINT PRIMARY KEY,
    up_menu_seq      BIGINT,
    menu_nm          VARCHAR(100) NOT NULL,
    menu_url         VARCHAR(300),
    menu_type_cd     VARCHAR(30),
    icon_class       VARCHAR(100),
    sort_ord         INTEGER NOT NULL DEFAULT 0,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_menu_mst_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_menu_mst_parent FOREIGN KEY (up_menu_seq) REFERENCES adm_menu_mst (menu_seq)
);

CREATE TABLE adm_auth_group_user (
    auth_group_seq   BIGINT NOT NULL,
    user_seq         BIGINT NOT NULL,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    PRIMARY KEY (auth_group_seq, user_seq),
    CONSTRAINT ck_adm_auth_group_user_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_auth_group_user_grp FOREIGN KEY (auth_group_seq) REFERENCES adm_auth_group (auth_group_seq),
    CONSTRAINT fk_adm_auth_group_user_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq)
);

CREATE TABLE adm_auth_group_dept (
    auth_group_seq   BIGINT NOT NULL,
    dept_seq         BIGINT NOT NULL,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    PRIMARY KEY (auth_group_seq, dept_seq),
    CONSTRAINT ck_adm_auth_group_dept_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_auth_group_dept_grp FOREIGN KEY (auth_group_seq) REFERENCES adm_auth_group (auth_group_seq)
);

CREATE TABLE adm_auth_menu (
    auth_group_seq   BIGINT NOT NULL,
    menu_seq         BIGINT NOT NULL,
    perm_lvl         INTEGER NOT NULL DEFAULT 0,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    PRIMARY KEY (auth_group_seq, menu_seq),
    CONSTRAINT ck_adm_auth_menu_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_auth_menu_grp FOREIGN KEY (auth_group_seq) REFERENCES adm_auth_group (auth_group_seq),
    CONSTRAINT fk_adm_auth_menu_menu FOREIGN KEY (menu_seq) REFERENCES adm_menu_mst (menu_seq)
);

CREATE TABLE adm_auth_user (
    user_seq         BIGINT NOT NULL,
    menu_seq         BIGINT NOT NULL,
    access_yn        CHAR(1) NOT NULL DEFAULT 'Y',
    perm_lvl         INTEGER NOT NULL DEFAULT 0,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    PRIMARY KEY (user_seq, menu_seq),
    CONSTRAINT ck_adm_auth_user_access_yn CHECK (access_yn IN ('Y', 'N', 'X')),
    CONSTRAINT fk_adm_auth_user_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq),
    CONSTRAINT fk_adm_auth_user_menu FOREIGN KEY (menu_seq) REFERENCES adm_menu_mst (menu_seq)
);

CREATE TABLE adm_code_mst (
    code_seq         BIGINT PRIMARY KEY,
    code_grp_cd      VARCHAR(100) NOT NULL,
    code_cd          VARCHAR(100) NOT NULL,
    code_nm          VARCHAR(200) NOT NULL,
    code_desc        VARCHAR(1000),
    sort_ord         INTEGER NOT NULL DEFAULT 0,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT uk_adm_code_mst_01 UNIQUE (code_grp_cd, code_cd),
    CONSTRAINT ck_adm_code_mst_use_yn CHECK (use_yn IN ('Y', 'N'))
);

CREATE TABLE adm_noti_mst (
    noti_seq         BIGINT PRIMARY KEY,
    noti_type_cd     VARCHAR(30),
    title            VARCHAR(300) NOT NULL,
    content          TEXT,
    start_dt         DATE,
    end_dt           DATE,
    pin_yn           CHAR(1) NOT NULL DEFAULT 'N',
    popup_yn         CHAR(1) NOT NULL DEFAULT 'N',
    view_cnt         BIGINT NOT NULL DEFAULT 0,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_noti_mst_pin_yn CHECK (pin_yn IN ('Y', 'N')),
    CONSTRAINT ck_adm_noti_mst_popup_yn CHECK (popup_yn IN ('Y', 'N')),
    CONSTRAINT ck_adm_noti_mst_use_yn CHECK (use_yn IN ('Y', 'N'))
);

CREATE TABLE adm_timeline_mst (
    timeline_seq     BIGINT PRIMARY KEY,
    timeline_type_cd VARCHAR(30),
    title            VARCHAR(300) NOT NULL,
    content          TEXT,
    event_dt         DATE NOT NULL,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_timeline_mst_use_yn CHECK (use_yn IN ('Y', 'N'))
);

CREATE TABLE adm_login_sesn (
    sesn_seq         BIGINT PRIMARY KEY,
    session_id       VARCHAR(64) NOT NULL UNIQUE,
    user_seq         BIGINT,
    login_id         VARCHAR(100) NOT NULL,
    user_nm          VARCHAR(100),
    status_cd        VARCHAR(20) NOT NULL,
    client_ip        VARCHAR(45),
    user_agent       VARCHAR(500),
    login_at         TIMESTAMP NOT NULL,
    last_access_at   TIMESTAMP,
    expires_at       TIMESTAMP,
    logout_at        TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_login_sesn_status CHECK (status_cd IN ('ACTIVE', 'EXPIRED', 'REVOKED')),
    CONSTRAINT fk_adm_login_sesn_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq)
);

CREATE TABLE adm_login_hist (
    hist_seq         BIGINT PRIMARY KEY,
    user_seq         BIGINT,
    login_id         VARCHAR(100),
    user_nm          VARCHAR(100),
    result_cd        VARCHAR(30) NOT NULL,
    result_msg       VARCHAR(400),
    session_id       VARCHAR(64),
    client_ip        VARCHAR(45),
    user_agent       VARCHAR(500),
    login_at         TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100),
    CONSTRAINT ck_adm_login_hist_result CHECK (result_cd IN ('SUCCESS', 'FAIL', 'LOGOUT', 'MYPAGE_UPDATE', 'MYPAGE_PASSWORD_CHANGE')),
    CONSTRAINT fk_adm_login_hist_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq)
);

CREATE TABLE adm_refresh_token (
    refresh_seq      BIGINT PRIMARY KEY,
    user_seq         BIGINT NOT NULL,
    login_id         VARCHAR(100) NOT NULL,
    session_id       VARCHAR(64) NOT NULL,
    token_hash       VARCHAR(64) NOT NULL,
    expires_at       TIMESTAMP NOT NULL,
    revoked_yn       CHAR(1) NOT NULL DEFAULT 'N',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100),
    updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_refresh_token_revoke CHECK (revoked_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_refresh_token_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq)
);

CREATE TABLE adm_api_mst (
    api_seq          BIGINT PRIMARY KEY,
    api_type         VARCHAR(20) NOT NULL,
    api_nm           VARCHAR(200) NOT NULL,
    caller_id        VARCHAR(100) NOT NULL,
    target_service   VARCHAR(100) NOT NULL,
    http_method      VARCHAR(10) NOT NULL,
    api_pattern      VARCHAR(500) NOT NULL,
    auth_type        VARCHAR(30) NOT NULL,
    api_desc         VARCHAR(1000),
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_api_mst_type CHECK (api_type IN ('EXTERNAL', 'INTERNAL')),
    CONSTRAINT ck_adm_api_mst_use_yn CHECK (use_yn IN ('Y', 'N'))
);

CREATE SEQUENCE adm_user_mst_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_auth_group_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_menu_mst_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_code_mst_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_noti_mst_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_timeline_mst_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_login_sesn_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_login_hist_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_refresh_token_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_api_mst_seq START 1 INCREMENT 1;

CREATE INDEX idx_adm_menu_mst_01 ON adm_menu_mst (up_menu_seq, sort_ord, menu_seq);
CREATE INDEX idx_adm_auth_group_user_01 ON adm_auth_group_user (user_seq, use_yn);
CREATE INDEX idx_adm_auth_group_dept_01 ON adm_auth_group_dept (dept_seq, use_yn);
CREATE INDEX idx_adm_auth_menu_01 ON adm_auth_menu (menu_seq, use_yn, perm_lvl);
CREATE INDEX idx_adm_auth_user_01 ON adm_auth_user (menu_seq, access_yn);
CREATE INDEX idx_adm_code_mst_01 ON adm_code_mst (code_grp_cd, sort_ord, code_seq);
CREATE INDEX idx_adm_noti_mst_01 ON adm_noti_mst (pin_yn, start_dt DESC, noti_seq DESC);
CREATE INDEX idx_adm_timeline_mst_01 ON adm_timeline_mst (event_dt DESC, timeline_seq DESC);
CREATE INDEX idx_adm_login_sesn_01 ON adm_login_sesn (login_id, status_cd, login_at DESC);
CREATE INDEX idx_adm_login_hist_01 ON adm_login_hist (login_id, login_at DESC);
CREATE INDEX idx_adm_refresh_token_01 ON adm_refresh_token (token_hash, revoked_yn, expires_at);
CREATE INDEX idx_adm_refresh_token_02 ON adm_refresh_token (session_id, revoked_yn);
CREATE INDEX idx_adm_api_mst_01 ON adm_api_mst (api_type, use_yn, api_seq DESC);
CREATE INDEX idx_adm_api_mst_02 ON adm_api_mst (caller_id, target_service, http_method);
