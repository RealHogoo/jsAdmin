# 헬스 체크 문서

## 개요

헬스 체크는 서비스 상태, DB 연결 상태, 서버 기본 정보를 확인하는 기능입니다.

## 주요 API

- `/health/main.do`
- `/health/status.json`
- `/health/db.json`
- `/health/server.json`
- `/health/live.json`
- `/health/ready.json`
- `/health/detail.json`

## 확인 항목

- DB 연결 및 ping 결과
- Hikari 풀 상태
- JVM 메모리
- 스레드 수
- 서버 가동 시간
