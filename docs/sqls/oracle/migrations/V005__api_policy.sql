DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(1) INTO v_cnt
      FROM USER_TABLES
     WHERE TABLE_NAME = 'ADM_API_MST';

    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE TABLE ADM_API_MST (
                API_SEQ         NUMBER(19,0)      NOT NULL,
                API_TYPE        VARCHAR2(20)      NOT NULL,
                API_NM          VARCHAR2(200)     NOT NULL,
                CALLER_ID       VARCHAR2(100)     NOT NULL,
                TARGET_SERVICE  VARCHAR2(100)     NOT NULL,
                HTTP_METHOD     VARCHAR2(10)      NOT NULL,
                API_PATTERN     VARCHAR2(500)     NOT NULL,
                AUTH_TYPE       VARCHAR2(30)      NOT NULL,
                API_DESC        VARCHAR2(1000),
                USE_YN          CHAR(1) DEFAULT ''Y'' NOT NULL,
                CREATED_AT      TIMESTAMP(6) DEFAULT SYSTIMESTAMP NOT NULL,
                CREATED_BY      VARCHAR2(100)     NOT NULL,
                UPDATED_AT      TIMESTAMP(6),
                UPDATED_BY      VARCHAR2(100),
                CONSTRAINT PK_ADM_API_MST PRIMARY KEY (API_SEQ),
                CONSTRAINT CK_ADM_API_MST_TYPE CHECK (API_TYPE IN (''EXTERNAL'', ''INTERNAL'')),
                CONSTRAINT CK_ADM_API_MST_USE_YN CHECK (USE_YN IN (''Y'', ''N''))
            )';
    END IF;
END;
/

DECLARE
    v_cnt NUMBER;
BEGIN
    SELECT COUNT(1) INTO v_cnt
      FROM USER_SEQUENCES
     WHERE SEQUENCE_NAME = 'ADM_API_MST_SEQ';

    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE SEQUENCE ADM_API_MST_SEQ
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
    SELECT COUNT(1) INTO v_cnt
      FROM USER_INDEXES
     WHERE INDEX_NAME = 'IDX_ADM_API_MST_01';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE INDEX IDX_ADM_API_MST_01
                ON ADM_API_MST (API_TYPE, USE_YN, API_SEQ DESC)';
    END IF;

    SELECT COUNT(1) INTO v_cnt
      FROM USER_INDEXES
     WHERE INDEX_NAME = 'IDX_ADM_API_MST_02';
    IF v_cnt = 0 THEN
        EXECUTE IMMEDIATE '
            CREATE INDEX IDX_ADM_API_MST_02
                ON ADM_API_MST (CALLER_ID, TARGET_SERVICE, HTTP_METHOD)';
    END IF;
END;
/
