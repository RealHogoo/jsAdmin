CREATE TABLE IF NOT EXISTS adm_api_mst (
    api_seq bigint PRIMARY KEY,
    api_type varchar(20) NOT NULL,
    api_nm varchar(200) NOT NULL,
    caller_id varchar(100) NOT NULL,
    target_service varchar(100) NOT NULL,
    http_method varchar(10) NOT NULL,
    api_pattern varchar(500) NOT NULL,
    auth_type varchar(30) NOT NULL,
    api_desc varchar(1000),
    use_yn char(1) NOT NULL DEFAULT 'Y',
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(100) NOT NULL,
    updated_at timestamp(6),
    updated_by varchar(100),
    CONSTRAINT ck_adm_api_mst_type CHECK (api_type IN ('EXTERNAL', 'INTERNAL')),
    CONSTRAINT ck_adm_api_mst_use_yn CHECK (use_yn IN ('Y', 'N'))
);

CREATE SEQUENCE IF NOT EXISTS adm_api_mst_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS idx_adm_api_mst_01
    ON adm_api_mst (api_type, use_yn, api_seq DESC);

CREATE INDEX IF NOT EXISTS idx_adm_api_mst_02
    ON adm_api_mst (caller_id, target_service, http_method);
