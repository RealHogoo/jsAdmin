# 인증(Auth) 모듈 설계 문서

> 파일 위치: `src/main/webapp/WEB-INF/views/auth/auth.md`  
> 관련 JSP: `src/main/webapp/WEB-INF/views/auth/login.jsp`  
> 관련 패키지: `msa.admin.auth.*`, `msa.com.interceptor.AuthInterceptor`

---

## 1. 모듈 개요

### 1.1 목적

- 관리자 서비스 전체의 **인증(로그인/로그아웃)** 과 세션 관리를 담당한다.
- 이후 확장될 **권한(Authorization) / SSO(JWT)** 의 기반이 되는 모듈이다.
- 공통 규칙:
  - 화면 호출: `*.do`
  - 데이터 처리/조회: `*.json`
  - 로그인 상태/권한 검증: `AuthInterceptor`에서 처리

### 1.2 책임 범위

1. 로그인 화면 제공 (`/login.do`)
2. 로그인 처리 (`/login.json`)
3. 로그아웃 처리 (`/logout.do`)
4. 세션에 로그인 사용자 정보 저장 및 조회
5. 인터셉터(AuthInterceptor)를 통한 로그인 여부 검증
6. 향후 확장:
   - 비밀번호 변경
   - 비밀번호 실패 횟수/계정 잠금
   - SSO/JWT 토큰 발급 및 검증

---

## 2. 화면 및 엔드포인트 정의

### 2.1 로그인 화면

- URL: `/login.do`
- HTTP Method: GET
- View: `WEB-INF/views/auth/login.jsp`
- Controller 메서드:
  - `msa.admin.auth.web.LoginController.loginForm(HttpServletRequest request, Model model)`
- 기능 설명:
  - 로그인 페이지를 렌더링한다.
  - 이미 로그인된 사용자가 접근했을 때의 처리 정책(예: `/main.do`로 리다이렉트)은 추후 옵션으로 추가 가능.

#### 2.1.1 화면 요소(기본)

- ID 입력 필드: `input[name="loginId"]`
- PW 입력 필드: `input[name="password"]` (type="password")
- 로그인 버튼
- 오류 메시지 영역 (서버/클라이언트에서 전달된 에러 메시지 표시)
- 향후 요소:
  - 비밀번호 변경 링크
  - 비밀번호 초기화(재발급) 링크
  - 다국어 지원을 위한 텍스트 메시지 키 사용

---

### 2.2 로그인 처리 API

- URL: `/login.json`
- HTTP Method: POST
- Content-Type: `application/x-www-form-urlencoded`  
  (추후 `application/json` 으로 확장 가능)
- Controller 메서드:
  - `msa.admin.auth.web.LoginController.login(HttpServletRequest request)`

#### 2.2.1 요청 파라미터 정의

| 항목     | 타입   | 필수 | 설명                           |
|----------|--------|------|--------------------------------|
| loginId  | String | Y    | 로그인 ID (ADMIN_USER.LOGIN_ID) |
| password | String | Y    | 비밀번호 (현재 평문, 추후 암호화 전송 예정) |

#### 2.2.2 공통 응답 구조

현재는 문자열(JSON 문자열) 형태로 리턴하지만,  
논리적 구조는 아래와 같이 통일해서 사용한다.

