# 관리자 서비스(admin-service) 전체 설계 문서

> 파일 위치: `src/main/webapp/WEB-INF/views/admin-service.md`  
> 문서 목적: **관리자 서비스 1번**의 전체 구조, 공통 규칙, 기능 목록(현재/향후)을 한 곳에서 관리  
> 대상: PM, PL, 개발자 전원

---

## 1. 서비스 개요

### 1.1 프로젝트 전체 인프라 및 MSA 구성

- 인프라
  - Synology NAS 위에 Docker / Tomcat / 기타 서비스 컨테이너 구성
- 전체 서비스 구성 (MSA)
  1. **관리자 서비스**  
     - 기술: 전자정부프레임워크 3.7 + Spring + Oracle + MyBatis  
     - 역할: 전체 시스템의 공통 관리자 포털, SSO 게이트웨이
  2. **스케줄링 서비스**
     - 기술: Spring Boot + Gradle + PostgreSQL
     - 역할: 배치/크론성 작업, 주기적 데이터 동기화
  3. **미디어 서비스**
     - 기술: React + Django + NoSQL
     - 역할: 미디어 파일 관리, 썸네일/트랜스코딩 등
  4. **웹하드 서비스**
     - 기술: NestJS + PostgreSQL
     - 역할: 파일 업/다운로드, 권한별 스토리지 제공

- 인증/SSO 방향
  - 관리자 서비스가 **공통 로그인 진입점**
  - 추후 JWT 발급/검증을 통해 다른 서비스와 연동 예정
  - 현재 단계: 세션 기반 로그인 + 인터셉터

---

## 2. 관리자 서비스의 책임 범위

관리자 서비스는 “관리자들이 사용하는 백오피스” 역할과 동시에  
다른 MSA 서비스들을 제어/설정하는 관제센터 역할을 한다.

### 2.1 핵심 기능 영역(현재/향후)

1. **인증 / 권한 / 계정 관리**
   - 로그인/로그아웃
   - 관리자 계정 관리(등록/수정/잠금)
   - 역할(Role) 및 권한 관리
   - 메뉴 권한 매핑
2. **메뉴 관리**
   - 좌측/상단 메뉴 트리 구성 및 정렬
   - 메뉴별 접근 권한 설정
3. **공통 코드 관리**
   - 코드 그룹/코드 관리
   - 드롭다운/라디오 등 공통 코드 소스 제공
4. **시스템 모니터링**
   - 헬스체크(애플리케이션/DB)
   - 로그 조회(접속 로그, 오류 로그)
5. **배치/스케줄 관리(연동)**
   - 스케줄링 서비스와 연동된 Job 목록 조회/수정
   - 수동 실행 트리거 등
6. **기타 관리 기능**
   - 알림(공지사항, 팝업)
   - 환경설정(외부 연동 URL, SMTP 등)

---

## 3. 현재 소스 기준 구조(패키지 / 뷰)

### 3.1 Java 패키지 구조 (현재 + 확장 계획)

