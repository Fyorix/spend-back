# User Service

User Service is a NestJS microservice responsible for user management and authentication token issuance.

## What this service does

- Registers users
- Authenticates users by email and password
- Issues JWT access tokens
- Fetches and deletes users by id

## Architecture overview

The implementation follows a layered structure inspired by clean architecture:

- `src/controllers`: HTTP entrypoints and OpenAPI annotations
- `src/core`: business logic, domain entities, domain errors, repository ports
- `src/infra`: TypeORM models, mappers, and repository implementation
- `src/module`: Nest module wiring and dependency injection tokens/constants
- `src/auth`: authentication guard and `@Public` decorator

Main flow:

1. Controller receives request and delegates to service.
2. Service uses repository port (`IUserRepository`) from `src/core/port`.
3. Infra repository (`TypeormUserRepository`) implements the port with TypeORM.
4. Global exception filter maps domain errors to HTTP statuses.

## Authentication and endpoint protection

All endpoints are protected by default.

Why:

- `APP_GUARD` is registered with `AuthGuard` in `src/module/user.module.ts`.
- That makes guard evaluation global for all routes in the module.

How to make an endpoint public:

- Add `@Public()` on the controller method (or controller class).
- `@Public()` sets metadata key `isPublic`.
- `AuthGuard` checks that metadata and skips JWT validation when present.

In short:

- Default: protected route, requires `Authorization: Bearer <token>`
- With `@Public()`: route is accessible without token

## Error handling

Global error handling is implemented by `CatchGlobalFilter`.

- Nest `HttpException` keeps its own status code.
- Domain errors are mapped to status codes through an error map.
- Unknown errors return `500 Internal Server Error`.

The filter also logs request context and error details with info/debug/error levels.

## Configuration

Environment variables used by this service:

- `PORT`: HTTP server port (default: `3004`)
- `ACCESS_TOKEN_DURATION`: JWT access token duration in seconds (default: `300`)
- `JWT_SECRET`: signing secret used by `JwtModule`

Config is loaded in `src/config/env.config.ts`.

## Toolchain versions

Confirmed in this environment:

- Node.js: `v24.14.0`
- Yarn: `4.12.0`

## Local development

Run commands from the repository root (`spend-back`) using Yarn workspaces.

Install dependencies:

```bash
yarn install
```

Run in dev mode:

```bash
yarn workspace user-service dev
```

Build:

```bash
yarn workspace user-service build
```

Run tests:

```bash
yarn workspace user-service test
yarn workspace user-service test:e2e
yarn workspace user-service test:cov
```

Run lint:

```bash
yarn workspace user-service lint
```

## API documentation

Swagger is enabled in bootstrap.

- OpenAPI UI path: `/api`

## Notes for contributors

- Keep controller logic thin.
- Put business rules in services under `src/core/services`.
- Depend on repository ports in core, not TypeORM repository directly.
- Keep mapping between domain and persistence in `src/infra/mappers`.
