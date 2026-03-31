# 인증 및 권한 문서

## 개요

인증 모듈은 `JWT + refresh token + 세션 추적` 구조로 동작합니다. 권한 관리 기능은 그룹 권한과 사용자 예외 권한을 함께 관리합니다.

## 로그인 API

- URL: `/login.json`
- Method: `POST`

예시:

```json
{
  "user_id": "ADMIN",
  "user_pw": "1111"
}
```

## 주요 기능

- 로그인, 로그아웃, 토큰 갱신
- 내 정보 조회
- 권한 그룹 조회
- 그룹 메뉴 권한 저장
- 사용자 예외 권한 저장

## 주요 API

- `/login.json`
- `/logout.json`
- `/auth/ping.json`
- `/auth/me.json`
- `/auth/refresh.json`
- `/auth/group/list.json`
- `/auth/group/menu/list.json`
- `/auth/group/menu/save.json`
- `/auth/user/search.json`
- `/auth/user/exception/save.json`
