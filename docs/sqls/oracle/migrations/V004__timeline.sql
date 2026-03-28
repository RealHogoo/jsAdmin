DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(1)
      INTO v_cnt
      FROM USER_TABLES
     WHERE TABLE_NAME = 'ADM_TIMELINE_MST';

    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE TABLE ADM_TIMELINE_MST (
                TIMELINE_SEQ      NUMBER(19,0)      NOT NULL,
                TIMELINE_TYPE_CD  VARCHAR2(30),
                TITLE             VARCHAR2(300)     NOT NULL,
                CONTENT           CLOB,
                EVENT_DT          DATE              NOT NULL,
                USE_YN            CHAR(1) DEFAULT ''Y'' NOT NULL,
                CREATED_AT        TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
                CREATED_BY        VARCHAR2(100)     NOT NULL,
                UPDATED_AT        TIMESTAMP(6),
                UPDATED_BY        VARCHAR2(100),
                CONSTRAINT PK_ADM_TIMELINE_MST PRIMARY KEY (TIMELINE_SEQ),
                CONSTRAINT CK_ADM_TIMELINE_MST_USE_YN CHECK (USE_YN IN (''Y'', ''N''))
            )';
    END IF;
END;
/

DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(1)
      INTO v_cnt
      FROM USER_SEQUENCES
     WHERE SEQUENCE_NAME = 'ADM_TIMELINE_MST_SEQ';

    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE SEQUENCE ADM_TIMELINE_MST_SEQ
            START WITH 1
            INCREMENT BY 1
            NOCACHE
            NOCYCLE';
    END IF;
END;
/

DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(1)
      INTO v_cnt
      FROM USER_INDEXES
     WHERE INDEX_NAME = 'IDX_ADM_TIMELINE_MST_01';

    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE INDEX IDX_ADM_TIMELINE_MST_01
                ON ADM_TIMELINE_MST (EVENT_DT DESC, TIMELINE_SEQ DESC)';
    END IF;
END;
/
