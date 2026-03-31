# 관리자 서비스 개요

## 목적

`admin-service`는 운영자 화면과 관리자 API를 제공하는 서비스입니다. 인증, 사용자, 메뉴, 권한, 공지, 타임라인, 접속 관리, API 정책 기능을 포함합니다.

## 패키지 구조

```text
com.realhogoo.jsadmin
|- access
|- apipolicy
|- auth
|- code
|- config
|- health
|- menu
|- mypage
|- notice
|- timeline
|- user
|- web
```

## 실행 구조

- Spring Boot가 애플리케이션을 기동합니다.
- JSP 뷰는 `src/main/webapp/WEB-INF/jsp` 아래에 있습니다.
- 정적 리소스는 `src/main/webapp/static` 아래에 있습니다.
- MyBatis 매퍼는 `common`, `oracle`, `postgres`로 분리돼 있습니다.

## 인증 구조

- `/login.json`에서 access token과 refresh token을 발급합니다.
- access token은 매 요청마다 검증합니다.
- refresh token은 서버에 저장합니다.
- 비밀번호는 BCrypt 해시를 사용합니다.

## DB 지원

- Oracle
- PostgreSQL

DB 벤더 선택은 `app.db.vendor` 설정으로 제어합니다.

## 프런트 규약

- API 응답은 `snake_case` 기준입니다.
- 프런트엔드 코드는 `snake_case` 키를 기본으로 처리해야 합니다.
- 레거시 응답과 함께 써야 하는 화면만 예외적으로 두 형식을 같이 지원합니다.
