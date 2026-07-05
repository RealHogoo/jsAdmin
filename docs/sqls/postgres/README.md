# PostgreSQL SQL Guide

이 디렉터리는 `admin-service` PostgreSQL 스키마와 배포 SQL을 관리한다.

## 주요 파일

- `apply_all.sql`: 신규 환경 전체 적용용
- `reset_all.sql`: 로컬/개발 초기화용
- `baseline/V000__baseline.sql`: 기준 스키마와 기본 seed
- `migrations/`: 기능별 누적 migration
- `deploy-*.sql`: 운영 배포에 바로 사용할 idempotent SQL

## 신규 환경 적용

```bash
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/apply_all.sql
```

`apply_all.sql`은 baseline 이후 현재 필요한 migration seed를 순서대로 적용한다.

## 운영 배포 적용

운영에서는 전체 reset을 수행하지 않는다. 해당 배포에 필요한 `deploy-*.sql`만 DB 백업 후 적용한다.

현재 인증/보안 관련 추가 SQL:

```bash
psql -h <host> -U <user> -d <database> -f docs/sqls/postgres/deploy-20260705-qr-login.sql
psql -h <host> -U <user> -d <database> -f docs/sqls/postgres/deploy-20260705-login-rate-limit.sql
```

## 이번 보안 테이블

- `adm_qr_login_req`: QR 로그인 요청, 승인, 사용 상태 저장
- `adm_login_rate_limit`: IP 기준 로그인 실패 제한 상태 저장

두 SQL은 `CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`를 사용해서 반복 실행 가능하게 작성되어 있다.

## 주의

- `reset_all.sql`은 데이터 삭제가 필요한 개발 환경에서만 사용한다.
- 운영 코드 배포 전에 신규 테이블 SQL을 먼저 적용한다.
- schema 기준 파일을 수정할 때는 대응되는 deploy SQL도 함께 추가한다.
