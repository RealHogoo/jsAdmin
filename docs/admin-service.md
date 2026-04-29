# 관리자 서비스 개요

## 목적

`admin-service`는 관리자 화면과 공통 인증 API를 제공하는 중심 서비스입니다.
다른 서비스는 이 서비스의 로그인과 `/auth/me.json` 응답을 기준으로 사용자와 권한을 확인합니다.

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
|- serviceregistry
|- timeline
|- user
|- web
```

## 실행 구조

- Spring Boot 기반으로 구동합니다.
- JSP 화면은 `src/main/webapp/WEB-INF/jsp` 아래에 있습니다.
- 정적 리소스는 `src/main/webapp/static` 아래에 있습니다.
- MyBatis 매퍼는 `common`, `oracle`, `postgres`로 분리되어 있습니다.

## 인증 구조

- `/login.json`에서 access token과 refresh token을 발급합니다.
- access token은 요청마다 검증합니다.
- refresh token은 서버 DB에 저장합니다.
- 비밀번호는 BCrypt 해시를 사용합니다.
- `/auth/me.json`은 `roles`, `session_id`, `service_permissions`를 포함합니다.

## 릴리즈 확인 기능

- 푸터 오른쪽에 현재 소스의 짧은 Git SHA를 표시합니다.
- `GitRevisionProvider`가 현재 `.git`의 `HEAD`를 읽어서 7자리 SHA를 계산합니다.
- `POST /version.json`으로도 같은 리비전을 조회할 수 있습니다.

## DB 지원

- Oracle
- PostgreSQL

DB 벤더는 `app.db.vendor` 설정으로 선택합니다.

## 프런트 규칙

- API 응답은 `snake_case` 기준입니다.
- JSP/JS 화면에서도 서버 응답 필드를 그대로 사용합니다.
- 서비스 권한 화면은 현재 `schedule-service`를 기준으로 먼저 적용되어 있습니다.
