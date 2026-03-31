# Operations Guide

## Required Settings

Base properties:

- `APP_DB_VENDOR`: `oracle` or `postgres`
- `SERVER_PORT`: HTTP port
- `JWT_SECRET`: JWT signing secret
- `JWT_EXP_SECONDS`: access token lifetime in seconds
- `ASSET_VERSION`: static asset cache version, usually `YYYYMMDD`
- `AUTH_SUPER_LOGIN_ID`: explicit super admin login id

Database settings:

- Oracle: [src/main/resources/db/oracle.properties](/D:/MSA_project/ADMIN_project/admin-service/src/main/resources/db/oracle.properties)
- PostgreSQL: [src/main/resources/db/postgres.properties](/D:/MSA_project/ADMIN_project/admin-service/src/main/resources/db/postgres.properties)

Supported keys:

- `db.driver` or `jdbc.driverClassName`
- `db.url` or `jdbc.url`
- `db.username` or `jdbc.username`
- `db.password` or `jdbc.password`

Recommended environment variables:

- `DB_DRIVER`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_INITIAL_SIZE`
- `DB_MAX_ACTIVE`
- `DB_MAX_IDLE`
- `DB_MIN_IDLE`

## Local Run

Oracle:

```powershell
$env:SERVER_PORT="8082"
$env:APP_DB_VENDOR="oracle"
.\gradlew.bat bootRun
```

PostgreSQL:

```powershell
$env:SERVER_PORT="8082"
$env:APP_DB_VENDOR="postgres"
.\gradlew.bat bootRun
```

## Build And Test

Compile resources:

```powershell
.\gradlew.bat compileJava processResources
```

Run tests:

```powershell
.\gradlew.bat test
```

Build WAR:

```powershell
.\gradlew.bat bootWar
```

## Deployment Checklist

- Set `JWT_SECRET` from environment, not from committed defaults.
- Set the correct `APP_DB_VENDOR`.
- Set `AUTH_SUPER_LOGIN_ID` explicitly and verify the matching account.
- Verify DB credentials before deployment.
- Set `ASSET_VERSION` to the deployment date, for example `20260331`.
- If a same-day hotfix is required, use a suffix such as `20260331a`.

## Smoke Test Checklist

- `POST /login.json`
- `POST /auth/me.json`
- `POST /auth/refresh.json`
- `GET /main.do`
- `POST /menu/tree.json`
- `POST /user/list.json`
- `POST /notice/list.json`
- `POST /timeline/list.json`
- `POST /health/db.json`

## Frontend Notes

- API payloads use `snake_case`.
- Static JS should not assume `camelCase` response fields.
- After changing static files, hard refresh the browser if cached assets are still served.

## Known Operational Risks

- Starting the app on a port already in use will fail immediately.
- Oracle JDBC may log thread cleanup warnings during shutdown; these are separate from startup failures.
- Invalid DB credentials fail fast during Hikari pool initialization.
