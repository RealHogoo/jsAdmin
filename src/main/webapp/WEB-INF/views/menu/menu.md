# 메뉴(Menu) 관리 모듈 설계 문서

> 파일 위치: `src/main/webapp/WEB-INF/views/menu/menu.md`  
> 관련 JSP: `src/main/webapp/WEB-INF/views/menu/menuList.jsp`  
> 관련 패키지: `msa.admin.menu.*`  
> 연관 문서: `WEB-INF/views/main/main.md` (메인 화면에서 메뉴 트리 렌더링 기준)

---

## 1. 모듈 개요

### 1.1 목적

- 관리자 서비스의 **좌측/상단 메뉴 트리 구조**를 관리하는 모듈.
- 메뉴의 계층 구조(상위/하위), 사용 여부, 정렬 순서 등을 **DB 기반으로 관리**한다.
- 메인 화면 및 기타 화면의 **네비게이션 영역에 표시할 메뉴 데이터의 단일 소스** 역할.

### 1.2 책임 범위

1. 메뉴 트리(ADMIN_MENU)의 생성/수정/논리 삭제
2. 상위 메뉴/하위 메뉴 계층 구조 관리 (`UP_MENU_ID`)
3. 정렬 순서(`SORT_ORD`) 관리
4. **메인 화면 좌측 메뉴에 제공할 메뉴 리스트 제공**
5. 향후:
   - 권한(ROLE)과 메뉴 매핑 (ADMIN_ROLE_MENU 등)
   - 사용자별 즐겨찾기 메뉴, 자주 쓰는 메뉴 노출
   - 프론트에서 사용하는 API(/menu/list.json 등)로 확장

### 1.3 공통 규칙

- 화면 호출: `*.do`
- 데이터 처리/조회: `*.json`
- 인증:
  - `/system/**` URL은 `AuthInterceptor` 를 통한 로그인 여부 체크 후 접근 허용
  - 메뉴 관리 기능은 **로그인 + 관리자 권한이 있는 사용자만** 접근하는 것을 기본 가정(권한 체크는 향후 Role 연동 시 구현)

---

## 2. 화면 및 엔드포인트 정의

### 2.1 메뉴 목록/관리 화면

- URL: `/system/menu/list.do`  
- HTTP Method: GET  
- View: `WEB-INF/views/menu/menuList.jsp`  
- Controller 메서드:
  - `msa.admin.menu.web.MenuController.list(Model model)`

#### 2.1.1 처리 흐름

1. `AuthInterceptor`에서 세션(LOGIN_USER) 체크
2. `AdminMenuService.selectMenuList()` 호출
   - Oracle `CONNECT BY` 를 사용하여 계층 구조로 정렬된 목록을 조회
3. Model에 `menuList` 추가
4. `menuList.jsp` 렌더링
   - 좌측: 계층형 메뉴 목록(트리)
   - 우측: 선택한 메뉴의 상세/등록/수정 폼

---

### 2.2 메뉴 저장 API (신규/수정)

- URL: `/system/menu/saveMenu.json`  
- HTTP Method: POST  
- Content-Type: `application/x-www-form-urlencoded`  
- Controller 메서드:
  - `msa.admin.menu.web.MenuController.saveMenu(AdminMenuVO vo)`

#### 2.2.1 요청 파라미터 정의

| 항목       | 타입    | 필수 | 설명                               |
|-----------|---------|------|------------------------------------|
| menuId    | Long    | N    | 메뉴 ID (없으면 신규, 있으면 수정) |
| upMenuId  | Long    | N    | 상위 메뉴 ID (루트 메뉴는 NULL)    |
| menuNm    | String  | Y    | 메뉴명                             |
| menuUrl   | String  | N    | 매핑 URL (`/main.do`, `/system/...`) |
| sortOrd   | Integer | Y    | 정렬 순서                          |
| useYn     | String  | Y    | 사용 여부 (`Y`/`N`)                |
| remark    | String  | N    | 비고                               |

#### 2.2.2 응답 구조

