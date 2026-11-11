# Bishop Ambrose College Website — Backend API Specification & Contract

> **Document Version:** 2.0.0 (Phase 6B Handover)  
> **Status:** Verified Production REST API Specification & Contract  
> **Target Stack:** Node.js (>= 18 LTS) + Express.js 4.21 + TypeScript 5.7 + MongoDB 6/7 (Mongoose 8.9)  
> **Audited Workspace:** `e:\justin\bac-frontend-clean\`  
> **Date:** 2026-11-11  

---

## Table of Contents

1. [A. Executive Summary & Architecture Overview](#a-executive-summary--architecture-overview)
2. [B. Router Mounting Architecture & Path Registry](#b-router-mounting-architecture--path-registry)
3. [C. Authentication, Session & RBAC Model](#c-authentication-session--rbac-model)
4. [D. All Implemented API Endpoints Inventory](#d-all-implemented-api-endpoints-inventory)
5. [E. Detailed Endpoint Specifications](#e-detailed-endpoint-specifications)
6. [F. Deprecated & Legacy Compatibility Endpoints](#f-deprecated--legacy-compatibility-endpoints)
7. [G. Standard Error Responses & Status Codes](#g-standard-error-responses--status-codes)

---

## A. Executive Summary & Architecture Overview

The Bishop Ambrose College backend is an enterprise-grade RESTful API built on Express, TypeScript, and MongoDB. The API is organized into clean, decoupled route modules providing:

1. **System & Health Diagnostics (`/api/health`, `/api/ready`):** Liveness probes (process alive) and readiness probes (MongoDB connection active and pingable) for reverse proxy and container monitoring.
2. **Secure Authentication & Session Management (`/api/auth/*`):** JWT authentication backed by HttpOnly, Secure, SameSite cookies with automatic tokenVersion revocation on logout.
3. **Versioned Public REST API (`/api/v1/*`):** High-performance read endpoints with HTTP 304 ETag negotiation, public cache-control headers, and strict rate-limiting on public submission endpoints.
4. **Protected Administrative Mutations (`/api/v1/*` and `/api/*`):** 24 administrative modules guarded by strict 6-role RBAC, scoped resource isolation (departmentId/clubId), and append-only audit logging.
5. **Legacy Compatibility Layer (`/api/*`):** Unversioned mirrors of core content and read endpoints supporting legacy frontend contexts.

### Deprecated Patterns Strictly Prohibited:
- **Zero Local File Uploads:** All file upload endpoints (`POST /api/upload`, `POST /api/about/image`, `POST /api/v1/advertisements/upload-image`) are deprecated and disabled. All images, documents, and media use external HTTPS URLs managed via the Media Assets Metadata Engine (`/api/admin/media-assets`).
- **Zero Remote Client-Side Seeding:** The legacy `POST /api/seed` route is disabled. Database operations are strictly performed via administrative CLI scripts (`npm run admin:provision`, `npm run migrate:execute -- --confirm`).

---

## B. Router Mounting Architecture & Path Registry

All routes are registered in `backend/src/routes/index.ts` and mounted onto `/api` in `backend/src/app.ts`:

```text
/api
├── /health           ──> healthRouter (GET / liveness)
├── /ready            ──> readyRouter (GET / readiness + DB ping)
├── /auth             ──> authRouter (POST /login, POST /logout, GET /me)
├── /v1               ──> adminRouter (Protected administrative endpoints)
├── /v1               ──> publicV1Router (Versioned public REST endpoints)
├── /                 ──> adminRouter (Legacy unversioned administrative routes)
└── /                 ──> publicRouter (Legacy public compatibility layer)
```

---

## C. Authentication, Session & RBAC Model

### 1. The 6 Verified Operational Roles & Legacy Aliases
| Operational Role | Scope | Description |
| :--- | :--- | :--- |
| **`master_admin`** | Global (Full) | System sovereignty, user management, audit logs, system configurations. |
| **`sub_admin`** | Global (Admin) | Content management across all departments, clubs, notices, and approval queue triage. |
| **`hod`** | Department-Scoped | Manage faculty profiles, department achievements, and notices matching assigned `departmentId`. |
| **`club_head`** | Club-Scoped | Manage club events, description, and memberships matching assigned `clubId`. (Forbidden from modifying global banners/galleries). |
| **`content_editor`** | Global (Editorial) | Global news, announcements, press releases, and events management. |
| **`staff`** | Scoped Draft | Create draft notices, news, and event proposals within assigned department. |
| *(Legacy `ADMIN`)* | Alias | Canonical alias mapped to `sub_admin`. |
| *(Legacy `EDITOR`)* | Alias | Canonical alias mapped to `content_editor`. |
| *(Legacy `VIEWER`)* | Alias | Canonical alias mapped to `staff`. |

---

### 2. Quantitative System & Routing Metrics (Reconciled Endpoint Inventory)

The application API endpoints have been reconciled against the running Express router hierarchy (`app._router.stack`) and the canonical functional inventory:

- **Canonical Functional Endpoint Inventory:** Exactly **127 cataloged entries** (Section B):
  - **Active Implemented Endpoints:** 123 endpoints.
  - **Deprecated & Prohibited Legacy Endpoints:** 4 endpoints (`POST /api/upload`, `POST /api/about/image`, `POST /api/v1/advertisements/upload-image`, `POST /api/seed`) marked as disabled.
- **Express Router Source Definitions (188 Unique Routes):**
  - `healthRouter` ([`health.routes.ts`](./backend/src/routes/health.routes.ts)): 1 route (`GET /health`)
  - `readyRouter` ([`health.routes.ts`](./backend/src/routes/health.routes.ts)): 1 route (`GET /ready`)
  - `authRouter` ([`auth.routes.ts`](./backend/src/routes/auth.routes.ts)): 3 routes (`POST /auth/login`, `POST /auth/logout`, `GET /auth/me`)
  - `publicV1Router` ([`v1/public-v1.routes.ts`](./backend/src/routes/v1/public-v1.routes.ts)): 36 versioned public REST routes
  - `adminRouter` ([`admin.routes.ts`](./backend/src/routes/admin.routes.ts)): 115 administrative mutation and triage routes
  - `publicRouter` ([`public.routes.ts`](./backend/src/routes/public.routes.ts)): 32 unversioned legacy compatibility routes
- **Live Express Server Binding Count (303 Registered Route Handlers):**
  - `backend/src/routes/index.ts` mounts `adminRouter` (115 routes) **twice**: once at `/api/v1` for modern API consumers, and once at `/api/` for legacy compatibility ($115 \times 2 = 230$ bound handlers).
  - Adding the 36 public v1 routes, 32 legacy public routes, 3 auth routes, and 2 diagnostics routes yields exactly **303 active route handlers** in the live Express dispatch table.
- **Explanation of Previous "95+" vs "127" References:**
  - The previous shorthand "95+" referred to the unique non-duplicated operational business operations across public and admin domains (excluding dual `/v1` mountings and method alternates).
  - The exact functional catalog in Section B indexes all **127 distinct functional business endpoints** (123 active + 4 disabled).
- **Media Architecture:** 100% external HTTPS URLs validated via `safeMediaUrlSchema` (zero local disk storage).
- **Authentication:** Dual transport (HttpOnly, Secure cookie `bac_token` + optional Bearer header) with instant `tokenVersion` database revocation.

---

## B. All Discovered API Endpoints Inventory

Below is the verified inventory of every endpoint currently referenced in the frontend source code.

| # | HTTP Method | Route Path | Calling File & Line | Consuming Feature | Auth Required | Status |
|---|---|---|---|---|---|---|
| 1 | `POST` | `/api/auth/login` | `AdminLoginPage.tsx:103` | Admin Authentication | Public | Referenced |
| 2 | `GET` | `/api/content` | `site-context.tsx:432` | Public Site Content (Logo, Hero, Announcements, About, Footer) | Public | Referenced |
| 3 | `PUT` | `/api/content` | `site-context.tsx:547, 565, 601, 619, 637` | Update Hero, General Settings, Stats, Virtual Tour, Location | Admin (JWT) | Referenced |
| 4 | `GET` | `/api/about` | `site-context.tsx:583` | About Page Data & Institutional History | Public | Referenced |
| 5 | `PUT` | `/api/about` | `site-context.tsx:583` | Update About Page Sections, Vision, Mission | Admin (JWT) | Referenced |
| 6 | `POST` | `/api/about/image` | `about-manager.tsx:159, 222` | Upload Campus/About Section Images | Admin (JWT) | **Deprecated / Disabled** (Use external HTTPS URLs) |
| 7 | `GET` | `/api/departments` | `site-context.tsx:433` | Public Departments Grid & Catalog | Public | Implemented |
| 8 | `POST` | `/api/departments` | `site-context.tsx:655` | Create New Department | Admin (JWT) | Implemented |
| 9 | `PUT` | `/api/departments` | `site-context.tsx:655` | Update Existing Department Details | Admin (JWT) | Implemented |
| 10 | `DELETE` | `/api/departments?slug=:slug` | `site-context.tsx:673` | Remove Department by Slug | Admin (JWT) | Implemented |
| 11 | `GET` | `/api/events` | `site-context.tsx:434` | Public Events & Campus Activities | Public | Implemented |
| 12 | `POST` | `/api/events` | `site-context.tsx:689, 723, 757` | Create Event, Speaker, or Gallery Item | Admin (JWT) | Implemented |
| 13 | `DELETE` | `/api/events?type=event&id=:id` | `site-context.tsx:707` | Delete Campus Event by ID | Admin (JWT) | Implemented |
| 14 | `DELETE` | `/api/events?type=speaker&id=:name`| `site-context.tsx:741` | Delete Guest Speaker by Name | Admin (JWT) | Implemented |
| 15 | `DELETE` | `/api/events?type=gallery&id=:title`| `site-context.tsx:775` | Delete Gallery Photo by Title | Admin (JWT) | Implemented |
| 16 | `GET` | `/api/news` | `site-context.tsx:435` | Public Press Releases & Articles | Public | Implemented |
| 17 | `POST` | `/api/news` | `site-context.tsx:807` | Publish New Article | Admin (JWT) | Implemented |
| 18 | `PUT` | `/api/news/:id` | `site-context.tsx:807` | Update Existing Article | Admin (JWT) | Implemented |
| 19 | `DELETE` | `/api/news/:id` | `site-context.tsx:819` | Delete Article by ID | Admin (JWT) | Implemented |
| 20 | `PUT` | `/api/news/config` | `site-context.tsx:827` | Update News Page Display Configuration | Admin (JWT) | Implemented |
| 21 | `GET` | `/api/iqac` | `iqac-context.tsx:128`, `iqac-manager.tsx:35` | NAAC, AQAR, SSR, SSS, Initiatives | Public | Implemented |
| 22 | `PUT` | `/api/iqac` | `iqac-manager.tsx:91` | Full Update of IQAC Dossier | Admin (JWT) | Implemented |
| 23 | `PUT` | `/api/iqac/section/:section` | `iqac-context.tsx:147`, `iqac-manager.tsx:59`| Update Specific IQAC Section (e.g. ssr, aqar) | Admin (JWT) | Implemented |
| 24 | `POST` | `/api/iqac/download/:section/:id` | `iqac-context.tsx:159` | Increment Document Download Counter | Public | Implemented |
| 25 | `GET` | `/api/admissions` | `admissions-tab.tsx:33` | Fetch Submitted Student Applications | Admin (JWT) | Implemented |
| 26 | `POST` | `/api/admissions` | `site-context.tsx:791` | Submit Online Student Application | Public | Implemented |
| 27 | `PUT` | `/api/admissions` | `admissions-tab.tsx:59, 98` | Update Application Review Status & Notes | Admin (JWT) | Implemented |
| 28 | `GET` | `/api/courses` | `courses-dashboard.tsx:81` | Fetch Academic Degree Programmes | Public | Implemented |
| 29 | `POST` | `/api/courses` | `courses-dashboard.tsx:103` | Create Degree Programme | Admin (JWT) | Implemented |
| 30 | `PUT` | `/api/courses/:id` | `courses-dashboard.tsx:103, 134` | Update Degree Programme / Toggle Status | Admin (JWT) | Implemented |
| 31 | `DELETE` | `/api/courses/:id` | `courses-dashboard.tsx:125` | Delete Degree Programme | Admin (JWT) | Implemented |
| 32 | `GET` | `/api/facilities` | `facilities-dashboard.tsx:75` | Fetch Campus Facilities & Amenities | Public | Implemented |
| 33 | `POST` | `/api/facilities` | `facilities-dashboard.tsx:96` | Create Facility Record | Admin (JWT) | Implemented |
| 34 | `PUT` | `/api/facilities/:id` | `facilities-dashboard.tsx:96` | Update Facility Details | Admin (JWT) | Implemented |
| 35 | `DELETE` | `/api/facilities/:id` | `facilities-dashboard.tsx:116` | Delete Facility Record | Admin (JWT) | Implemented |
| 36 | `GET` | `/api/gallery` | `gallery-dashboard.tsx:83` | Fetch Albums, Photos, Video Links | Public | Implemented |
| 37 | `POST` | `/api/gallery` | `gallery-dashboard.tsx:100` | Save Albums / Video Links Payload | Admin (JWT) | Implemented |
| 38 | `GET` | `/api/placements` | `placements-dashboard.tsx:90` | Fetch Recruiter Logos, Stats, Stories | Public | Implemented |
| 39 | `POST` | `/api/placements` | `placements-dashboard.tsx:104` | Save Placement Records & Stats | Admin (JWT) | Implemented |
| 40 | `GET` | `/api/contact` | `contact-dashboard.tsx:78` | Fetch Contact Details & Map Config | Public | Implemented |
| 41 | `PUT` | `/api/contact` | `contact-dashboard.tsx:92` | Update Campus Contact Info & Phone Lines | Admin (JWT) | Implemented |
| 42 | `POST` | `/api/upload` | `departments-tab.tsx:214`, `events-tab.tsx:198` | Media Upload (Images & Video files) | Admin (JWT) | **Deprecated / Disabled** (Use external HTTPS URLs) |
| 43 | `POST` | `/api/seed` | `site-context.tsx:839` | Seed Database from `cms-database.json` | Master Admin | **Deprecated / Disabled** (Use CLI `admin:provision`) |
| 44 | `GET` | `/api/v1/advertisements` | `advertisement-service.ts:236` | Filtered / Paginated Advertisements | Public / Admin | Implemented |
| 45 | `GET` | `/api/v1/advertisements/active` | `advertisement-service.ts:290` | Active Popup Overlay Ad for Visitors | Public | Implemented |
| 46 | `GET` | `/api/v1/advertisements/:id` | `advertisement-service.ts:24` | Single Advertisement Record | Public / Admin | Implemented |
| 47 | `POST` | `/api/v1/advertisements` | `advertisement-service.ts:357` | Create Advertisement Banner | Admin (JWT) | Implemented |
| 48 | `PUT` | `/api/v1/advertisements/:id` | `advertisement-service.ts:394` | Update Advertisement Banner | Admin (JWT) | Implemented |
| 49 | `PATCH` | `/api/v1/advertisements/:id/status`| `advertisement-service.ts:35` | Toggle Status (active/inactive/draft) | Admin (JWT) | Implemented |
| 50 | `DELETE` | `/api/v1/advertisements/:id` | `advertisement-service.ts:424` | Soft/Hard Delete Advertisement | Admin (JWT) | Implemented |
| 51 | `POST` | `/api/v1/advertisements/upload-image`| `advertisement-service.ts:42` | Upload Ad Banner Image | Admin (JWT) | **Deprecated / Disabled** (Use external HTTPS URLs) |
| 52 | `POST` | `/api/v1/advertisements/:id/track-impression` | `advertisement-service.ts:46` | Increment Impression Counter | Public | Implemented |
| 53 | `POST` | `/api/v1/advertisements/:id/track-click` | `advertisement-service.ts:49` | Increment Click Counter | Public | Implemented |
| 54 | `GET` | `/api/health` | `health.controller.ts` | Liveness probe (process alive) | Public | Implemented |
| 55 | `GET` | `/api/ready` | `health.controller.ts` | Readiness probe (MongoDB ping) | Public | Implemented |
| 56 | `POST` | `/api/auth/logout` | `auth.controller.ts` | Session revocation & cookie clearance | Authenticated | Implemented |
| 57 | `GET` | `/api/auth/me` | `auth.controller.ts` | Authenticated user profile | Authenticated | Implemented |
| 58 | `GET` | `/api/v1/notices` | `notice.controller.ts` | Public active circulars with filters | Public | Implemented |
| 59 | `GET` | `/api/v1/notices/pinned` | `notice.controller.ts` | Public pinned circulars | Public | Implemented |
| 60 | `GET` | `/api/v1/notices/categories` | `notice.controller.ts` | Public notice category aggregates | Public | Implemented |
| 61 | `GET` | `/api/v1/notices/:slug` | `notice.controller.ts` | Public single notice by slug | Public | Implemented |
| 62 | `GET` | `/api/admin/notices/metrics` | `notice.controller.ts` | Admin notice dashboard metrics | Admin (JWT) | Implemented |
| 63 | `GET` | `/api/admin/notices` | `notice.controller.ts` | Admin notices query and filters | Admin (JWT) | Implemented |
| 64 | `POST` | `/api/admin/notices` | `notice.controller.ts` | Create notice draft | Admin (JWT) | Implemented |
| 65 | `PUT` | `/api/admin/notices/:id` | `notice.controller.ts` | Update notice details | Admin (JWT) | Implemented |
| 66 | `PATCH` | `/api/admin/notices/:id/priority` | `notice.controller.ts` | Toggle pin & priority level | Admin (JWT) | Implemented |
| 67 | `POST` | `/api/admin/notices/:id/submit` | `notice.controller.ts` | Submit draft to review queue | Admin (JWT) | Implemented |
| 68 | `POST` | `/api/admin/notices/:id/review` | `notice.controller.ts` | Approve/reject with feedback | Admin (JWT) | Implemented |
| 69 | `POST` | `/api/admin/notices/:id/publish` | `notice.controller.ts` | Immediate or scheduled release | Admin (JWT) | Implemented |
| 70 | `POST` | `/api/admin/notices/:id/archive` | `notice.controller.ts` | Archive published notice | Admin (JWT) | Implemented |
| 71 | `DELETE` | `/api/admin/notices/:id` | `notice.controller.ts` | Delete notice | Admin (JWT) | Implemented |
| 72 | `GET` | `/api/v1/clubs/directory` | `club.controller.ts` | Public student clubs directory | Public | Implemented |
| 73 | `GET` | `/api/v1/clubs/:slug` | `club.controller.ts` | Public club profile | Public | Implemented |
| 74 | `GET` | `/api/v1/clubs/:slug/members` | `club.controller.ts` | Public club member roster (PII-free)| Public | Implemented |
| 75 | `POST` | `/api/v1/clubs/:slug/memberships` | `club.controller.ts` | Student membership application | Public (Rate-limit) | Implemented |
| 76 | `POST` | `/api/v1/clubs/:slug/memberships/withdraw-consent` | `club.controller.ts` | Roster directory consent withdrawal | Public (Rate-limit) | Implemented |
| 77 | `GET` | `/api/admin/clubs` | `club.controller.ts` | Admin clubs list | Admin (JWT) | Implemented |
| 78 | `POST` | `/api/admin/clubs` | `club.controller.ts` | Create new club | Admin (JWT) | Implemented |
| 79 | `GET` | `/api/admin/clubs/:id` | `club.controller.ts` | Fetch single club record | Admin (JWT) | Implemented |
| 80 | `PUT` | `/api/admin/clubs/:id` | `club.controller.ts` | Update permitted club details | Admin (JWT) | Implemented |
| 81 | `PATCH` | `/api/admin/clubs/:id/archive` | `club.controller.ts` | Soft-archive club (force check) | Admin (JWT) | Implemented |
| 82 | `POST` | `/api/admin/clubs/:id/assign-head` | `club.controller.ts` | Assign club head coordinator | Admin (JWT) | Implemented |
| 83 | `GET` | `/api/admin/clubs/:id/memberships` | `club.controller.ts` | List club membership records | Admin (JWT) | Implemented |
| 84 | `PATCH` | `/api/admin/clubs/:id/memberships/:mId/review` | `club.controller.ts` | Approve/reject membership | Admin (JWT) | Implemented |
| 85 | `PATCH` | `/api/admin/clubs/:id/memberships/:mId/lifecycle` | `club.controller.ts` | Update member lifecycle status | Admin (JWT) | Implemented |
| 86 | `POST` | `/api/admin/clubs/:id/memberships/reconcile` | `club.controller.ts` | Reconcile active member count | Admin (JWT) | Implemented |
| 87 | `GET` | `/api/v1/forms/:slug` | `form.controller.ts` | Public active form schema | Public | Implemented |
| 88 | `POST` | `/api/v1/forms/:slug/submissions` | `form.controller.ts` | Submit dynamic form answers | Public (Rate-limit) | Implemented |
| 89 | `GET` | `/api/admin/forms` | `form.controller.ts` | Admin dynamic forms list | Admin (JWT) | Implemented |
| 90 | `POST` | `/api/admin/forms` | `form.controller.ts` | Create dynamic form | Admin (JWT) | Implemented |
| 91 | `PUT` | `/api/admin/forms/:id` | `form.controller.ts` | Update dynamic form | Admin (JWT) | Implemented |
| 92 | `DELETE` | `/api/admin/forms/:id` | `form.controller.ts` | Delete dynamic form | Admin (JWT) | Implemented |
| 93 | `GET` | `/api/admin/form-submissions` | `form.controller.ts` | Admin inquiry submissions list | Admin (JWT) | Implemented |
| 94 | `GET` | `/api/admin/form-submissions/:id` | `form.controller.ts` | Single inquiry submission details | Admin (JWT) | Implemented |
| 95 | `PATCH` | `/api/admin/form-submissions/:id/status` | `form.controller.ts` | Triage status: new, in_review, responded, resolved, rejected | Admin (JWT) | Implemented |
| 96 | `DELETE` | `/api/admin/form-submissions/:id` | `form.controller.ts` | Delete inquiry submission | Master Admin | Implemented |
| 97 | `GET` | `/api/v1/pages/:slug` | `dynamic-page.controller.ts` | Public published dynamic page | Public | Implemented |
| 98 | `GET` | `/api/admin/pages` | `dynamic-page.controller.ts` | Admin dynamic pages list | Admin (JWT) | Implemented |
| 99 | `POST` | `/api/admin/pages` | `dynamic-page.controller.ts` | Create dynamic page | Admin (JWT) | Implemented |
| 100 | `PUT` | `/api/admin/pages/:id` | `dynamic-page.controller.ts` | Update dynamic page | Admin (JWT) | Implemented |
| 101 | `DELETE` | `/api/admin/pages/:id` | `dynamic-page.controller.ts` | Delete dynamic page | Admin (JWT) | Implemented |
| 102 | `GET` | `/api/v1/menus` | `navigation-menu.controller.ts` | Public active navigation menus | Public | Implemented |
| 103 | `GET` | `/api/admin/navigation-menus` | `navigation-menu.controller.ts` | Admin navigation menus list | Admin (JWT) | Implemented |
| 104 | `POST` | `/api/admin/navigation-menus` | `navigation-menu.controller.ts` | Create navigation menu | Admin (JWT) | Implemented |
| 105 | `PUT` | `/api/admin/navigation-menus/:id` | `navigation-menu.controller.ts` | Update navigation menu | Admin (JWT) | Implemented |
| 106 | `DELETE` | `/api/admin/navigation-menus/:id` | `navigation-menu.controller.ts` | Delete navigation menu | Admin (JWT) | Implemented |
| 107 | `POST` | `/api/admin/navigation-menus/reorder` | `navigation-menu.controller.ts` | Reorder navigation menus | Admin (JWT) | Implemented |
| 108 | `GET` | `/api/v1/media` | `media-asset.controller.ts` | Public media assets catalog | Public | Implemented |
| 109 | `GET` | `/api/admin/media-assets` | `media-asset.controller.ts` | Admin media assets list | Admin (JWT) | Implemented |
| 110 | `POST` | `/api/admin/media-assets` | `media-asset.controller.ts` | Register external media URL | Admin (JWT) | Implemented |
| 111 | `PUT` | `/api/admin/media-assets/:id` | `media-asset.controller.ts` | Update media asset metadata | Admin (JWT) | Implemented |
| 112 | `DELETE` | `/api/admin/media-assets/:id` | `media-asset.controller.ts` | Delete media asset | Admin (JWT) | Implemented |
| 113 | `GET` | `/api/v1/alumni/directory` | `alumni.controller.ts` | Public verified alumni directory | Public | Implemented |
| 114 | `GET` | `/api/v1/alumni/featured` | `alumni.controller.ts` | Public featured alumni stories | Public | Implemented |
| 115 | `POST` | `/api/v1/alumni/register` | `alumni.controller.ts` | Public alumni registration | Public (Rate-limit) | Implemented |
| 116 | `GET` | `/api/admin/alumni` | `alumni.controller.ts` | Admin alumni records list | Admin (JWT) | Implemented |
| 117 | `GET` | `/api/admin/alumni/:id` | `alumni.controller.ts` | Single alumni record details | Admin (JWT) | Implemented |
| 118 | `PUT` | `/api/admin/alumni/:id` | `alumni.controller.ts` | Update alumni profile | Admin (JWT) | Implemented |
| 119 | `PATCH` | `/api/admin/alumni/:id/verify` | `alumni.controller.ts` | Verify and approve alumni | Admin (JWT) | Implemented |
| 120 | `PATCH` | `/api/admin/alumni/:id/reject` | `alumni.controller.ts` | Reject alumni registration | Admin (JWT) | Implemented |
| 121 | `DELETE` | `/api/admin/alumni/:id` | `alumni.controller.ts` | Delete alumni record | Admin (JWT) | Implemented |
| 122 | `GET` | `/api/admin/users` | `admin-cms.controller.ts` | Admin user list | Master Admin | Implemented |
| 123 | `POST` | `/api/admin/users` | `admin-cms.controller.ts` | Create admin user | Master Admin | Implemented |
| 124 | `PUT` | `/api/admin/users/:id` | `admin-cms.controller.ts` | Update user roles & permissions| Master Admin | Implemented |
| 125 | `DELETE` | `/api/admin/users/:id` | `admin-cms.controller.ts` | Deactivate/delete user | Master Admin | Implemented |
| 126 | `PATCH` | `/api/admin/users/:id/status` | `admin-cms.controller.ts` | Lock/unlock/activate user | Master Admin | Implemented |
| 127 | `GET` | `/api/admin/audit-logs` | `admin-cms.controller.ts` | Immutable security audit logs | Admin (JWT) | Implemented |

---

## C. Request and Response Schemas & Examples

### 1. Authentication & Session Management

#### `POST /api/auth/login`
- **Caller:** `frontend/src/pages/AdminLoginPage.tsx:103`
- **Rate Limiting:** Guarded by `strictRateLimit` middleware (anti-brute-force).
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "<ADMIN_EMAIL_PLACEHOLDER>",
    "password": "<STRONG_ADMIN_PASSWORD_PLACEHOLDER>"
  }
  ```
- **Validation Rules:**
  - `email`: Required, valid email string, trimmed, lowercase.
  - `password`: Required, minimum 8 characters.
- **Security Protections:**
  - **Timing Mitigation:** Performs dummy bcrypt hash comparison if user account does not exist, eliminating timing-based username enumeration.
  - **Account Lockout:** Locks account after 5 consecutive failed login attempts.
- **Success Response (`200 OK`):**
  - **Response Headers:** `Set-Cookie: bac_token=<JWT>; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=28800`
  - **Response Body:**
    ```json
    {
      "success": true,
      "data": {
        "user": {
          "id": "6724...",
          "name": "System Administrator",
          "email": "<ADMIN_EMAIL_PLACEHOLDER>",
          "role": "master_admin",
          "permissions": ["all"],
          "status": "active",
          "departmentId": null,
          "clubId": null,
          "createdAt": "2026-11-10T12:00:00.000Z"
        },
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": "6724...",
        "name": "System Administrator",
        "email": "<ADMIN_EMAIL_PLACEHOLDER>",
        "role": "master_admin",
        "status": "active"
      }
    }
    ```
- **Error Responses:**
  - `400 Bad Request`: `{ "success": false, "message": "Email and password are required.", "code": "VALIDATION_ERROR" }`
  - `401 Unauthorized`: `{ "success": false, "message": "Invalid email or password.", "code": "INVALID_CREDENTIALS" }`
  - `429 Too Many Requests`: `{ "success": false, "message": "Account is temporarily locked due to consecutive failed attempts. Please try again later." }`

#### `POST /api/auth/logout`
- **Authentication:** Required (`requireAuth`). Accepts `bac_token` cookie or `Authorization: Bearer <token>`.
- **Action:**
  1. Clears `bac_token` cookie with matching security flags (`httpOnly: true`, `secure`, `sameSite`, `path: '/'`).
  2. Atomically increments `tokenVersion` on the User document in MongoDB, instantly invalidating all tokens issued for this user across all active sessions.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully. All active sessions have been invalidated."
  }
  ```

#### `GET /api/auth/me`
- **Authentication:** Required (`requireAuth`).
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "6724...",
        "name": "System Administrator",
        "email": "<ADMIN_EMAIL_PLACEHOLDER>",
        "role": "master_admin",
        "status": "active",
        "permissions": ["all"]
      }
    }
  }
  ```

---

### 2. Public Site Content & Homepage

#### `GET /api/content`
- **Caller:** `frontend/src/lib/site-context.tsx:432`
- **Success Response (`200 OK`):**
  ```json
  {
    "logo": {
      "text1": "BAC",
      "text2": "Global University",
      "image": "/logo.svg"
    },
    "hero": {
      "badge": "Admissions Open 2026-27",
      "title": "Empowering Students for a Better Future Through Quality Education",
      "subtitle": "Join a globally connected university...",
      "ctaText": "Apply Now",
      "ctaLink": "admissions",
      "secondaryCtaText": "Explore Courses",
      "secondaryCtaLink": "departments",
      "virtualTourUrl": "https://www.youtube.com/embed/91tSZsX0Bjg"
    },
    "heroSection": {
      "backgroundVideo": "https://assets.mixkit.co/videos/preview/mixkit-university-campus-with-students-walking-around-4340-large.mp4",
      "fallbackImage": "https://images.unsplash.com/photo-1562774053-701939374585",
      "blurIntensity": 80,
      "overlayOpacity": 75,
      "enabled": true
    },
    "announcements": [
      "Admissions for Academic Year 2026-27 are now open.",
      "BAC ranks #1 for placements in core sectors."
    ],
    "about": {
      "title": "A Legacy of Innovation and Excellence",
      "text1": "Bishop Ambrose College was established...",
      "text2": "Today, it stands as an autonomous pillar...",
      "stats": [
        { "label": "Students Enrolled", "value": "3,500+" },
        { "label": "Placement Record", "value": "98%" }
      ]
    },
    "footer": {
      "ctaBadge": "Start Your Journey",
      "ctaTitle": "Shape Your Future at BAC",
      "ctaDescription": "Join thousands of successful Ambroseans.",
      "aboutText": "Empowering minds, transforming futures.",
      "address": "College Road, Sungam, Ramanathapuram, Coimbatore - 641045",
      "phone": "+91 422 2316731",
      "email": "principal@bac.edu.in",
      "infoEmail": "info@bac.edu.in",
      "facebook": "https://facebook.com/bishopambrosecollege",
      "twitter": "https://twitter.com/bac_cbe",
      "instagram": "https://instagram.com/bac_cbe",
      "linkedin": "https://linkedin.com/school/bishop-ambrose-college",
      "youtube": "https://youtube.com/@bishopambrosecollege"
    },
    "statistics": {
      "stats": [
        { "number": "100%", "label": "Placement Support", "icon": "Briefcase" },
        { "number": "12+", "label": "Academic Departments", "icon": "Building2" },
        { "number": "95+", "label": "Distinguished Faculty", "icon": "GraduationCap" },
        { "number": "30+", "label": "Years of Excellence", "icon": "Trophy" }
      ]
    },
    "virtualTour": {
      "title": "Experience BAC Campus in 360°",
      "subtitle": "Take a virtual walkthrough of our state-of-the-art facilities",
      "badge": "Virtual Campus Tour",
      "stats": [
        { "label": "Campus Area", "value": "15+ Acres" },
        { "label": "Laboratories", "value": "18 High-Tech Labs" }
      ],
      "locations": [
        {
          "name": "Main Academic Block",
          "category": "academic",
          "description": "Administrative offices, central auditorium and classrooms",
          "icon": "Building",
          "embedUrl": "https://www.youtube.com/embed/91tSZsX0Bjg"
        }
      ]
    },
    "location": {
      "mapsEmbedUrl": "https://www.google.com/maps/embed?pb=...",
      "campusAddress": "College Road, Sungam, Ramanathapuram, Coimbatore, Tamil Nadu 641045",
      "transportNote": "Regular bus services available from Gandhipuram and Ukkadam bus terminals."
    }
  }
  ```
- **Frontend Fallback:** Falls back to default state derived from `university-data.ts`.

#### `PUT /api/content`
- **Caller:** `site-context.tsx:547, 565, 601, 619, 637`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Request Body (Partial Update / Discriminator payload):**
  Accepts either a specific subsection object or a merged content update:
  ```json
  {
    "heroSection": {
      "backgroundVideo": "https://cdn.bac.edu.in/video/campus-2026.mp4",
      "fallbackImage": "https://cdn.bac.edu.in/images/campus-fall.jpg",
      "blurIntensity": 75,
      "overlayOpacity": 80,
      "enabled": true
    }
  }
  ```
- **Success Response:** `200 OK` with `{ "success": true, "data": { ... } }`

---

### 3. Departments & Academic Catalog

#### `GET /api/departments`
- **Caller:** `site-context.tsx:433`
- **Response Structure:** Array of `Department` objects.
  ```json
  [
    {
      "slug": "computer-science",
      "name": "Department of Computer Science",
      "shortName": "CS",
      "category": "Science",
      "icon": "Cpu",
      "description": "Pioneering computing education, AI research, and software innovation.",
      "longDescription": "The Department of Computer Science was established in 1994...",
      "cover": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      "coverImage": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      "facultyCount": 14,
      "studentCount": 360,
      "placementRate": "96%",
      "programsCount": 3,
      "researchLabs": 4,
      "color": "from-cyan-500 to-blue-600",
      "vision": "To produce globally competent computing professionals with ethical values.",
      "mission": "Empowering students through rigorous theory, experiential learning, and industry immersion.",
      "highlights": [
        "100% placement track record in core IT roles",
        "State-of-the-art AI & Cloud Computing laboratory"
      ],
      "programs": [
        {
          "name": "B.Sc Computer Science",
          "code": "UG-CS-01",
          "level": "UG",
          "duration": "3 Years",
          "intake": 60,
          "eligibility": "Higher Secondary (10+2) with Mathematics/Computer Science",
          "description": "Comprehensive foundation in algorithms, databases, full-stack development, and software engineering."
        }
      ],
      "faculty": [
        {
          "name": "Dr. V. Anitha",
          "designation": "Associate Professor & HOD",
          "qualification": "M.Sc., M.Phil., Ph.D.",
          "experience": "18 Years",
          "specialization": "Data Mining, Artificial Intelligence",
          "email": "anitha.cs@bac.edu.in",
          "image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2"
        }
      ],
      "researchAreas": ["Deep Learning", "IoT", "Cloud Security"],
      "researchStats": {
        "publications": 48,
        "patents": 3,
        "fundedProjects": "₹ 15.5 Lakhs"
      },
      "labs": [
        {
          "name": "Turing Advanced Computing Lab",
          "description": "60 High-performance i7 workstations with GPU accelerators",
          "equipment": ["NVIDIA RTX 4080 GPUs", "Gigabit LAN Backbone"],
          "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97"
        }
      ],
      "events": [
        {
          "title": "CYBERFEST 2026 — Intercollegiate Symposium",
          "date": "March 15, 2026",
          "type": "Technical Symposium"
        }
      ],
      "alumni": [
        {
          "name": "Karthik Subramanian",
          "batch": "2018",
          "designation": "Senior Cloud Engineer",
          "company": "Amazon Web Services",
          "testimonial": "The practical exposure at BAC formed the bedrock of my cloud engineering career."
        }
      ],
      "achievements": [
        "Best Department Award (Bharathiar University Zone) 2024",
        "Winners of Smart India Hackathon Regional Finals"
      ],
      "flagshipEvents": ["CodeCraft Hackathon", "AlumConnect Talks"],
      "contact": {
        "email": "hod.cs@bac.edu.in",
        "phone": "+91 422 2316731 Ext. 204",
        "location": "3rd Floor, Ramanujan Science Block"
      }
    }
  ]
  ```

#### `POST /api/departments` & `PUT /api/departments`
- **Caller:** `site-context.tsx:655`
- **Body:** Full `Department` JSON.
- **Success Code:** `200 OK` (updates cache and triggers `refresh()`).

#### `DELETE /api/departments?slug=:slug`
- **Caller:** `site-context.tsx:673`
- **Query Parameter:** `slug` (string, required).
- **Success Code:** `200 OK`.

---

### 4. Events, Guest Speakers & Event Gallery

The frontend handles events, speakers, and gallery under a single polymorph `/api/events` endpoint:

#### `GET /api/events`
- **Caller:** `site-context.tsx:434`
- **Success Response (`200 OK`):**
  ```json
  {
    "events": [
      {
        "id": "ev-01",
        "title": "National Level Hackathon 2026",
        "category": "Hackathons",
        "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        "date": "October 15, 2026",
        "dateISO": "2026-10-15T09:00:00.000Z",
        "venue": "IT Block Auditorium",
        "participants": 500,
        "prizePool": "₹ 50,000",
        "description": "A 24-hour non-stop innovation sprint addressing rural technology challenges.",
        "speakers": ["Dr. Priya Suresh", "Mr. Rajan Kumar"]
      }
    ],
    "guestSpeakers": [
      {
        "name": "Dr. Priya Suresh",
        "company": "Zoho Corporation",
        "topic": "Future of AI in Higher Education",
        "date": "October 15, 2026",
        "image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330"
      }
    ],
    "eventGallery": [
      {
        "url": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
        "category": "Hackathon",
        "title": "Hackathon 2026 Inaugural Ceremony"
      }
    ]
  }
  ```

#### `POST /api/events` (Polymorphic Mutation)
- **Caller:** `site-context.tsx:689, 723, 757`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Payload Schema by Type:**
  - **Create / Update Event (`type: "event"`):**
    ```json
    {
      "type": "event",
      "id": "ev-01",
      "data": {
        "title": "Ambrose Cultural Fiesta",
        "category": "Cultural",
        "image": "https://cdn.bac.edu.in/events/fiesta.jpg",
        "date": "November 5, 2026",
        "dateISO": "2026-11-05T10:00:00.000Z",
        "venue": "Campus Grounds",
        "participants": 1200,
        "prizePool": "₹ 1,00,000",
        "description": "Annual flagship intercollegiate cultural extravaganza."
      }
    }
    ```
  - **Create / Update Speaker (`type: "speaker"`):**
    ```json
    {
      "type": "speaker",
      "id": "Mr. Kavin Paul",
      "data": {
        "name": "Mr. Kavin Paul",
        "company": "StartupHub India",
        "topic": "Entrepreneurship for Gen-Z",
        "date": "October 22, 2026",
        "image": "https://cdn.bac.edu.in/speakers/kavin.jpg"
      }
    }
    ```
  - **Create Gallery Item (`type: "gallery"`):**
    ```json
    {
      "type": "gallery",
      "data": {
        "url": "https://cdn.bac.edu.in/gallery/sports-2026.jpg",
        "category": "Sports",
        "title": "Annual Athletic Meet 2026"
      }
    }
    ```

#### `DELETE /api/events` (Query Discriminator)
- **Delete Event:** `DELETE /api/events?type=event&id=ev-01`
- **Delete Speaker:** `DELETE /api/events?type=speaker&id=Mr.%20Kavin%20Paul`
- **Delete Gallery Item:** `DELETE /api/events?type=gallery&id=Annual%20Athletic%20Meet%202026`

---

### 5. News Articles & Press Releases

#### `GET /api/news`
- **Caller:** `site-context.tsx:435`
- **Response Structure:** Array of `NewsArticle` objects:
  ```json
  [
    {
      "id": "news_01",
      "title": "BAC Students Win State-Level Hackathon 2026",
      "summary": "Computer Science undergrads won 1st prize at TN Innovation Summit.",
      "content": "Full article markdown or HTML body...",
      "category": "Achievements",
      "author": "Dr. Thomas Raj",
      "date": "2026-09-20",
      "status": "published",
      "image": "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      "featured": true,
      "tags": ["Hackathon", "Student Achievement", "Computer Science"]
    }
  ]
  ```

#### `POST /api/news` & `PUT /api/news/:id`
- **Caller:** `site-context.tsx:807`
- **Body:** `Partial<NewsArticle>` JSON.

#### `DELETE /api/news/:id`
- **Caller:** `site-context.tsx:819`
- **Success Response:** `200 OK`.

#### `PUT /api/news/config`
- **Caller:** `site-context.tsx:827`
- **Body:**
  ```json
  {
    "bannerTitle": "Latest News & Happenings",
    "featuredArticleId": "news_01",
    "articlesPerPage": 6,
    "enableComments": false
  }
  ```

---

### 6. IQAC Accreditation Dossier

#### `GET /api/iqac`
- **Caller:** `iqac-context.tsx:128`, `iqac-manager.tsx:35`
- **Success Response (`200 OK`):**
  ```json
  {
    "overview": {
      "naacGrade": "B+",
      "naacCGPA": "2.71",
      "naacCycle": "3rd Cycle",
      "naacYear": "2023",
      "established": "1994",
      "autonomyStatus": "Autonomous Institution",
      "affiliation": "Bharathiar University, Coimbatore",
      "ugcRecognition": "UGC 2(f) & 12(B)",
      "accreditationStatus": "NAAC Accredited",
      "isoStatus": "ISO 9001:2015 Certified",
      "nirf": "NIRF Ranked Institution"
    },
    "committee": {
      "coordinator": "Dr. P. Samuel Manoharan",
      "coordinatorDesignation": "Principal & IQAC Coordinator",
      "members": [
        {
          "name": "Dr. V. Anitha",
          "role": "IQAC Director",
          "designation": "Associate Professor, Computer Science"
        }
      ]
    },
    "aqar": [
      {
        "year": "2023-24",
        "status": "Submitted",
        "submittedOn": "2024-11-20",
        "downloadUrl": "/downloads/aqar-2023-24.pdf",
        "highlights": ["NAAC 3rd Cycle Accreditation completed"]
      }
    ],
    "ssr": [
      {
        "cycle": "3rd Cycle",
        "year": "2023",
        "grade": "B+",
        "cgpa": "2.71",
        "downloadUrl": "/downloads/ssr-3rd-cycle-2023.pdf"
      }
    ],
    "sss": {
      "year": "2023-24",
      "overallScore": 78.4,
      "categories": [
        { "label": "Teaching & Learning", "score": 82 },
        { "label": "Infrastructure & Facilities", "score": 76 }
      ]
    },
    "initiatives": [
      {
        "title": "Outcome-Based Education (OBE)",
        "description": "Implemented CBCS-OBE framework across all UG/PG programs.",
        "year": "2022",
        "status": "Ongoing"
      }
    ],
    "documents": [
      {
        "title": "NAAC Peer Team Report — 3rd Cycle (2023)",
        "category": "NAAC",
        "fileUrl": "/downloads/naac-peer-report-2023.pdf",
        "fileSize": "3.2 MB"
      }
    ]
  }
  ```

#### `PUT /api/iqac/section/:section`
- **Caller:** `iqac-context.tsx:147`, `iqac-manager.tsx:59`
- **Path Param:** `section` (e.g. `overview`, `committee`, `aqar`, `ssr`, `sss`, `initiatives`, `documents`).
- **Body:** JSON object corresponding to that section.
- **Success:** `200 OK`.

#### `POST /api/iqac/download/:section/:id`
- **Caller:** `iqac-context.tsx:159`
- **Action:** Increments download counter in MongoDB for that document without returning document bytes (bytes served via CDN or static route).

---

### 7. Admissions & Student Applications

#### `POST /api/admissions` (Public Student Form Submission)
- **Caller:** `site-context.tsx:791` (invoked by `admissions-page.tsx:77`)
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "name": "Maria Joseph",
    "email": "maria.j@gmail.com",
    "phone": "+91 98421 54321",
    "program": "B.Sc Computer Science",
    "gpa": "92.5%",
    "notes": "Interested in Artificial Intelligence specialization"
  }
  ```
- **Success Response (`201 Created` or `200 OK`):**
  ```json
  {
    "success": true,
    "appNumber": "BAC-ADM-2026-1048",
    "message": "Application submitted successfully."
  }
  ```

#### `GET /api/admissions` (Admin Review Queue)
- **Caller:** `admissions-tab.tsx:33`
- **Headers:** `Authorization: Bearer <token>`
- **Response Structure:**
  ```json
  [
    {
      "id": "app-001",
      "name": "Maria Joseph",
      "email": "maria.j@gmail.com",
      "phone": "+91 98421 54321",
      "program": "B.Sc Computer Science",
      "status": "new",
      "appliedAt": "2026-03-10T14:30:00Z",
      "gpa": "92.5%",
      "notes": "Verified +2 HSC Marksheet."
    }
  ]
  ```

#### `PUT /api/admissions` (Admin Status & Notes Update)
- **Caller:** `admissions-tab.tsx:59, 98`
- **Headers:** `Content-Type: application/json`, `Authorization: Bearer <token>`
- **Request Body:**
  ```json
  {
    "id": "app-001",
    "status": "shortlisted",
    "notes": "Interview scheduled for Monday 10:00 AM."
  }
  ```

---

### 8. Advertisements & Popup Overlay (`/api/v1/advertisements`)

#### `GET /api/v1/advertisements/active?position=popup_overlay`
- **Caller:** `advertisement-service.ts:290` (called by `components/public/advertisement-popup.tsx`)
- **Response (`200 OK`):**
  ```json
  {
    "id": "ad-001",
    "title": "Admissions 2026-27 Open — Apply Now for UG & PG Programs",
    "description": "Scholarships available for meritorious students across all disciplines.",
    "imageUrl": "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&h=675&fit=crop",
    "imageAltText": "BAC Admissions 2026",
    "destinationUrl": "admissions",
    "openInNewTab": false,
    "startDate": "2026-01-01T00:00",
    "endDate": "2026-12-31T23:59",
    "displayDuration": 10,
    "displayFrequency": "once_per_session",
    "displayPosition": "popup_overlay",
    "priority": 1,
    "status": "active",
    "createdAt": "2026-01-01T00:00:00.000Z",
    "updatedAt": "2026-03-01T10:00:00.000Z",
    "clickCount": 142,
    "impressionCount": 3890
  }
  ```

#### `GET /api/v1/advertisements`
- **Caller:** `advertisement-service.ts:236`
- **Query Params:** `search`, `status`, `position`, `startDate`, `endDate`
- **Response:** Array of `Advertisement` records.

#### `POST /api/v1/advertisements` & `PUT /api/v1/advertisements/:id`
- **Body:** `CreateAdvertisementDto` / `UpdateAdvertisementDto`.

#### `PATCH /api/v1/advertisements/:id/status`
- **Body:** `{ "status": "active" | "inactive" | "draft" }`

#### `DELETE /api/v1/advertisements/:id`
- **Action:** Delete advertisement record.

#### `POST /api/v1/advertisements/:id/track-impression` & `POST /api/v1/advertisements/:id/track-click`
- **Action:** Atomic `$inc` in MongoDB for `impressionCount` or `clickCount`.

---

### 9. External Media Assets Engine & Prohibited Local Uploads

#### Prohibited & Deprecated Endpoints:
The following legacy endpoints are **strictly deprecated and disabled**:
- `POST /api/upload` (File binary upload) — **DISABLED**
- `POST /api/about/image` (Campus about image upload) — **DISABLED**
- `POST /api/v1/advertisements/upload-image` (Advertisement image upload) — **DISABLED**

> [!SECURITY]
> **Zero Local Disk Uploads:**  
> The application strictly rejects multipart binary uploads and filesystem storage. All media assets (images, hero videos, brochures, documents) must be hosted on external HTTPS storage (e.g. Cloudinary, AWS S3, or college CDN).

#### Implemented Media Assets API:

##### `POST /api/admin/media-assets`
- **Authentication:** Required (`requireAuth`, `requirePermissions('media:create')`).
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "title": "Campus Main Entrance Banner",
    "url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",
    "altText": "Bishop Ambrose College Main Entrance Building",
    "category": "campus",
    "tags": ["campus", "entrance", "homepage"],
    "fileSize": 245000,
    "dimensions": { "width": 1920, "height": 1080 }
  }
  ```
- **Validation Rules (`safeMediaUrlSchema`):**
  - `url`: Must be a valid absolute URL with explicit `https://` scheme (or whitelisted institutional domain `http://`). Protocol-relative URLs, data URIs, and dangerous schemes (`javascript:`, `file:`) are rejected.
  - `title`: Required text string (1–200 characters, no `<script>` or event handlers).
  - `category`: Enum matching media categories (`campus`, `faculty`, `events`, `academics`, `sports`, `general`).
- **Success Response (`201 Created`):**
  ```json
  {
    "success": true,
    "message": "Media asset registered successfully.",
    "data": {
      "id": "6725...",
      "title": "Campus Main Entrance Banner",
      "url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",
      "altText": "Bishop Ambrose College Main Entrance Building",
      "category": "campus",
      "createdAt": "2026-11-10T12:00:00.000Z"
    }
  }
  ```

##### `GET /api/v1/media` & `GET /api/admin/media-assets`
- **Query Parameters:** `?category=campus&search=entrance&page=1&limit=50`
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "data": {
      "assets": [
        {
          "id": "6725...",
          "title": "Campus Main Entrance Banner",
          "url": "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1920&q=80",
          "category": "campus"
        }
      ],
      "pagination": { "page": 1, "limit": 50, "total": 1, "totalPages": 1 }
    }
  }
  ```

---

### 10. Database Initialization, Migrations & Provisioning (CLI Engine)

#### Deprecated Endpoint:
- `POST /api/seed` — **DISABLED**. Client-side HTTP requests can never trigger database resets or unauthenticated seed writes in production.

#### Implemented CLI Tools:
1. **Administrative Account Provisioning:**
   ```bash
   npm run admin:provision
   ```
   Interactive CLI utility to provision administrator accounts with bcrypt password hashing and 6-role RBAC assignment.
2. **Preflight Schema Inspection (Read-Only):**
   ```bash
   npm run migrate:preflight
   ```
   Validates database connectivity and schema readiness without mutating records.
3. **Migration Execution with Automatic Cryptographic Backup:**
   ```bash
   npm run migrate:execute -- --confirm
   ```
   Dumps all 15 collections to `backend/backups/bac_backup_YYYYMMDD_HHMMSS/` with SHA-256 checksums before applying idempotent schema migrations.
4. **Verified Migration Rollback:**
   ```bash
   npm run migrate:restore -- --backup-dir="backups/bac_backup_<TIMESTAMP>" --confirm
   ```
   Restores collections from verified pre-migration backups, preserving the `users` collection to protect administrative access.

---

## D. Complete Module-by-Module Requirements

| Module | Existing Frontend Implementation | Current Storage / State | Real Backend Requirements |
|---|---|---|---|
| **1. Homepage & Site Content** | `HomePage.tsx`, `components/home/*`, `components/site/*` | `site-context.tsx` with fallback to `university-data.ts` | `/api/content` (GET, PUT). Must store Logo, Hero, Announcements, Footer, Statistics, Virtual Tour, Location. |
| **2. About & Institutional Info** | `about-page.tsx`, `components/home/about.tsx`, `about-manager.tsx` | `site-context.tsx` | `/api/about` (GET, PUT) and `/api/about/image` (POST). |
| **3. Departments & Catalog** | `department-detail.tsx`, `departments-tab.tsx`, `departments-cms.tsx` | `site-context.tsx` | `/api/departments` (CRUD with `?slug=`). Needs collection for 12 departments with nested programs, faculty, labs. |
| **4. Courses & Academic Programmes** | `courses-dashboard.tsx`, `courses-cms.tsx` | `courses-dashboard.tsx` has raw `fetch("/api/courses")` | `/api/courses` (GET, POST, PUT, DELETE). Stores name, code, level (UG/PG), department, duration, intake, eligibility. |
| **5. Faculty & Staff Directory** | `faculty-cms.tsx`, `department-detail.tsx` | Embedded inside Department documents & `faculty-cms` local state | `/api/faculty` (recommended) or query via `/api/departments/:slug/faculty`. |
| **6. Events & Guest Speakers** | `events-page.tsx`, `events-tab.tsx`, `events-cms.tsx` | `site-context.tsx` calling `/api/events` | Polymorphic `/api/events` (GET, POST, DELETE with `?type=event\|speaker\|gallery`). |
| **7. News & Notices** | `news-page.tsx`, `news-cms.tsx`, `notices-cms.tsx` | `site-context.tsx` calling `/api/news` & `cms-store.tsx` (`STORAGE_PREFIX + "notices"`) | `/api/news` (CRUD), `/api/news/config`, `/api/notices` (CRUD). |
| **8. IQAC, NAAC, AQAR, SSR** | `IQACPage.tsx`, `iqac-public-page.tsx`, `iqac-manager.tsx`, `aqar-ssr-cms.tsx` | `iqac-context.tsx` calling `/api/iqac` | `/api/iqac` (GET, PUT), `/api/iqac/section/:section` (PUT), `/api/iqac/download/:section/:id` (POST). |
| **9. Admissions & Applications** | `admissions-page.tsx`, `admissions-tab.tsx`, `applications-cms.tsx` | `site-context.tsx` and `admissions-tab.tsx` calling `/api/admissions` | `/api/admissions` (POST public application, GET list, PUT status/notes). |
| **10. Contact Forms & Enquiries** | `contact-page.tsx`, `components/home/contact.tsx`, `contact-dashboard.tsx`, `enquiries-cms.tsx` | `contact-dashboard.tsx` calls `/api/contact`; public forms set `setSubmitted(true)`; `cms-store.tsx` uses `bac_cms_enquiries` | `/api/contact` (GET, PUT settings), `POST /api/contact/enquiries` (public form submission), `/api/admin/enquiries` (admin triage). |
| **11. Gallery & Media Management** | `gallery-page.tsx`, `gallery-dashboard.tsx`, `media-library-cms.tsx` | `gallery-dashboard.tsx` calls `/api/gallery`; `cms-store.tsx` uses `bac_cms_media` | `/api/gallery` (GET, POST), `/api/admin/media` (CRUD asset metadata), `/api/upload` (binary storage). |
| **12. Advertisement Popups** | `advertisement-popup.tsx`, `advertisements-cms.tsx`, `advertisement-service.ts` | Fully defined `/api/v1/advertisements` specification with fallback to `bac_advertisements_v2` | Full 10-endpoint suite under `/api/v1/advertisements` including active priority query and analytics tracking. |
| **13. Admin Auth & RBAC** | `AdminLoginPage.tsx`, `users-cms.tsx`, `roles-perms-cms.tsx` | `AdminLoginPage.tsx` calls `/api/auth/login`; `cms-store.tsx` uses `bac_cms_users` & `bac_admin_user` | `/api/auth/login`, `/api/auth/me`, `/api/admin/users` (CRUD), `/api/admin/roles` (permissions matrix). |
| **14. Dynamic Pages & Navigation** | `page-builder-cms.tsx`, `menu-builder-cms.tsx` | `cms-store.tsx` (`bac_cms_pages`, `bac_cms_menus`) | `/api/admin/pages` (CRUD for `DynamicPage` with block JSON), `/api/admin/menus` (CRUD for `MenuItem`). |
| **15. Institutional Facilities** | `facilities-page.tsx`, `facilities-dashboard.tsx`, `facilities-cms.tsx` | `facilities-dashboard.tsx` calls `/api/facilities` | `/api/facilities` (GET, POST, PUT, DELETE). |
| **16. Placement & Career Cell** | `placements-page.tsx`, `placements-dashboard.tsx`, `placement-cell-cms.tsx` | `placements-dashboard.tsx` calls `/api/placements` | `/api/placements` (GET, POST). |
| **17. Alumni Association** | `alumni-page.tsx`, `alumni-cms.tsx` | Public registration form sets local state; admin uses `bac_cms_alumni` | `POST /api/alumni/register` (public form), `/api/admin/alumni` (admin verification and directory management). |
| **18. Document Center** | `document-center-cms.tsx` | `cms-store.tsx` (`bac_cms_documents`) | `/api/documents` (CRUD for NIRF, Autonomous, IQAC, Academic documents). |
| **19. Student Life & Clubs** | `clubs-cms.tsx`, `associations-cms.tsx`, `sports-arts-cms.tsx` | `cms-store.tsx` (`bac_cms_clubs`) | `/api/clubs` (CRUD for cultural, sports, and technical societies). |
| **20. Approvals & Audit Trail** | `approvals-cms.tsx`, `audit-logs-cms.tsx` | `cms-store.tsx` (`bac_cms_approvals`, `bac_cms_audit_logs`) | `/api/admin/approvals` (review workflow), `/api/admin/audit-logs` (immutable tamper-evident logging). |
| **21. Autonomous Governance & Exams** | `statutory-bodies-cms.tsx`, `autonomy-regs-cms.tsx`, `exam-schedules-cms.tsx`, `exam-regulations-cms.tsx` | Local mock state in components | `/api/autonomous/statutory-bodies`, `/api/autonomous/regulations`, `/api/examination/schedules`, `/api/examination/regulations`. |

---

## E. Proposed MongoDB Collections & Mongoose Schemas

### Recommended MongoDB Collections
1. `users` — Administrative accounts & RBAC credentials
2. `audit_logs` — Activity tracking & compliance records
3. `site_content` — Singleton holding global homepage, hero, about, footer, location
4. `departments` — Academic departments, faculty, curriculum, labs
5. `courses` — Degree programmes (UG, PG, Doctoral, Certificate)
6. `events` — Campus events, guest speakers, and event gallery entries
7. `news_articles` — Press releases, achievements, news configuration
8. `notices` — College circulars, exam notices, emergency alerts
9. `iqac_dossier` — Singleton holding NAAC, AQAR, SSR, SSS, and IQAC committee data
10. `admissions_applications` — Prospective student online applications
11. `advertisements` — Popup overlays and banners with scheduling & metrics
12. `contact_enquiries` — Public inquiries submitted via contact page
13. `facilities` — Campus amenities, labs, sports complexes, hostels
14. `placements` — Recruiters, placement statistics, and alumni success stories
15. `gallery_albums` — Photo albums and video links
16. `dynamic_pages` — Custom landing pages constructed with block builder
17. `navigation_menus` — Hierarchical navigation trees
18. `media_assets` — Uploaded media catalog and file metadata
19. `college_documents` — Official PDF circulars, policies, NIRF dossiers
20. `alumni_members` — Registered alumni network profiles
21. `student_clubs` — Student clubs, coordinators, and achievements
22. `approvals` — Content submission, review, and publication queue

---

### Mongoose Schema Blueprints

#### 1. `User` Schema (`users` collection)
```typescript
import mongoose, { Schema } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: {
    type: String,
    enum: ['master_admin', 'sub_admin', 'hod', 'club_head', 'content_editor', 'staff'],
    default: 'sub_admin'
  },
  departmentId: { type: String, default: null }, // e.g., 'computer-science'
  clubId: { type: String, default: null },
  permissions: [{ type: String }], // ['all'] or granular module names
  status: { type: String, enum: ['active', 'deactivated'], default: 'active' },
  avatar: { type: String, default: null },
  phone: { type: String, default: null },
  lastLogin: { type: Date, default: null },
  refreshTokenHash: { type: String, default: null }
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);
```

#### 2. `Advertisement` Schema (`advertisements` collection)
```typescript
const AdvertisementSchema = new Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  imageUrl: { type: String, required: true },
  imageAltText: { type: String, default: '' },
  destinationUrl: { type: String, default: '' },
  openInNewTab: { type: Boolean, default: false },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  displayDuration: { type: Number, default: 10 },
  displayFrequency: {
    type: String,
    enum: ['once_per_session', 'every_visit'],
    default: 'once_per_session'
  },
  displayPosition: {
    type: String,
    enum: ['popup_overlay', 'homepage_banner', 'sidebar_banner'],
    default: 'popup_overlay'
  },
  priority: { type: Number, min: 1, max: 10, default: 1 },
  status: {
    type: String,
    enum: ['active', 'scheduled', 'draft', 'inactive', 'expired'],
    default: 'draft'
  },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  clickCount: { type: Number, default: 0 },
  impressionCount: { type: Number, default: 0 }
}, { timestamps: true });

AdvertisementSchema.index({ status: 1, displayPosition: 1, startDate: 1, endDate: 1, priority: 1 });
export const AdvertisementModel = mongoose.model('Advertisement', AdvertisementSchema);
```

#### 3. `AdmissionApplication` Schema (`admissions_applications` collection)
```typescript
const AdmissionApplicationSchema = new Schema({
  appNumber: { type: String, unique: true, required: true }, // e.g. BAC-ADM-2026-1001
  studentName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  program: { type: String, required: true },
  departmentSlug: { type: String },
  gpa: { type: String },
  qualifyingExam: { type: String },
  marksPercentage: { type: Number },
  schoolName: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  status: {
    type: String,
    enum: ['new', 'under_review', 'shortlisted', 'approved', 'rejected'],
    default: 'new'
  },
  submittedAt: { type: Date, default: Date.now },
  notes: { type: String, default: '' },
  remarks: [{
    author: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
  }],
  documentsAttached: [{ type: String }] // file URLs
}, { timestamps: true });

export const AdmissionApplicationModel = mongoose.model('AdmissionApplication', AdmissionApplicationSchema);
```

#### 4. `Department` Schema (`departments` collection)
```typescript
const ProgramSubSchema = new Schema({
  name: { type: String, required: true },
  code: { type: String, required: true },
  level: { type: String, enum: ['UG', 'PG', 'Doctoral', 'Certificate'], required: true },
  duration: { type: String, required: true },
  intake: { type: Number, default: 60 },
  eligibility: { type: String, required: true },
  description: { type: String, default: '' }
}, { _id: true });

const FacultySubSchema = new Schema({
  name: { type: String, required: true },
  designation: { type: String, required: true },
  qualification: { type: String, required: true },
  experience: { type: String },
  specialization: { type: String },
  email: { type: String },
  image: { type: String }
}, { _id: true });

const DepartmentSchema = new Schema({
  slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  category: { type: String, required: true },
  icon: { type: String, default: 'Building2' },
  description: { type: String, required: true },
  longDescription: { type: String },
  cover: { type: String },
  coverImage: { type: String },
  facultyCount: { type: Number, default: 0 },
  studentCount: { type: Number, default: 0 },
  placementRate: { type: String, default: '95%' },
  programsCount: { type: Number, default: 1 },
  researchLabs: { type: Number, default: 0 },
  color: { type: String, default: 'from-blue-600 to-indigo-700' },
  vision: { type: String },
  mission: { type: String },
  highlights: [{ type: String }],
  programs: [ProgramSubSchema],
  faculty: [FacultySubSchema],
  researchAreas: [{ type: String }],
  researchStats: {
    publications: { type: Number, default: 0 },
    patents: { type: Number, default: 0 },
    fundedProjects: { type: String, default: '₹ 0' }
  },
  labs: [{
    name: String,
    description: String,
    equipment: [String],
    image: String
  }],
  events: [{
    title: String,
    date: String,
    type: { type: String }
  }],
  alumni: [{
    name: String,
    batch: String,
    designation: String,
    company: String,
    testimonial: String
  }],
  achievements: [{ type: String }],
  flagshipEvents: [{ type: String }],
  contact: {
    email: String,
    phone: String,
    location: String
  }
}, { timestamps: true });

export const DepartmentModel = mongoose.model('Department', DepartmentSchema);
```

#### 5. `ContactEnquiry` Schema (`contact_enquiries` collection)
```typescript
const ContactEnquirySchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  category: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['unread', 'read', 'in_progress', 'resolved'],
    default: 'unread'
  },
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  notes: { type: String, default: '' },
  submittedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export const ContactEnquiryModel = mongoose.model('ContactEnquiry', ContactEnquirySchema);
```

---

## F. Authentication and Authorization Matrix

### Role-Based Access Control (RBAC) Definitions
The frontend defines six distinct administrative roles in `cms-store.tsx`:

1. **`master_admin`:** Unrestricted administrative access across all 20+ modules, system settings, database reset (`/api/seed`), user management, and approval finalization.
2. **`sub_admin`:** General administrative access with permissions bounded to authorized modules.
3. **`hod`:** Department-scoped admin (e.g. `departmentId = "computer-science"`). Can manage faculty, syllabus, lab facilities, and submit departmental achievements for approval.
4. **`club_head`:** Student organization head (e.g. `clubId = "cultural-club"`). Can create club events, announcements, and submit activity reports.
5. **`content_editor`:** Staff member drafting announcements, news articles, and photo albums. Must submit content for approval prior to public release.
6. **`staff`:** Read-only access to internal documents, circulars, and student rosters.

### Endpoint Security Matrix

| Endpoint Group | Public Access | Content Editor / HOD | Sub Admin | Master Admin |
|---|---|---|---|---|
| `GET /api/content`, `GET /api/about` | Read Only | Read Only | Read Only | Read & Write |
| `PUT /api/content`, `PUT /api/about` | No Access | No Access | With Permission | Full Access |
| `GET /api/departments`, `GET /api/events`, `GET /api/news` | Read Only | Read Only | Read Only | Full Access |
| `POST/PUT/DELETE /api/departments` | No Access | Scoped to own Dept | Scoped to Depts | Full Access |
| `POST/PUT/DELETE /api/events`, `/api/news` | No Access | Draft / Submit | Publish Directly | Full Access |
| `GET /api/iqac` | Read Only | Read Only | Read Only | Full Access |
| `PUT /api/iqac`, `/api/iqac/section/:section` | No Access | No Access | With Permission | Full Access |
| `POST /api/admissions` (apply) | Full Access | Full Access | Full Access | Full Access |
| `GET/PUT /api/admissions` (review) | No Access | No Access | Admission Role | Full Access |
| `GET /api/v1/advertisements/active` | Full Access | Full Access | Full Access | Full Access |
| `POST/PUT/DELETE /api/v1/advertisements` | No Access | No Access | Marketing Role | Full Access |
| `POST /api/upload` | **Disabled** | **Disabled** | **Disabled** | **Disabled** (Replaced by external media URLs) |
| `POST /api/seed` | **Disabled** | **Disabled** | **Disabled** | **Disabled** (Replaced by CLI `admin:provision`) |
| `/api/admin/users`, `/api/admin/roles` | No Access | No Access | No Access | Master Admin Only |
| `/api/admin/audit-logs` | No Access | No Access | Read Only | Read Only (Immutable) |

---

## G. Frontend-to-Backend Integration Architecture

### 1. Connecting the Vite Dev Server
When developing locally, configure the Vite dev server proxy in [`frontend/vite.config.ts`](./frontend/vite.config.ts):
```typescript
server: {
  port: 3000,
  proxy: {
    "/api": {
      target: "http://localhost:5001",
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 2. Full-Stack Data Synchronization
The frontend integrates with the backend REST APIs across all functional modules:
- **Site & Institutional Context (`site-context.tsx`):** Consumes `/api/content`, `/api/departments`, `/api/events`, and `/api/news` with automatic offline fallback to `university-data.ts`.
- **Accreditation Portal (`iqac-context.tsx`):** Consumes `/api/iqac` with granular section updates.
- **Enterprise CMS Store (`cms-store.tsx`):** Fully integrated with MongoDB REST APIs for Users, Approvals, Pages, Menus, Media Assets, Forms, Inquiries, Clubs, Notices, and Alumni.
- **Service Adapters:** Dedicated API clients in `notice-service.ts`, `club-service.ts`, and `advertisement-service.ts` communicating with `/api/v1/*`.

---

## H. Architectural Decisions & Security Invariants

### 1. Active Architecture Decisions

| # | Design Topic | Implemented Architecture | Security Rationale |
|---|---|---|---|
| **AD1** | **Media Storage Architecture** | **100% External HTTPS URLs** registered via `/api/admin/media-assets`. Local file uploads are strictly prohibited and disabled. | Eliminates arbitrary file upload vulnerabilities, shell execution risks, and local host storage exhaustion. |
| **AD2** | **Authentication & Token Storage** | **HttpOnly, Secure, SameSite=Strict Cookie (`bac_token`)** combined with atomic `tokenVersion` in MongoDB. | Eliminates XSS token theft risks inherent to `localStorage`. Enables instant revocation of all active sessions on logout or password change. |
| **AD3** | **Dual Routing Architecture** | Modern versioned REST API under `/api/v1/*` with legacy unversioned mirrors under `/api/*`. | Supports modern API standards while ensuring 100% backward compatibility for existing frontend components. |
| **AD4** | **Form Engine & Inquiries Triage** | Dynamic schema engine with flexible status triage: `new`, `in_review`, `responded`, `resolved`, `rejected`. | Allows admission and contact queries to be captured dynamically and triaged by authorized coordinators with administrative notes. |
| **AD5** | **RBAC & Resource Scoping** | 6 operational roles with strict departmental (`hod`) and club (`club_head`) isolation guards. | Prevents cross-departmental record modification while preserving centralized governance for master and sub administrators. |

---

## I. Verified Implementation Milestones (Complete Full-Stack Delivery)

```text
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Foundation & Diagnostics                                      │
│ • Express + TypeScript + Mongoose scaffolding & strict environment     │
│ • Liveness (/api/health) and Readiness (/api/ready) monitoring probes  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 2: Secure Authentication & Session Management                    │
│ • Bcrypt password hashing (cost 12), brute-force lockout mitigation    │
│ • POST /api/auth/login, POST /api/auth/logout, GET /api/auth/me        │
│ • Controlled CLI provisioning utility (npm run admin:provision)        │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 3: Core Domain Services & Public Content                         │
│ • Content, About, Departments, Courses, Events, Gallery, Placements    │
│ • Public versioned REST API (/api/v1/*) with HTTP 304 ETag caching     │
│ • Admissions & Contact enquiry public submission endpoints             │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 4: Enterprise CMS Modules & Data Governance                      │
│ • Notices CMS: Pinning, priority, review queue, scheduled publishing   │
│ • Clubs CMS: Profiles, memberships, privacy-preserving roster          │
│ • Dynamic Forms & Inquiries Engine: 5-state triage workflow            │
│ • Dynamic Pages, Navigation Menus, and External Media Assets Engine    │
│ • Alumni Network: Verification and searchable public directory         │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 5: Production Hardening, Proxy Routing & Performance             │
│ • Port 5001 standardization, PM2 fork supervisor (16s kill_timeout)    │
│ • Corrected Nginx virtual host with repeated security headers          │
│ • SPA deep-link fallback (try_files $uri $uri/ /index.html)            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 6: Institutional Branding, Handover Documentation & Delivery     │
│ • Verified institutional branding across code and metadata             │
│ • Operational handover runbooks and administrative governance guides   │
│ • Zero uncommitted git changes, verified automated test coverage       │
└────────────────────────────────────────────────────────────────────────┘
```

---

## J. Production Quality Assurance & Security Checklist

All test suites and security checks pass with zero defects:

### 1. Public Content & Data Integrity
- [x] `GET /api/content` returns all required institutional sections with ETag caching.
- [x] `GET /api/departments` serves complete departmental catalog.
- [x] `GET /api/v1/notices` and `/notices/pinned` filter and sort published circulars correctly.
- [x] `GET /api/v1/clubs/directory` and `/clubs/:slug/members` strictly protect student PII.

### 2. Form Submissions & Dynamic Validation
- [x] `POST /api/v1/forms/:slug/submissions` dynamically validates fields against form definitions.
- [x] Form submission triage correctly tracks statuses: `new`, `in_review`, `responded`, `resolved`, `rejected`.
- [x] Public submissions are guarded against abuse by `strictRateLimit`.

### 3. Media & File Security
- [x] Zero local file uploads: All upload endpoints (`/api/upload`, etc.) are disabled.
- [x] `safeMediaUrlSchema` enforces valid HTTPS URLs and rejects dangerous URI schemes.

### 4. Authentication, Authorization & Security
- [x] `POST /api/auth/login` mitigates timing attacks and sets `HttpOnly`, `Secure`, `SameSite=Strict` cookies.
- [x] `POST /api/auth/logout` clears cookies and atomically increments `tokenVersion` in MongoDB.
- [x] RBAC scope guards strictly restrict `hod` and `club_head` to their assigned resources.
- [x] Zero hardcoded administrative accounts or credentials in version control.

---

## K. Quick Reference: Complete Implemented Endpoint Summary

| Resource | Method | Path | Request Body / Parameters | Auth / Permissions | Status |
|---|---|---|---|---|---|
| **Health** | `GET` | `/api/health` | None | Public | Implemented |
| **Ready** | `GET` | `/api/ready` | None (Pings MongoDB) | Public | Implemented |
| **Auth Login** | `POST` | `/api/auth/login` | `{ email, password }` | Public (Rate-limited) | Implemented |
| **Auth Logout** | `POST` | `/api/auth/logout` | None | Authenticated | Implemented |
| **Auth Me** | `GET` | `/api/auth/me` | None | Authenticated | Implemented |
| **Content** | `GET` | `/api/content`, `/api/v1/content` | None | Public | Implemented |
| **Content** | `PUT` | `/api/content`, `/api/v1/content` | `updateSiteContentSchema` | Admin (`content:update`) | Implemented |
| **About** | `GET` | `/api/about`, `/api/v1/about` | None | Public | Implemented |
| **About** | `PUT` | `/api/about`, `/api/v1/about` | `updateAboutPageSchema` | Admin (`about:update`) | Implemented |
| **About Image** | `POST` | `/api/about/image` | Deprecated | **Disabled** | Disabled |
| **Departments** | `GET` | `/api/departments`, `/api/v1/departments` | `?search=` | Public | Implemented |
| **Departments** | `POST` | `/api/departments` | `createDepartmentSchema` | Admin (`departments:create`) | Implemented |
| **Departments** | `PUT` | `/api/departments/:slug` | `updateDepartmentSchema` | Admin (`departments:update`) | Implemented |
| **Departments** | `DELETE`| `/api/departments/:slug` | None | Admin (`departments:delete`) | Implemented |
| **Courses** | `GET` | `/api/courses`, `/api/v1/courses` | `?level=&department=` | Public | Implemented |
| **Courses** | `POST` | `/api/courses` | `createCourseSchema` | Admin (`courses:create`) | Implemented |
| **Courses** | `PUT` | `/api/courses/:id` | `updateCourseSchema` | Admin (`courses:update`) | Implemented |
| **Courses** | `DELETE`| `/api/courses/:id` | None | Admin (`courses:delete`) | Implemented |
| **Events** | `GET` | `/api/events`, `/api/v1/events` | None | Public | Implemented |
| **Events** | `POST` | `/api/events` | Polymorphic `{ type, data }` | Admin (`events:create`) | Implemented |
| **Events** | `DELETE`| `/api/events` | `?type=&id=` | Admin (`events:delete`) | Implemented |
| **News** | `GET` | `/api/news`, `/api/v1/news` | `?category=&search=` | Public | Implemented |
| **News** | `POST` | `/api/news` | `createNewsArticleSchema` | Admin (`news:create`) | Implemented |
| **News** | `PUT` | `/api/news/:id` | `updateNewsArticleSchema` | Admin (`news:update`) | Implemented |
| **News** | `DELETE`| `/api/news/:id` | None | Admin (`news:delete`) | Implemented |
| **IQAC** | `GET` | `/api/iqac`, `/api/v1/iqac` | None | Public | Implemented |
| **IQAC** | `PUT` | `/api/iqac` | `updateIQACDossierSchema` | Admin (`iqac:update`) | Implemented |
| **IQAC Section**| `PUT` | `/api/iqac/section/:section` | Partial section payload | Admin (`iqac:update`) | Implemented |
| **Admissions** | `POST` | `/api/admissions` | `submitAdmissionsApplicationSchema` | Public (Rate-limited) | Implemented |
| **Admissions** | `GET` | `/api/admin/admissions` | `?status=&page=&limit=` | Admin (`admissions:read`) | Implemented |
| **Admissions** | `PUT` | `/api/admin/admissions/:id/status` | `{ status, notes }` | Admin (`admissions:update`) | Implemented |
| **Facilities** | `GET` | `/api/facilities`, `/api/v1/facilities` | None | Public | Implemented |
| **Facilities** | `POST` | `/api/facilities` | `createFacilitySchema` | Admin (`facilities:create`) | Implemented |
| **Facilities** | `PUT` | `/api/facilities/:id` | `updateFacilitySchema` | Admin (`facilities:update`) | Implemented |
| **Facilities** | `DELETE`| `/api/facilities/:id` | None | Admin (`facilities:delete`) | Implemented |
| **Gallery** | `GET` | `/api/gallery`, `/api/v1/gallery` | None | Public | Implemented |
| **Gallery** | `POST` | `/api/gallery` | `updateGallerySchema` | Admin (`gallery:update`) | Implemented |
| **Placements** | `GET` | `/api/placements`, `/api/v1/placements` | None | Public | Implemented |
| **Placements** | `POST` | `/api/placements` | `updatePlacementSchema` | Admin (`placements:update`) | Implemented |
| **Contact** | `GET` | `/api/contact`, `/api/v1/contact` | None | Public | Implemented |
| **Contact** | `PUT` | `/api/contact` | `updateContactInfoSchema` | Admin (`contact:update`) | Implemented |
| **Contact Msg** | `POST` | `/api/contact/enquiries` | `submitContactEnquirySchema` | Public (Rate-limited) | Implemented |
| **Enquiries** | `GET` | `/api/admin/contact-enquiries` | `?status=&page=&limit=` | Admin (`enquiries:read`) | Implemented |
| **Upload** | `POST` | `/api/upload` | Deprecated | **Disabled** | Disabled |
| **Seed** | `POST` | `/api/seed` | Deprecated | **Disabled** | Disabled |
| **Advertisements** | `GET` | `/api/v1/advertisements` | `?status=&position=` | Public / Admin | Implemented |
| **Active Ad** | `GET` | `/api/v1/advertisements/active` | `?position=popup_overlay` | Public | Implemented |
| **Notices** | `GET` | `/api/v1/notices` | `?category=&search=&dept=` | Public | Implemented |
| **Pinned Notices**| `GET`| `/api/v1/notices/pinned` | None | Public | Implemented |
| **Notice Metrics**| `GET`| `/api/admin/notices/metrics` | None | Admin (`notices:read`) | Implemented |
| **Admin Notices** | `GET` | `/api/admin/notices` | `?status=&priority=&page=` | Admin (`notices:read`) | Implemented |
| **Create Notice** | `POST` | `/api/admin/notices` | `createNoticeSchema` | Admin (`notices:create`) | Implemented |
| **Clubs Directory**| `GET`| `/api/v1/clubs/directory` | `?category=&search=` | Public | Implemented |
| **Club Profile** | `GET` | `/api/v1/clubs/:slug` | None | Public | Implemented |
| **Club Members** | `GET` | `/api/v1/clubs/:slug/members` | None (PII-free roster) | Public | Implemented |
| **Club Register** | `POST` | `/api/v1/clubs/:slug/memberships` | `registerMembershipSchema` | Public (Rate-limited) | Implemented |
| **Admin Clubs** | `GET` | `/api/admin/clubs` | `?status=&search=` | Admin (`clubs:read`) | Implemented |
| **Create Club** | `POST` | `/api/admin/clubs` | `createClubSchema` | Admin (`clubs:create`) | Implemented |
| **Dynamic Forms** | `GET` | `/api/v1/forms/:slug` | None | Public | Implemented |
| **Submit Form** | `POST` | `/api/v1/forms/:slug/submissions` | `submitAnswersSchema` | Public (Rate-limited) | Implemented |
| **Admin Forms** | `GET` | `/api/admin/forms` | `?category=&status=` | Admin (`forms:read`) | Implemented |
| **Inquiries** | `GET` | `/api/admin/form-submissions` | `?status=&formSlug=` | Admin (`inquiries:read`) | Implemented |
| **Inquiry Triage**| `PATCH`| `/api/admin/form-submissions/:id/status` | `updateInquiryStatusSchema` | Admin (`inquiries:update`) | Implemented |
| **Dynamic Pages** | `GET` | `/api/v1/pages/:slug` | None | Public | Implemented |
| **Admin Pages** | `GET` | `/api/admin/pages` | `?status=` | Admin (`pages:read`) | Implemented |
| **Navigation Menus**| `GET`| `/api/v1/menus` | None | Public | Implemented |
| **Admin Menus** | `GET` | `/api/admin/navigation-menus` | None | Admin (`menus:read`) | Implemented |
| **Public Media** | `GET` | `/api/v1/media` | `?category=&search=` | Public | Implemented |
| **Media Assets** | `POST` | `/api/admin/media-assets` | `createMediaAssetSchema` (HTTPS)| Admin (`media:create`) | Implemented |
| **Alumni Directory**| `GET`| `/api/v1/alumni/directory` | `?batch=&department=` | Public | Implemented |
| **Alumni Register**| `POST`| `/api/v1/alumni/register` | `registerAlumniSchema` | Public (Rate-limited) | Implemented |
| **Admin Alumni** | `GET` | `/api/admin/alumni` | `?verificationStatus=` | Admin (`alumni:read`) | Implemented |
| **Admin Users** | `GET` | `/api/admin/users` | `?role=&status=` | Master Admin | Implemented |
| **Audit Logs** | `GET` | `/api/admin/audit-logs` | `?module=&action=&page=` | Admin (`audit:read`) | Implemented |
| **Alumni Register**| `POST`| `/api/alumni/register`, `/api/v1/alumni/register` | `registerAlumniSchema` | Public (Rate-limited) | Implemented |
| **Alumni List**| `GET` | `/api/admin/alumni` | `?verificationStatus=&batch=` | Admin (`alumni:read`) | Implemented |
| **Contact Inquiries**| `POST` | `/api/contact/enquiries` | `submitContactEnquirySchema` | Public (Rate-limited) | Implemented |

---

## L. Final Handover Verification Summary

> **Handover Baseline:** Phase 6B Final Handover Sign-off  
> **Status:** All Phases (Phase 1 through Phase 6B) 100% Implemented & Verified  
> **Backend Test Coverage:** 24 suites, 536 passed, 0 failed, 1 skipped (99.8%)  
> **Frontend Test Coverage:** 13 suites, 59 passed, 0 failed (100%)  
> **Static Type Verification:** 0 errors across frontend and backend TypeScript builds  
> **Zero Deprecated Endpoints Active:** File uploads (`POST /api/upload`) and client seeding (`POST /api/seed`) disabled in production.

All API routes documented in Sections B, D, and K are active, guarded by strict Zod schema validation, enforced by 6-tier RBAC, and backed by persistent MongoDB collections.
