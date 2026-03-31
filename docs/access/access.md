# 접속 관리 문서

## 개요

접속 관리 기능은 현재 로그인 세션과 로그인 이력을 조회하고, 필요 시 강제 만료를 수행하는 화면입니다.

## 주요 기능

- 현재 활성 세션 목록 조회
- 로그인 성공, 실패, 로그아웃 이력 조회
- 세션 강제 만료
- 특정 사용자의 전체 세션 만료

## 주요 API

- `/access/main.do`
- `/access/session/list.json`
- `/access/history/list.json`
- `/access/session/expire.json`
- `/access/session/expireUser.json`

## 관련 테이블

- `ADM_LOGIN_SESN`
- `ADM_LOGIN_HIST`
