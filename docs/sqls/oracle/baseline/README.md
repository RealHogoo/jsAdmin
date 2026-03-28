# Oracle baseline 안내

신규 Oracle 환경에 처음 설치할 때 사용하는 전체 초기 스키마 위치입니다.

파일:

- `V000__baseline.sql`

포함 범위:

- 사용자/권한/메뉴
- 코드/공지/타임라인
- 로그인 세션/로그인 이력
- refresh token
- API 정책

주의:

- 외부 마스터 테이블이 필요한 `DEPT_SEQ`는 컬럼만 유지하고 FK는 포함하지 않았습니다.
- 이후 구조 변경은 `../migrations/`에 버전별 SQL을 추가합니다.
