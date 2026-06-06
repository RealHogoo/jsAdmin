WITH seed(service_cd, service_nm, base_url, status_path, live_path, ready_path, timeout_ms, sort_ord, remark) AS (
    VALUES
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
       sort_ord = seed.sort_ord,
       remark = seed.remark,
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
  FROM seed
 WHERE sm.service_cd = seed.service_cd;

WITH seed(service_cd, perm_cd, perm_nm, perm_desc, sort_ord) AS (
    VALUES
        ('webhard-service', 'READ', 'Read Access', 'Allows read actions in webhard service', 1),
        ('webhard-service', 'WRITE', 'Write Access', 'Allows create and update actions in webhard service', 2),
        ('webhard-service', 'DELETE', 'Delete Access', 'Allows delete actions in webhard service', 3),
        ('webhard-service', 'SHARE', 'Share Access', 'Allows share link actions in webhard service', 4),
        ('media-service', 'READ', 'Read Access', 'Allows read actions in media service', 1),
        ('media-service', 'WRITE', 'Write Access', 'Allows media sync, import, and edit actions', 2),
        ('media-service', 'DELETE', 'Delete Access', 'Allows delete actions in media service', 3)
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

INSERT INTO adm_auth_service_perm (
    auth_group_seq, service_perm_seq, use_yn, created_by, updated_by
)
SELECT ag.auth_group_seq, spd.service_perm_seq, 'Y', 'SYSTEM', 'SYSTEM'
FROM adm_auth_group ag
JOIN adm_service_perm_def spd ON 1 = 1
JOIN adm_service_mst sm ON sm.service_seq = spd.service_seq
WHERE ag.auth_group_cd = 'ADMIN'
  AND sm.service_cd IN ('webhard-service', 'media-service')
ON CONFLICT (auth_group_seq, service_perm_seq) DO UPDATE
   SET use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM';

SELECT setval('adm_service_mst_seq', GREATEST(COALESCE((SELECT MAX(service_seq) FROM adm_service_mst), 0), 1), true);
SELECT setval('adm_service_perm_def_seq', GREATEST(COALESCE((SELECT MAX(service_perm_seq) FROM adm_service_perm_def), 0), 1), true);
