-- Default admin/service seed data.
-- Safe to run multiple times on PostgreSQL.
-- Seed IDs are selected from 1..9999 so they stay readable even when runtime sequences start at 10000+.

WITH picked AS (
    SELECT COALESCE(
        (SELECT user_seq FROM adm_user_mst WHERE login_id = 'ADMIN'),
        (
            SELECT candidate_id
            FROM generate_series(1, 9999) AS s(candidate_id)
            WHERE NOT EXISTS (
                SELECT 1 FROM adm_user_mst existing WHERE existing.user_seq = s.candidate_id
            )
            ORDER BY candidate_id
            LIMIT 1
        )
    ) AS user_seq
)
INSERT INTO adm_user_mst (
    user_seq, login_id, user_nm, pwd_hash, dept_seq, use_yn, login_fail_cnt,
    lock_yn, pwd_reset_yn, created_by, updated_by
)
SELECT user_seq, 'ADMIN', '관리자', '1111', NULL, 'Y', 0, 'N', 'N', 'SYSTEM', 'SYSTEM'
FROM picked
WHERE user_seq IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM adm_user_mst WHERE login_id = 'ADMIN');

UPDATE adm_user_mst
   SET user_nm = COALESCE(NULLIF(user_nm, ''), '관리자'),
       use_yn = 'Y',
       lock_yn = 'N',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
 WHERE login_id = 'ADMIN';

WITH picked AS (
    SELECT COALESCE(
        (SELECT auth_group_seq FROM adm_auth_group WHERE auth_group_cd = 'ADMIN'),
        (
            SELECT candidate_id
            FROM generate_series(1, 9999) AS s(candidate_id)
            WHERE NOT EXISTS (
                SELECT 1 FROM adm_auth_group existing WHERE existing.auth_group_seq = s.candidate_id
            )
            ORDER BY candidate_id
            LIMIT 1
        )
    ) AS auth_group_seq
)
INSERT INTO adm_auth_group (
    auth_group_seq, auth_group_cd, auth_group_nm, auth_group_desc, use_yn, created_by, updated_by
)
SELECT auth_group_seq, 'ADMIN', '관리자', '기본 관리자 그룹', 'Y', 'SYSTEM', 'SYSTEM'
FROM picked
WHERE auth_group_seq IS NOT NULL
  AND NOT EXISTS (SELECT 1 FROM adm_auth_group WHERE auth_group_cd = 'ADMIN');

UPDATE adm_auth_group
   SET auth_group_nm = '관리자',
       auth_group_desc = '기본 관리자 그룹',
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
 WHERE auth_group_cd = 'ADMIN';

INSERT INTO adm_auth_group_user (
    auth_group_seq, user_seq, use_yn, created_by, updated_by
)
SELECT ag.auth_group_seq, u.user_seq, 'Y', 'SYSTEM', 'SYSTEM'
FROM adm_auth_group ag
JOIN adm_user_mst u ON u.login_id = 'ADMIN'
WHERE ag.auth_group_cd = 'ADMIN'
ON CONFLICT (auth_group_seq, user_seq) DO UPDATE
   SET use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM';

WITH seed(service_cd, service_nm, base_url, status_path, live_path, ready_path, timeout_ms, sort_ord, remark) AS (
    VALUES
        ('admin-service', 'Admin Service', 'http://localhost:8081', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 1, 'Authentication and admin portal service'),
        ('schedule-service', 'Schedule Service', 'http://localhost:8082', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 2, 'Project and task scheduling service'),
        ('webhard-service', 'Webhard Service', 'http://localhost:8083', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 3, 'Webhard file and folder management service'),
        ('media-service', 'Media Service', 'http://localhost:8084', '/api/health/', '/api/health/', '/api/health/', 3000, 4, 'Reference media gallery service')
),
missing AS (
    SELECT seed.*,
           ROW_NUMBER() OVER (ORDER BY seed.sort_ord, seed.service_cd) AS rn
    FROM seed
    WHERE NOT EXISTS (
        SELECT 1 FROM adm_service_mst existing WHERE existing.service_cd = seed.service_cd
    )
),
available AS (
    SELECT candidate_id,
           ROW_NUMBER() OVER (ORDER BY candidate_id) AS rn
    FROM generate_series(1, 9999) AS s(candidate_id)
    WHERE NOT EXISTS (
        SELECT 1 FROM adm_service_mst existing WHERE existing.service_seq = s.candidate_id
    )
)
INSERT INTO adm_service_mst (
    service_seq, service_cd, service_nm, base_url, status_path, live_path, ready_path,
    timeout_ms, use_yn, sort_ord, remark, created_by, updated_by
)
SELECT available.candidate_id, missing.service_cd, missing.service_nm, missing.base_url,
       missing.status_path, missing.live_path, missing.ready_path, missing.timeout_ms,
       'Y', missing.sort_ord, missing.remark, 'SYSTEM', 'SYSTEM'
FROM missing
JOIN available ON available.rn = missing.rn;

