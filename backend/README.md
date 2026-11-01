# BAC Backend — Developer Guide

> **Phase:** 2 — Secure Authentication & Role-Based Authorization  
> **Stack:** Node.js 24 · Express 4 · TypeScript 5 · MongoDB 7 / Mongoose 8 · bcryptjs · jsonwebtoken · Zod  
> **Port:** 5001 (development)

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Environment Variables](#environment-variables)
4. [Administrative Account Provisioning](#administrative-account-provisioning)
5. [Project Structure](#project-structure)
6. [Available Scripts](#available-scripts)
7. [Authentication & Authorization Architecture](#authentication--authorization-architecture)
8. [API Endpoints (Phase 1 & 2)](#api-endpoints-phase-1--2)
9. [Testing & Verification](#testing--verification)
10. [Known Risks & Deployment Prerequisites](#known-risks--deployment-prerequisites)

---

## Prerequisites

| Requirement | Minimum | Recommended |
|---|---|---|
| **Node.js** | 18.0.0 | 24.x (current dev environment) |
| **npm** | 9.0.0 | 11.x |
| **MongoDB** | 6.0 | 7.x |
| **TypeScript** | 5.0 | 5.7.x |

---

## Quick Start

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Copy and configure environment
cp .env.example .env
# Edit .env — ensure MONGODB_URI and JWT_SECRET (>= 32 chars in production) are set

# 4. Provision the initial Master Administrator account
npm run admin:provision

# 5. Start the development server (hot-reload)
npm run dev
```

The server will start on `http://localhost:5001`.

---

## Environment Variables

Copy `.env.example` to `.env` and configure each variable:

| Variable | Required | Default | Description |
|---|---|---|---|
| `NODE_ENV` | No | `development` | `development`, `production`, or `test` |
| `PORT` | **Yes** | — | Server port (`5001` for dev) |
| `MONGODB_URI` | **Yes** | — | MongoDB connection string |
| `CORS_ORIGINS` | **Yes** | — | Comma-separated allowed origins (`http://localhost:3000`) |
| `TRUST_PROXY` | No | `0` | Set to `1` only behind Nginx / ALB |
| `LOG_LEVEL` | No | `info` | `debug`, `info`, `warn`, `error`, `silent` |
| `REQUEST_ID_HEADER` | No | `X-Request-Id` | Header name for request tracing |
| `JWT_SECRET` | **Yes** | — | HMAC-SHA256 secret key (minimum 32 chars in production) |
| `JWT_EXPIRES_IN` | No | `8h` | Token expiration duration string |
| `COOKIE_SECRET` | No | — | Optional secret for cookie signing |

---

## Administrative Account Provisioning

To prevent insecure default accounts or backdoors, public administrator registration is disabled. Administrator accounts are created via the controlled provisioning CLI tool:

```bash
npm run admin:provision
```

The script interactively prompts for:
1. Administrator Name (e.g. `Dr. V. Anitha`)
2. Normalized Email (e.g. `admin@bac.edu.in`)
3. Strong Password (enforcing minimum 12 chars, uppercase, lowercase, digit, and symbol)

Alternatively, parameters can be passed through environment variables for automated setups:
```bash
ADMIN_NAME="Dr. V. Anitha" ADMIN_EMAIL="admin@bac.edu.in" ADMIN_PASSWORD="SecurePassword@2026" npm run admin:provision
```

---

## Authentication & Authorization Architecture

### Session Strategy: Dual Token & Cookie Defense
1. **HttpOnly Cookie (`bac_token`):**
   - Inaccessible to browser JavaScript, mitigating XSS token extraction.
   - `Secure: true` in production (enforcing HTTPS transmission).
   - `SameSite: strict` (production) / `lax` (development).
2. **Bearer Authorization Header:**
   - Supported for programmatic clients, automated tests, and mobile/headless callers (`Authorization: Bearer <token>`).
3. **Instant Revocation via `tokenVersion`:**
   - The User document tracks a numeric `tokenVersion`.
   - When `/api/auth/logout` is called or an account is disabled, `tokenVersion` is incremented in MongoDB.
   - Any token issued with an older `tokenVersion` is immediately rejected with `401 TOKEN_REVOKED` on its next request.
4. **Brute-Force & Lockout Protection:**
   - 5 consecutive failed login attempts locks the account for 15 minutes.
   - Dummy password hash comparison balances timing when unknown emails are queried, preventing account enumeration timing attacks.
   - Strict rate limiting: 10 login requests per 15-minute window per IP.

### Role-Based Access Control (RBAC)
- **Roles:** `master_admin` (aliased `ADMIN`), `sub_admin`, `hod`, `club_head`, `content_editor` (aliased `EDITOR`), `staff` (aliased `VIEWER`).
- **Middleware:**
  - `requireAuth`: Validates JWT signature, expiration, active status, and `tokenVersion`.
  - `requireRoles(...roles)`: Verifies role membership. Master Admin has universal access.
  - `requirePermissions(...perms)`: Verifies granular permissions or wildcard `*`/`all`.
  - Access defaults to deny (returns `401 Unauthorized` or `403 Forbidden`).

---

## API Endpoints (Phase 1 & 2)

### Foundation Probes
- `GET /api/health` — Liveness probe (200 OK)
- `GET /api/ready` — Readiness probe (200 OK if DB reachable, 503 if unavailable)

### Authentication Endpoints
- `POST /api/auth/login`
  - Body: `{ "email": "...", "password": "..." }`
  - Responses:
    - `200 OK`: `{ "success": true, "data": { "user": {...}, "token": "..." } }` + `Set-Cookie: bac_token=...`
    - `400 Bad Request`: Validation failure (malformed email, unexpected fields)
    - `401 Unauthorized`: Generic `"Invalid email or password."`
    - `429 Too Many Requests`: Account locked or rate limit exceeded
- `POST /api/auth/logout`
  - Requires: Authentication
  - Clears `bac_token` cookie and increments `tokenVersion` in database.
  - Response: `200 OK`: `{ "success": true, "message": "Logged out successfully." }`
- `GET /api/auth/me`
  - Requires: Authentication
  - Response: `200 OK`: `{ "success": true, "data": { "user": {...} } }`

---

## Testing & Verification

```bash
# Run all automated tests
npm test

# Run tests with code coverage
npm run test:coverage

# TypeScript strict typecheck
npm run typecheck

# ESLint validation
npm run lint

# Production build
npm run build
```

### Test Suites Summary

| Test Suite | Tests | Purpose |
|---|---|---|
| `auth.test.ts` | 22 | Login, logout, me, cookies, lockout, timing mitigation, RBAC, revocation |
| `user-model.test.ts` | 7 | Password hashing, lockout lifecycle, toJSON sanitization |
| `env.test.ts` | 18 | Strict env validation, JWT_SECRET requirements |
| `health.test.ts` | 12 | Liveness, readiness, 404 handler, UUID v4 propagation |
| `cors.test.ts` | 8 | Whitelisted origins, credentials mode, wildcard prevention |
| `rate-limit.test.ts` | 5 | Rate limit overage rejection, RFC 9110 draft-7 headers |
| `error-handler.test.ts` | 15 | Error classification, operational errors, stack trace suppression |
| `graceful-shutdown.test.ts` | 2 | Clean server teardown without connection leaking |

---

## Known Risks & Deployment Prerequisites

1. **Production Reverse Proxy & HTTPS:**
   - In production, set `NODE_ENV=production` and ensure the application runs behind an HTTPS reverse proxy (e.g. Nginx or Cloudflare).
   - Set `TRUST_PROXY=1` only when deployed behind a validated trusted proxy.
2. **JWT Secret Strength:**
   - Ensure `JWT_SECRET` is generated with high entropy (e.g. `openssl rand -base64 32`) and kept confidential.
3. **Frontend Integration:**
   - The frontend's existing `AdminLoginPage.tsx` currently sends `POST /api/auth/login` and falls back to local simulation. With the backend running on `5001` via the Vite proxy, real backend authentication is now supported. In Phase 3, frontend state will be bound directly to server sessions.
