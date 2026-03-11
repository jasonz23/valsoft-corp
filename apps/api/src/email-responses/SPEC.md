# Module: email-responses

## Purpose
Manage customer-facing response workflow records linked 1:1 to incoming emails.

## Responsibilities
- List and filter response records
- Edit draft, status, assignee
- Create and list response notes
- Approve response drafts
- Expose placeholder send action

## Does NOT Handle
- Incoming email ingestion and AI processing
- Internal issue workflow management

## Dependencies
- Internal: `prisma`
- External: NestJS, class-validator

## Exports
- `EmailResponsesController`
- `EmailResponsesService`

## Testing Requirements
- Status transitions and approval behavior
- Filter behavior for status/category/assignee
- Note creation and retrieval

## Security Considerations
- Validate all patch payloads
- Preserve server authority over status transitions
