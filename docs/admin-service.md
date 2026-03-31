# Admin Service Overview

## Purpose

`admin-service` provides the administration UI and API for authentication, users, menus, permissions, notices, timelines, access monitoring, and API policy management.

## Package Layout

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

## Runtime Structure

- Spring Boot starts the application and registers servlet/filter configuration in Java config.
- JSP views live under `src/main/webapp/WEB-INF/jsp`.
- Static assets live under `src/main/webapp/static`.
- MyBatis mappers are split into `common`, `oracle`, and `postgres`.

## Authentication Model

- `/login.json` issues an access token and refresh token.
- Access tokens are validated on each request.
- Refresh tokens are persisted server-side.
- Passwords are hashed with BCrypt.

## Database Support

- Oracle
- PostgreSQL

Vendor selection is controlled by `app.db.vendor`.

## Frontend Contract

- API JSON responses are serialized in `snake_case`.
- Frontend code should read `snake_case` fields by default.
- If a screen must support both legacy and current payloads, handle both key styles explicitly.

## Related Docs

- [Operations Guide](/D:/MSA_project/ADMIN_project/admin-service/docs/operations.md)
- [SQL Docs](/D:/MSA_project/ADMIN_project/admin-service/docs/sqls/README.md)
