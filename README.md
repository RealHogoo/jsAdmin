# admin-service

Administrative service built with Spring Boot, JSP, and MyBatis.

## Scope

- Authentication and token refresh
- User management
- Menu and authorization management
- Common code management
- Notice and timeline management
- Access history and session control
- API policy management
- My page
- Health checks

## Stack

- Java 17
- Spring Boot 2.7
- JSP
- MyBatis
- Oracle or PostgreSQL
- JWT
- BCrypt

## Configuration

Base application settings are in [src/main/resources/app.properties](/D:/MSA_project/ADMIN_project/admin-service/src/main/resources/app.properties).

Database vendor settings are split by file.

- [src/main/resources/db/oracle.properties](/D:/MSA_project/ADMIN_project/admin-service/src/main/resources/db/oracle.properties)
- [src/main/resources/db/postgres.properties](/D:/MSA_project/ADMIN_project/admin-service/src/main/resources/db/postgres.properties)

## Quick Start

```powershell
$env:SERVER_PORT="8082"
$env:APP_DB_VENDOR="oracle"
.\gradlew.bat bootRun
```

## Documents

- [Operations Guide](/D:/MSA_project/ADMIN_project/admin-service/docs/operations.md)
- [Service Overview](/D:/MSA_project/ADMIN_project/admin-service/docs/admin-service.md)
- [PostgreSQL SQL Guide](/D:/MSA_project/ADMIN_project/admin-service/docs/sqls/postgres/README.md)

## Notes

- Static asset cache version is controlled by `asset.version` or `ASSET_VERSION`.
- Frontend JSON handling assumes `snake_case` API payloads. New UI code should not rely on `camelCase` response keys.
