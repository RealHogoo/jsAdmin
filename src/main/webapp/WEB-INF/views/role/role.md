# 권한(Role) 관리 모듈 설계 문서

> 파일 위치 예시: `docs/role.md`  
> 관련 화면:  
> - 권한 관리: `WEB-INF/views/role/roleList.jsp`  
> - 메뉴 관리: `WEB-INF/views/menu/menuList.jsp`  
> 관련 패키지:  
> - `msa.admin.role.*`  
> - `msa.admin.menu.*`  
> - (향후) `msa.admin.auth.*`

---

## 1. 모듈 개요

### 1.1 목적

- 관리자 서비스에서 사용하는 **권한(ROLE) 관리** 기능을 제공한다.
- 권한과 메뉴, 사용자 간의 매핑을 통해 **메뉴 접근 제어 및 기능 사용 권한**을 제어한다.
- 메인 좌측 메뉴 및 개별 기능에 대한 접근 권한의 **단일 기준(소스 오브 트루스)** 역할을 한다.

### 1.2 책임 범위 (1차 버전)

1. **ROLE 관리**
   - 권한 목록 조회
   - 권한 등록/수정
   - 권한 논리 삭제(USE_YN = 'N')

2. **ROLE ↔ MENU 매핑**
   - 권한별 허용 메뉴 목록 관리
   - 메뉴 트리를 체크박스로 표시하여 ROLE에 메뉴를 할당

3. **USER ↔ ROLE 매핑 (테이블 설계만)**
   - 향후 로그인 사용자 권한 확인을 위해 USER-ROLE 구조를 미리 정의

> 실제 로그인 세션과의 연동(사용자별 권한/메뉴 로딩)은 다음 단계에서 구현 예정.

### 1.3 공통 규칙

- 화면 요청 URL: `*.do`
- 데이터 처리/저장 API: `*.json`
- 기본 URL prefix:
  - 권한 관리: `/system/role/**`
- 인증/권한:
  - `/system/**` 는 `AuthInterceptor` 를 통해 **로그인 체크 필수**
  - 권한 자체에 대한 접근 제어(예: MASTER 권한만 ROLE 관리 가능)는 2차 단계에서 추가

---

## 2. 화면 및 엔드포인트 정의

### 2.1 권한 목록 + 상세/메뉴 매핑 화면

- URL: `/system/role/list.do`  
- HTTP Method: GET  
- View: `WEB-INF/views/role/roleList.jsp`  
- Controller: `msa.admin.role.web.RoleController.list(Long roleId, Model model)`

#### 2.1.1 처리 흐름

1. `AuthInterceptor`에서 세션(`LOGIN_USER`) 체크
2. `AdminRoleService.selectRoleList()` 호출 → 권한 목록 조회
3. `AdminRoleService.selectRoleWithMenus(roleId)` 호출 → 선택된 ROLE 상세 및 매핑 메뉴 목록 조회
4. `AdminMenuService.selectMenuList()` 호출 → 전체 메뉴 트리 조회 (계층 구조)
5. Model에 아래 항목 세팅
   - `roleList` : ROLE 목록
   - `selectedRole` : 선택된 ROLE + menuIdList
   - `menuList` : 전체 메뉴 트리
6. `roleList.jsp` 렌더링
   - 좌측: ROLE 목록
   - 우측: ROLE 기본 정보 + 메뉴 권한 체크박스

---

### 2.2 ROLE 저장 API (ROLE + ROLE_MENU)

- URL: `/system/role/saveRole.json`  
- HTTP Method: POST  
- Content-Type: `application/x-www-form-urlencoded`  
- Controller: `RoleController.saveRole(AdminRoleVO vo, Long[] menuIds)`

#### 2.2.1 요청 파라미터

