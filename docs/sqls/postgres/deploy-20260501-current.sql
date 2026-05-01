-- admin-service production delta for the current release.
-- Safe to run multiple times on PostgreSQL.

CREATE TABLE IF NOT EXISTS adm_auth_group_user (
    auth_group_seq BIGINT NOT NULL,
    user_seq BIGINT NOT NULL,
    use_yn CHAR(1) NOT NULL DEFAULT 'Y',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP(6),
    updated_by VARCHAR(100),
    PRIMARY KEY (auth_group_seq, user_seq),
    CONSTRAINT ck_adm_auth_group_user_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_auth_group_user_grp FOREIGN KEY (auth_group_seq) REFERENCES adm_auth_group (auth_group_seq),
    CONSTRAINT fk_adm_auth_group_user_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq)
);

ALTER TABLE adm_auth_group_user
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE adm_auth_group_user
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';

ALTER TABLE adm_auth_group_user
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(6);

ALTER TABLE adm_auth_group_user
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_adm_auth_group_user_01
    ON adm_auth_group_user (user_seq, use_yn);

CREATE TABLE IF NOT EXISTS adm_service_perm_def (
    service_perm_seq BIGINT PRIMARY KEY,
    service_seq BIGINT NOT NULL,
    perm_cd VARCHAR(100) NOT NULL,
    perm_nm VARCHAR(200) NOT NULL,
    perm_desc VARCHAR(1000),
    sort_ord INTEGER NOT NULL DEFAULT 0,
    use_yn CHAR(1) NOT NULL DEFAULT 'Y',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP(6),
    updated_by VARCHAR(100),
    CONSTRAINT uk_adm_service_perm_def_01 UNIQUE (service_seq, perm_cd),
    CONSTRAINT ck_adm_service_perm_def_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_service_perm_def_service FOREIGN KEY (service_seq) REFERENCES adm_service_mst (service_seq)
);

ALTER TABLE adm_service_perm_def
    ADD COLUMN IF NOT EXISTS perm_desc VARCHAR(1000);

ALTER TABLE adm_service_perm_def
    ADD COLUMN IF NOT EXISTS sort_ord INTEGER NOT NULL DEFAULT 0;

ALTER TABLE adm_service_perm_def
    ADD COLUMN IF NOT EXISTS use_yn CHAR(1) NOT NULL DEFAULT 'Y';

ALTER TABLE adm_service_perm_def
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE adm_service_perm_def
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';

ALTER TABLE adm_service_perm_def
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(6);

ALTER TABLE adm_service_perm_def
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

CREATE TABLE IF NOT EXISTS adm_auth_service_perm (
    auth_group_seq BIGINT NOT NULL,
    service_perm_seq BIGINT NOT NULL,
    use_yn CHAR(1) NOT NULL DEFAULT 'Y',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP(6),
    updated_by VARCHAR(100),
    PRIMARY KEY (auth_group_seq, service_perm_seq),
    CONSTRAINT ck_adm_auth_service_perm_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_auth_service_perm_grp FOREIGN KEY (auth_group_seq) REFERENCES adm_auth_group (auth_group_seq),
    CONSTRAINT fk_adm_auth_service_perm_def FOREIGN KEY (service_perm_seq) REFERENCES adm_service_perm_def (service_perm_seq)
);

ALTER TABLE adm_auth_service_perm
    ADD COLUMN IF NOT EXISTS use_yn CHAR(1) NOT NULL DEFAULT 'Y';

ALTER TABLE adm_auth_service_perm
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE adm_auth_service_perm
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';

ALTER TABLE adm_auth_service_perm
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(6);

ALTER TABLE adm_auth_service_perm
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

CREATE TABLE IF NOT EXISTS adm_auth_user_service_perm (
    user_seq BIGINT NOT NULL,
    service_perm_seq BIGINT NOT NULL,
    access_yn CHAR(1) NOT NULL DEFAULT 'Y',
    created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM',
    updated_at TIMESTAMP(6),
    updated_by VARCHAR(100),
    PRIMARY KEY (user_seq, service_perm_seq),
    CONSTRAINT ck_adm_auth_user_service_perm_access_yn CHECK (access_yn IN ('Y', 'X')),
    CONSTRAINT fk_adm_auth_user_service_perm_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq),
    CONSTRAINT fk_adm_auth_user_service_perm_def FOREIGN KEY (service_perm_seq) REFERENCES adm_service_perm_def (service_perm_seq)
);

ALTER TABLE adm_auth_user_service_perm
    ADD COLUMN IF NOT EXISTS access_yn CHAR(1) NOT NULL DEFAULT 'Y';

ALTER TABLE adm_auth_user_service_perm
    ADD COLUMN IF NOT EXISTS created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE adm_auth_user_service_perm
    ADD COLUMN IF NOT EXISTS created_by VARCHAR(100) NOT NULL DEFAULT 'SYSTEM';

ALTER TABLE adm_auth_user_service_perm
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP(6);

ALTER TABLE adm_auth_user_service_perm
    ADD COLUMN IF NOT EXISTS updated_by VARCHAR(100);