```json
{
  "success": true,
  "message": "",
  "data": {
    "loginId": "admin",
    "userNm": "시스템 관리자",
    "roles": []
  }
}
필드 설명:

항목	타입	설명
success	Boolean	처리 성공 여부
message	String	사용자에게 보여줄 메시지(오류/주의/정보 등)
data	Object	실제 응답 데이터(로그인 성공 시 사용자 정보 등)

2.2.3 로그인 성공 시 동작
ADMIN_USER 테이블에서 LOGIN_ID 와 USE_YN = 'Y' 조건으로 사용자 조회

비밀번호 비교

현재: 평문 비교 (예: inputPw.equals(dbUserPw))

향후: 해시(BCrypt 등) 비교로 변경 예정

비밀번호 일치 시:

세션에 로그인 사용자 정보 저장

세션 키: LOGIN_USER

값: AdminUserVO 또는 별도의 DTO

JSON 응답:

success = true

message = "" 또는 환영 메시지

data 에 loginId, userNm, roles 등 포함

FE(자바스크립트)에서 응답을 보고 /main.do 로 이동

2.2.4 로그인 실패 시 동작
아이디 없음

조건: ADMIN_USER 조회 결과가 없음

응답:

json
코드 복사
{
  "success": false,
  "message": "아이디 또는 비밀번호가 올바르지 않습니다.",
  "data": null
}
비밀번호 불일치

조건: 조회된 사용자 존재, inputPw != dbUserPw

로그:

AdminAuthServiceImpl 에서 “로그인 실패 - 비밀번호 불일치: {loginId}” 로그 기록

응답: 위와 동일 구조의 실패 응답

계정 비활성화 (USE_YN != 'Y')

추후 정책으로 분리:

메시지 예: "사용이 중지된 계정입니다. 관리자에게 문의하세요."

2.3 로그아웃 처리
URL: /logout.do

HTTP Method: GET

Controller 메서드:

msa.admin.auth.web.LoginController.logout(HttpServletRequest request)

동작:

request.getSession(false) 로 세션 객체 조회

세션이 존재하면 invalidate() 호출

/login.do 로 리다이렉트

특징:

세션이 없는 상태에서 호출해도 예외 없이 동작해야 한다.

추후: 로그아웃 이력 기록(접속 로그 테이블)로 확장 가능

3. 세션 구조 및 인터셉터(AuthInterceptor)
3.1 세션 구조
세션 키: LOGIN_USER

값: AdminUserVO 또는 세션 전용 DTO

예상 필드:

필드	타입	설명
userId	Long	사용자 PK (USER_ID)
loginId	String	로그인 ID
userNm	String	사용자 이름
email	String	이메일
roles	List<?>	사용자 역할 목록(향후)

3.2 AuthInterceptor 개요
클래스: msa.com.interceptor.AuthInterceptor

역할:

로그인 여부(세션 유무) 체크

추후: 역할/권한 체크로 확장

등록 위치:

WEB-INF/spring/dispatcher-servlet.xml 내 <mvc:interceptors> 설정

3.2.1 적용/제외 URL 패턴 (예시)
기본 적용 패턴:

/**

제외(화이트리스트) URL:

/login.do

/login.json

/logout.do (로그아웃은 세션 없어도 접근 허용)

/health.do, /health.json

정적 리소스:

/css/**

/js/**

/images/**

기타 리소스 경로

3.2.2 처리 로직 (요약)
요청 URI를 DEBUG 로그로 남김.

요청 URI가 예외 리스트에 해당하면 통과.

그렇지 않으면 세션에서 LOGIN_USER 조회.

값이 없으면:

*.do 요청:

/login.do 로 리다이렉트 (쿼리스트링에 원래 URL을 붙일지 여부는 정책으로 결정)

*.json 요청:

JSON 형태의 에러 응답을 내려주는 방식으로 확장 예정
(예: HTTP 401, { success: false, message: "로그인이 필요합니다." })

4. DB 설계 (인증 관련)
4.1 ADMIN_USER 테이블
테이블명: ADMIN_USER

용도: 관리자 계정 정보 저장

컬럼	타입	PK	NOT NULL	기본값	설명
USER_ID	NUMBER(19)	Y	Y		사용자 PK
LOGIN_ID	VARCHAR2(50)		Y		로그인 ID
USER_PW	VARCHAR2(200)		Y		비밀번호(해시 저장 예정)
USER_NM	VARCHAR2(100)		Y		사용자 이름
EMAIL	VARCHAR2(200)		N		이메일
USE_YN	CHAR(1)		Y	'Y'	사용 여부(Y/N)
REG_DT	DATE		Y	SYSDATE	등록일시
UPD_DT	DATE		N		수정일시

4.1.1 시퀀스
sql
코드 복사
CREATE SEQUENCE SEQ_ADMIN_USER
    START WITH 1
    INCREMENT BY 1
    NOCACHE
    NOCYCLE;

COMMENT ON SEQUENCE SEQ_ADMIN_USER IS 'ADMIN_USER PK용 시퀀스';
4.1.2 유니크 인덱스
sql
코드 복사
CREATE UNIQUE INDEX UX_ADMIN_USER_LOGIN_ID
    ON ADMIN_USER (LOGIN_ID);

COMMENT ON INDEX UX_ADMIN_USER_LOGIN_ID IS '관리자 계정 로그인 ID 유니크';
4.2 로그인 조회 SQL (Mapper 기준)
Mapper 파일: src/main/resources/sqlmap/admin/auth/AdminAuth_SQL.xml

네임스페이스: adminAuth

sql
코드 복사
SELECT
    USER_ID   AS userId,
    LOGIN_ID  AS loginId,
    USER_PW   AS userPw,
    USER_NM   AS userNm,
    EMAIL     AS email,
    USE_YN    AS useYn
FROM ADMIN_USER
WHERE LOGIN_ID = #{loginId}
  AND USE_YN = 'Y'
5. Java 클래스 매핑
5.1 Controller
클래스: msa.admin.auth.web.LoginController

역할:

로그인 화면, 로그인 처리, 로그아웃 처리 담당

주요 메서드:

loginForm(HttpServletRequest, Model) → /login.do

login(HttpServletRequest) → /login.json

logout(HttpServletRequest) → /logout.do

5.2 Service
인터페이스: msa.admin.auth.service.AdminAuthService

구현체: msa.admin.auth.service.impl.AdminAuthServiceImpl

역할:

로그인 비즈니스 로직

비밀번호 검증, 실패 로깅

향후: 비밀번호 변경/잠금/로그인 이력 관리 등

5.3 DAO / Mapper
DAO: msa.admin.auth.persistence.AdminAuthDAO

상속: EgovAbstractMapper

메서드 예:

AdminUserVO selectUserForLogin(AdminUserVO param)

Mapper XML: sqlmap/admin/auth/AdminAuth_SQL.xml

5.4 VO
클래스: msa.admin.auth.vo.AdminUserVO

필드:

private Long userId;

private String loginId;

private String userPw;

private String userNm;

private String email;

private String useYn;

용도:

로그인 조회 결과 매핑

세션에 저장되는 사용자 정보의 기본형

5.5 인터셉터
클래스: msa.com.interceptor.AuthInterceptor

역할:

세션 기반 로그인 여부 검증

추후: 역할/권한 체크

6. 에러/예외 케이스 정의
케이스	설명	처리 방식
존재하지 않는 ID	ADMIN_USER 조회 결과 없음	success=false, 공통 메시지 반환
비밀번호 불일치	조회 결과는 있으나 비밀번호 다름	success=false, 동일 메시지, 서비스에서 실패 로그 기록
USE_YN != 'Y'	비활성/잠금 계정	별도 메시지 정의 가능, 정책에 따라 분리
세션 없음 상태에서 /main.do	비로그인 사용자가 메인으로 직접 접근	/login.do 로 리다이렉트
세션 없음 상태에서 *.json 호출	인증이 필요한 JSON API에 비로그인 접근	HTTP 401 + JSON 에러(추후 구현)
DB 연결 오류	로그인 처리 중 DB 예외 발생	공통 에러 페이지/에러 JSON으로 위임

7. TODO / 향후 확장 계획
비밀번호 암호화

BCrypt 등 해시 알고리즘 적용

기존 평문 비밀번호 마이그레이션 방안 검토

로그인 실패 횟수/잠금 정책

실패 횟수 저장 테이블 또는 컬럼 추가

일정 횟수 이상 실패 시 계정 잠금 처리

로그인 이력 테이블 설계

ADMIN_LOGIN_HISTORY (예정)

IP, 브라우저, 성공/실패 여부 기록

SSO / JWT 연동

로그인 성공 시 JWT 발급

다른 MSA 서비스가 해당 JWT를 검증하는 구조 마련

비밀번호 변경/초기화

/auth/password-change.do, /auth/password-change.json

/auth/password-reset.do 등 추가 예정

세션 타임아웃/동시 접속 제어

중복 로그인 방지(옵션)

마지막 접속 시각 업데이트 및 알림 기능