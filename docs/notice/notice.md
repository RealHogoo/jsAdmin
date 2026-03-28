# 공지사항 관리 문서

## 개요

공지사항 관리는 운영 공지 데이터를 등록하고 조회하는 화면입니다.

## 주요 기능

- 공지 목록 조회
- 공지 상세 조회
- 공지 등록/수정
- 공지 삭제

## 주요 API

- `/notice/main.do`
- `/notice/list.json`
- `/notice/detail.json`
- `/notice/save.json`
- `/notice/delete.json`

## 비고

- 대시보드에서 공지사항 목록과 연동됩니다.
- 비로그인 상태에서도 목록 조회를 허용하는 정책을 사용할 수 있습니다.
