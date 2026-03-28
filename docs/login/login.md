# 로그인 화면 문서

## 개요

로그인 화면은 관리자 인증 진입점입니다.

## 주요 기능

- ID / 비밀번호 입력
- 로그인 실패 메시지 표시
- 로그인 지연 카운트다운 표시
- 성공 시 홈 화면 이동

## 주요 API

- `/login.do`
- `/login.json`

## 정책

- 3회 실패: 1분 지연
- 5회 실패: 10분 지연
- 7회 실패: 계정 잠금

## 저장 정보

- `JWT`
- `REFRESH_TOKEN`
- `LOGIN_USER`
- `LOGIN_SESSION_ID`

## 프런트 동작

- access token 만료 시 공통 `app.js`가 refresh를 시도합니다.
