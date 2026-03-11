# Valsoft Support Ops Monorepo

Internal AI Support Email Triage and Response Dashboard.

## Apps
- `apps/api`: NestJS backend (ingestion, AI processing, workflows, Prisma)
- `apps/web`: Next.js dashboard (email responses, issues Kanban, users)
- `packages/shared`: shared enums, labels, and TypeScript contracts

## Quick Start
1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env
```

Set both `DATABASE_URL` (Supabase pooled URL) and `DIRECT_URL` (Supabase direct URL) in `.env`.

3. Configure Prisma and database:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
```

4. Start both apps:

```bash
npm run dev
```

- API: `http://localhost:4000/api`
- Swagger: `http://localhost:4000/api/docs`
- Web: `http://localhost:3000`

## Local Databases (Docker)

Start local Postgres + test Postgres + Supabase Auth services:

```bash
npm run db:up
```

Stop local database stack:

```bash
npm run db:down
```

Useful URLs:
- Supabase Auth gateway: `http://localhost:9998/auth/v1`
- Local DB: `postgresql://postgres:postgres@localhost:54322/support_ops?schema=public`
- Local test DB: `postgresql://postgres:postgres@localhost:54323/support_ops_test?schema=public`

## Key Endpoints
- `POST /api/emails/ingest`
- `GET /api/email-responses`
- `PATCH /api/email-responses/:id`
- `POST /api/email-responses/:id/approve`
- `GET /api/issues`
- `PATCH /api/issues/:id`
- `PATCH /api/issues/:id/category`
- `GET /api/users`

## n8n Integration
See [docs/n8n-workflow.md](./docs/n8n-workflow.md).