```json
{
  "success": true,
  "message": ""
}
항목	타입	설명
success	Boolean	처리 성공 여부
message	String	오류/안내 메시지(옵션)
2.3 메뉴 삭제 API (논리 삭제)

URL: /system/menu/deleteMenu.json

HTTP Method: POST

Content-Type: application/x-www-form-urlencoded

Controller 메서드:

msa.admin.menu.web.MenuController.deleteMenu(Long menuId)

2.3.1 요청 파라미터
항목	타입	필수	설명
menuId	Long	Y	메뉴 ID
2.3.2 동작

USE_YN = 'N' 으로 업데이트하는 논리 삭제 방식 채택.

실제 물리 삭제는 향후 정책에 따라 별도 배치나 관리 작업으로 수행.

3. DB 설계
3.1 ADMIN_MENU 테이블

테이블명: ADMIN_MENU

용도: 관리자 메뉴 트리 구조 저장

3.1.1 컬럼 정의
컬럼명	타입	PK	NOT NULL	기본값	설명
MENU_ID	NUMBER(10)	Y	Y		메뉴 PK
UP_MENU_ID	NUMBER(10)		N		상위 메뉴 ID (루트 NULL)
MENU_NM	VARCHAR2(100)		Y		메뉴명
MENU_URL	VARCHAR2(200)		N		메뉴 URL (/main.do 등)
SORT_ORD	NUMBER(5)		Y		정렬 순서
USE_YN	CHAR(1)		Y	'Y'	사용 여부 (Y / N)
REMARK	VARCHAR2(400)		N		비고
3.1.2 시퀀스

시퀀스명: ADMIN_MENU_SEQ

sql
코드 복사

CREATE SEQUENCE ADMIN_MENU_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE;

3.1.3 기본 인덱스/제약조건

PK

PK_ADMIN_MENU (MENU_ID)

권장 인덱스

IDX_ADMIN_MENU_UP_MENU_ID (UP_MENU_ID)

IDX_ADMIN_MENU_SORT (UP_MENU_ID, SORT_ORD)

3.1.4 샘플 데이터

sql
코드 복사

-- 1레벨: 루트 메뉴
INSERT INTO ADMIN_MENU (MENU_ID, UP_MENU_ID, MENU_NM, MENU_URL, SORT_ORD, USE_YN)
VALUES (ADMIN_MENU_SEQ.NEXTVAL, NULL, '대시보드', '/main.do', 10, 'Y');

INSERT INTO ADMIN_MENU (MENU_ID, UP_MENU_ID, MENU_NM, MENU_URL, SORT_ORD, USE_YN)
VALUES (ADMIN_MENU_SEQ.NEXTVAL, NULL, '시스템 관리', NULL, 20, 'Y');

-- 2레벨: 시스템 관리 하위
INSERT INTO ADMIN_MENU (MENU_ID, UP_MENU_ID, MENU_NM, MENU_URL, SORT_ORD, USE_YN)
VALUES (ADMIN_MENU_SEQ.NEXTVAL, 2, '메뉴 관리', '/system/menu/list.do', 10, 'Y');

INSERT INTO ADMIN_MENU (MENU_ID, UP_MENU_ID, MENU_NM, MENU_URL, SORT_ORD, USE_YN)
VALUES (ADMIN_MENU_SEQ.NEXTVAL, 2, '권한 관리(예정)', NULL, 20, 'Y');


※ 2 값은 실제 시스템 관리 메뉴의 MENU_ID에 맞게 조정.

4. Java 클래스 매핑
4.1 VO

클래스: msa.admin.menu.vo.AdminMenuVO

java
코드 복사

public class AdminMenuVO implements Serializable {

    private Long menuId;
    private Long upMenuId;
    private String menuNm;
    private String menuUrl;
    private Integer sortOrd;
    private String useYn;
    private String remark;

    // Oracle CONNECT BY LEVEL → LVL 매핑
    private Integer lvl;

    // getter / setter 생략
}

4.2 DAO / Mapper

DAO: msa.admin.menu.persistence.AdminMenuDAO

상속: EgovAbstractMapper

주요 메서드:

List<AdminMenuVO> selectMenuList()

AdminMenuVO selectMenuDetail(Long menuId)

int insertMenu(AdminMenuVO vo)

int updateMenu(AdminMenuVO vo)

int deleteMenu(Long menuId) (USE_YN = 'N')

Mapper XML: src/main/resources/sqlmap/admin/menu/AdminMenu_SQL.xml

sql
코드 복사

SELECT
    MENU_ID    AS menuId,
    UP_MENU_ID AS upMenuId,
    MENU_NM    AS menuNm,
    MENU_URL   AS menuUrl,
    SORT_ORD   AS sortOrd,
    USE_YN     AS useYn,
    REMARK     AS remark,
    LEVEL      AS lvl
FROM ADMIN_MENU
WHERE USE_YN = 'Y'
START WITH UP_MENU_ID IS NULL
CONNECT BY PRIOR MENU_ID = UP_MENU_ID
ORDER SIBLINGS BY SORT_ORD, MENU_ID;

4.3 Service

인터페이스: msa.admin.menu.service.AdminMenuService

구현체: msa.admin.menu.service.impl.AdminMenuServiceImpl

역할:

메뉴 목록 조회 (계층 구조)

단일 메뉴 조회

메뉴 저장 (신규/수정 통합)

menuId == null → 신규 (insertMenu)

menuId != null → 수정 (updateMenu)

메뉴 논리 삭제 (deleteMenu)

4.4 Controller

클래스: msa.admin.menu.web.MenuController

주요 메서드:

list(Model model) → /system/menu/list.do

saveMenu(AdminMenuVO vo) → /system/menu/saveMenu.json

deleteMenu(Long menuId) → /system/menu/deleteMenu.json

5. 화면 설계 (menuList.jsp)
5.1 레이아웃 개요

상단: 페이지 타이틀(“메뉴 관리”)

좌측 영역: 메뉴 트리 목록

DB에서 조회한 menuList를 계층 구조대로 표시

각 행 클릭 시, 우측 폼에 해당 메뉴의 정보 로딩

“루트 메뉴 추가”, “하위 메뉴 추가” 버튼 제공

우측 영역: 메뉴 등록/수정 폼

필드: 메뉴 ID, 상위 메뉴 ID/명, 메뉴명, URL, 정렬순서, 사용여부, 비고

버튼: 저장, 신규, 삭제

Ajax 결과 메시지를 표시하는 영역(성공/에러)

5.2 주요 요소 및 동작

목록 테이블

menuId, menuNm, sortOrd, useYn 표시

lvl 값에 따라 들여쓰기/트리 형태 표현

JavaScript

editMenu(...) : 선택한 메뉴 정보 → 폼 세팅

newRootMenu() : 상위 메뉴 없는 루트 메뉴 신규 작성 모드

newChildMenu(upMenuId, upMenuNm) : 특정 메뉴의 하위 메뉴 신규 작성 모드

saveMenu() : /system/menu/saveMenu.json 호출 후, 성공 시 페이지 새로고침

deleteMenu() : /system/menu/deleteMenu.json 호출 후, 성공 시 페이지 새로고침

6. 메인 화면 연동
6.1 MainController와의 관계

MainController에서 AdminMenuService를 주입받아, 메인 화면 렌더링 시 메뉴 목록을 함께 조회한다.

java
코드 복사

@Resource(name = "adminMenuService")
private AdminMenuService adminMenuService;

@RequestMapping("/main.do")
public String main(HttpSession session, Model model) throws Exception {

    AdminUserVO loginUser =
        (AdminUserVO) session.getAttribute("LOGIN_USER");
    model.addAttribute("loginUser", loginUser);

    // 메뉴 목록 (계층 구조)
    List<AdminMenuVO> menuList = adminMenuService.selectMenuList();
    model.addAttribute("menuList", menuList);

    return "main/main";
}

6.2 main.jsp 좌측 메뉴 구성

menuList를 기반으로 좌측 메뉴를 렌더링.

1차 버전:

1 Depth: upMenuId == null

2 Depth: upMenuId == 상위 menuId

향후:

ROLE/권한에 따른 메뉴 필터링

즐겨찾기/최근 사용 메뉴 노출

7. 에러/예외 케이스 정의
케이스	설명	처리 방식
상위 메뉴 ID 잘못 지정	UP_MENU_ID 가 존재하지 않는 MENU_ID	Service/DAO에서 제약조건 위반 시 에러 처리
메뉴명 미입력	MENU_NM NULL	화면 검증 + 서버 검증, 적절한 메시지 반환
정렬순서 미입력 또는 숫자 아님	SORT_ORD NULL/비정상	폼에서 기본값(10) 설정, 서버에서도 검증
삭제 대상 메뉴 ID 없음	menuId 파라미터 누락 또는 DB 미존재	실패 메시지 반환 (success=false)
세션 없음 상태에서 /system/menu/** 접근	비로그인 사용자가 직접 URL로 접근	AuthInterceptor에서 /login.do 로 리다이렉트
DB 예외 (제약조건, 연결 오류 등)	INSERT/UPDATE/DELETE 중 예외 발생	공통 에러 처리 또는 JSON 에러 응답
8. TODO / 향후 확장 계획

권한(ROLE) 연동

ADMIN_ROLE, ADMIN_ROLE_MENU 테이블 설계

로그인한 사용자 Role 기준으로 메뉴 필터링

권한 관리 화면(role/role.md)과 연계

정렬 UX 개선

Drag & Drop 기반 메뉴 순서 변경

일괄 저장 API (/system/menu/reorder.json) 등 설계

캐싱 전략

메뉴 구조는 변경 빈도가 낮으므로, 로그인 시 세션/캐시로 로딩

메뉴 변경 시 캐시 무효화 전략 수립

API 공개

다른 프론트엔드(React/Vue 등)에서 사용할 /menu/tree.json API 제공

JSON 형태의 메뉴 트리 반환

다국어 메뉴명 지원

메뉴명/설명을 별도 다국어 테이블로 분리 (ADMIN_MENU_I18N 등)

사용자 맞춤 메뉴

즐겨찾기 메뉴 (ADMIN_FAVORITE_MENU)

최근 사용 메뉴 (접속로그 기반 요약)