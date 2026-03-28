# 사용자 관리 문서

## 개요

사용자 관리는 관리자 계정 생성, 수정, 비활성화, 잠금 해제, 비밀번호 초기화를 담당합니다.

## 주요 기능

- 사용자 목록 조회
- 상세 조회
- 신규 등록
- 수정
- 비활성화
- 잠금 해제
- 비밀번호 초기화

## 주요 정책

- `ADMIN`만 슈퍼 계정으로 취급
- `ADMIN` 외 로그인 ID는 소문자만 허용
- 비밀번호 초기화 시 ID와 동일한 값으로 초기화
- 초기화 후에는 `PWD_RESET_YN='Y'`로 표시

## 주요 API

- `/user/main.do`
- `/user/list.json`
- `/user/detail.json`
- `/user/save.json`
- `/user/delete.json`
- `/user/unlock.json`
- `/user/resetPassword.json`

## 관련 테이블

- `ADM_USER_MST`

## 비고

- 비밀번호는 BCrypt 해시 저장
- 기존 평문 계정은 로그인 시 자동 해시 승격
