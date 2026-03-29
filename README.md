# admin-service

관리자 포털, 공통 코드, 메뉴, 권한, 공지, 타임라인, 접속 이력 등을 제공하는 `Spring Boot + JSP + MyBatis` 기반 서비스입니다.

## 현재 범위

- JWT 기반 로그인, 로그아웃, 토큰 갱신, 세션 검증
- 사용자 관리
- 메뉴 관리
- 권한 관리
- 공통 코드 관리
- 공지사항 관리
- 타임라인 관리
- 접속 관리
- API 정책 관리
- 마이페이지
- 서비스 상태 점검

## 기술 스택

- Java 17
- Spring Boot 2.7
- JSP
- MyBatis
- Oracle / PostgreSQL 전환 가능 구조
- JWT (`java-jwt`)
- BCrypt

## 주요 엔드포인트

- 로그인: `/login.json`
- 토큰 상태 확인: `/auth/ping.json`
- 내 정보: `/auth/me.json`
- 토큰 갱신: `/auth/refresh.json`
- 로그아웃: `/logout.json`

Access token은 요청마다 직접 검증하고, refresh token은 서버 테이블에 저장해 회전 관리합니다.

## 설정

핵심 설정은 `src/main/resources/app.properties` 에 있습니다.

```properties
asset.version=${ASSET_VERSION:20260329}
app.db.vendor=${APP_DB_VENDOR:oracle}
jwt.secret=${JWT_SECRET:jsadmin-local-dev-secret-20260327-change-before-prod}
jwt.issuer=jsAdmin
jwt.exp_seconds=${JWT_EXP_SECONDS:3600}
auth.super.login-id=ADMIN
```

DB 연결 정보는 벤더별 파일로 분리돼 있습니다.

- `src/main/resources/db/oracle.properties`
- `src/main/resources/db/postgres.properties`

## 실행 예시

```powershell
$env:SERVER_PORT="8082"
$env:APP_DB_VENDOR="oracle"
.\gradlew.bat bootRun
```

토큰 만료를 짧게 보고 싶으면:

```powershell
$env:JWT_EXP_SECONDS="10"
.\gradlew.bat bootRun
```

운영에서는 `JWT_SECRET`, DB 접속 정보, `APP_DB_VENDOR`를 환경변수로 주입하는 것을 권장합니다.

## 문서

- `docs/admin-service.md`
- `docs/auth/auth.md`
- `docs/main/main.md`
- `docs/menu/menu.md`
- `docs/role/role.md`

## 참고

- `docs/sqls/oracle`, `docs/sqls/postgres` 에 DB별 SQL이 분리돼 있습니다.
- 정적 리소스 버전은 `asset.version` 또는 `ASSET_VERSION`으로 관리합니다.
