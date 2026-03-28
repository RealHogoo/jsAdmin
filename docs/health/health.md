# 헬스체크 문서

## 개요

헬스체크는 관리자 서비스와 연동 자원의 상태를 빠르게 확인하는 화면입니다.

## 주요 기능

- 서버 상태 조회
- DB 상태 조회
- 라이브/레디 상태 조회
- 상세 상태 요약 확인

## 주요 API

- `/health/main.do`
- `/dashboard/health.do`
- `/health/status.json`
- `/health/db.json`
- `/health/server.json`
- `/health/live.json`
- `/health/ready.json`
- `/health/detail.json`

## 비고

- 일부 공개용 상태 API와 운영용 상세 API를 구분해서 사용할 수 있습니다.
