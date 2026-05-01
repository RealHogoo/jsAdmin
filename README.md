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

## 운영 프록시와 공개 URL

- `ADMIN_SERVICE_PUBLIC_BASE_URL`은 어드민 서비스의 외부 접속 주소입니다.
- 운영 기준 예시는 `ADMIN_SERVICE_PUBLIC_BASE_URL=https://adm.js65.myds.me`입니다.
- 프록시 뒤에서 동작할 때는 `X-Forwarded-Proto`, `X-Forwarded-Host`, `X-Forwarded-Port`를 전달해야 합니다.
- 로그인 후 `return_url`은 임의 외부 도메인으로 보내지 않고, 현재 도메인 또는 같은 사이트 계열 도메인만 허용합니다.

운영 프록시 필수 헤더:

```nginx
proxy_set_header Host $host;
proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Port $server_port;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

## 권한 점검 체크리스트

- 비로그인 사용자는 로그인 페이지 외 관리 화면 접근 시 로그인 페이지로 이동합니다.
- 대시보드와 타임라인 공개 영역은 로그인 여부와 관계없이 조회 가능해야 합니다.
- 일반 사용자는 권한이 없는 관리 API 호출 시 권한 없음 메시지를 받아야 합니다.
- 그룹관리에서는 그룹 사용자 매핑을 추가/삭제할 수 있어야 합니다.
- 권한관리에서는 그룹 권한과 사용자 권한을 각각 저장/조회할 수 있어야 합니다.
- 스케줄러 권한 변경 후 `schedule-service` 화면에서 즉시 접근 결과가 일치해야 합니다.

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

## 인코딩

- 소스와 문서는 UTF-8 기준입니다.
- Windows PowerShell에서 한글이 깨져 보이면 `Get-Content -Encoding UTF8 <파일명>`으로 확인합니다.
- `.editorconfig`로 UTF-8 저장 기준을 고정합니다.
- 깨진 문자열 점검은 `.\scripts\check-encoding.ps1`로 실행합니다.

## 배포 점검

- 운영 DB 반영 SQL은 `docs/sqls/postgres/deploy-20260501-current.sql`입니다.
- 배포 후 스모크 체크는 `.\scripts\check-deploy-smoke.ps1`로 실행합니다.
- 스모크 체크는 어드민/스케줄러 `ready`, `version`, 스케줄러 미인증 `return_url` 리다이렉트를 확인합니다.

## 문서

- 서비스 개요: [docs/admin-service.md](docs/admin-service.md)
- 운영 가이드: [docs/operations.md](docs/operations.md)
- 인증: [docs/auth/auth.md](docs/auth/auth.md)
- 서비스 권한: [docs/auth/service-permissions.md](docs/auth/service-permissions.md)
- SQL: [docs/sqls/README.md](docs/sqls/README.md)
