# Module: web

## Purpose
Next.js operations dashboard for triaging email responses and managing internal issues.

## Responsibilities
- Render separate dashboard pages for Email Responses, Issues, and Users
- Provide filtering, editing, assignment, notes, and status transitions
- Provide drag-and-drop issue board interactions
- Consume typed backend APIs only

## Does NOT Handle
- AI processing logic
- Direct database access
- Secret handling

## Dependencies
- Internal: `@valsoft/shared`
- External: Next.js App Router, React, dnd-kit

## Exports
- Web application routes under `/email-responses`, `/issues`, `/users`

## Security Considerations
- Uses only public API base URL
- No secret keys or server credentials in client bundle
