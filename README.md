# MSA 관리자 서비스 (admin-service)

Synology NAS 기반 MSA 프로젝트 중 **1번 관리자 서비스** 소스 코드 저장소.

- 역할: 전체 서비스(스케줄링, 미디어, 웹하드)의 공통 관리자 포털 및 로그인 게이트
- 기술 스택
  - Framework: eGovFramework 3.7 (Spring 4.x)
  - Language: Java 8
  - DB: Oracle
  - ORM: MyBatis + EgovAbstractMapper
  - WAS: Apache Tomcat 8.5.x

## 주요 모듈

- **인증(Auth)**
  - 로그인/로그아웃
  - 세션 기반 인증, 인터셉터로 보호
  - 문서: `src/main/webapp/WEB-INF/views/auth/auth.md`
- **메인(Main) 대시보드**
  - 로그인 후 진입 페이지(`/main.do`)
  - 문서: `src/main/webapp/WEB-INF/views/main/main.md`
- **헬스체크**
  - `/health.do`, `/health.json` 제공
  - DB 연결 상태 확인

보다 자세한 전체 설계는  
`src/main/webapp/WEB-INF/views/admin-service.md` 를 참고한다.

## 프로젝트 구조 (요약)

```text
src/main/java
  ├─ msa.admin.auth        # 인증 모듈
  ├─ msa.admin.main        # 메인 대시보드
  └─ msa.com               # 공통(헬스체크, 인터셉터 등)

src/main/resources
  ├─ spring                # datasource, mybatis 설정
  ├─ sqlmap                # MyBatis SQL 매퍼
  └─ properties            # 환경별 DB 설정

src/main/webapp/WEB-INF/views
  ├─ auth                  # 로그인 화면 + auth.md
  ├─ main                  # 메인 화면 + main.md
  └─ admin-service.md      # 관리자 서비스 전체 개요
```
