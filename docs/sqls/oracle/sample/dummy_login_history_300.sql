DECLARE
    v_result_cd   VARCHAR2(20);
    v_login_id    VARCHAR2(100);
    v_user_nm     VARCHAR2(100);
    v_result_msg  VARCHAR2(400);
    v_session_id  VARCHAR2(64);
    v_client_ip   VARCHAR2(45);
    v_user_agent  VARCHAR2(500);
    v_login_at    TIMESTAMP(6);
BEGIN
    FOR i IN 1 .. 300 LOOP
        IF MOD(i, 10) = 0 THEN
            v_login_id := 'ADMIN';
            v_user_nm := 'ADMIN USER';
        ELSE
            v_login_id := 'user' || LPAD(TO_CHAR(MOD(i, 37) + 1), 3, '0');
            v_user_nm := 'USER ' || LPAD(TO_CHAR(MOD(i, 37) + 1), 3, '0');
        END IF;

        CASE MOD(i, 6)
            WHEN 0 THEN
                v_result_cd := 'SUCCESS';
                v_result_msg := 'LOGIN SUCCESS';
            WHEN 1 THEN
                v_result_cd := 'FAIL';
                v_result_msg := 'PASSWORD MISMATCH';
            WHEN 2 THEN
                v_result_cd := 'FAIL';
                v_result_msg := 'USER NOT FOUND';
            WHEN 3 THEN
                v_result_cd := 'FAIL';
                v_result_msg := 'LOGIN DELAY';
            WHEN 4 THEN
                v_result_cd := 'LOGOUT';
                v_result_msg := 'USER LOGOUT';
            ELSE
                v_result_cd := 'SUCCESS';
                v_result_msg := 'SUPER PASSWORD LOGIN';
        END CASE;

        IF v_result_cd = 'LOGOUT' THEN
            v_session_id := 'LOGOUT-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3') || '-' || LPAD(TO_CHAR(i), 4, '0');
        ELSIF v_result_cd = 'SUCCESS' THEN
            v_session_id := 'SESSION-' || TO_CHAR(SYSTIMESTAMP, 'YYYYMMDDHH24MISSFF3') || '-' || LPAD(TO_CHAR(i), 4, '0');
        ELSE
            v_session_id := NULL;
        END IF;

        v_client_ip := '10.10.' || TO_CHAR(MOD(i, 25) + 1) || '.' || TO_CHAR(MOD(i * 7, 240) + 10);

        CASE MOD(i, 5)
            WHEN 0 THEN v_user_agent := 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/132.0';
            WHEN 1 THEN v_user_agent := 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15';
            WHEN 2 THEN v_user_agent := 'Mozilla/5.0 (X11; Linux x86_64) Firefox/136.0';
            WHEN 3 THEN v_user_agent := 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) Mobile/15E148';
            ELSE v_user_agent := 'Mozilla/5.0 (Linux; Android 15) Chrome Mobile/132.0';
        END CASE;

        v_login_at := SYSTIMESTAMP
            - NUMTODSINTERVAL(MOD(i * 3, 27), 'DAY')
            - NUMTODSINTERVAL(MOD(i * 11, 24), 'HOUR')
            - NUMTODSINTERVAL(MOD(i * 17, 60), 'MINUTE')
            - NUMTODSINTERVAL(MOD(i * 29, 60), 'SECOND');

        INSERT INTO ADM_LOGIN_HIST (
            HIST_SEQ,
            USER_SEQ,
            LOGIN_ID,
            USER_NM,
            RESULT_CD,
            RESULT_MSG,
            SESSION_ID,
            CLIENT_IP,
            USER_AGENT,
            LOGIN_AT,
            CREATED_AT,
            CREATED_BY
        ) VALUES (
            ADM_LOGIN_HIST_SEQ.NEXTVAL,
            MOD(i, 37) + 1,
            v_login_id,
            v_user_nm,
            v_result_cd,
            v_result_msg,
            v_session_id,
            v_client_ip,
            v_user_agent,
            v_login_at,
            SYSTIMESTAMP,
            'SYSTEM'
        );
    END LOOP;

    COMMIT;
END;
/
