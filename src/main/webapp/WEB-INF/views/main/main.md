---

## 2. `src/main/webapp/WEB-INF/views/main/main.md`

```markdown
# 메인(Main) 대시보드 모듈 설계 문서

> 파일 위치: `src/main/webapp/WEB-INF/views/main/main.md`  
> 관련 JSP: `src/main/webapp/WEB-INF/views/main/main.jsp`  
> 관련 패키지: `msa.admin.main.web.MainController`

---

## 1. 모듈 개요

### 1.1 목적

- 로그인 이후 가장 먼저 진입하는 **메인 대시보드 화면**을 제공한다.
- 관리자 입장에서 전체 시스템 상태와 주요 메뉴로 빠르게 이동할 수 있도록 한다.
- 현재는 단순한 “로그인 성공 후 랜딩 페이지” 수준이지만,  
  단계적으로 **대시보드 기능**을 확장할 예정이다.

### 1.2 책임 범위

1. 로그인 이후 최초 진입 화면(`/main.do`) 제공
2. 세션에 저장된 로그인 사용자 정보를 화면에 표시
3. 향후:
   - 시스템 상태 요약(헬스체크 결과, 오류 요약)
   - 다른 MSA 서비스들의 상태 요약(스케줄링/미디어/웹하드)
   - 최근 작업/공지사항/알림 표시
   - 사용자별 즐겨찾는 메뉴, 최근 접근 메뉴 등

---

## 2. 화면 및 엔드포인트 정의

### 2.1 메인 화면

- URL: `/main.do`
- HTTP Method: GET
- View: `WEB-INF/views/main/main.jsp`
- Controller 메서드:
  - `msa.admin.main.web.MainController.main(HttpSession session, Model model)`

#### 2.1.1 처리 흐름

1. `AuthInterceptor` 에서 세션(`LOGIN_USER`) 존재 여부 체크
   - 없으면 `/login.do` 로 리다이렉트 (로그인 필요)
2. 세션에서 로그인 사용자 정보(`LOGIN_USER`) 가져오기
3. JSP에 전달할 모델 데이터 구성:
   - 로그인 사용자 이름/ID
   - 향후: 역할/권한, 즐겨찾는 메뉴 등
4. `main.jsp` 렌더링

#### 2.1.2 화면 구성(초기 버전)

초기 버전 기준 섹션 구상:

1. 헤더 영역
   - 시스템 타이틀: 예) “MSA 관리자 포털”
   - 로그인 사용자 정보 표시: “{userNm} ({loginId}) 님 환영합니다.”
   - 로그아웃 링크(`/logout.do`)
2. 좌측 메뉴 영역(또는 상단 메뉴)
   - 메뉴관리에서 정의한 메뉴 구조를 기반으로 렌더링 (추후 연동)
3. 메인 콘텐츠 영역
   - 간단한 안내 문구:
     - “왼쪽 메뉴에서 기능을 선택하세요.”
   - 헬스체크 요약 박스(향후):
     - 관리자 서비스 DB 상태
     - 스케줄링/미디어/웹하드 연동 상태
4. 푸터 영역
   - 시스템 버전, 저작권 등

---

### 2.2 대시보드 데이터 API (향후)

현재는 메인 화면에서 별도의 Ajax 호출 없이 렌더링만 하지만,  
대시보드 고도화 시 아래와 같은 API를 도입할 수 있다.

#### 2.2.1 시스템 상태 요약 API (예정)

- URL: `/main/status.json`
- HTTP Method: GET
- 역할:
  - 헬스체크 결과 요약 제공
  - 각 MSA 서비스 상태 요약 제공
- 응답 예시:

```json
{
  "success": true,
  "message": "",
  "data": {
    "adminService": { "status": "UP" },
    "schedulerService": { "status": "UP" },
    "mediaService": { "status": "DOWN" },
    "webhardService": { "status": "UP" }
  }
}
2.2.2 최근 알림/공지 API (예정)
URL: /main/notices.json

역할:

최근 공지사항, 시스템 알림 목록 제공

3. 세션 연동
메인 화면 접근은 항상 로그인 이후라고 가정한다.