```text
msa
 ├─ admin
 │   ├─ auth
 │   │   ├─ persistence   # AdminAuthDAO 등
 │   │   ├─ service       # AdminAuthService
 │   │   ├─ service.impl  # AdminAuthServiceImpl
 │   │   ├─ vo            # AdminUserVO
 │   │   └─ web           # LoginController (로그인/로그아웃)
 │   ├─ main
 │   │   └─ web           # MainController (메인 대시보드)
 │   ├─ user              # ★ 향후: 사용자관리 (UserController 등)
 │   ├─ role              # ★ 향후: 권한관리 (RoleController 등)
 │   ├─ menu              # ★ 향후: 메뉴관리 (MenuController 등)
 │   ├─ code              # ★ 향후: 공통코드 관리
 │   └─ system            # ★ 향후: 로그/환경설정/배치 관리
 └─ com
     ├─ dao               # HealthCheckDAO (공통/시스템용 DAO)
     ├─ interceptor       # AuthInterceptor (세션/권한 체크)
     ├─ service           # HealthCheckService
     ├─ service.impl      # HealthCheckServiceImpl
     └─ web               # HealthCheckController (/health.do, /health.json)
 3.2 JSP / 뷰 디렉터리 구조 및 MD 배치 규칙

현재 구조:

src/main/webapp/WEB-INF/views
 ├─ admin-service.md     # 이 문서 (관리자 서비스 전체 개요)
 ├─ auth
 │   └─ login.jsp        # 로그인 화면
 ├─ health
 │   └─ health.jsp       # 헬스체크 화면 (필요 시)
 └─ main
     └─ main.jsp         # 메인 대시보드


규칙(확정)

각 기능 폴더의 루트에 해당 기능 설명용 .md 파일을 둔다.

예시:

로그인:

폴더: WEB-INF/views/auth

뷰: login.jsp

문서: login.md

사용자관리:

폴더: WEB-INF/views/user

뷰: user-list.jsp, user-form.jsp …

문서: user.md

메뉴관리:

폴더: WEB-INF/views/menu

뷰: menu-tree.jsp …

문서: menu.md

권한관리:

폴더: WEB-INF/views/role

뷰: role-list.jsp, role-menu-mapping.jsp …

문서: role.md

공통코드:

폴더: WEB-INF/views/code

문서: code.md

시스템/설정:

폴더: WEB-INF/views/system

문서: system.md, logging-sql.md 등 세분화 가능

4. 공통 개발 규칙
4.1 URL / Controller 규칙

화면 호출: *.do (JSP)

예: /login.do, /main.do, /user/list.do

데이터 처리/조회 API: *.json

예: /login.json, /user/list.json, /menu/save.json

Controller 작성 규칙:

패키지: msa.[도메인].web

클래스명: [도메인]Controller

예: LoginController, UserController, MenuController

메서드명: 화면/기능 이름 기반으로 의미 있게 작성

예: loginForm, login, listUsers, saveMenu

4.2 Service / DAO / Mapper 규칙

Service 인터페이스:

패키지: msa.[도메인].service

이름: [도메인]Service

Service 구현체:

패키지: msa.[도메인].service.impl

이름: [도메인]ServiceImpl

DAO(EgovAbstractMapper 기반):

패키지: msa.[도메인].persistence

이름: [도메인]DAO

Mapper XML:

경로: src/main/resources/sqlmap/[도메인]/[세부]/XXX_SQL.xml

네임스페이스: 소문자 카멜 + 도메인

예: adminAuth, adminUser, adminRole, adminMenu

4.3 DB 공통 규칙

테이블명: TB_ prefix 사용하지 않음

예: ADMIN_USER, ADMIN_ROLE, ADMIN_MENU, CM_CODE

모든 PK는 시퀀스 사용

유니크한 컬럼은 UNIQUE 인덱스로 별도 관리

예: UX_ADMIN_USER_LOGIN_ID

시퀀스 예시 규칙
CREATE SEQUENCE SEQ_ADMIN_USER
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON SEQUENCE SEQ_ADMIN_USER IS 'ADMIN_USER PK용 시퀀스';

유니크 인덱스 예시
CREATE UNIQUE INDEX UX_ADMIN_USER_LOGIN_ID
    ON ADMIN_USER (LOGIN_ID);

COMMENT ON INDEX UX_ADMIN_USER_LOGIN_ID IS '관리자 계정 로그인 ID 유니크';

5. 현재 구현된 기능 상세
5.1 헬스체크 (공통 / 시스템)

컨트롤러

msa.com.web.HealthCheckController

URL

/health.do : JSP 기반 헬스 페이지(또는 단순 텍스트)

/health.json : JSON 형태 상태 정보

구성 요소

DAO: msa.com.dao.HealthCheckDAO

테스트 쿼리: SELECT 1 FROM DUAL

Service: msa.com.service.HealthCheckService

ServiceImpl: msa.com.service.impl.HealthCheckServiceImpl

반환 정보(예시)

DB 연결 여부

애플리케이션 버전/빌드 정보(추가 예정)

관련 문서(추가 예정)

WEB-INF/views/health/health.md

5.2 로그인 / 로그아웃 / 세션

상세 스펙 문서는 WEB-INF/views/auth/login.md 에 작성 예정.
여기서는 전체 맥락만 정리.

주요 URL

/login.do : 로그인 화면

/login.json: 로그인 처리

/logout.do : 로그아웃 처리

컨트롤러

msa.admin.auth.web.LoginController

주요 흐름

/login.do 호출 → login.jsp 렌더링

사용자 입력 → /login.json (POST)

Service에서 ADMIN_USER 조회 + 비밀번호 검증

성공 시 세션에 LOGIN_USER 저장

실패 시 JSON 응답으로 에러 메시지 반환

/logout.do → 세션 invalidate 후 /login.do 리다이렉트

세션 정보(초기 구조)

세션 키: LOGIN_USER

값: AdminUserVO 또는 DTO (userId, loginId, userNm, email, roles 등)

DB 테이블

ADMIN_USER

DAO/Service

msa.admin.auth.persistence.AdminAuthDAO

msa.admin.auth.service.AdminAuthService

msa.admin.auth.service.impl.AdminAuthServiceImpl

5.3 AuthInterceptor (세션 / 권한 체크 기본)

위치: msa.com.interceptor.AuthInterceptor

설정: WEB-INF/spring/dispatcher-servlet.xml 의 <mvc:interceptors>

동작

요청 URI 로그 (DEBUG)

예외 URL(로그인/헬스/정적 리소스) → 통과

이외 URL:

세션에서 LOGIN_USER 확인

없으면:

화면(*.do) → /login.do 로 리다이렉트

API(*.json) → JSON 에러 응답(추후 세분화)

향후 확장

roles 기반 URL 접근 제어(권한관리와 연계)

JWT 발급/검증 로직으로 확장 가능

5.4 메인 화면 (대시보드)

URL: /main.do

JSP: WEB-INF/views/main/main.jsp

컨트롤러: msa.admin.main.web.MainController

기능

로그인 후 Landing Page

추후:

시스템 요약 상태(헬스, 알림, 최근 배치 실패 등) 표시

사용자별 즐겨찾기 메뉴 등

6. 앞으로 구현할 주요 기능 설계(초안)
6.1 사용자 관리 (User Management)

목표

관리자 계정의 CRUD 관리

비밀번호 초기화, 잠금/해제

JSP/문서

폴더: WEB-INF/views/user

뷰:

user-list.jsp : 사용자 목록/검색

user-form.jsp : 등록/수정

문서:

user.md : 화면/API/DB/권한 설계

URL 예시

/user/list.do : 목록 화면

/user/list.json : 목록 조회

/user/detail.json : 상세 조회

/user/save.json : 등록/수정

/user/delete.json : 삭제/비활성화

DB 테이블(예상)

ADMIN_USER

이미 존재(로그인에서 사용) → CRUD 확장

ADMIN_USER_ROLE

사용자별 역할 매핑

주요 시퀀스

SEQ_ADMIN_USER (기존)

유니크 인덱스

UX_ADMIN_USER_LOGIN_ID (중복 ID 방지)

6.2 권한관리 (Role / Permission Management)

목표

역할(Role) 정의

메뉴/기능 단위 권한 부여

JSP/문서

폴더: WEB-INF/views/role

뷰:

role-list.jsp : 역할 목록

role-form.jsp : 역할 등록/수정

role-user-mapping.jsp : 역할 ↔ 사용자 매핑

role-menu-mapping.jsp : 역할 ↔ 메뉴 매핑

문서:

role.md

URL 예시

/role/list.do, /role/list.json

/role/save.json

/role/user-mapping.json

/role/menu-mapping.json

DB 테이블(예상)

ADMIN_ROLE

ROLE_ID (PK, 시퀀스)

ROLE_CD (유니크 코드)

ROLE_NM, USE_YN, 설명

ADMIN_USER_ROLE

USER_ID, ROLE_ID (복합 PK)

ADMIN_ROLE_MENU

ROLE_ID, MENU_ID (복합 PK)

시퀀스/인덱스 예시

CREATE SEQUENCE SEQ_ADMIN_ROLE
    START WITH 1
    INCREMENT BY 1
    NOCACHE NOCYCLE;

COMMENT ON SEQUENCE SEQ_ADMIN_ROLE IS 'ADMIN_ROLE PK용 시퀀스';

CREATE UNIQUE INDEX UX_ADMIN_ROLE_CD
    ON ADMIN_ROLE (ROLE_CD);

COMMENT ON INDEX UX_ADMIN_ROLE_CD IS '역할 코드 유니크 인덱스';

6.3 메뉴 관리 (Menu Management)

목표

관리자 화면의 좌측/상단 메뉴 트리 관리

메뉴별 URL/권한/정렬 순서 정의

JSP/문서

폴더: WEB-INF/views/menu

뷰:

menu-tree.jsp : 트리 구조 관리 화면

menu-form.jsp : 메뉴 상세/등록/수정

문서:

menu.md

URL 예시

/menu/tree.do / /menu/tree.json

/menu/save.json

/menu/delete.json

DB 테이블(예상)

ADMIN_MENU

MENU_ID (PK, 시퀀스)

PARENT_MENU_ID (부모)

MENU_NM, MENU_LVL, SORT_ORD

URL, USE_YN, ICON 등

ADMIN_ROLE_MENU (위 권한관리에서 정의)

시퀀스 예시

CREATE SEQUENCE SEQ_ADMIN_MENU
    START WITH 1
    INCREMENT BY 1
    NOCACHE NOCYCLE;

COMMENT ON SEQUENCE SEQ_ADMIN_MENU IS 'ADMIN_MENU PK용 시퀀스';

6.4 공통 코드 관리 (Common Code)

목표

시스템 전반에서 사용하는 코드(상태, 유형 등)를 중앙에서 관리

JSP/문서

폴더: WEB-INF/views/code

뷰:

code-group-list.jsp, code-group-form.jsp

code-list.jsp, code-form.jsp

문서:

code.md

DB 테이블(예상)

CM_CODE_GROUP

GRP_ID, GRP_CD, GRP_NM, 설명, USE_YN 등

CM_CODE

CODE_ID, GRP_ID, CODE, CODE_NM, SORT_ORD, USE_YN 등

시퀀스 예시

CREATE SEQUENCE SEQ_CM_CODE_GROUP;
COMMENT ON SEQUENCE SEQ_CM_CODE_GROUP IS 'CM_CODE_GROUP PK용 시퀀스';

CREATE SEQUENCE SEQ_CM_CODE;
COMMENT ON SEQUENCE SEQ_CM_CODE IS 'CM_CODE PK용 시퀀스';

6.5 시스템 / 로그 / 환경설정

목표

시스템 상태/로그 조회

환경설정(예: 외부 연동, SMTP, 알림 설정 등)

JSP/문서

폴더: WEB-INF/views/system

문서: system.md, logging-sql.md, log-viewer.md 등 분리

기능 항목(예상)

접속 로그 조회

테이블: SYS_ACCESS_LOG

컬럼: ACCESS_ID(PK), USER_ID, URI, METHOD, IP, 브라우저정보, 발생일시

오류 로그 조회

테이블: SYS_ERROR_LOG

스택트레이스 요약, 메시지, 발생 시각

SQL 로그 정책

현재 구현된 log4jdbc + log4j2 구조를 문서화
(별도 logging-sql.md 에 자세히 기록)

환경설정

테이블: SYS_CONFIG

KEY/VALUE 방식 구성

6.6 배치 / 스케줄 관리 연동

목표

별도 스케줄링 서비스(Spring Boot)와 연동하여

Job 리스트 조회

실행 이력 조회

수동 실행 트리거 등 제공

JSP/문서

폴더: WEB-INF/views/batch

문서: batch.md

구현 방식(초안)

관리자 서비스 ↔ 스케줄링 서비스 REST 호출

JWT 혹은 토큰 기반 호출 권한 관리

7. 개발용 SQL 로그 환경(요약)

자세한 내용은 추후 WEB-INF/views/system/logging-sql.md 에 상세 기록.
여기서는 “관리자 서비스 전체 설계” 관점에서 핵심만 정리.

dev 환경

db-dev.properties 에 log4jdbc 드라이버 설정

db.driver=net.sf.log4jdbc.sql.jdbcapi.DriverSpy

db.url=jdbc:log4jdbc:oracle:thin:@localhost:1521/admin

log4jdbc.log4j2.properties 에 SLF4J 델리게이터 사용

log4jdbc.spylogdelegator.name=net.sf.log4jdbc.log.slf4j.Slf4jSpyLogDelegator

log4j2.xml 로거 설정

jdbc.sqlonly : DEBUG → 파라미터 치환된 SQL만 출력

jdbc.resultsettable, jdbc.resultset, jdbc.connection 등은 level="off"

prod 환경

Oracle 순수 드라이버 사용

SQL 로그는 DB/이벤트 기반 모니터링으로 대체    
     
     
