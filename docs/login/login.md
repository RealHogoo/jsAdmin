# 로그인 문서

## 개요

로그인 기능은 관리자 계정 인증 후 access token, refresh token, 세션 정보를 발급합니다.

## 요청 예시

```json
{
  "user_id": "ADMIN",
  "user_pw": "1111"
}
```

## 주요 동작

- 사용자 인증
- 로그인 이력 기록
- 세션 발급
- refresh token 저장
- 비밀번호 재설정 필요 여부 확인

## 주요 API

- `/login.json`
- `/logout.json`
