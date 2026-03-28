# admin-service

관리자 포털, 공통 로그인 게이트웨이, 운영 화면을 제공하는 `Spring Boot + JSP + MyBatis + Oracle` 기반 서비스입니다.

## 현재 범위

- JWT 기반 로그인, 로그아웃, 토큰 갱신, 세션 검증
- 사용자 관리
- 메뉴 관리
- 권한 관리
- 공통 코드 관리
- 공지사항 관리
- 타임라인 관리
- 접속 관리
  - 현재 세션
  - 로그인 이력
- API 정책 관리
- 마이페이지
- 서비스 상태 확인

## 핵심 기술

- Java 17
- Spring Boot 2.7
- JSP
- MyBatis
- Oracle
- JWT (`java-jwt`)
- BCrypt

## 인증 구조

- 로그인: `/login.json`
- 토큰 상태 확인: `/auth/ping.json`
- 내 정보: `/auth/me.json`
- refresh: `/auth/refresh.json`
- 로그아웃: `/logout.json`

JWT access token은 각 요청에서 직접 검증하고, refresh token은 서버 테이블에서 회전 관리합니다.

## 실행 설정

`src/main/resources/app.properties`

```properties
jwt.secret=${JWT_SECRET:jsadmin-local-dev-secret-20260327-change-before-prod}
jwt.issuer=jsAdmin
jwt.exp_seconds=${JWT_EXP_SECONDS:3600}
auth.super.login-id=ADMIN
```

개발 중 access token 만료를 짧게 보고 싶으면:

```powershell
$env:JWT_EXP_SECONDS="10"
.\gradlew.bat bootRun
```

운영에서는 반드시 `JWT_SECRET`를 환경변수로 주입해야 합니다.

## 주요 문서

- `docs/admin-service.md`
- `docs/auth/auth.md`
- `docs/main/main.md`
- `docs/menu/menu.md`
- `docs/role/role.md`

## 비고

- `target/` 아래 문서는 빌드 산출물 복사본입니다.
- 실제 수정 대상은 `docs/` 아래 문서입니다.
