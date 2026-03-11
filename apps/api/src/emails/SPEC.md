# Module: emails

## Purpose
Own inbound email ingestion, AI processing lifecycle coordination, and incoming email read APIs.

## Responsibilities
- Validate and upsert ingestion payloads from n8n by `messageId`
- Trigger AI classification and reply draft generation lifecycle
- Persist processing status transitions independently of workflow statuses
- Expose incoming email list/detail endpoints

## Does NOT Handle
- Email response workflow transitions and note management
- Issue workflow transitions and note management
- External integration syncs

## Dependencies
- Internal: `openai`, `prisma`, `email-responses`, `issues`
- External: class-validator, NestJS, Prisma

## Exports
- `EmailsController`
- `EmailIngestionService`
- `EmailProcessingService`
- `EmailsService`

## Testing Requirements
- Ingestion upsert behavior (duplicate messageId)
- Processing state transitions for success and failure
- AI output validation and persistence mapping

## Security Considerations
- Treat inbound payload as untrusted and validate all fields
- Keep all AI credentials and processing server-side only