세션에서 로그인 사용자 정보(LOGIN_USER)를 가져와 화면에 표시한다.

예시 코드 흐름:

java
코드 복사
// MainController.main(...)
AdminUserVO loginUser = (AdminUserVO) session.getAttribute("LOGIN_USER");
model.addAttribute("loginUser", loginUser);
return "main/main";
JSP 예시:

jsp
코드 복사
<c:if test="${not empty loginUser}">
    <div class="welcome">
        ${loginUser.userNm} (${loginUser.loginId}) 님 환영합니다.
    </div>
</c:if>
4. 권한/메뉴와의 관계 (향후)
메인 화면은 다음 역할을 한다.

메뉴 관리와 연동된 실제 메뉴 트리 렌더링의 루트

좌측/상단 메뉴는 ADMIN_MENU / ADMIN_ROLE_MENU 등과 연동될 예정

권한에 따른 접근 가능한 메뉴만 노출

로그인한 사용자의 역할(Role)에 따라 메뉴 필터링

사용자별 대시보드 구성

권한/업무에 따라 다른 위젯/메뉴를 우선적으로 보여줄 수 있음

메뉴/권한 관리 설계는
WEB-INF/views/menu/menu.md, WEB-INF/views/role/role.md 에서 자세히 기록한다.

5. 관련 Java 클래스
5.1 MainController
패키지: msa.admin.main.web

클래스: MainController

주요 책임:

/main.do 요청 처리

향후: /main/status.json, /main/notices.json 등 대시보드 관련 API 처리

예상 메서드:

java
코드 복사
@RequestMapping("/main.do")
public String main(HttpSession session, Model model) {
    // 세션에서 로그인 사용자 정보 조회
    AdminUserVO loginUser = (AdminUserVO) session.getAttribute("LOGIN_USER");
    model.addAttribute("loginUser", loginUser);
    return "main/main";
}
5.2 다른 모듈과의 의존 관계
Auth 모듈

세션에 LOGIN_USER 를 넣어주는 주체

AuthInterceptor로 /main.do 접근 권한 기본 보장

Health 모듈

대시보드의 “시스템 상태 요약” 데이터를 제공할 수 있음

메뉴/권한 모듈(향후)

메인 화면에서 렌더링할 메뉴 트리 정보를 제공

6. DB와의 관계
현재 메인 화면 자체는 DB에 직접 의존하지 않는다.
그러나 향후 다음과 같은 데이터 소스를 사용할 수 있다.

시스템 헬스/로그 테이블

예: SYS_ACCESS_LOG, SYS_ERROR_LOG, SYS_HEALTH_HISTORY

공지사항/알림 테이블

예: ADMIN_NOTICE

배치/스케줄 이력

예: 스케줄링 서비스와 연동하여 별도 DB 또는 API 사용

메인 모듈 자체에서 DB 설계는 갖지 않고,
각 도메인(공지, 로그, 배치 등)의 모듈 설계를 참조하는 방식으로 구성한다.

7. 에러/예외 케이스
케이스	설명	처리 방식
세션 없음 상태에서 /main.do	비로그인 사용자가 직접 URL로 접근	AuthInterceptor에서 /login.do 로 이동
세션 정보는 있으나 VO 필드 누락	잘못된 세션 저장, 배포 중 구조 변경 등	공통 에러 페이지 또는 로그인 재요청
대시보드 데이터 API 실패	헬스/알림 API 호출 실패	메인 화면에서 해당 위젯에 오류 메시지 표시

8. TODO / 향후 확장 계획
메인 대시보드 위젯 설계

헬스체크 요약

최근 로그인/접속 현황

배치 실패/지연 Job 요약

사용자별 즐겨찾기 메뉴 기능

즐겨찾기 테이블 설계 (예: ADMIN_FAVORITE_MENU)

최근 사용 메뉴 목록

접속 로그 기반으로 최근 N개 메뉴 표시

알림/공지 위젯

ADMIN_NOTICE 테이블과 연동

다른 MSA 서비스 상태 모니터링

각 서비스별 /health 호출 결과를 모아서 표시

UI/UX 개선

반응형 레이아웃

공통 헤더/푸터/사이드바 컴포넌트 분리