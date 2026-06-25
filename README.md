# Koonek HOP

Koonek Healthcare Operations Platform — a subscription SaaS for clinic and medical practice management, built under the [aonikenk.dev](https://aonikenk.dev) brand.

This is the successor to `co-med` (a single-tenant clinic app built for one client). See `MIGRATION.md` in the `co-med` repository for the full migration strategy and decision log.

## Structure

```
apps/
  web/      React 18 + Vite + TypeScript + Tailwind SPA
  api/      Express + TypeScript + Prisma (PostgreSQL) REST API
packages/
  design-tokens/  Brand color/typography tokens, sourced from the aonikenk.dev Brand Manual
  config/         Shared tsconfig and ESLint presets
```

## Getting started

```bash
npm install
cp apps/api/.env.example apps/api/.env   # fill in DATABASE_URL and JWT_SECRET
npm run dev:api    # starts the API on :8000
npm run dev:web    # starts the web app on :5173
```

## Conventions

- Codebase, comments, commit messages, and internal docs are in English.
- User-facing UI strings go through i18n (`es` default, `en` available) — never hardcoded in components.
- Tenant isolation: every domain table carries `organizationId`/`organization_id`; queries must scope explicitly in the service layer in addition to database-level RLS.
