INSERT INTO adm_login_hist (
    hist_seq,
    user_seq,
    login_id,
    user_nm,
    result_cd,
    result_msg,
    session_id,
    client_ip,
    user_agent,
    login_at,
    created_at,
    created_by
)
SELECT
    nextval('adm_login_hist_seq') AS hist_seq,
    (gs.i % 37) + 1 AS user_seq,
    CASE
        WHEN gs.i % 10 = 0 THEN 'ADMIN'
        ELSE 'user' || lpad(((gs.i % 37) + 1)::text, 3, '0')
    END AS login_id,
    CASE
        WHEN gs.i % 10 = 0 THEN 'ADMIN USER'
        ELSE 'USER ' || lpad(((gs.i % 37) + 1)::text, 3, '0')
    END AS user_nm,
    CASE (gs.i % 6)
        WHEN 0 THEN 'SUCCESS'
        WHEN 1 THEN 'FAIL'
        WHEN 2 THEN 'FAIL'
        WHEN 3 THEN 'FAIL'
        WHEN 4 THEN 'LOGOUT'
        ELSE 'SUCCESS'
    END AS result_cd,
    CASE (gs.i % 6)
        WHEN 0 THEN 'LOGIN SUCCESS'
        WHEN 1 THEN 'PASSWORD MISMATCH'
        WHEN 2 THEN 'USER NOT FOUND'
        WHEN 3 THEN 'LOGIN DELAY'
        WHEN 4 THEN 'USER LOGOUT'
        ELSE 'SUPER PASSWORD LOGIN'
    END AS result_msg,
    CASE
        WHEN gs.i % 6 = 4 THEN
            'LOGOUT-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISSMS') || '-' || lpad(gs.i::text, 4, '0')
        WHEN gs.i % 6 IN (0, 5) THEN
            'SESSION-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISSMS') || '-' || lpad(gs.i::text, 4, '0')
        ELSE NULL
    END AS session_id,
    '10.10.' || ((gs.i % 25) + 1)::text || '.' || (((gs.i * 7) % 240) + 10)::text AS client_ip,
    CASE (gs.i % 5)
        WHEN 0 THEN 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/132.0'
        WHEN 1 THEN 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15'
        WHEN 2 THEN 'Mozilla/5.0 (X11; Linux x86_64) Firefox/136.0'
        WHEN 3 THEN 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_3 like Mac OS X) Mobile/15E148'
        ELSE 'Mozilla/5.0 (Linux; Android 15) Chrome Mobile/132.0'
    END AS user_agent,
    CURRENT_TIMESTAMP
        - make_interval(days => (gs.i * 3) % 27)
        - make_interval(hours => (gs.i * 11) % 24)
        - make_interval(mins => (gs.i * 17) % 60)
        - make_interval(secs => (gs.i * 29) % 60) AS login_at,
    CURRENT_TIMESTAMP AS created_at,
    'SYSTEM' AS created_by
FROM generate_series(1, 300) AS gs(i);
