# admin-service

관리자 인증, 권한, 공통 운영 기능을 담당하는 MSA 기반 서비스

---

## 1. 개요

`admin-service`는 전체 시스템의 공통 관리자 서비스이며  
로그인, JWT 발급/갱신, 사용자/권한/메뉴 관리, 운영성 기능을 담당한다.

또한 `schedule-service` 같은 하위 서비스가 공통 인증 체계를 사용할 수 있도록  
인증의 기준점 역할을 한다.

---

## 2. 아키텍처 개요

### 2.1 구성

- admin-service
  - 로그인
  - JWT 발급 / refresh
  - 사용자 관리
  - 메뉴 / 권한 관리
  - 공통 코드 관리
  - 공지사항 / 타임라인 관리
  - 접속 이력 / 세션 관리
  - API 정책 관리
  - MSA 서비스 관리
  - 헬스체크

### 2.2 전체 흐름

[client] -> admin-service 로그인 -> JWT 발급 -> 각 서비스 요청 -> JWT 검증

### 2.3 인증 흐름

Authorization: Bearer {access_token}

또는 `localhost` 공통 쿠키 기반 인증을 사용한다.

---

## 3. 인증 / 권한 체계

- 로그인 처리: admin-service
- 토큰 발급: admin-service
- 토큰 갱신: admin-service
- 사용자 / 권한 / 메뉴 기준 정보 관리: admin-service
- 다른 서비스는 admin-service가 발급한 JWT를 기준으로 인증 처리

---

## 4. 주요 기능

- 로그인 / 로그아웃
- Access Token / Refresh Token 발급
- 내 정보 조회
- 사용자 관리
- 메뉴 관리
- 권한 관리
- 공통 코드 관리
- 공지사항 관리
- 타임라인 관리
- 접속 세션 / 로그인 이력 관리
- API 정책 관리
- MSA 서비스 관리
- 서비스별 헬스체크

---

## 5. DB 구조

주요 테이블:

- `adm_user_mst`
- `adm_auth_group`
- `adm_auth_group_user`
- `adm_menu_mst`
- `adm_auth_menu`
- `adm_auth_user`
- `adm_code_mst`
- `adm_noti_mst`
- `adm_timeline_mst`
- `adm_login_sesn`
- `adm_login_hist`
- `adm_refresh_token`
- `adm_api_mst`
- `adm_service_mst`

---

## 6. API 개요

- `POST /login.json`
- `POST /auth/me.json`
- `POST /auth/refresh.json`
- `POST /menu/tree.json`
- `POST /user/list.json`
- `POST /auth/list.json`
- `POST /code/list.json`
- `POST /notice/list.json`
- `POST /timeline/list.json`
- `POST /access/session/list.json`
- `POST /api/list.json`
- `POST /service/list.json`
- `POST /health/detail.json`

---

## 7. 기술 스택

- Java 17
- Spring Boot 2.7
- JSP
- MyBatis
- PostgreSQL / Oracle
- JWT
- BCrypt

---

## 8. 설정 파일

- 공통 설정
  - `src/main/resources/app.properties`
- Oracle 설정
  - `src/main/resources/db/oracle.properties`
- PostgreSQL 설정
  - `src/main/resources/db/postgres.properties`

---

## 9. 실행

### PostgreSQL 기준

```powershell
$env:APP_DB_VENDOR="postgres"
$env:JWT_SECRET="change-this-secret-to-a-long-random-value"
.\gradlew.bat bootRun
```

### Oracle 기준

```powershell
$env:APP_DB_VENDOR="oracle"
$env:JWT_SECRET="change-this-secret-to-a-long-random-value"
.\gradlew.bat bootRun
```

---

## 10. 접속 경로

- 메인 화면: `http://localhost:8081/main.do`
- 로그인 API: `http://localhost:8081/login.json`
- 내 정보 API: `http://localhost:8081/auth/me.json`
- 헬스체크 화면: `http://localhost:8081/main.do`

---

## 11. 문서

- 서비스 개요: `docs/admin-service.md`
- 운영 가이드: `docs/operations.md`
- SQL 가이드: `docs/sqls/README.md`
- 인증 문서: `docs/auth/auth.md`
- 로그인 문서: `docs/login/login.md`

---

## 12. 정리

`admin-service`는 관리자 포털이면서 공통 인증 서버 역할을 수행한다.  
현재 구조는 `schedule-service`와 JWT 및 공통 쿠키 기반 로그인 흐름을 공유하도록 구성되어 있다.
