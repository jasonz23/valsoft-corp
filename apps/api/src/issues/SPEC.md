# Module: issues

## Purpose
Manage internal issue workflow records linked 1:1 to incoming emails.

## Responsibilities
- List and filter issue records for operations dashboard
- Update issue title, description, status, and assignee
- Manage issue notes
- Allow controlled AI category correction on linked incoming email

## Does NOT Handle
- AI processing logic
- Customer response draft lifecycle

## Dependencies
- Internal: `prisma`
- External: NestJS, class-validator

## Exports
- `IssuesController`
- `IssuesService`

## Testing Requirements
- Drag/drop-like status updates
- AI category correction persistence on linked email
- Note behavior and filtering

## Security Considerations
- Validate patch payloads and category updates
