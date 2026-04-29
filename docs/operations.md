# 운영 가이드

## 필수 설정

- `APP_ENV`
- `APP_DB_VENDOR`
- `PUBLIC_BASE_URL`
- `JWT_SECRET`
- `JWT_EXP_SECONDS`
- `ASSET_VERSION`
- `AUTH_SUPER_LOGIN_ID`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`

## PostgreSQL 실행 예시

```powershell
$env:APP_DB_VENDOR="postgres"
$env:APP_ENV="dev"
$env:PUBLIC_BASE_URL="http://localhost:8081"
$env:JWT_SECRET="change-this-secret"
$env:DB_URL="jdbc:postgresql://localhost:5432/admin"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
.\gradlew.bat bootRun
```

## 점검 포인트

- `POST /login.json`
- `POST /auth/me.json`
- `POST /auth/refresh.json`
- `POST /version.json`
- `POST /health/live.json`
- `POST /health/ready.json`
- `POST /health/status.json`

## 릴리즈 확인

- 관리자 화면 푸터 오른쪽에 현재 배포 소스의 짧은 Git SHA가 표시됩니다.
- `POST /version.json` 응답의 `revision`과 화면 푸터 표시값이 같은지 확인하면 됩니다.
- 소스 반영 여부를 운영에서 빠르게 확인할 때 이 값을 기준으로 사용합니다.

## 배포 체크리스트

- `JWT_SECRET`이 운영 환경변수로 주입되는지 확인
- `APP_ENV=prod` 적용 여부 확인
- `APP_DB_VENDOR`가 의도한 DB와 일치하는지 확인
- `AUTH_SUPER_LOGIN_ID`가 실제 운영 계정 정책과 맞는지 확인
- DB 접속 정보 최종 검증
- `ASSET_VERSION` 갱신 여부 확인
- 푸터 `release` 표시와 `POST /version.json` 값 확인

## 주의사항

- 포트가 이미 사용 중이면 기동에 실패합니다.
- DB 계정이나 비밀번호가 다르면 Hikari 초기화 단계에서 즉시 실패합니다.
- Git 작업트리 없이 빌드된 환경에서는 release 값이 `unknown`으로 표시될 수 있습니다.
