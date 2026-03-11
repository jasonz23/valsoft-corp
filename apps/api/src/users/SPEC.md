# Module: users

## Purpose
Provide assignment user records used by email response and issue workflows.

## Responsibilities
- List users for assignment selectors
- Create users
- Update user fields

## Does NOT Handle
- Authentication or authorization
- Role permissions

## Dependencies
- Internal: `prisma`
- External: NestJS, class-validator

## Exports
- `UsersController`
- `UsersService`

## Testing Requirements
- CRUD behavior with uniqueness checks for email

## Security Considerations
- Validate input payloads and enforce unique email constraint at DB level
