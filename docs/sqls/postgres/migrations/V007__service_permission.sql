CREATE TABLE IF NOT EXISTS adm_service_perm_def (
    service_perm_seq bigint PRIMARY KEY,
    service_seq bigint NOT NULL,
    perm_cd varchar(100) NOT NULL,
    perm_nm varchar(200) NOT NULL,
    perm_desc varchar(1000),
    sort_ord integer NOT NULL DEFAULT 0,
    use_yn char(1) NOT NULL DEFAULT 'Y',
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(100) NOT NULL,
    updated_at timestamp(6),
    updated_by varchar(100),
    CONSTRAINT uk_adm_service_perm_def_01 UNIQUE (service_seq, perm_cd),
    CONSTRAINT ck_adm_service_perm_def_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_service_perm_def_service FOREIGN KEY (service_seq) REFERENCES adm_service_mst (service_seq)
);

CREATE TABLE IF NOT EXISTS adm_auth_service_perm (
    auth_group_seq bigint NOT NULL,
    service_perm_seq bigint NOT NULL,
    use_yn char(1) NOT NULL DEFAULT 'Y',
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(100) NOT NULL,
    updated_at timestamp(6),
    updated_by varchar(100),
    PRIMARY KEY (auth_group_seq, service_perm_seq),
    CONSTRAINT ck_adm_auth_service_perm_use_yn CHECK (use_yn IN ('Y', 'N')),
    CONSTRAINT fk_adm_auth_service_perm_grp FOREIGN KEY (auth_group_seq) REFERENCES adm_auth_group (auth_group_seq),
    CONSTRAINT fk_adm_auth_service_perm_def FOREIGN KEY (service_perm_seq) REFERENCES adm_service_perm_def (service_perm_seq)
);

CREATE TABLE IF NOT EXISTS adm_auth_user_service_perm (
    user_seq bigint NOT NULL,
    service_perm_seq bigint NOT NULL,
    access_yn char(1) NOT NULL DEFAULT 'Y',
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(100) NOT NULL,
    updated_at timestamp(6),
    updated_by varchar(100),
    PRIMARY KEY (user_seq, service_perm_seq),
    CONSTRAINT ck_adm_auth_user_service_perm_access_yn CHECK (access_yn IN ('Y', 'X')),
    CONSTRAINT fk_adm_auth_user_service_perm_usr FOREIGN KEY (user_seq) REFERENCES adm_user_mst (user_seq),
    CONSTRAINT fk_adm_auth_user_service_perm_def FOREIGN KEY (service_perm_seq) REFERENCES adm_service_perm_def (service_perm_seq)
);

CREATE SEQUENCE IF NOT EXISTS adm_service_perm_def_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS idx_adm_service_perm_def_01
    ON adm_service_perm_def (service_seq, use_yn, sort_ord, service_perm_seq);

CREATE INDEX IF NOT EXISTS idx_adm_auth_service_perm_01
    ON adm_auth_service_perm (service_perm_seq, use_yn);

CREATE INDEX IF NOT EXISTS idx_adm_auth_user_service_perm_01
    ON adm_auth_user_service_perm (service_perm_seq, access_yn);

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
