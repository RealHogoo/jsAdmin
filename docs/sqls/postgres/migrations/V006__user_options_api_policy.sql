INSERT INTO adm_api_mst (
    api_seq,
    api_type,
    api_nm,
    caller_id,
    target_service,
    http_method,
    api_pattern,
    auth_type,
    api_desc,
    use_yn,
    created_by,
    updated_by
)
SELECT
    nextval('adm_api_mst_seq'),
    'INTERNAL',
    'Schedule PM User Options',
    'schedule-service',
    'admin-service',
    'POST',
    '/user/options.json',
    'JWT',
    'schedule-service PM 선택용 사용자 검색 API',
    'Y',
    'SYSTEM',
    'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1
    FROM adm_api_mst
    WHERE caller_id = 'schedule-service'
      AND target_service = 'admin-service'
      AND http_method = 'POST'
      AND api_pattern = '/user/options.json'
);
