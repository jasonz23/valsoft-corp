# Security Checklist for Full-Stack JS/TS Applications

Every item here exists because real applications have been breached by ignoring it. This is not theoretical — these are the 30 most common security gaps in production codebases.

## Table of Contents

1. [Authentication & Secrets](#authentication--secrets)
2. [Input & Data Validation](#input--data-validation)
3. [Rate Limiting & DDoS Protection](#rate-limiting--ddos-protection)
4. [API & Network Security](#api--network-security)
5. [Storage & File Handling](#storage--file-handling)
6. [Payments & Webhooks](#payments--webhooks)
7. [Email & Communication](#email--communication)
8. [Logging & Compliance](#logging--compliance)
9. [Environment & Deployment](#environment--deployment)

---

## Authentication & Secrets

### 1. JWT sessions: max 7 days + refresh token rotation
Short-lived access tokens (15 min) with rotating refresh tokens (7 day max). When a refresh token is used, the old one is invalidated immediately.

### 2. Use Supabase Auth (GoTrue) — never roll your own
Authentication is the most security-critical code in your app. Supabase Auth handles password hashing, MFA, session management, OAuth providers, and dozens of edge cases. Run GoTrue locally via Docker for development. NestJS guards validate the JWT on every request.

### 3. Secrets belong in environment variables
Never hardcode API keys, database URLs, or tokens. Use `process.env.SECRET_NAME`. In production, use a secrets manager (AWS Secrets Manager, Vault, Doppler).

### 4. .gitignore is your first file
Before writing any code, create `.gitignore` with: `.env`, `.env.*`, `node_modules/`, `dist/`, `*.pem`, `*.key`. If a secret reaches git history, consider it compromised — rotate it.

### 5. Rotate secrets every 90 days minimum
Set calendar reminders. Automate where possible. This limits the blast radius of any leak.

---

## Input & Data Validation

### 6. Verify every package exists before installing
AI-suggested packages might not exist or could be typosquatting attacks. Check npmjs.com before running `npm install`.

### 7. Prefer newer, more secure package versions
Check for known vulnerabilities. Use packages that are actively maintained.

### 8. Run `npm audit fix` after every build
Catches known vulnerabilities in your dependency tree. Make this part of your CI pipeline.

### 9. Sanitize every input, parameterize every query
All user input is hostile. Use Zod for validation, parameterized queries or an ORM for database access. Never concatenate user input into SQL strings.

### 10. Enable Row-Level Security from day one
In Supabase/Postgres, RLS ensures users can only access their own data even if your application logic has bugs. This is defense in depth.

---

## Rate Limiting & DDoS Protection

### 11. Remove all console.log before shipping
Console logs can leak request bodies, tokens, user data. Use a structured logger (Winston, Pino) with log levels. Only `warn` and `error` in production.

### 12. CORS: allow only your production domain
Never use `*` for Access-Control-Allow-Origin in production. Explicitly list your domains.

### 13. Validate redirect URLs against an allow-list
Open redirects are a phishing vector. Only redirect to URLs you've explicitly approved.

### 14. Auth + rate limits on every endpoint, including mobile APIs
Every endpoint, no exceptions. Mobile APIs are often forgotten — they face the same threats as web APIs.

### 15. Rate limit everything: 100 req/hour per IP as a baseline
Adjust based on your use case, but start restrictive. Use express-rate-limit, Fastify rate-limit, or your platform's built-in options.

### 16. Password reset: 3 attempts per email per hour
Password reset is a prime abuse vector. Strict limits prevent enumeration and denial of service.

---

## API & Network Security

### 17. Cap AI API costs in your dashboard AND in code
Set spending limits in your AI provider dashboard and implement token/request budgets in your code. A runaway loop can cost thousands.

### 18. DDoS protection via Cloudflare or Vercel edge config
Put a CDN/edge layer in front of your API. This handles volumetric attacks that your server never could.

---

## Storage & File Handling

### 19. Lock down storage buckets
Users access only their own files. Use signed URLs with short TTLs. Never expose bucket root or allow directory listing.

### 20. Validate uploads by file signature, not extension
A `.jpg` file could contain a PHP payload. Check magic bytes/file signatures. Limit upload sizes (e.g., 10MB for images, 50MB for documents).

---

## Payments & Webhooks

### 21. Verify webhook signatures before processing
Stripe, PayPal, and others sign their webhooks. Always verify the signature before processing payment data. Never trust the payload blindly.

---

## Email & Communication

### 22. Use Resend or SendGrid with proper SPF/DKIM records
Proper email authentication prevents your messages from being marked as spam and prevents spoofing of your domain.

---

## Logging & Compliance

### 23. Check permissions server-side — UI checks are cosmetic
A hidden button is not security. Server-side authorization on every request, every time.

### 24. Act as a security engineer and review your own code
After writing code, switch your mindset to adversarial. Look for injection points, auth bypasses, data leaks.

### 25. Try to hack your own app
Attempt common attacks: SQL injection, XSS, CSRF, IDOR (changing IDs in URLs to access other users' data). Fix what you find.

### 26. Log critical actions
Deletions, role changes, payments, data exports — log them all with timestamps, user IDs, and IP addresses. Use structured logging for easy querying.

### 27. Build a real account deletion flow
GDPR requires it. Users must be able to delete their data. Implement soft delete first (30-day grace period), then hard delete.

---

## Environment & Deployment

### 28. Automate backups and test restoration
A backup you've never restored is not a backup. Set up automated daily backups and test restoration quarterly.

### 29. Keep test and production completely separate
Separate databases, separate API keys, separate everything. A test environment that touches production data is a production environment.

### 30. Test webhooks stay in test
Never let test webhook endpoints point at production databases or services. Use Stripe test mode, sandbox environments, etc.

---

## Quick Implementation Checklist

When starting a new feature or project, copy this and check off each item:

```
[ ] .gitignore created with .env, node_modules, dist, keys
[ ] .env file created, all secrets in environment variables
[ ] Supabase Auth configured (GoTrue in docker-compose, JWT guard in NestJS)
[ ] Input validation schema written (Zod)
[ ] Rate limiting configured on all routes
[ ] CORS configured for specific domains only
[ ] RLS enabled on database tables
[ ] Error handling returns structured responses (no stack traces in production)
[ ] Logging configured with proper levels (no console.log)
[ ] npm audit clean
```
