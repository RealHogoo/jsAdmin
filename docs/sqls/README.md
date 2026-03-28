# SQL 배포 가이드

## 원칙

- 서비스 기동 시 자동 DDL 반영은 개발 편의용으로만 사용합니다.
- 운영 배포는 이 폴더의 SQL을 기준으로 별도 반영하는 것을 권장합니다.
- DB 벤더별로 스크립트를 분리합니다.

## 폴더 구조

```text
docs/sqls/
├─ oracle/
│  ├─ baseline/
│  └─ migrations/
└─ postgres/
   ├─ baseline/
   └─ migrations/
```

## 버전 규칙

- baseline:
  - `V000__baseline.sql`
- migrations:
  - `V001__...sql`
  - `V002__...sql`
- 기존 SQL을 수정하기보다 다음 버전 파일을 추가하는 방식을 권장합니다.

## baseline

신규 환경에 처음 설치할 때 사용하는 전체 초기 스키마입니다.

현재 baseline에는 아래 테이블이 포함됩니다.

- `ADM_USER_MST`
- `ADM_MENU_MST`
- `ADM_AUTH_GROUP`
- `ADM_AUTH_GROUP_USER`
- `ADM_AUTH_GROUP_DEPT`
- `ADM_AUTH_MENU`
- `ADM_AUTH_USER`
- `ADM_CODE_MST`
- `ADM_NOTI_MST`
- `ADM_TIMELINE_MST`
- `ADM_LOGIN_SESN`
- `ADM_LOGIN_HIST`
- `ADM_REFRESH_TOKEN`
- `ADM_API_MST`

## migrations

기존 설치 환경을 업그레이드할 때 순서대로 적용하는 변경분입니다.

현재 migrations에는 아래 변경이 정리되어 있습니다.

- 사용자 보안 컬럼 추가
- 로그인 세션 / 로그인 이력 추가
- refresh token 추가
- 타임라인 추가
- API 정책 추가

## 비고

- Oracle baseline은 일반 `CREATE TABLE / CREATE SEQUENCE / CREATE INDEX` 기준입니다.
- PostgreSQL baseline은 Oracle 구조를 기준으로 포팅한 초기 설치본입니다.
- `DEPT_SEQ`처럼 외부 마스터에 의존하는 컬럼은 유지하되, 외부 테이블 FK는 baseline에 포함하지 않았습니다.
