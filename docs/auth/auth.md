# 인증 모듈 문서

## 개요

현재 인증 모듈은 `JWT + refresh token + 세션 추적` 구조입니다.

## 주요 API

### 1. 로그인

- URL: `/login.json`
- Method: `POST`
- 요청:

```json
{
  "user_id": "ADMIN",
  "user_pw": "1111"
}
```

- 응답:

```json
{
  "ok": true,
  "code": "OK",
  "message": "success",
  "data": {
    "token": "...",
    "refresh_token": "...",
    "session_id": "...",
    "refresh_expires_at": 0,
    "user": {
      "user_id": "ADMIN",
      "user_nm": "관리자",
      "roles": ["ROLE_SUPER_ADMIN", "ROLE_ADMIN"],
      "super_admin": true
    }
  }
}
```

### 2. ping

- URL: `/auth/ping.json`
- Method: `POST`
- 용도:
  - 현재 access token / 세션 유효성 확인
  - 헤더 로그인 상태 재검증

### 3. me

- URL: `/auth/me.json`
- Method: `POST`
- 용도:
  - 현재 로그인 사용자 정보 조회

### 4. refresh

- URL: `/auth/refresh.json`
- Method: `POST`
- 요청:

```json
{
  "refresh_token": "..."
}
```

- 특징:
  - refresh token 검증
  - 기존 refresh token 즉시 폐기
  - 새 access token 발급
  - 새 refresh token 재발급

### 5. 로그아웃

- URL: `/logout.json`
- Method: `POST`
- 동작:
  - 현재 세션 종료
  - 세션 기준 refresh token 전부 폐기
  - 로그아웃 이력 저장

## 로그인 실패 정책

- 3회 실패: 1분 지연
- 5회 실패: 10분 지연
- 7회 실패: 계정 잠금

## 저장 구조

### 사용자

- `ADM_USER_MST`
  - `PWD_HASH`
  - `LOGIN_FAIL_CNT`
  - `LOCK_UNTIL_AT`
  - `LOCK_YN`
  - `PWD_RESET_YN`

### refresh token

- `ADM_REFRESH_TOKEN`
  - `REFRESH_SEQ`
  - `USER_SEQ`
  - `LOGIN_ID`
  - `SESSION_ID`
  - `TOKEN_HASH`
  - `EXPIRES_AT`
  - `REVOKED_YN`

## 현재 보안 기준

- 비밀번호는 BCrypt 해시 저장
- 기존 평문 비밀번호는 로그인 성공 시 자동 해시 승격
- refresh token은 원문이 아닌 SHA-256 해시 저장
- JWT에는 `jti`를 포함해 재발급 시 토큰 문자열이 바뀜

## 프런트 동작

`static/js/app.js`

- `401` 응답 수신
- `REFRESH_TOKEN`이 있으면 `/auth/refresh.json` 1회 호출
- 성공하면 원요청 자동 재시도
- 실패하면 인증정보 삭제 후 로그인 화면 이동

## 운영 설정

```properties
jwt.secret=${JWT_SECRET:...}
jwt.issuer=jsAdmin
jwt.exp_seconds=${JWT_EXP_SECONDS:3600}
```

운영에서는 `JWT_SECRET` 환경변수 사용을 권장합니다.
