# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Tnzeem Courses — a NestJS 11 + TypeORM (PostgreSQL) REST API for an online courses platform.
The product grows in phases; see `project-phases/overview.md` for the domain model and roadmap.
Phase 1 (public website + staff dashboard) is complete; Phase 2 (instructor dashboard, course
rounds, orders, enrollments) is in progress. Node 22.x. API served at `:3000`, Swagger at
`/api/docs`.

## Commands

```bash
npm run start:dev        # watch-mode dev server
npm run build            # nest build (postbuild copies src/i18n -> dist/i18n)
npm run start:prod       # build + run dist/src/main.js
npm run lint             # eslint --fix over {src,apps,libs,test}
npm run format           # prettier

npm test                             # all jest specs (*.spec.ts under src/)
npm test -- path/to/file.spec.ts     # single spec file
npm test -- -t "test name"           # single test by name
npm run test:e2e                     # e2e (test/jest-e2e.json)

npm run seed                                        # seed admin user + permissions + sources
npm run migration:generate --name=<Name>           # generate migration from entity diff
npm run migration:run
npm run migration:revert
```

Note: `synchronize` is ON in non-production (`database.config.ts`), so schema auto-syncs from
entities in dev. Migrations in `src/database/migrations/` are for production/explicit changes
(e.g. SQL views like `TrainerStatisticsView`). Migration CLI uses `src/database/data-source.ts`.

## Architecture

### Module layout by audience
Feature modules are grouped by consumer, all wired in `src/app.module.ts`:
- `src/staff-dashboard/*` — admin/support/sales; RBAC-protected
- `src/instructor-dashboard/*` — trainer self-service (Phase 2)
- `src/website/*` — public/guest endpoints (`website/guest`, `website/shared`)
- `src/shared/*` — cross-audience domains: `auth`, `user`, `orders`, `payment`, `enrollments`, `storage`
- `src/common/*` — decorators, guards, pipes, DTO bases, helpers (no feature logic)

Route prefixes follow the group, e.g. `@Controller('staff-dashboard/courses')`.

### Per-module structure (enforced — see `skills/nestjs-crud.md`)
```
module/
  dto/requests/   create-<m>.request.ts, update-<m>.request.ts, query-<m>.request.ts
  dto/responses/  <m>.response.ts
  entities/       <m>.entity.ts
  <m>.controller.ts  <m>.service.ts  <m>.module.ts   (+ repositories/ where used)
```
Conventions: request classes are named `XxxRequest` (never `Dto`); response classes `XxxResponse`.
Controllers only receive/validate/delegate/map — **all business logic lives in services**.
Never return entities from controllers — always map entity → response class.
Every request field validated with class-validator; every endpoint documented with `@ApiTags`,
`@ApiOperation`, `@ApiResponse`, `@ApiParam/@ApiQuery`, `@ApiBearerAuth`.

### Auth & RBAC
JWT bearer auth. `JwtAuthGuard` (`src/common/guards/`) verifies the token and attaches the
payload to `request.user`, read via `@CurrentUser()` / `@CurrentUser('sub')`.
- `PermissionsGuard` + `@Permissions('leads.view', ...)` — fine-grained RBAC; permissions are
  embedded in the JWT payload. Use `@UseGuards(JwtAuthGuard, PermissionsGuard)` (order matters).
- `TrainerGuard` — restricts to `userType === TRAINER` for instructor-dashboard routes.
Auth logic is custom (not passport strategies) despite passport deps being present.

### i18n (nestjs-i18n)
Language resolved from `x-lang` header then `Accept-Language`; fallback `en`. Files in
`src/i18n/{ar,en}/{common,errors,validation}.json`. Never hardcode user-facing messages — use
translation keys (e.g. `errors.INSUFFICIENT_PERMISSIONS`). Validation errors are auto-translated
via the global `I18nValidationPipe` + `I18nValidationExceptionFilter` in `main.ts`.
Translatable **content** (course name/description) is stored as `jsonb` `{ ar, en }` columns;
resolve for a response with `getTranslatedString(value, lang)` (`src/common/utils/translation.util.ts`),
`lang` supplied by the `@Lang()` decorator.

### Entities
- Timestamps: `@Column(() => AuditColumns, { prefix: false })` (`created_at` / `updated_at`).
- Soft delete: `@DeleteDateColumn({ name: 'deleted_at' })` (or `SoftDeleteColumns`).
- snake_case DB columns via explicit `name:`; enum columns use string enums from `enums/`.
- `autoLoadEntities` is on — no central entity registry to update.

### Responses
Wrap non-paginated payloads in `ApiResponseDto.success(data, message?)` /
`ApiResponseDto.fail(...)` (`src/common/dto/responses/api.response.ts`). Paginated list
endpoints return `PaginationResponseDto<T>` directly.

### Storage & payments (strategy pattern)
- `StorageService.upload(file, UploadType)` dispatches to local / DigitalOcean (S3) / Vimeo
  strategies via `storage-strategy.resolver.ts`. File endpoints use `FileFieldsInterceptor` +
  `@ApiConsumes('multipart/form-data')`; `MultipartJsonPipe` (global) parses JSON fields sent
  as multipart strings.
- `payment/` uses `payment-strategy.factory.ts` over cash / bank-transfer strategies.

## Config

`@nestjs/config` with `registerAs` namespaces (`app`, `database`, `i18n`) in `src/config/`,
loaded globally. Env in `.env` (see `README.md`): `DB_*`, `APP_PORT`, `CORS_ALLOWED_ORIGINS`
(comma-separated, enforced in `main.ts`), `NODE_ENV`, `TYPEORM_SYNC`.
