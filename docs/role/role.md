# 권한 역할 문서

## 개요

권한 관리 기능은 권한 그룹과 메뉴 권한을 기준으로 관리자 서비스 접근 범위를 제어합니다.

## 주요 기능

- 권한 그룹 조회
- 권한 그룹 생성/수정/미사용 처리
- 그룹별 메뉴 권한 조회
- 그룹별 메뉴 권한 저장
- 그룹별 서비스 권한 저장
- 사용자 예외 권한 저장

## 관련 API

- `/auth/group/list.json`
- `/auth/group/save.json`
- `/auth/group/delete.json`
- `/auth/group/menu/list.json`
- `/auth/group/menu/save.json`
- `/auth/group/service/list.json`
- `/auth/group/service/save.json`
- `/auth/user/menuPermList.json`
- `/auth/user/exception/save.json`
