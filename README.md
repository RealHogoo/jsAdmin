# admin-service

`admin-service`는 Spring Boot, JSP, MyBatis 기반의 관리자 서비스입니다.

## 주요 기능

- 로그인, 토큰 갱신, 로그아웃
- 사용자 관리
- 메뉴 및 권한 관리
- 공통 코드 관리
- 공지사항 및 타임라인 관리
- 접속 이력 및 세션 관리
- API 정책 관리
- 마이페이지
- 헬스 체크

## 기술 스택

- Java 17
- Spring Boot 2.7
- JSP
- MyBatis
- Oracle / PostgreSQL
- JWT
- BCrypt

## 설정 위치

- 공통 설정: [src/main/resources/app.properties](src/main/resources/app.properties)
- Oracle 설정: [src/main/resources/db/oracle.properties](src/main/resources/db/oracle.properties)
- PostgreSQL 설정: [src/main/resources/db/postgres.properties](src/main/resources/db/postgres.properties)

## 빠른 실행

```powershell
$env:APP_DB_VENDOR="oracle"
$env:JWT_SECRET="change-this-secret"
.\gradlew.bat bootRun
```

## 문서

- [서비스 개요](docs/admin-service.md)
- [운영 가이드](docs/operations.md)
- [SQL 가이드](docs/sqls/README.md)

## 참고

- 정적 리소스 버전은 `asset.version` 또는 `ASSET_VERSION`으로 관리합니다.
- 프런트엔드 JSON 응답은 `snake_case` 기준입니다.
