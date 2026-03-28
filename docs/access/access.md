# 접속 관리 문서

## 개요

접속 관리는 로그인 세션과 로그인 이력을 운영자가 조회하고 제어하는 화면입니다.

## 화면 구성

탭 2개:

1. 현재 세션
2. 로그인 이력

## 주요 기능

### 현재 세션

- 현재 활성 세션 조회
- 로그인 ID, 사용자명, IP, 로그인 시각, 최근 활동 시각 확인
- 세션 강제 만료
- 사용자 기준 전체 세션 만료

### 로그인 이력

- 성공 / 실패 / 로그아웃 이력 조회
- 기본 조회 기간: 최근 1개월
- 결과 코드와 상세 사유 확인
- 그리드 기반 동적 표시

## 주요 API

- `/access/main.do`
- `/access/session/list.json`
- `/access/history/list.json`
- `/access/session/expire.json`
- `/access/session/expireUser.json`
- `/logout.json`

## 관련 테이블

- `ADM_LOGIN_SESN`
- `ADM_LOGIN_HIST`

## 비고

- 로그아웃 시 이력은 `LOGOUT`으로 기록됩니다.
- 마이페이지 수정/비밀번호 변경도 이력 코드로 남습니다.
