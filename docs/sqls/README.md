# SQL 배포 가이드

## 원칙

- 애플리케이션 기동 시 자동 DDL 반영은 사용하지 않습니다.
- 배포 시 SQL은 별도 절차로 반영하는 것을 권장합니다.
- DB 벤더별로 스크립트를 분리합니다.

## 디렉터리 구조

```text
docs/sqls/
|- oracle/
|  |- baseline/
|  `- migrations/
`- postgres/
   |- baseline/
   `- migrations/
```

## 버전 규칙

- baseline: `V000__baseline.sql`
- migrations: `V001__...sql`, `V002__...sql`

기존 SQL을 수정하기보다 다음 버전 SQL을 추가하는 방식을 권장합니다.

## baseline

신규 환경에서 처음 설치할 때 사용하는 전체 초기 스키마입니다.

포함 범위:

- 사용자
- 메뉴 및 권한
- 공통 코드
- 공지사항
- 타임라인
- 로그인 세션 및 이력
- refresh token
- API 정책

## migrations

기존 환경 업그레이드 시 순서대로 반영하는 변경 SQL입니다.
