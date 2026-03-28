# API 정책 관리 문서

## 개요

API 정책 관리는 외부 API와 내부 연동 정책을 한 화면에서 관리합니다.

## 화면 구성

탭 2개:

1. 외부 API
2. 내부 연동

## 주요 기능

- 정책 목록 조회
- 정책 등록/수정
- 정책 미사용 처리
- API 타입별 분리 조회

## 관리 항목

- 정책명
- 호출 주체
- 대상 서비스
- HTTP Method
- API Pattern
- 인증 방식
- 사용 여부
- 설명

## 주요 API

- `/api/main.do`
- `/api/list.json`
- `/api/save.json`
- `/api/delete.json`

## 관련 테이블

- `ADM_API_MST`

## 설계 메모

- 외부 / 내부 정책은 한 테이블에서 `API_TYPE`으로 구분합니다.
- 내부 정책은 서비스 간 allowlist 관리 목적입니다.