WITH seed(service_cd, service_nm, base_url, status_path, live_path, ready_path, timeout_ms, sort_ord, remark) AS (
    VALUES
        ('admin-service', 'Admin Service', 'http://localhost:8081', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 1, 'Authentication and admin portal service'),
        ('schedule-service', 'Schedule Service', 'http://localhost:8082', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 2, 'Project and task scheduling service'),
        ('webhard-service', 'Webhard Service', 'http://localhost:8083', '/health/status.json', '/health/live.json', '/health/ready.json', 3000, 3, 'Webhard file and folder management service'),
        ('media-service', 'Media Service', 'http://localhost:8084', '/api/health/', '/api/health/', '/api/health/', 3000, 4, 'Reference media gallery service')
)
UPDATE adm_service_mst sm
   SET service_nm = seed.service_nm,
       base_url = seed.base_url,
       status_path = seed.status_path,
       live_path = seed.live_path,
       ready_path = seed.ready_path,
       timeout_ms = seed.timeout_ms,
       use_yn = 'Y',
       sort_ord = seed.sort_ord,
       remark = seed.remark,
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
  FROM seed
 WHERE sm.service_cd = seed.service_cd;

WITH seed(service_cd, perm_cd, perm_nm, perm_desc, sort_ord) AS (
    VALUES
        ('schedule-service', 'DASHBOARD_ACCESS', 'Dashboard Access', 'Allows access to schedule dashboard views', 1),
        ('schedule-service', 'WRITE', 'Write Access', 'Allows create and update actions in schedule service', 2),
        ('schedule-service', 'DELETE', 'Delete Access', 'Allows delete actions in schedule service', 3),
        ('webhard-service', 'WRITE', 'Write Access', 'Allows create and update actions in webhard service', 1),
        ('webhard-service', 'DELETE', 'Delete Access', 'Allows delete actions in webhard service', 2),
        ('webhard-service', 'SHARE', 'Share Access', 'Allows share link actions in webhard service', 3),
        ('media-service', 'WRITE', 'Write Access', 'Allows media metadata sync and edits', 1),
        ('media-service', 'SHARE', 'Share Access', 'Reserved for media sharing actions', 2),
        ('media-service', 'DELETE', 'Delete Access', 'Reserved for media delete actions', 3)
),
missing AS (
    SELECT sm.service_seq, seed.perm_cd, seed.perm_nm, seed.perm_desc, seed.sort_ord,
           ROW_NUMBER() OVER (ORDER BY sm.sort_ord, sm.service_seq, seed.sort_ord, seed.perm_cd) AS rn
    FROM seed
    JOIN adm_service_mst sm ON sm.service_cd = seed.service_cd
    WHERE NOT EXISTS (
        SELECT 1
        FROM adm_service_perm_def existing
        WHERE existing.service_seq = sm.service_seq
          AND existing.perm_cd = seed.perm_cd
    )
),
available AS (
    SELECT candidate_id,
           ROW_NUMBER() OVER (ORDER BY candidate_id) AS rn
    FROM generate_series(1, 9999) AS s(candidate_id)
    WHERE NOT EXISTS (
        SELECT 1 FROM adm_service_perm_def existing WHERE existing.service_perm_seq = s.candidate_id
    )
)
INSERT INTO adm_service_perm_def (
    service_perm_seq, service_seq, perm_cd, perm_nm, perm_desc, sort_ord, use_yn, created_by, updated_by
)
SELECT available.candidate_id, missing.service_seq, missing.perm_cd, missing.perm_nm,
       missing.perm_desc, missing.sort_ord, 'Y', 'SYSTEM', 'SYSTEM'
FROM missing
JOIN available ON available.rn = missing.rn;

WITH seed(service_cd, perm_cd, perm_nm, perm_desc, sort_ord) AS (
    VALUES
        ('schedule-service', 'DASHBOARD_ACCESS', 'Dashboard Access', 'Allows access to schedule dashboard views', 1),
        ('schedule-service', 'WRITE', 'Write Access', 'Allows create and update actions in schedule service', 2),
        ('schedule-service', 'DELETE', 'Delete Access', 'Allows delete actions in schedule service', 3),
        ('webhard-service', 'WRITE', 'Write Access', 'Allows create and update actions in webhard service', 1),
        ('webhard-service', 'DELETE', 'Delete Access', 'Allows delete actions in webhard service', 2),
        ('webhard-service', 'SHARE', 'Share Access', 'Allows share link actions in webhard service', 3),
        ('media-service', 'WRITE', 'Write Access', 'Allows media metadata sync and edits', 1),
        ('media-service', 'SHARE', 'Share Access', 'Reserved for media sharing actions', 2),
        ('media-service', 'DELETE', 'Delete Access', 'Reserved for media delete actions', 3)
)
UPDATE adm_service_perm_def spd
   SET perm_nm = seed.perm_nm,
       perm_desc = seed.perm_desc,
       sort_ord = seed.sort_ord,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
  FROM seed
  JOIN adm_service_mst sm ON sm.service_cd = seed.service_cd
 WHERE spd.service_seq = sm.service_seq
   AND spd.perm_cd = seed.perm_cd;

