# admin-service

관리자 포털, 공통 인증, 권한 관리, 서비스 레지스트리 관리를 담당하는 Spring Boot 기반 서비스입니다.

## 역할

- 관리자 로그인, 액세스 토큰, 리프레시 토큰 발급
- 사용자, 메뉴, 권한 그룹 관리
- 서비스별 권한 관리
- 공통 코드, 공지, 타임라인 관리
- 로그인 세션, 로그인 이력 관리
- API 정책 관리
- 서비스 레지스트리 및 헬스체크 관리

## 현재 권한 모델

- 로그인만으로 접근 가능한 관리자 기능은 허용하지 않습니다.
- 관리자성 쓰기 기능과 민감 조회 기능은 관리자 역할이 필요합니다.
- `/auth/me.json` 응답에는 `roles`, `session_id`, `service_permissions`가 포함됩니다.
- 서비스별 권한은 현재 `schedule-service`를 대상으로 사용합니다.

서비스 권한 상세는 [docs/auth/service-permissions.md](docs/auth/service-permissions.md)를 참고합니다.

## 주요 API

- 인증
  - `POST /login.json`
  - `POST /auth/me.json`
  - `POST /auth/refresh.json`
  - `POST /logout.json`
- 사용자/권한
  - `POST /user/list.json`
  - `POST /auth/group/list.json`
  - `POST /auth/group/save.json`
  - `POST /auth/group/delete.json`
  - `POST /auth/group/menu/list.json`
  - `POST /auth/group/menu/save.json`
  - `POST /auth/group/service/list.json`
  - `POST /auth/group/service/save.json`
  - `POST /auth/user/servicePermList.json`
- 운영 관리
  - `POST /code/list.json`
  - `POST /notice/list.json`
  - `POST /timeline/list.json`
  - `POST /access/session/list.json`
  - `POST /api/list.json`
  - `POST /service/list.json`
- 헬스
  - `POST /health/live.json`
  - `POST /health/ready.json`
  - `POST /health/status.json`

헬스 엔드포인트는 인증 예외입니다. 내부 헬스체커 호환을 위해 빈 POST와 JSON 본문 POST 둘 다 처리합니다.

## DB

주 사용 DB는 PostgreSQL 기준으로 정리되어 있습니다.

주요 테이블:

- `adm_user_mst`
- `adm_auth_group`
- `adm_auth_group_user`
- `adm_menu_mst`
- `adm_auth_menu`
- `adm_auth_user`
- `adm_service_mst`
- `adm_service_perm_def`
- `adm_auth_service_perm`
- `adm_auth_user_service_perm`
- `adm_noti_mst`
- `adm_timeline_mst`
- `adm_login_sesn`
- `adm_login_hist`
- `adm_refresh_token`
- `adm_api_mst`

## 실행

기본 포트는 `8081`입니다.

필수 또는 권장 환경 변수:

```powershell
$env:APP_ENV="dev"
$env:APP_DB_VENDOR="postgres"
$env:DB_URL="jdbc:postgresql://localhost:5432/admin"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:JWT_SECRET="change-this-to-a-long-random-secret"
.\gradlew.bat bootRun
```

`JWT_SECRET`는 32자 이상 강한 값이어야 합니다.

운영 배포 시에는 `APP_ENV=prod` 같은 형태로 환경 구분값을 함께 주입하는 것을 권장합니다.

## SQL

PostgreSQL 기준 전체 반영:

```powershell
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/apply_all.sql
```

신규 환경 기준으로는 `docs/sqls/postgres/baseline/V000__baseline.sql` 하나로 서비스 권한 포함 전체 구조를 구성합니다.

## 문서

- 운영 가이드: [docs/operations.md](docs/operations.md)
- SQL 가이드: [docs/sqls/README.md](docs/sqls/README.md)
- PostgreSQL SQL: [docs/sqls/postgres/README.md](docs/sqls/postgres/README.md)
- 인증 문서: [docs/auth/auth.md](docs/auth/auth.md)
- 서비스 권한 문서: [docs/auth/service-permissions.md](docs/auth/service-permissions.md)

## 참고

- Oracle 관련 SQL과 설정 파일은 레거시 호환 목적으로 남아 있을 수 있습니다.
- 현재 개발/운영 기준 권장은 PostgreSQL입니다.
