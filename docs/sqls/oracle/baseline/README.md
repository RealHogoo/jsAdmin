# Oracle baseline 안내

신규 Oracle 환경에서 처음 설치할 때 사용하는 전체 초기 스키마 위치입니다.

포함 파일:

- `V000__baseline.sql`

포함 범위:

- 사용자
- 메뉴 및 권한
- 공통 코드, 공지, 타임라인
- 로그인 세션 및 로그인 이력
- refresh token
- API 정책

주의사항:

- `DEPT_SEQ`처럼 외부 마스터에 의존하는 컬럼은 유지하되 FK는 포함하지 않습니다.
- 이후 구조 변경은 `../migrations/` 아래에 버전 SQL로 추가합니다.
