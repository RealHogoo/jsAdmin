UPDATE adm_menu_mst
   SET menu_nm = '그룹관리',
       menu_url = '/auth/group/main.do',
       up_menu_seq = 5,
       menu_type_cd = 'PAGE',
       icon_class = 'ico-users',
       sort_ord = 110,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
 WHERE menu_seq = 11;

INSERT INTO adm_menu_mst (
    menu_seq, up_menu_seq, menu_nm, menu_url, menu_type_cd, icon_class,
    sort_ord, use_yn, created_at, created_by, updated_at, updated_by
)
SELECT 20, 5, '권한관리', '/auth/main.do', 'PAGE', 'ico-lock',
       115, 'Y', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1
      FROM adm_menu_mst
     WHERE menu_seq = 20
);

UPDATE adm_menu_mst
   SET menu_nm = '권한관리',
       menu_url = '/auth/main.do',
       up_menu_seq = 5,
       menu_type_cd = 'PAGE',
       icon_class = 'ico-lock',
       sort_ord = 115,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
 WHERE menu_seq = 20;

INSERT INTO adm_auth_menu (
    auth_group_seq, menu_seq, perm_lvl, use_yn, created_at, created_by, updated_at, updated_by
)
SELECT 5, 20, 10, 'Y', CURRENT_TIMESTAMP, 'SYSTEM', CURRENT_TIMESTAMP, 'SYSTEM'
WHERE NOT EXISTS (
    SELECT 1
      FROM adm_auth_menu
     WHERE auth_group_seq = 5
       AND menu_seq = 20
);

UPDATE adm_auth_menu
   SET perm_lvl = 10,
       use_yn = 'Y',
       updated_at = CURRENT_TIMESTAMP,
       updated_by = 'SYSTEM'
 WHERE auth_group_seq = 5
   AND menu_seq = 20;
