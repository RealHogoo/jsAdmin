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
    CONSTRAINT ck_adm_login_hist_result CHECK (result_cd IN ('SUCCESS', 'FAIL', 'LOGOUT', 'MYPAGE_UPDATE', 'MYPAGE_PASSWORD_CHANGE', 'QR_LOGIN_SUCCESS')),
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

CREATE TABLE adm_qr_login_req (
    qr_login_seq       BIGINT PRIMARY KEY,
    request_id         VARCHAR(64) NOT NULL UNIQUE,
    request_token_hash VARCHAR(64) NOT NULL UNIQUE,
    status_cd          VARCHAR(20) NOT NULL,
    approved_user_seq  BIGINT,
    approved_login_id  VARCHAR(100),
    approved_user_nm   VARCHAR(100),
    approved_session_id VARCHAR(64),
    mobile_session_id  VARCHAR(64),
    client_ip          VARCHAR(45),
    user_agent         VARCHAR(500),
    expires_at         TIMESTAMP(6) NOT NULL,
    approved_at        TIMESTAMP(6),
    consumed_at        TIMESTAMP(6),
    created_at         TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by         VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at         TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by         VARCHAR(100),
    CONSTRAINT ck_adm_qr_login_req_01 CHECK (status_cd IN ('WAITING', 'APPROVED', 'CONSUMED', 'EXPIRED', 'CANCELLED'))
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

CREATE TABLE adm_service_mst (
    service_seq      BIGINT PRIMARY KEY,
    service_cd       VARCHAR(100) NOT NULL UNIQUE,
    service_nm       VARCHAR(200) NOT NULL,
    base_url         VARCHAR(500) NOT NULL,
    status_path      VARCHAR(300) NOT NULL DEFAULT '/health/status.json',
    live_path        VARCHAR(300) NOT NULL DEFAULT '/health/live.json',
    ready_path       VARCHAR(300) NOT NULL DEFAULT '/health/ready.json',
    timeout_ms       INTEGER NOT NULL DEFAULT 3000,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    sort_ord         INTEGER NOT NULL DEFAULT 0,
    remark           VARCHAR(1000),
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT ck_adm_service_mst_use_yn CHECK (use_yn IN ('Y', 'N'))
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
CREATE SEQUENCE adm_qr_login_req_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_api_mst_seq START 1 INCREMENT 1;
CREATE SEQUENCE adm_service_mst_seq START 1 INCREMENT 1;

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
CREATE INDEX idx_adm_qr_login_req_01 ON adm_qr_login_req (request_id, status_cd, expires_at);
CREATE INDEX idx_adm_qr_login_req_02 ON adm_qr_login_req (request_token_hash, status_cd, expires_at);
CREATE INDEX idx_adm_api_mst_01 ON adm_api_mst (api_type, use_yn, api_seq DESC);
CREATE INDEX idx_adm_api_mst_02 ON adm_api_mst (caller_id, target_service, http_method);
CREATE INDEX idx_adm_service_mst_01 ON adm_service_mst (use_yn, sort_ord, service_seq);

INSERT INTO adm_user_mst (
    user_seq, login_id, user_nm, pwd_hash, dept_seq, use_yn, login_fail_cnt,
    lock_yn, pwd_reset_yn, created_by, updated_by
) VALUES (
    1, 'ADMIN', 'ADMIN USER', '1111', NULL, 'Y', 0,
    'N', 'N', 'SYSTEM', 'SYSTEM'
);

INSERT INTO adm_auth_group (
    auth_group_seq, auth_group_cd, auth_group_nm, auth_group_desc, use_yn, created_by, updated_by
) VALUES (
    1, 'ADMIN', 'Administrators', 'Default admin group', 'Y', 'SYSTEM', 'SYSTEM'
);

INSERT INTO adm_auth_group_user (
    auth_group_seq, user_seq, use_yn, created_by, updated_by
) VALUES (
    1, 1, 'Y', 'SYSTEM', 'SYSTEM'
);

INSERT INTO adm_menu_mst (
    menu_seq, up_menu_seq, menu_nm, menu_url, menu_type_cd, icon_class,
    sort_ord, use_yn, created_by, updated_by
) VALUES
    (1, NULL, '대시보드', '/home.do', 'PAGE', 'dashboard', 1, 'Y', 'SYSTEM', 'SYSTEM'),
    (2, NULL, '시스템', NULL, 'GROUP', 'settings', 2, 'Y', 'SYSTEM', 'SYSTEM'),
    (3, 2, '권한 관리', '/auth/main.do', 'PAGE', 'shield_person', 1, 'Y', 'SYSTEM', 'SYSTEM'),
    (4, 2, '메뉴 관리', '/menu/main.do', 'PAGE', 'menu', 2, 'Y', 'SYSTEM', 'SYSTEM'),
    (5, 2, '헬스 체크', '/health/main.do', 'PAGE', 'monitor_heart', 3, 'Y', 'SYSTEM', 'SYSTEM');

INSERT INTO adm_auth_menu (
    auth_group_seq, menu_seq, perm_lvl, use_yn, created_by, updated_by
) VALUES
    (1, 1, 9, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 2, 9, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 3, 9, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 4, 9, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 5, 9, 'Y', 'SYSTEM', 'SYSTEM');

INSERT INTO adm_service_mst (
    service_seq, service_cd, service_nm, base_url, status_path, live_path, ready_path,
    timeout_ms, use_yn, sort_ord, remark, created_by, updated_by
) VALUES
    (1, 'admin-service', 'Admin Service', 'http://localhost:8081', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 'Y', 1, 'Common auth and admin portal', 'SYSTEM', 'SYSTEM'),
    (2, 'schedule-service', 'Schedule Service', 'http://localhost:8082', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 'Y', 2, 'Project and task scheduling service', 'SYSTEM', 'SYSTEM'),
    (3, 'webhard-service', 'Webhard Service', 'http://localhost:8083', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 'Y', 3, 'Webhard file and folder management service', 'SYSTEM', 'SYSTEM'),
    (4, 'media-service', 'Media Service', 'http://localhost:8084', '/api/health/', '/api/health/', '/api/health/', 3000, 'Y', 4, 'Reference media gallery service', 'SYSTEM', 'SYSTEM');

CREATE TABLE adm_service_perm_def (
    service_perm_seq BIGINT PRIMARY KEY,
    service_seq      BIGINT NOT NULL,
    perm_cd          VARCHAR(100) NOT NULL,
    perm_nm          VARCHAR(200) NOT NULL,
    perm_desc        VARCHAR(1000),
    sort_ord         INTEGER NOT NULL DEFAULT 0,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    CONSTRAINT uk_adm_service_perm_def_01 UNIQUE (service_seq, perm_cd),
    CONSTRAINT ck_adm_service_perm_def_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_service_perm_def_service FOREIGN KEY (service_seq) REFERENCES adm_service_mst (service_seq)
);

CREATE TABLE adm_auth_service_perm (
    auth_group_seq   BIGINT NOT NULL,
    service_perm_seq BIGINT NOT NULL,
    use_yn           CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    PRIMARY KEY (auth_group_seq, service_perm_seq),
    CONSTRAINT ck_adm_auth_service_perm_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_auth_service_perm_grp FOREIGN KEY (auth_group_seq) REFERENCES adm_auth_group (auth_group_seq),
    CONSTRAINT fk_adm_auth_service_perm_def FOREIGN KEY (service_perm_seq) REFERENCES adm_service_perm_def (service_perm_seq)
);

CREATE TABLE adm_auth_user_service_perm (
    user_seq         BIGINT NOT NULL,
    service_perm_seq BIGINT NOT NULL,
    access_yn        CHAR(1) NOT NULL DEFAULT 'Y',
    created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by       VARCHAR(100) NOT NULL,
    updated_at       TIMESTAMP,
    updated_by       VARCHAR(100),
    PRIMARY KEY (user_seq, service_perm_seq),
    CONSTRAINT ck_adm_auth_user_service_perm_access_yn CHECK (access_yn IN ('Y', 'X')),
    CONSTRAINT fk_adm_auth_user_service_perm_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq),
    CONSTRAINT fk_adm_auth_user_service_perm_def FOREIGN KEY (service_perm_seq) REFERENCES adm_service_perm_def (service_perm_seq)
);

CREATE SEQUENCE adm_service_perm_def_seq START 1 INCREMENT 1;

CREATE INDEX idx_adm_service_perm_def_01 ON adm_service_perm_def (service_seq, use_yn, sort_ord, service_perm_seq);
CREATE INDEX idx_adm_auth_service_perm_01 ON adm_auth_service_perm (service_perm_seq, use_yn);
CREATE INDEX idx_adm_auth_user_service_perm_01 ON adm_auth_user_service_perm (service_perm_seq, access_yn);

INSERT INTO adm_api_mst (
    api_seq, api_type, api_nm, caller_id, target_service, http_method,
    api_pattern, auth_type, api_desc, use_yn, created_by, updated_by
) VALUES (
    1, 'INTERNAL', 'Schedule PM User Options', 'schedule-service', 'admin-service', 'POST',
    '/user/options.json', 'JWT', 'schedule-service PM selection user lookup API', 'Y', 'SYSTEM', 'SYSTEM'
);

INSERT INTO adm_service_perm_def (
    service_perm_seq, service_seq, perm_cd, perm_nm, perm_desc, sort_ord, use_yn, created_by, updated_by
) VALUES
    (1, 2, 'DELETE', 'Delete Access', 'Allows delete actions in schedule service', 3, 'Y', 'SYSTEM', 'SYSTEM'),
    (2, 2, 'WRITE', 'Write Access', 'Allows create and update actions in schedule service', 2, 'Y', 'SYSTEM', 'SYSTEM'),
    (3, 2, 'DASHBOARD_ACCESS', 'Dashboard Access', 'Allows access to schedule dashboard views', 1, 'Y', 'SYSTEM', 'SYSTEM'),
    (4, 3, 'READ', 'Read Access', 'Allows read actions in webhard service', 1, 'Y', 'SYSTEM', 'SYSTEM'),
    (5, 3, 'WRITE', 'Write Access', 'Allows create and update actions in webhard service', 2, 'Y', 'SYSTEM', 'SYSTEM'),
    (6, 3, 'DELETE', 'Delete Access', 'Allows delete actions in webhard service', 3, 'Y', 'SYSTEM', 'SYSTEM'),
    (7, 3, 'SHARE', 'Share Access', 'Allows share link actions in webhard service', 4, 'Y', 'SYSTEM', 'SYSTEM'),
    (8, 4, 'READ', 'Read Access', 'Allows read actions in media service', 1, 'Y', 'SYSTEM', 'SYSTEM'),
    (9, 4, 'WRITE', 'Write Access', 'Allows media sync, import, and edit actions', 2, 'Y', 'SYSTEM', 'SYSTEM'),
    (10, 4, 'DELETE', 'Delete Access', 'Allows delete actions in media service', 3, 'Y', 'SYSTEM', 'SYSTEM');

INSERT INTO adm_auth_service_perm (
    auth_group_seq, service_perm_seq, use_yn, created_by, updated_by
) VALUES
    (1, 1, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 2, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 3, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 4, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 5, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 6, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 7, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 8, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 9, 'Y', 'SYSTEM', 'SYSTEM'),
    (1, 10, 'Y', 'SYSTEM', 'SYSTEM');

SELECT setval('adm_service_mst_seq', GREATEST(COALESCE((SELECT MAX(service_seq) FROM adm_service_mst), 0), 1), true);
SELECT setval('adm_service_perm_def_seq', GREATEST(COALESCE((SELECT MAX(service_perm_seq) FROM adm_service_perm_def), 0), 1), true);