| 항목      | 타입      | 필수 | 설명                                                |
|-----------|-----------|------|-----------------------------------------------------|
| roleId    | Long      | N    | 권한 ID (없으면 신규, 있으면 수정)                 |
| roleCd    | String    | Y    | 권한 코드 (예: ADMIN, OPERATOR)                    |
| roleNm    | String    | Y    | 권한 이름 (화면 표시용)                            |
| useYn     | String    | Y    | 사용 여부 (`Y` / `N`)                               |
| remark    | String    | N    | 비고                                                |
| menuIds[] | Long 배열 | N    | 체크된 메뉴 ID 배열 (ROLE에 매핑할 메뉴 목록)      |

> `menuIds` 는 `<input type="checkbox" name="menuIds" value="...">` 기반 배열로 전달된다.

#### 2.2.2 동작 요약

1. `menuIds` 배열을 `List<Long>` 형태로 변환하여 `AdminRoleVO.menuIdList`에 세팅
2. `AdminRoleService.saveRole(vo)` 호출
   - 신규: ROLE 등록 + ROLE_MENU 등록
   - 수정: ROLE 수정 + ROLE_MENU 전체 비활성화 후 재등록
3. JSON 응답 반환

#### 2.2.3 응답 구조

```json
{
  "success": true,
  "message": ""
}
2.3 ROLE 삭제 API (논리 삭제)

URL: /system/role/deleteRole.json

HTTP Method: POST

Content-Type: application/x-www-form-urlencoded

Controller: RoleController.deleteRole(Long roleId)

2.3.1 요청 파라미터
항목	타입	필수	설명
roleId	Long	Y	삭제할 권한 ID
2.3.2 동작

AdminRoleService.deleteRole(roleId) 호출

ADMIN_ROLE.USE_YN = 'N' 으로 처리 (논리 삭제)

해당 ROLE의 ADMIN_ROLE_MENU 도 전체 비활성 처리 (USE_YN = 'N')

(향후) ADMIN_USER_ROLE 도 정책에 따라 비활성 처리 가능

JSON 응답 반환

3. DB 설계
3.1 ADMIN_ROLE (권한 마스터)
컬럼명	타입	PK	NOT NULL	기본값	설명
ROLE_ID	NUMBER(10)	Y	Y		권한 PK
ROLE_CD	VARCHAR2(50)		Y		권한 코드 (UNIQUE)
ROLE_NM	VARCHAR2(100)		Y		권한 이름
USE_YN	CHAR(1)		Y	'Y'	사용 여부
REMARK	VARCHAR2(400)		N		비고
3.1.1 시퀀스
CREATE SEQUENCE ADMIN_ROLE_SEQ
    START WITH 1
    INCREMENT BY 1
    NOCACHE;

3.2 ADMIN_ROLE_MENU (ROLE ↔ MENU 매핑)
컬럼명	타입	PK	NOT NULL	기본값	설명
ROLE_ID	NUMBER(10)	Y	Y		권한 ID (FK: ADMIN_ROLE)
MENU_ID	NUMBER(10)	Y	Y		메뉴 ID (FK: ADMIN_MENU)
USE_YN	CHAR(1)		Y	'Y'	사용 여부

PK: (ROLE_ID, MENU_ID)

FK:

ROLE_ID → ADMIN_ROLE(ROLE_ID)

MENU_ID → ADMIN_MENU(MENU_ID)

3.3 ADMIN_USER_ROLE (USER ↔ ROLE 매핑)
컬럼명	타입	PK	NOT NULL	기본값	설명
USER_ID	NUMBER(10)	Y	Y		사용자 ID (FK: ADMIN_USER)
ROLE_ID	NUMBER(10)	Y	Y		권한 ID (FK: ADMIN_ROLE)
USE_YN	CHAR(1)		Y	'Y'	사용 여부

PK: (USER_ID, ROLE_ID)

향후 로그인 사용자 → ROLE 목록 조회 시 사용 예정

4. Java 매핑 구조
4.1 VO
4.1.1 AdminRoleVO

패키지: msa.admin.role.vo.AdminRoleVO

public class AdminRoleVO implements Serializable {

    private Long roleId;
    private String roleCd;
    private String roleNm;
    private String useYn;
    private String remark;

    // ROLE에 매핑된 메뉴 ID 리스트 (화면/저장용)
    private List<Long> menuIdList;

    // getter / setter ...
}

4.1.2 AdminRoleMenuVO (선택적 보조 VO)

패키지: msa.admin.role.vo.AdminRoleMenuVO

역할:

ROLE_MENU 조인 결과(메뉴명 포함)를 별도로 표현하고 싶을 때 사용 가능
(1차 버전에서는 필수는 아님)

4.2 Mapper XML (AdminRole_SQL.xml)

위치 예시: src/main/resources/sqlmap/admin/role/AdminRole_SQL.xml

namespace: adminRole

주요 쿼리:

ROLE 목록

<select id="selectRoleList" resultType="msa.admin.role.vo.AdminRoleVO">
    SELECT
        ROLE_ID   AS roleId,
        ROLE_CD   AS roleCd,
        ROLE_NM   AS roleNm,
        USE_YN    AS useYn,
        REMARK    AS remark
    FROM ADMIN_ROLE
    ORDER BY ROLE_CD
</select>


ROLE 상세

<select id="selectRoleDetail" parameterType="long"
        resultType="msa.admin.role.vo.AdminRoleVO">
    SELECT
        ROLE_ID   AS roleId,
        ROLE_CD   AS roleCd,
        ROLE_NM   AS roleNm,
        USE_YN    AS useYn,
        REMARK    AS remark
    FROM ADMIN_ROLE
    WHERE ROLE_ID = #{value}
</select>


ROLE 등록/수정/삭제

ROLE 메뉴 매핑 조회/전체 비활성/등록

4.3 DAO

클래스: msa.admin.role.persistence.AdminRoleDAO

상속: EgovAbstractMapper

주요 메서드:

List<AdminRoleVO> selectRoleList();
AdminRoleVO selectRoleDetail(Long roleId);
int insertRole(AdminRoleVO vo);
int updateRole(AdminRoleVO vo);
int deleteRole(Long roleId);           // USE_YN = 'N'
List<Long> selectRoleMenuIds(Long roleId);
int deleteRoleMenuAll(Long roleId);    // ROLE_MENU 전체 USE_YN = 'N'
int insertRoleMenu(Long roleId, Long menuId);

4.4 Service
4.4.1 인터페이스

클래스: msa.admin.role.service.AdminRoleService

List<AdminRoleVO> selectRoleList() throws Exception;
AdminRoleVO selectRoleWithMenus(Long roleId) throws Exception;
void saveRole(AdminRoleVO vo) throws Exception;
void deleteRole(Long roleId) throws Exception;

4.4.2 구현체

클래스: msa.admin.role.service.impl.AdminRoleServiceImpl

트랜잭션 적용: @Transactional (ROLE 저장/삭제 시)

동작 요약:

selectRoleWithMenus(roleId)

ROLE 기본 정보 조회

ROLE_MENU 테이블에서 매핑된 MENU_ID 목록 조회 → menuIdList에 세팅

saveRole(vo)

roleId == null → 신규 등록

insertRole() 호출 (selectKey로 roleId 세팅)

roleId != null → 수정

updateRole() 호출

이후 ROLE_MENU 처리:

deleteRoleMenuAll(roleId) : 기존 매핑 전체 비활성화

menuIdList 기준으로 insertRoleMenu() 반복 호출

deleteRole(roleId)

ADMIN_ROLE.USE_YN = 'N'

ADMIN_ROLE_MENU 전체 비활성화

(추후) ADMIN_USER_ROLE 비활성화 정책 추가 가능

5. Controller 및 화면
5.1 RoleController

클래스: msa.admin.role.web.RoleController

URL Prefix: /system/role

주요 메서드:

list(Long roleId, Model model) – /system/role/list.do

ROLE 목록 조회

선택된 ROLE 상세 + 메뉴 매핑 조회

전체 메뉴 트리 조회

view: role/roleList.jsp

saveRole(AdminRoleVO vo, Long[] menuIds) – /system/role/saveRole.json

화면에서 넘어온 menuIds[] → menuIdList로 세팅

AdminRoleService.saveRole(vo) 호출

JSON 응답 반환

deleteRole(Long roleId) – /system/role/deleteRole.json

AdminRoleService.deleteRole(roleId) 호출

JSON 응답 반환

5.2 roleList.jsp 화면 설계

파일: WEB-INF/views/role/roleList.jsp

레이아웃:

상단: 페이지 제목 (“권한 관리”)

좌측: ROLE 목록

ROLE ID, ROLE 코드, ROLE 이름, 사용 여부

행 클릭 시 해당 ROLE 상세로 이동 (/system/role/list.do?roleId=...)

우측: ROLE 상세 + 메뉴 매핑

ROLE 코드, 이름, 사용 여부, 비고

메뉴 트리 체크박스 (메뉴별 권한 부여)

버튼: 저장 / 신규 / 삭제

결과 메시지 영역 (성공/실패 표시)

5.2.1 메뉴 체크박스 표현

menuList (AdminMenuVO 계층 리스트) + selectedRole.menuIdList 조합

Oracle LEVEL → LVL 을 lvl 필드로 매핑하여 인덴트/계층 표현

예시 개념:

<div class="menu-tree">
    <c:set var="selectedMenuIds" value="${selectedRole.menuIdList}" />
    <c:forEach var="m" items="${menuList}">
        <div class="menu-item indent-${m.lvl}">
            <input type="checkbox"
                   name="menuIds"
                   value="${m.menuId}"
                   <c:if test="${selectedMenuIds ne null && selectedMenuIds.contains(m.menuId)}">checked</c:if> />
            ${m.menuNm} (${m.menuId})
        </div>
    </c:forEach>
</div>

5.2.2 JavaScript 주요 함수

goRoleDetail(roleId) : 특정 ROLE 선택 시 동일 화면 재호출

newRole() : 신규 권한 등록 모드

saveRole() : /system/role/saveRole.json 호출 후 결과 처리

deleteRole() : /system/role/deleteRole.json 호출 후 결과 처리

6. 권한 적용 방향(향후 단계)

메뉴와 연동

ADMIN_MENU에 “권한 관리” 메뉴 추가

URL: /system/role/list.do

권한관리 화면 접근 자체도 특정 ROLE에만 허용(예: SYSTEM_ADMIN)하는 구조로 확장

로그인과 연동

ADMIN_USER_ROLE을 통해 로그인 사용자의 ROLE 목록 조회

ADMIN_ROLE_MENU과 조합하여 사용자별 메뉴 접근 가능 목록 생성

로그인 성공 시 세션에 ROLE/메뉴 리스트 저장

메뉴 필터링 및 URL 접근 제어

MainController에서 메뉴 조회 시 ROLE 기반 필터링 적용

AuthInterceptor 확장:

요청 URL → 메뉴/ROLE 매핑 조회

해당 ROLE이 없는 사용자는 403 또는 에러 페이지로 유도

7. 오늘 작업 요약 (2025-12-11)

권한(ROLE) 관리 전체 구조 설계

ADMIN_ROLE / ADMIN_ROLE_MENU / ADMIN_USER_ROLE 테이블 설계

ROLE/ROLE_MENU 저장 정책(논리 삭제, 전체 비활성 후 재등록) 정리

Java 계층 구현

AdminRoleVO 정의 (menuIdList 포함)

AdminRoleDAO / AdminRoleService / AdminRoleServiceImpl 구현

RoleController 기본 엔드포인트(/list.do, /saveRole.json, /deleteRole.json) 설계

권한 관리 화면 기본 골격 정의

roleList.jsp 레이아웃 (ROLE 목록 + ROLE 상세 + 메뉴 트리 체크박스)

ROLE와 메뉴 매핑을 한 화면에서 관리하는 UX 방향 확정

향후 작업 방향 정리

메뉴에 권한관리 메뉴 연결

로그인 시 USER_ROLE, ROLE_MENU 기반 권한 세션화

메뉴 필터링, URL 접근 제어까지 단계적으로 확장 예정
