# 운영 가이드

## 필수 설정

- `APP_ENV`
- `APP_DB_VENDOR`
- `ADMIN_SERVICE_PUBLIC_BASE_URL`
- `JWT_SECRET`
- `AUTH_QR_LOGIN_TOKEN_SECRET`
- `AUTH_SUPER_LOGIN_ID`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

운영 환경에서는 `APP_ENV=prod` 또는 `APP_ENV=production`을 사용하고, `JWT_SECRET`과 `AUTH_QR_LOGIN_TOKEN_SECRET`은 개발 기본값을 사용하지 않는다.

## 로컬 PostgreSQL 실행 예시

```powershell
$env:APP_DB_VENDOR="postgres"
$env:APP_ENV="dev"
$env:ADMIN_SERVICE_PUBLIC_BASE_URL="http://localhost:8081"
$env:JWT_SECRET="change-this-secret"
$env:AUTH_QR_LOGIN_TOKEN_SECRET="change-this-qr-secret"
$env:DB_URL="jdbc:postgresql://localhost:5432/admin"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
.\gradlew.bat bootRun
```

## 배포 순서

1. DB 백업을 생성한다.
2. 신규 SQL을 먼저 적용한다.
3. 애플리케이션을 배포한다.
4. `/health/ready.json`, `/version.json`, 로그인, refresh, QR 로그인을 확인한다.

현재 추가 배포 SQL:

```bash
psql -h <host> -U <user> -d <database> -f docs/sqls/postgres/deploy-20260705-qr-login.sql
psql -h <host> -U <user> -d <database> -f docs/sqls/postgres/deploy-20260705-login-rate-limit.sql
```

## 헬스 체크

- `POST /health/live.json`
- `POST /health/ready.json`
- `POST /health/status.json`
- `POST /version.json`

## 보안 체크리스트

- 운영 비밀값은 환경변수 또는 안전한 secret store로 주입한다.
- `TRUST_FORWARDED_HEADERS=true`는 신뢰된 프록시 뒤에서만 사용한다.
- HTTPS 종료 프록시에서는 `X-Forwarded-Proto`, `X-Forwarded-Host`, `X-Forwarded-Port` 전달을 확인한다.
- `adm_qr_login_req`, `adm_login_rate_limit` 테이블 존재 여부를 배포 전에 확인한다.
- QR 로그인과 로그인 rate limit cleanup 스케줄이 운영 정책에 맞는지 확인한다.

## 주요 설정값

- `AUTH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS`: IP rate limit 허용 실패 횟수
- `AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS`: IP rate limit 집계 창
- `AUTH_LOGIN_RATE_LIMIT_BLOCK_SECONDS`: IP 차단 시간
- `AUTH_LOGIN_RATE_LIMIT_CLEANUP_RETENTION_HOURS`: 만료된 IP rate limit 데이터 보존 시간
- `AUTH_LOGIN_RATE_LIMIT_CLEANUP_CRON`: IP rate limit cleanup 스케줄
- `AUTH_QR_LOGIN_CLEANUP_RETENTION_DAYS`: QR 로그인 요청 보존 일수
- `AUTH_QR_LOGIN_CLEANUP_CRON`: QR 로그인 cleanup 스케줄