INSERT INTO adm_auth_service_perm (
    auth_group_seq, service_perm_seq, use_yn, created_by, updated_by
)
SELECT ag.auth_group_seq, spd.service_perm_seq, 'Y', 'SYSTEM', 'SYSTEM'
FROM adm_auth_group ag
JOIN adm_service_perm_def spd ON 1 = 1
JOIN adm_service_mst sm ON sm.service_seq = spd.service_seq
WHERE ag.auth_group_cd = 'ADMIN'
  AND sm.service_cd IN ('schedule-service', 'webhard-service', 'media-service')
ON CONFLICT (auth_group_seq, service_perm_seq) DO UPDATE
   SET use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM';

WITH seed(menu_key, menu_nm, menu_url, menu_type_cd, icon_class, sort_ord) AS (
    VALUES
        ('dashboard', '대시보드', '/home.do', 'PAGE', 'dashboard', 1),
        ('auth', '권한 관리', '/auth/main.do', 'PAGE', 'shield_person', 10),
        ('menu', '메뉴 관리', '/menu/main.do', 'PAGE', 'menu', 20),
        ('service', '서비스 관리', '/service/main.do', 'PAGE', 'dns', 30),
        ('api', 'API 정책 관리', '/api/main.do', 'PAGE', 'api', 40),
        ('health', '헬스 체크', '/health/main.do', 'PAGE', 'monitor_heart', 50)
),
missing AS (
    SELECT seed.*,
           ROW_NUMBER() OVER (ORDER BY seed.sort_ord, seed.menu_url) AS rn
    FROM seed
    WHERE NOT EXISTS (
        SELECT 1 FROM adm_menu_mst existing WHERE existing.menu_url = seed.menu_url
    )
),
available AS (
    SELECT candidate_id,
           ROW_NUMBER() OVER (ORDER BY candidate_id) AS rn
    FROM generate_series(1, 9999) AS s(candidate_id)
    WHERE NOT EXISTS (
        SELECT 1 FROM adm_menu_mst existing WHERE existing.menu_seq = s.candidate_id
    )
)
INSERT INTO adm_menu_mst (
    menu_seq, up_menu_seq, menu_nm, menu_url, menu_type_cd, icon_class,
    sort_ord, use_yn, created_by, updated_by
)
SELECT available.candidate_id, NULL, missing.menu_nm, missing.menu_url, missing.menu_type_cd,
       missing.icon_class, missing.sort_ord, 'Y', 'SYSTEM', 'SYSTEM'
FROM missing
JOIN available ON available.rn = missing.rn;

WITH seed(menu_nm, menu_url, menu_type_cd, icon_class, sort_ord) AS (
    VALUES
        ('대시보드', '/home.do', 'PAGE', 'dashboard', 1),
        ('권한 관리', '/auth/main.do', 'PAGE', 'shield_person', 10),
        ('메뉴 관리', '/menu/main.do', 'PAGE', 'menu', 20),
        ('서비스 관리', '/service/main.do', 'PAGE', 'dns', 30),
        ('API 정책 관리', '/api/main.do', 'PAGE', 'api', 40),
        ('헬스 체크', '/health/main.do', 'PAGE', 'monitor_heart', 50)
)
UPDATE adm_menu_mst m
   SET menu_nm = seed.menu_nm,
       menu_type_cd = seed.menu_type_cd,
       icon_class = seed.icon_class,
       sort_ord = seed.sort_ord,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
  FROM seed
 WHERE m.menu_url = seed.menu_url;

INSERT INTO adm_auth_menu (
    auth_group_seq, menu_seq, perm_lvl, use_yn, created_by, updated_by
)
SELECT ag.auth_group_seq, m.menu_seq, 9, 'Y', 'SYSTEM', 'SYSTEM'
FROM adm_auth_group ag
JOIN adm_menu_mst m ON m.menu_url IN (
    '/home.do',
    '/auth/main.do',
    '/menu/main.do',
    '/service/main.do',
    '/api/main.do',
    '/health/main.do'
)
WHERE ag.auth_group_cd = 'ADMIN'
ON CONFLICT (auth_group_seq, menu_seq) DO UPDATE
   SET perm_lvl = 9,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM';

SELECT setval('adm_user_mst_seq', GREATEST(COALESCE((SELECT MAX(user_seq) FROM adm_user_mst), 0), 1), true);
SELECT setval('adm_auth_group_seq', GREATEST(COALESCE((SELECT MAX(auth_group_seq) FROM adm_auth_group), 0), 1), true);
SELECT setval('adm_menu_mst_seq', GREATEST(COALESCE((SELECT MAX(menu_seq) FROM adm_menu_mst), 0), 1), true);
SELECT setval('adm_service_mst_seq', GREATEST(COALESCE((SELECT MAX(service_seq) FROM adm_service_mst), 0), 1), true);
SELECT setval('adm_service_perm_def_seq', GREATEST(COALESCE((SELECT MAX(service_perm_seq) FROM adm_service_perm_def), 0), 1), true);
