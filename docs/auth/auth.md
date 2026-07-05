# 인증 및 권한

## 개요

`admin-service` 인증은 JWT access token, DB 저장 refresh token, 로그인 세션 추적을 함께 사용한다. 권한은 관리자 역할, 메뉴 권한, 서비스 권한을 조합해서 판단한다.

## 주요 보안 정책

- 로그인 실패 횟수와 계정 잠금 상태는 사용자 테이블에 저장한다.
- IP 기준 로그인 rate limit은 `adm_login_rate_limit` 테이블에 저장한다.
- refresh token은 원문을 저장하지 않고 SHA-256 해시로 저장한다.
- QR 로그인 요청 토큰은 설정된 비밀값 기반 HMAC-SHA256으로 해시한다.
- 쿠키는 `HttpOnly`, `SameSite=Strict`로 발급하고 HTTPS 요청에서는 `Secure`를 붙인다.
- JSON 변경 요청은 Origin/Referer 기반 same-origin 검사를 적용한다.

## 주요 API

- `POST /login.json`
- `POST /logout.json`
- `POST /auth/ping.json`
- `POST /auth/me.json`
- `POST /auth/refresh.json`
- `POST /auth/qr/create.json`
- `POST /auth/qr/status.json`
- `POST /auth/qr/approve.json`
- `POST /auth/qr/consume.json`
- `POST /auth/group/list.json`
- `POST /auth/group/save.json`
- `POST /auth/group/delete.json`
- `POST /auth/group/menu/list.json`
- `POST /auth/group/menu/save.json`
- `POST /auth/group/service/list.json`
- `POST /auth/group/service/save.json`
- `POST /auth/user/search.json`
- `POST /auth/user/exception/save.json`

## 필수 테이블

- `adm_login_sesn`: 로그인 세션 상태
- `adm_login_hist`: 로그인/로그아웃/QR 승인 이력
- `adm_refresh_token`: refresh token 해시와 폐기 상태
- `adm_qr_login_req`: QR 로그인 요청 상태
- `adm_login_rate_limit`: IP 기준 로그인 rate limit 상태

## 운영 주의

운영 배포에서는 코드 배포 전에 PostgreSQL 배포 SQL을 먼저 적용한다. 특히 `adm_qr_login_req`, `adm_login_rate_limit` 테이블이 없으면 QR 로그인 또는 로그인 rate limit 처리에서 오류가 발생할 수 있다.
