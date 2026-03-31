# PostgreSQL SQL 가이드

`admin-service`용 PostgreSQL baseline, migration, 샘플 SQL을 정리한 디렉터리입니다.

## 주요 파일

- `apply_all.sql`
- `reset_all.sql`
- `baseline/V000__baseline.sql`
- `migrations/V001__user_security.sql`
- `migrations/V002__login_access.sql`
- `migrations/V003__refresh_token.sql`
- `migrations/V004__timeline.sql`
- `migrations/V005__api_policy.sql`
- `sample/dummy_login_history_300.sql`

## 권장 순서

1. 전체 재구성이 필요할 때만 `reset_all.sql` 실행
2. 전체 스키마 생성 시 `apply_all.sql` 실행
3. 로그인 이력 화면 테스트가 필요하면 `sample/dummy_login_history_300.sql` 실행

## 실행 예시

```bash
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/apply_all.sql
psql -h localhost -U postgres -d admin -f docs/sqls/postgres/sample/dummy_login_history_300.sql
```
