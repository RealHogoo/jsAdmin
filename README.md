# admin-service

`admin-service`는 관리자 로그인, 공통 인증, 권한, 메뉴, 공지, 타임라인, 서비스 레지스트리 기능을 제공하는 Spring Boot 서비스입니다.

## 역할

- 관리자 로그인과 JWT/refresh token 발급
- 사용자, 권한 그룹, 메뉴 권한 관리
- 서비스별 권한 정의와 사용자/그룹 매핑
- 공통 코드, 공지, 타임라인 관리
- 접근 세션과 로그인 이력 관리
- 서비스 레지스트리와 헬스체크 관리

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
- 운영
  - `POST /code/list.json`
  - `POST /notice/list.json`
  - `POST /timeline/list.json`
  - `POST /access/session/list.json`
  - `POST /api/list.json`
  - `POST /service/list.json`
  - `POST /version.json`
- 헬스
  - `POST /health/live.json`
  - `POST /health/ready.json`
  - `POST /health/status.json`

## 릴리즈 표시

- 메인 화면 푸터 오른쪽에 현재 소스의 짧은 Git SHA를 표시합니다.
- `POST /version.json`은 `service`, `revision` 값을 반환합니다.
- 운영 화면에서 최근 반영 여부를 빠르게 확인하는 용도로 사용합니다.

## DB

기본 권장 DB는 PostgreSQL입니다.

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

```powershell
$env:APP_ENV="dev"
$env:SERVICE_ID="admin-service"
$env:ADMIN_SERVICE_PUBLIC_BASE_URL="http://localhost:8081"
$env:APP_DB_VENDOR="postgres"
$env:DB_URL="jdbc:postgresql://localhost:5432/admin"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
$env:JWT_SECRET="change-this-to-a-long-random-secret"
.\gradlew.bat bootRun
```

`JWT_SECRET`은 충분히 긴 값으로 설정하고, 연동 서비스와 동일한 값을 사용해야 합니다.

## 문서

- 서비스 개요: [docs/admin-service.md](docs/admin-service.md)
- 운영 가이드: [docs/operations.md](docs/operations.md)
- 인증: [docs/auth/auth.md](docs/auth/auth.md)
- 서비스 권한: [docs/auth/service-permissions.md](docs/auth/service-permissions.md)
- SQL: [docs/sqls/README.md](docs/sqls/README.md)