CREATE SEQUENCE IF NOT EXISTS adm_service_perm_def_seq START WITH 1 INCREMENT BY 1;

SELECT setval(
    'adm_service_perm_def_seq',
    GREATEST(
        COALESCE((SELECT MAX(service_perm_seq) FROM adm_service_perm_def), 0),
        1
    ),
    true
);

CREATE INDEX IF NOT EXISTS idx_adm_service_perm_def_01
    ON adm_service_perm_def (service_seq, use_yn, sort_ord, service_perm_seq);

CREATE INDEX IF NOT EXISTS idx_adm_auth_service_perm_01
    ON adm_auth_service_perm (service_perm_seq, use_yn);

CREATE INDEX IF NOT EXISTS idx_adm_auth_user_service_perm_01
    ON adm_auth_user_service_perm (service_perm_seq, access_yn);

INSERT INTO adm_service_mst (
    service_seq, service_cd, service_nm, base_url, status_path, live_path, ready_path,
    timeout_ms, use_yn, sort_ord, remark, created_by, updated_by
)
SELECT COALESCE((SELECT MAX(service_seq) + 1 FROM adm_service_mst), 1),
       'schedule-service', 'Schedule Service', 'http://localhost:8082',
       '/health/status.json', '/health/live.json', '/health/ready.json',
       3000, 'Y', 2, 'Project and task scheduling service', 'SYSTEM', 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM adm_service_mst WHERE service_cd = 'schedule-service'
);

INSERT INTO adm_service_perm_def (
    service_perm_seq, service_seq, perm_cd, perm_nm, perm_desc, sort_ord, use_yn, created_by, updated_by
)
SELECT nextval('adm_service_perm_def_seq'), sm.service_seq, seed.perm_cd, seed.perm_nm, seed.perm_desc, seed.sort_ord, 'Y', 'SYSTEM', 'SYSTEM'
FROM adm_service_mst sm
JOIN (
    VALUES
        ('schedule-service', 'DASHBOARD_ACCESS', 'Dashboard Access', 'Allows access to schedule dashboard views', 1),
        ('schedule-service', 'WRITE', 'Write Access', 'Allows create and update actions in schedule service', 2),
        ('schedule-service', 'DELETE', 'Delete Access', 'Allows delete actions in schedule service', 3)
) AS seed(service_cd, perm_cd, perm_nm, perm_desc, sort_ord)
  ON seed.service_cd = sm.service_cd
WHERE NOT EXISTS (
    SELECT 1
    FROM adm_service_perm_def existing
    WHERE existing.service_seq = sm.service_seq
      AND existing.perm_cd = seed.perm_cd
);

UPDATE adm_menu_mst
   SET menu_nm = '그룹관리',
       menu_url = '/auth/group/main.do',
       up_menu_seq = 5,
       menu_type_cd = 'PAGE',
       icon_class = 'ico-users',
       sort_ord = 110,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
 WHERE menu_seq = 11;

INSERT INTO adm_menu_mst (
    menu_seq, up_menu_seq, menu_nm, menu_url, menu_type_cd, icon_class,
    sort_ord, use_yn, created_at, created_by, updated_at, updated_by
)
SELECT 20, 5, '권한관리', '/auth/main.do', 'PAGE', 'ico-lock',
       115, 'Y', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1 FROM adm_menu_mst WHERE menu_seq = 20
);

UPDATE adm_menu_mst
   SET menu_nm = '권한관리',
       menu_url = '/auth/main.do',
       up_menu_seq = 5,
       menu_type_cd = 'PAGE',
       icon_class = 'ico-lock',
       sort_ord = 115,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
 WHERE menu_seq = 20;

INSERT INTO adm_auth_menu (
    auth_group_seq, menu_seq, perm_lvl, use_yn, created_at, created_by, updated_at, updated_by
)
SELECT ag.auth_group_seq, 20, 10, 'Y', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'
FROM adm_auth_group ag
WHERE ag.auth_group_cd = 'ADMIN'
  AND NOT EXISTS (
      SELECT 1
      FROM adm_auth_menu existing
      WHERE existing.auth_group_seq = ag.auth_group_seq
        AND existing.menu_seq = 20
  );

UPDATE adm_auth_menu am
   SET perm_lvl = 10,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
  FROM adm_auth_group ag
 WHERE am.auth_group_seq = ag.auth_group_seq
   AND ag.auth_group_cd = 'ADMIN'
   AND am.menu_seq = 20;

INSERT INTO adm_auth_service_perm (
    auth_group_seq, service_perm_seq, use_yn, created_by, updated_by
)
SELECT ag.auth_group_seq, spd.service_perm_seq, 'Y', 'SYSTEM', 'SYSTEM'
FROM adm_service_perm_def spd
JOIN adm_service_mst sm
  ON sm.service_seq = spd.service_seq
JOIN adm_auth_group ag
  ON ag.auth_group_cd = 'ADMIN'
WHERE sm.service_cd = 'schedule-service'
  AND NOT EXISTS (
      SELECT 1
      FROM adm_auth_service_perm existing
      WHERE existing.auth_group_seq = ag.auth_group_seq
        AND existing.service_perm_seq = spd.service_perm_seq
  );
