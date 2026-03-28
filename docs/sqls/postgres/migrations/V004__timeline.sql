CREATE TABLE IF NOT EXISTS adm_timeline_mst (
    timeline_seq bigint PRIMARY KEY,
    timeline_type_cd varchar(30),
    title varchar(300) NOT NULL,
    content text,
    event_dt date NOT NULL,
    use_yn char(1) NOT NULL DEFAULT 'Y',
    created_at timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by varchar(100) NOT NULL,
    updated_at timestamp(6),
    updated_by varchar(100),
    CONSTRAINT ck_adm_timeline_mst_use_yn CHECK (use_yn IN ('Y', 'N'))
);

CREATE SEQUENCE IF NOT EXISTS adm_timeline_mst_seq START WITH 1 INCREMENT BY 1;

CREATE INDEX IF NOT EXISTS idx_adm_timeline_mst_01
    ON adm_timeline_mst (event_dt DESC, timeline_seq DESC);
