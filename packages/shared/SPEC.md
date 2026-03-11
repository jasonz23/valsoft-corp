# Module: shared

## Purpose
Provide cross-application shared enums, labels, and typed contracts used by both frontend and backend.

## Responsibilities
- Publish canonical enum unions and labels for AI categories and workflow statuses
- Provide strongly typed DTO-like interfaces for list/detail API response usage in web app

## Does NOT Handle
- Backend persistence logic
- HTTP client implementation
- Frontend rendering components

## Dependencies
- Internal: none
- External: TypeScript only

## Exports
- Enum value arrays and type aliases
- Label maps for frontend display
- API response interfaces used in Next.js

## File Organization
- `src/enums.ts`: string literal arrays and derived types
- `src/constants.ts`: label maps and UI-safe constant maps
- `src/types.ts`: shared cross-app interfaces

## Testing Requirements
- Type-level correctness via strict TypeScript builds

## Security Considerations
- No secret or environment-bound values in this package
