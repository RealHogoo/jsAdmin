# 관리자 서비스 전체 문서

## 개요

`admin-service`는 운영자용 웹 포털이자 공통 인증 게이트웨이입니다.  
화면 렌더링은 JSP, 서버 API는 Spring MVC, 데이터 접근은 MyBatis를 사용합니다.

## 현재 패키지 구조

```text
com.realhogoo.jsadmin
├─ access
├─ apipolicy
├─ auth
├─ code
├─ health
├─ menu
├─ mypage
├─ notice
├─ timeline
├─ user
├─ web
└─ common
```

## 주요 기능

### 인증

- `/login.json`
- `/logout.json`
- `/auth/ping.json`
- `/auth/me.json`
- `/auth/refresh.json`

특징:

- access token + refresh token 구조
- JWT access token 직접 검증
- refresh token 서버 저장 및 회전
- BCrypt 비밀번호 저장/검증
- 로그인 실패 지연/잠금 정책 적용

### 운영 화면

- 홈
- 메뉴 관리
- 권한 관리
- 사용자 관리
- 공통 코드 관리
- 공지사항 관리
- 타임라인 관리
- 접속 관리
- API 정책 관리
- 마이페이지
- 헬스체크

## 데이터 저장 개요

### 사용자/인증

- `ADM_USER_MST`
- `ADM_REFRESH_TOKEN`

### 권한/메뉴

- `ADM_MENU_MST`
- `ADM_AUTH_GROUP`
- `ADM_AUTH_MENU`
- `ADM_AUTH_USER`

### 접속 관리

- `ADM_LOGIN_SESN`
- `ADM_LOGIN_HIST`

### API 정책

- `ADM_API_MST`

## 프런트 구조

### 공통 JS

- `static/js/app.js`
  - SPA 페이지 로드
  - 공통 JSON 호출
  - JWT 상태 정리
  - 자동 refresh 재시도
- `static/js/ux.js`
  - DOM/문자열/스토리지 유틸
- `static/js/grid.js`
  - 공통 그리드 렌더
  - chunk list 표시

### 화면 공통화

- `page-header.jspf`
- 공통 CSS
- 공통 버튼/탭/그리드 스타일

## 보안 기준

- 비밀번호 평문 저장 금지
- `JWT_SECRET` 운영 환경변수 주입 권장
- 기본 공개 API 최소화
- refresh token은 해시 저장
- 로그아웃 시 세션과 refresh token 동시 폐기

## 개발 시 참고

### access token 만료 시간 테스트

```powershell
$env:JWT_EXP_SECONDS="10"
.\gradlew.bat bootRun
```

### 기본값 복구

```powershell
Remove-Item Env:JWT_EXP_SECONDS
```

## 관련 세부 문서

- `docs/auth/auth.md`
- `docs/main/main.md`
- `docs/menu/menu.md`
- `docs/role/role.md`
