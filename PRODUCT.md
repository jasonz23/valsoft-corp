# AI Support Email Triage and Response Dashboard — Core Specification

## Product Vision
Build an internal operations product that ingests support emails, uses AI to classify and draft a response, and tracks customer-response workflow and internal issue workflow independently.

## Non-Negotiable Coding Standards

### TypeScript
- Strict mode is required for all packages
- No untyped API payloads across module boundaries
- All DTOs and API contracts must be explicit and validated

### Architecture
- Monorepo with `apps/api`, `apps/web`, and `packages/shared`
- Domain modules in backend: `emails`, `email-responses`, `issues`, `users`, `openai`, `integrations`
- Services own business logic; controllers only coordinate request/response
- Processing state is separate from issue and response workflow state

### Security
- OpenAI keys and database credentials are backend-only environment variables
- Input validation on every write endpoint
- No secret values sent to frontend
- Endpoints currently open by scope, but code is structured for future auth middleware

### Testing
- Unit tests for core backend workflow services
- Endpoint tests for ingestion path and high-value transitions

### Logging
- Structured server-side logging for ingestion and processing lifecycle transitions

## Module Registry
- `apps/api`: ingestion, AI processing, workflow APIs
- `apps/web`: operations dashboards for email responses, issues, users
- `packages/shared`: shared enums, labels, and DTO-like public types

## Tech Stack
- Frontend: Next.js App Router + TypeScript
- Backend: NestJS + TypeScript
- DB: Supabase Postgres
- ORM: Prisma
- AI: OpenAI official npm package

## API Conventions
- Base path: `/api`
- JSON request/response
- Query filters via optional query params
- Domain enums must match DB enum values exactly
