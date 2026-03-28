# 권한 관리 문서

## 개요

권한 관리는 권한 그룹 단위 메뉴 허용과 사용자 예외 권한을 함께 다룹니다.

## 현재 화면 구성

탭 2개 구조:

1. 그룹 권한 관리
2. 사용자 예외 관리

## 주요 기능

### 그룹 권한 관리

- 권한 그룹 목록 조회
- 선택 그룹의 메뉴별 권한 레벨 조회
- 그룹별 메뉴 권한 저장

### 사용자 예외 관리

- 사용자 검색
- 선택 사용자 기준 예외 권한 조회
- 메뉴별 허용/차단/권한 레벨 예외 저장

## 주요 API

- `/auth/group/list.json`
- `/auth/group/menu/list.json`
- `/auth/group/menu/save.json`
- `/auth/user/search.json`
- `/auth/user/menuPermList.json`
- `/auth/user/exception/save.json`
- `/auth/user/exception/delete.json`

## 표시 기준

- 선택 그룹/선택 사용자는 seq가 아니라 이름 중심으로 표시
- 메뉴 권한 목록은 트리 구조로 보여주되, 공통 화면 스타일을 따름

## 관련 테이블

- `ADM_AUTH_GROUP`
- `ADM_AUTH_GROUP_USER`
- `ADM_AUTH_GROUP_DEPT`
- `ADM_AUTH_MENU`
- `ADM_AUTH_USER`
- `ADM_MENU_MST`
