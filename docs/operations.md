# 운영 가이드

## 필수 설정

- `APP_DB_VENDOR`: `oracle` 또는 `postgres`
- `SERVER_PORT`: 서비스 포트
- `JWT_SECRET`: JWT 서명 키
- `JWT_EXP_SECONDS`: access token 만료 시간(초)
- `ASSET_VERSION`: 정적 리소스 버전
- `AUTH_SUPER_LOGIN_ID`: 슈퍼관리자 로그인 ID

## DB 설정

- Oracle: [src/main/resources/db/oracle.properties](/D:/MSA_project/ADMIN_project/admin-service/src/main/resources/db/oracle.properties)
- PostgreSQL: [src/main/resources/db/postgres.properties](/D:/MSA_project/ADMIN_project/admin-service/src/main/resources/db/postgres.properties)

지원 키:

- `db.driver` 또는 `jdbc.driverClassName`
- `db.url` 또는 `jdbc.url`
- `db.username` 또는 `jdbc.username`
- `db.password` 또는 `jdbc.password`

권장 환경변수:

- `DB_DRIVER`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_INITIAL_SIZE`
- `DB_MAX_ACTIVE`
- `DB_MAX_IDLE`
- `DB_MIN_IDLE`

## 로컬 실행

Oracle:

```powershell
$env:APP_DB_VENDOR="oracle"
$env:JWT_SECRET="change-this-secret"
$env:DB_URL="jdbc:log4jdbc:oracle:thin:@localhost:1521/admin"
$env:DB_USERNAME="ADMIN_DEV"
$env:DB_PASSWORD="StrongDev123!"
.\gradlew.bat bootRun
```

PostgreSQL:

```powershell
$env:APP_DB_VENDOR="postgres"
$env:JWT_SECRET="change-this-secret"
.\gradlew.bat bootRun
```

## 빌드 및 테스트

```powershell
.\gradlew.bat compileJava processResources
.\gradlew.bat test
.\gradlew.bat bootWar
```

## 배포 체크리스트

- `JWT_SECRET`를 운영 환경변수로 주입했는지 확인
- `APP_DB_VENDOR`를 올바르게 선택했는지 확인
- `AUTH_SUPER_LOGIN_ID`와 실제 계정이 일치하는지 확인
- DB 접속정보를 최종 검증했는지 확인
- `ASSET_VERSION`을 배포일 기준으로 설정했는지 확인

## 스모크 테스트 체크리스트

- `POST /login.json`
- `POST /auth/me.json`
- `POST /auth/refresh.json`
- `GET /main.do`
- `POST /menu/tree.json`
- `POST /user/list.json`
- `POST /notice/list.json`
- `POST /timeline/list.json`
- `POST /health/db.json`

## 운영 주의사항

- 포트가 이미 사용 중이면 기동에 실패합니다.
- Oracle JDBC는 종료 시 thread 정리 경고를 남길 수 있습니다.
- DB 계정이나 비밀번호가 틀리면 Hikari 초기화 단계에서 즉시 실패합니다.
