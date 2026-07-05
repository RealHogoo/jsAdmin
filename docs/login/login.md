# 로그인

## 개요

로그인은 관리자 계정을 인증하고 access token, refresh token, 로그인 세션 ID를 발급한다. 웹 화면에서는 토큰을 응답 본문과 인증 쿠키로 함께 받는다.

## 요청 예시

```json
{
  "user_id": "ADMIN",
  "user_pw": "1111"
}
```

## 처리 흐름

1. 요청 IP의 rate limit 상태를 `adm_login_rate_limit`에서 확인한다.
2. 사용자 계정, 잠금 상태, 비밀번호 재설정 필요 여부를 확인한다.
3. 비밀번호를 검증하고 필요하면 bcrypt 해시로 업그레이드한다.
4. 로그인 실패 시 계정 실패 횟수와 IP rate limit 상태를 갱신한다.
5. 로그인 성공 시 세션, access token, refresh token을 발급한다.
6. refresh token은 해시로 저장하고, 로그인 이력은 `adm_login_hist`에 남긴다.

## QR 로그인

PC 로그인 화면은 QR 로그인 요청을 자동 생성한다. 모바일에서 QR을 승인하면 PC가 해당 요청을 consume해서 로그인 토큰을 발급받는다.

- QR 요청 TTL 기본값: 180초
- QR 생성 rate limit: IP당 기본 60회/분
- 모바일 승인 후 모바일 세션과 refresh token은 즉시 만료 처리한다.
- QR 요청/승인/사용 상태는 `adm_qr_login_req`에 저장한다.

## 설정

- `AUTH_LOGIN_RATE_LIMIT_MAX_ATTEMPTS`
- `AUTH_LOGIN_RATE_LIMIT_WINDOW_SECONDS`
- `AUTH_LOGIN_RATE_LIMIT_BLOCK_SECONDS`
- `AUTH_LOGIN_RATE_LIMIT_CLEANUP_RETENTION_HOURS`
- `AUTH_LOGIN_RATE_LIMIT_CLEANUP_CRON`
- `AUTH_QR_LOGIN_TTL_SECONDS`
- `AUTH_QR_LOGIN_CREATE_RATE_LIMIT_MAX_PER_MINUTE`
- `AUTH_QR_LOGIN_TOKEN_SECRET`

## 주요 API

- `POST /login.json`
- `POST /logout.json`
- `POST /auth/refresh.json`
- `POST /auth/qr/create.json`
- `POST /auth/qr/status.json`
- `POST /auth/qr/approve.json`
- `POST /auth/qr/consume.json`
