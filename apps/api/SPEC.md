# Module: api

## Purpose
NestJS backend for support email ingestion, AI classification, and workflow management APIs.

## Responsibilities
- Receive ingestion payloads from n8n
- Persist normalized domain entities in Prisma/Supabase Postgres
- Execute AI classification and draft generation with OpenAI
- Expose typed CRUD endpoints for email responses, issues, users, and notes
- Maintain separate processing lifecycle and business workflow status

## Does NOT Handle
- Frontend rendering
- External integrations implementation (only provider interface)
- Real outbound email sending

## Dependencies
- Internal: `openai`, `emails`, `email-responses`, `issues`, `users`, `integrations`
- External: NestJS, Prisma, OpenAI npm package, class-validator

## Exports
- REST API under `/api`

## Security Considerations
- Secrets are loaded only from env vars
- Write endpoints are validated with DTOs
- Open endpoints by current scope; ready for future auth guards
