# Project Structure & DevOps Guide

This reference defines the canonical folder layout, modular architecture, and DevOps configuration for full-stack JS/TS applications.

## Table of Contents

1. [Architecture Philosophy — Modular by Design](#architecture-philosophy)
2. [Spec-Driven Modules](#spec-driven-modules)
3. [The Core Spec — PRODUCT.md](#the-core-spec)
4. [Monorepo Structure](#monorepo-structure)
5. [Backend Structure](#backend-structure)
6. [Frontend Structure (Web)](#frontend-structure-web)
7. [Mobile Structure (React Native / Expo)](#mobile-structure)
8. [Shared Packages](#shared-packages)
9. [Environment Configuration](#environment-configuration)
10. [Docker Setup](#docker-setup)
11. [CI/CD Pipeline](#cicd-pipeline)
12. [Essential Config Files](#essential-config-files)

---

## Architecture Philosophy

Every folder is a module. Every module is self-contained. Every module has a spec.

The goal: any developer (or AI agent) should be able to open a folder, read its spec file, and know exactly what belongs there, what doesn't, and why the module exists. This eliminates the "where does this go?" problem that plagues growing codebases.

Three rules govern folder organization:

1. **Group by domain, not by type.** A `users/` folder contains everything about users — routes, services, types, tests. Not a `controllers/` folder with every controller in the app.

2. **Every module folder has a `SPEC.md`.** This file describes what the module does, what it depends on, what it exports, and what should never be added to it. It's the contract between the module and the rest of the codebase.

3. **The root `PRODUCT.md` is law.** It defines the product goals, mandatory coding standards, and architectural constraints that every module must follow. Module specs inherit from and cannot contradict PRODUCT.md.

---

## Spec-Driven Modules

### SPEC.md Format

Every feature folder (module) contains a `SPEC.md` that acts as a guide for any developer or AI agent working in that folder:

```markdown
# Module: [module-name]

## Purpose
One-sentence description of what this module does and why it exists.

## Responsibilities
- What this module owns (bullet list of specific responsibilities)

## Does NOT Handle
- What explicitly does NOT belong here (prevents scope creep)

## Dependencies
- Internal: which other modules this depends on
- External: which third-party packages this uses

## Exports
- What this module exposes to the rest of the app (services, types, components)

## File Organization
- How files in this folder are organized and named

## Testing Requirements
- What must be tested and how (unit, integration, e2e)

## Security Considerations
- Any security concerns specific to this module
```

### Example: `modules/auth/SPEC.md`

```markdown
# Module: auth

## Purpose
Handles all authentication and session management for the application.

## Responsibilities
- User login, logout, and session refresh
- JWT token generation and validation
- OAuth provider integration (Google, GitHub)
- Password reset flow
- MFA enrollment and verification

## Does NOT Handle
- User profile management (see modules/users)
- Role-based permissions (see modules/authorization)
- API key management for external integrations (see modules/api-keys)

## Dependencies
- Internal: modules/users (for user lookup), modules/email (for reset emails)
- External: @clerk/nextjs, jose (JWT), zod

## Exports
- AuthService: main service class
- authMiddleware: Express/Fastify middleware
- Types: AuthResult, SessionPayload, LoginDto

## File Organization
auth/
├── SPEC.md
├── auth.service.ts        # Core business logic
├── auth.controller.ts     # Route handlers
├── auth.middleware.ts      # Auth middleware
├── auth.routes.ts          # Route definitions
├── auth.types.ts           # TypeScript types
├── auth.validation.ts      # Zod schemas
├── auth.test.ts            # Unit tests
└── auth.integration.test.ts # Integration tests

## Testing Requirements
- Unit test every auth service method
- Integration test the full login/logout flow
- Test token expiration and refresh rotation
- Test rate limiting on login endpoint

## Security Considerations
- Rate limit login to 5 attempts per 15 minutes per IP
- Never log passwords or tokens, even in debug mode
- Rotate refresh tokens on every use
- Hash password reset tokens before storing
```

---

## The Core Spec — PRODUCT.md

At the root of your project lives `PRODUCT.md`. This is the single source of truth that every module, every developer, and every AI agent must follow. It's not a README — it's a mandatory, strict specification.

### PRODUCT.md Template

```markdown
# [Product Name] — Core Specification

## Product Vision
[2-3 sentences about what this product does and who it's for]

## Non-Negotiable Coding Standards

These are mandatory. No exceptions. No "we'll fix it later."

### TypeScript
- strict: true in all tsconfig files
- No `any` types — use `unknown` with type guards
- Explicit return types on all exported functions
- Discriminated unions for state, not optional fields

### Architecture
- Domain-driven module structure — group by feature, not by type
- Every module folder has a SPEC.md
- Services contain business logic. Controllers handle HTTP. Never mix them
- Repository pattern for data access — services never call the database directly

### Security
- Auth via Supabase Auth (GoTrue) — no custom auth
- All secrets in environment variables, never hardcoded
- Input validation with Zod at the API boundary
- Rate limiting on all endpoints — [X] req/hour per IP baseline
- CORS locked to production domains only
- RLS enabled on all database tables

### Testing (TDD)
- Test-driven development: write tests first, then implement
- Unit tests for all business logic (services) with Jest mocking
- Integration tests for all API endpoints
- Test files co-located with source files (*.spec.ts)
- Minimum [X]% coverage on critical paths

### Logging
- Structured JSON logging via Pino (no console.log)
- GCP/AWS compatible severity levels
- Sensitive data redaction at logger level
- Correlation IDs (x-request-id) on every log line

### Swagger / OpenAPI
- Every endpoint decorated with @ApiOperation, @ApiResponse, @ApiTags
- Every DTO decorated with @ApiProperty
- Swagger UI served at /api/docs
- Client SDKs generated from OpenAPI spec

### Git & Workflow
- Conventional commits (feat:, fix:, refactor:, docs:, test:, chore:)
- Feature branches off main
- PRs require passing CI before merge
- No force pushes to main

## Module Registry

| Module | Owner | Purpose |
|--------|-------|---------|
| auth | — | Authentication and session management |
| users | — | User profiles and account settings |
| [etc] | — | [etc] |

## Tech Stack
- Frontend: [React/Next.js/etc]
- Backend: [Node.js + Express/Fastify/NestJS/etc]
- Database: [PostgreSQL/etc]
- ORM: [Prisma/Drizzle/etc]
- Auth: Supabase Auth (GoTrue)
- Hosting: [Vercel/AWS/etc]

## API Conventions
- RESTful, versioned: /api/v1/...
- Consistent response shape: { data, error, pagination }
- Cursor-based pagination for lists
- OpenAPI spec maintained and up-to-date
```

### How PRODUCT.md Gets Used

When an AI agent (or developer) starts working on any task, the process is:

1. Read `PRODUCT.md` — understand the mandatory standards
2. Identify which module(s) the task touches
3. Read the relevant `SPEC.md` files — understand module boundaries
4. Write code that satisfies both the product standards and the module spec
5. If the task requires a new module, create the module folder with a `SPEC.md` first, then write code

---

## Monorepo Structure

```
project-root/
├── PRODUCT.md                 # Core product spec (mandatory standards)
├── package.json               # Root workspace config + scripts
├── turbo.json                 # Turborepo pipeline config
├── .gitignore                 # FIRST file created
├── .env.example               # Template — never commit actual .env
├── .env                       # Dev environment (git-ignored)
├── .env.test                  # Test environment (git-ignored)
├── docker-compose.yml         # Dev DB + Test DB + Supabase Auth
├── docker-compose.ci.yml      # CI-only minimal test DB
├── Dockerfile                 # Multi-stage production build
├── cloudbuild.yaml            # GCP Cloud Build CI/CD pipeline
├── scripts/
│   ├── init-db.sql            # Creates auth schema + extensions
│   └── nginx.conf             # Supabase gateway proxy config
│
├── apps/
│   ├── web/                   # Next.js / React web app
│   │   ├── SPEC.md
│   │   └── ...
│   ├── mobile/                # React Native / Expo app
│   │   ├── SPEC.md
│   │   └── ...
│   └── api/                   # NestJS Backend API server
│       ├── SPEC.md
│       └── ...
│
├── packages/
│   ├── shared/                # Shared types, utils, constants
│   │   ├── SPEC.md
│   │   └── ...
│   ├── ui/                    # Shared UI components (web)
│   │   ├── SPEC.md
│   │   └── ...
│   └── config/                # Shared ESLint, TS configs
│       └── ...
│
└── docs/
    ├── api.md                 # API documentation
    ├── architecture.md        # Architecture decisions
    └── onboarding.md          # Developer onboarding guide
```

---

## Backend Structure (NestJS)

```
apps/api/
├── SPEC.md                    # API app-level spec
├── package.json
├── tsconfig.json
├── nest-cli.json              # NestJS CLI config
├── src/
│   ├── main.ts                # Entry point — bootstrap, Swagger setup, global pipes
│   ├── app.module.ts          # Root module — imports all feature modules
│   │
│   ├── config/
│   │   ├── SPEC.md
│   │   ├── config.module.ts   # ConfigModule with env validation
│   │   ├── env.validation.ts  # Zod/class-validator env schema
│   │   └── database.config.ts # TypeORM/Prisma connection config
│   │
│   ├── common/                # Cross-cutting concerns
│   │   ├── SPEC.md
│   │   ├── filters/
│   │   │   └── all-exceptions.filter.ts   # Global exception filter
│   │   ├── guards/
│   │   │   ├── auth.guard.ts              # JWT auth guard
│   │   │   └── roles.guard.ts             # RBAC guard
│   │   ├── interceptors/
│   │   │   ├── logging.interceptor.ts     # Request/response logging
│   │   │   └── transform.interceptor.ts   # Response shape wrapper
│   │   ├── pipes/
│   │   │   └── validation.pipe.ts         # Global validation pipe
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts  # @CurrentUser() param decorator
│   │   │   └── roles.decorator.ts         # @Roles() method decorator
│   │   └── dto/
│   │       ├── pagination.dto.ts          # Shared pagination query DTO
│   │       └── paginated-response.dto.ts  # Shared paginated response wrapper
│   │
│   ├── logger/
│   │   ├── SPEC.md
│   │   ├── logger.module.ts              # Pino-based structured logger
│   │   └── logger.service.ts             # Injectable AppLoggerService
│   │
│   ├── modules/               # Feature modules (domain-driven)
│   │   ├── auth/
│   │   │   ├── SPEC.md
│   │   │   ├── auth.module.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.service.spec.ts       # Unit tests (written FIRST)
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.controller.spec.ts    # Integration tests
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts           # @ApiProperty decorated
│   │   │   │   ├── register.dto.ts
│   │   │   │   └── auth-response.dto.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   │
│   │   ├── users/
│   │   │   ├── SPEC.md
│   │   │   ├── users.module.ts
│   │   │   ├── users.service.ts
│   │   │   ├── users.service.spec.ts      # Unit tests (written FIRST)
│   │   │   ├── users.controller.ts
│   │   │   ├── users.controller.spec.ts   # Integration tests
│   │   │   ├── users.repository.ts
│   │   │   ├── dto/
│   │   │   │   ├── create-user.dto.ts
│   │   │   │   ├── update-user.dto.ts
│   │   │   │   └── user-response.dto.ts
│   │   │   ├── entities/
│   │   │   │   └── user.entity.ts
│   │   │   └── helpers/                   # Module-scoped helper functions
│   │   │       └── format-user-response.ts
│   │   │
│   │   └── [feature]/
│   │       ├── SPEC.md
│   │       └── ... (same pattern)
│   │
│   └── shared/
│       ├── SPEC.md
│       ├── utils/                         # Cross-module helper functions
│       │   ├── pagination.helper.ts
│       │   ├── slug.helper.ts
│       │   └── date.helper.ts
│       └── types/
│           └── index.ts                   # Shared backend types
│
├── test/
│   ├── jest-e2e.json          # E2E test config
│   ├── setup.ts               # Test environment setup
│   ├── factories/             # Shared test data factories
│   │   ├── user.factory.ts
│   │   └── order.factory.ts
│   └── helpers/               # Test utility functions
│       └── create-test-app.ts
│
└── database/
    ├── SPEC.md
    ├── migrations/            # Database migrations
    └── seed.ts                # Seed data for development
```

---

## Frontend Structure (Web)

```
apps/web/
├── SPEC.md
├── package.json
├── tsconfig.json
├── next.config.js             # (or vite.config.ts)
├── public/
│   └── ...
├── src/
│   ├── app/                   # Next.js App Router pages
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   └── (dashboard)/
│   │       ├── layout.tsx
│   │       └── [feature]/page.tsx
│   │
│   ├── components/
│   │   ├── SPEC.md
│   │   ├── ui/                # Generic UI components (Button, Input, Modal)
│   │   │   ├── SPEC.md
│   │   │   └── ...
│   │   └── [feature]/         # Feature-specific components
│   │       ├── SPEC.md
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── SPEC.md
│   │   ├── use-auth.ts
│   │   ├── use-debounce.ts
│   │   └── use-pagination.ts
│   │
│   ├── services/              # API client layer
│   │   ├── SPEC.md
│   │   ├── api-client.ts      # Base fetch/axios config
│   │   └── [feature].service.ts
│   │
│   ├── stores/                # State management (Zustand, etc.)
│   │   ├── SPEC.md
│   │   └── [feature].store.ts
│   │
│   ├── types/
│   │   └── index.ts           # Shared frontend types
│   │
│   └── lib/
│       ├── SPEC.md
│       └── utils.ts           # Frontend utility functions
│
└── tests/
    └── ...
```

---

## Mobile Structure

```
apps/mobile/
├── SPEC.md
├── package.json
├── app.json                   # Expo config
├── tsconfig.json
├── src/
│   ├── app/                   # Expo Router (file-based routing)
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── (auth)/
│   │   │   ├── login.tsx
│   │   │   └── register.tsx
│   │   └── (tabs)/
│   │       ├── _layout.tsx
│   │       ├── home.tsx
│   │       └── profile.tsx
│   │
│   ├── components/
│   │   ├── SPEC.md
│   │   └── ...
│   │
│   ├── hooks/
│   │   ├── SPEC.md
│   │   └── ...
│   │
│   ├── services/
│   │   ├── SPEC.md
│   │   └── ...
│   │
│   └── stores/
│       ├── SPEC.md
│       └── ...
│
└── assets/
    └── ...
```

---

## Shared Packages

```
packages/shared/
├── SPEC.md
├── package.json
├── src/
│   ├── types/                 # Types shared between frontend and backend
│   │   ├── user.ts
│   │   ├── api-responses.ts
│   │   └── index.ts
│   ├── constants/
│   │   └── index.ts           # Shared constants (roles, statuses, limits)
│   ├── validation/
│   │   └── schemas.ts         # Zod schemas shared between client and server
│   └── utils/
│       └── index.ts           # Pure utility functions (date formatting, etc.)
└── tsconfig.json
```

---

## Environment Configuration

### Environment files

```
.env                  # Development environment (local dev DB on 54322, local GoTrue)
.env.test             # Test environment (test DB on 54323, test JWT secret)
.env.example          # Template with all required vars (committed to git, no real values)
```

Both `.env` and `.env.test` are git-ignored. Only `.env.example` is committed.

### .env.test example

```bash
# .env.test — points at the ephemeral test database
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://postgres:postgres@localhost:54323/app_test
DIRECT_URL=postgresql://postgres:postgres@localhost:54323/app_test
SUPABASE_URL=http://localhost:9998
SUPABASE_JWT_SECRET=super-secret-jwt-token-for-local-dev-min-32-chars
LOG_LEVEL=error
```

### Loading .env.test in tests

```typescript
// test/setup.ts — load BEFORE any imports
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(__dirname, '../.env.test') });
```

```json
// In jest config (package.json or jest.config.ts)
{ "setupFiles": ["./test/setup.ts"] }
```

### Env validation with Zod (required)

```typescript
// src/config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string(),
  DIRECT_URL: z.string().optional(),
  SUPABASE_URL: z.string().url(),
  SUPABASE_JWT_SECRET: z.string().min(32),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  CORS_ORIGINS: z.string().transform(s => s.split(',')).optional(),
});

export const env = envSchema.parse(process.env);
```

---

## Docker Setup

### docker-compose.yml (development + test + Supabase Auth)

```yaml
services:
  db:
    image: postgres:16-alpine
    ports:
      - "54322:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_dev
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  db-test:
    image: postgres:16-alpine
    ports:
      - "54323:5432"
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_test
    volumes:
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  supabase-auth:
    image: supabase/gotrue:v2.158.1
    depends_on:
      db:
        condition: service_healthy
    environment:
      GOTRUE_API_HOST: 0.0.0.0
      GOTRUE_API_PORT: 9999
      API_EXTERNAL_URL: http://localhost:9998
      GOTRUE_DB_DRIVER: postgres
      GOTRUE_DB_DATABASE_URL: "postgres://postgres:postgres@db:5432/app_dev?sslmode=disable&search_path=auth"
      GOTRUE_DB_NAMESPACE: auth
      GOTRUE_SITE_URL: http://localhost:3000
      GOTRUE_JWT_SECRET: super-secret-jwt-token-for-local-dev-min-32-chars
      GOTRUE_JWT_EXP: 3600
      GOTRUE_DISABLE_SIGNUP: "false"
      GOTRUE_EXTERNAL_EMAIL_ENABLED: "true"
      GOTRUE_MAILER_AUTOCONFIRM: "true"

  supabase-gateway:
    image: nginx:alpine
    depends_on:
      - supabase-auth
    ports:
      - "9998:9998"
    volumes:
      - ./scripts/nginx.conf:/etc/nginx/conf.d/default.conf:ro

volumes:
  pgdata:
```

Key design: `db` has a persistent volume for dev data. `db-test` has NO volume — it starts completely fresh every time, guaranteeing test isolation. Both run `init-db.sql` which creates the `auth` schema and necessary extensions.

### scripts/init-db.sql

```sql
-- Create auth schema for Supabase GoTrue
CREATE SCHEMA IF NOT EXISTS auth;

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
```

### scripts/nginx.conf (Supabase gateway)

```nginx
server {
    listen 9998;
    location / {
        proxy_pass http://supabase-auth:9999;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Dockerfile (multi-stage, production)

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN addgroup -S app && adduser -S app -G app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/prisma ./prisma
USER app
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

### docker-compose.ci.yml (CI-only — minimal test DB)

```yaml
services:
  db-test-ci:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: app_test
    volumes:
      - ./scripts/init-db.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5
```

### Package.json scripts

```json
{
  "scripts": {
    "docker:up": "docker compose up -d",
    "docker:down": "docker compose down",
    "docker:reset": "docker compose down -v && docker compose up -d",
    "db:migrate": "npx prisma migrate deploy",
    "db:migrate:dev": "npx prisma migrate dev",
    "db:migrate:test": "dotenv -e .env.test -- npx prisma migrate deploy",
    "db:seed": "npx prisma db seed",
    "db:studio": "npx prisma studio",
    "start:dev": "nest start --watch",
    "start:prod": "node dist/main",
    "build": "nest build",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "typecheck": "tsc --noEmit",
    "test": "dotenv -e .env.test -- jest",
    "test:watch": "dotenv -e .env.test -- jest --watch",
    "test:cov": "dotenv -e .env.test -- jest --coverage",
    "test:ci": "jest --ci --coverage --forceExit",
    "test:e2e": "dotenv -e .env.test -- jest --config ./test/jest-e2e.json",
    "migrate:ci": "npx prisma migrate deploy",
    "swagger:generate": "npx openapi-generator-cli generate -i http://localhost:3000/api-json -g typescript-axios -o ./generated/api-client"
  }
}
```

---

## CI/CD Pipeline — GCP Cloud Build

### cloudbuild.yaml

The pipeline follows: **build → push → test (ephemeral DB) → migrate → deploy**. Private secrets come from GCP Secret Manager. Public config is set directly in the file.

```yaml
steps:
  # Build the container image
  - id: docker-build
    name: 'gcr.io/cloud-builders/docker'
    args:
      [
        'build',
        '-t',
        '${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:$COMMIT_SHA',
        '.',
      ]

  # Push the container image to Artifact Registry
  - id: docker-push
    name: 'gcr.io/cloud-builders/docker'
    args:
      [
        'push',
        '${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:$COMMIT_SHA',
      ]

  # Spin up the test database
  - id: start-test-db
    name: 'docker/compose:1.29.2'
    args: ['-f', 'docker-compose.ci.yml', 'up', '-d', 'db-test-ci']

  # Run tests using the built image
  - id: run-tests
    name: '${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:$COMMIT_SHA'
    entrypoint: sh
    args:
      - '-c'
      - 'cd /app && npm run test:ci'
    env:
      # Public config — safe to store in the build file
      - 'NODE_ENV=test'
      - 'LOG_LEVEL=error'
      - 'PORT=3001'
      # Test database — ephemeral, no real data
      - 'DATABASE_URL=postgresql://postgres:postgres@db-test-ci:5432/app_test?connect_timeout=300'
      - 'DIRECT_URL=postgresql://postgres:postgres@db-test-ci:5432/app_test?connect_timeout=300'
      # Test-only dummy values for required env vars
      - 'SUPABASE_URL=http://localhost:9998'
      - 'SUPABASE_JWT_SECRET=super-secret-jwt-token-for-local-dev-min-32-chars'
    waitFor: ['docker-build', 'docker-push', 'start-test-db']

  # Spin down the test database
  - id: stop-test-db
    name: 'docker/compose:1.29.2'
    args: ['-f', 'docker-compose.ci.yml', 'down']
    waitFor: ['run-tests']

  # Run database migrations against production
  - id: migrate
    name: '${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:$COMMIT_SHA'
    entrypoint: sh
    args:
      - '-c'
      - 'cd /app && npm run migrate:ci'
    secretEnv: ['DATABASE_URL', 'DIRECT_URL']
    waitFor: ['run-tests']

  # Deploy container image to Cloud Run
  - id: deploy
    name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: gcloud
    args:
      - run
      - deploy
      - ${_SERVICE}
      - --image
      - ${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:$COMMIT_SHA
      - --args=run,start:prod
      - --region
      - ${_REGION}
      - --platform
      - managed
      - --min-instances=1
      - --max-instances=3
      # Private secrets — from GCP Secret Manager, never in the build file
      - >-
        --set-secrets=
        DATABASE_URL=DATABASE_URL:latest,
        DIRECT_URL=DIRECT_URL:latest,
        SUPABASE_JWT_SECRET=SUPABASE_JWT_SECRET:latest,
        SUPABASE_SERVICE_ROLE_KEY=SUPABASE_SERVICE_ROLE_KEY:latest
      # Public config — safe to store directly
      - >-
        --update-env-vars=^|||^
        NODE_ENV=production|||
        PORT=3000|||
        LOG_LEVEL=info|||
        SUPABASE_URL=${_SUPABASE_URL}|||
        CORS_ORIGINS=${_CORS_ORIGINS}
    waitFor: ['migrate']

# Template substitutions — project-specific values
substitutions:
  _REGION: us-west1
  _REPO: my-app
  _SERVICE: api
  _SUPABASE_URL: https://your-project.supabase.co
  _CORS_ORIGINS: https://your-app.com

# Private secrets from GCP Secret Manager (for migration step)
availableSecrets:
  secretManager:
    - versionName: projects/${PROJECT_NUMBER}/secrets/DATABASE_URL/versions/latest
      env: 'DATABASE_URL'
    - versionName: projects/${PROJECT_NUMBER}/secrets/DIRECT_URL/versions/latest
      env: 'DIRECT_URL'

images:
  - ${_REGION}-docker.pkg.dev/${PROJECT_ID}/${_REPO}/${_SERVICE}:$COMMIT_SHA

options:
  machineType: 'E2_HIGHCPU_8'
  logging: CLOUD_LOGGING_ONLY
```

### Secrets vs Config — Decision Guide

| Variable | Type | Where it lives | Why |
|----------|------|----------------|-----|
| `NODE_ENV`, `PORT`, `LOG_LEVEL` | Public config | cloudbuild.yaml `--update-env-vars` | Non-sensitive, version-controlled |
| `CORS_ORIGINS`, `SUPABASE_URL` | Public config | cloudbuild.yaml substitutions | URL-level info, not secret |
| `DATABASE_URL`, `DIRECT_URL` | Private secret | GCP Secret Manager → `--set-secrets` | Contains credentials |
| `SUPABASE_JWT_SECRET` | Private secret | GCP Secret Manager → `--set-secrets` | Signing key, must be secret |
| `SUPABASE_SERVICE_ROLE_KEY` | Private secret | GCP Secret Manager → `--set-secrets` | Admin-level access key |
| API keys (Stripe, SendGrid, etc.) | Private secret | GCP Secret Manager → `--set-secrets` | Third-party credentials |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Private secret | GCP Secret Manager → `--set-secrets` | OAuth credential |
| `GOOGLE_OAUTH_CLIENT_ID` | Public config | cloudbuild.yaml substitutions | Client ID is public by design |

**Rule of thumb:** If seeing the value in a git log or build output would create a security risk, it's a private secret and goes in Secret Manager. Everything else is public config.

---

## Essential Config Files

### .gitignore (create FIRST)

```
node_modules/
dist/
build/
.next/
.env
.env.test
.env.local
.env.*.local
*.pem
*.key
.DS_Store
coverage/
*.log
generated/
```

### tsconfig.json (strict base)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Refactoring Existing Repos

When refactoring an existing codebase to follow this structure:

1. **Start with PRODUCT.md.** Write the core spec first — this clarifies what the codebase should become
2. **Map existing code to modules.** Identify natural domain boundaries in the existing code
3. **Create module folders with SPEC.md first.** Write the spec before moving any code
4. **Move one module at a time.** Don't try to restructure everything at once
5. **Maintain backward compatibility.** Use re-exports from old paths while transitioning
6. **Add tests before refactoring.** If code doesn't have tests, write characterization tests that capture current behavior before changing anything
7. **Fix the security fundamentals early.** .gitignore, env vars, input validation — these are quick wins with high impact

### Refactoring Checklist

```
[ ] PRODUCT.md written and approved
[ ] Module boundaries identified
[ ] SPEC.md written for each module
[ ] .gitignore verified (no secrets in git history)
[ ] Environment variables extracted from code
[ ] Input validation added at API boundaries
[ ] Error handling standardized
[ ] Tests added for existing critical paths
[ ] Code moved module by module (not all at once)
[ ] Re-exports maintained for backward compatibility
[ ] CI pipeline updated
```
