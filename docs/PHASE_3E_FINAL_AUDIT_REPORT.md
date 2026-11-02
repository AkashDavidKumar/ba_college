# BISHOP AMBROSE COLLEGE WEBSITE
# Sub-Phase 3E — Final Independent Verification Audit Report

**Date of Audit:** November 1, 2026  
**Auditor:** Independent Backend Architect & Security Audit Agent  
**Audit Mode:** Read-Only Verification  
**Workspace:** `E:\justin\bac-frontend-clean`  
**GitHub Repository:** `https://github.com/AkashDavidKumar/ba_college.git`  
**Inspected Commit:** `030c568d3e7304af3fb7364f0a2675bcdcc8e8c9`  
**Authoritative Reference:** `phase3_implementation_plan_v2point2.md` & `BACKEND_API_SPECIFICATION.md`

---

## 1. Overall Audit Result

**VERDICT: CONDITIONALLY PASS (WITH ACTIONABLE DEFECTS IDENTIFIED)**

The core Sub-Phase 3E requirements — centralized API client (`api-client.ts`), HttpOnly cookie authentication, public read endpoints, offline resilience fallback, removal of the legacy `/api/seed` HTTP invocation, and GitHub delivery — are successfully implemented and verified. All 12 backend test suites (193 tests) pass cleanly when executed with network permissions for Supertest port binding.

However, this independent audit has identified specific architectural defects in legacy standalone admin sub-pages (raw `fetch` calls omitting credentials, nonexistent upload/advertisement mutation endpoints) that must be remediated before production sign-off.

---

## 2. API Endpoint Compatibility Matrix

| Endpoint | Method | Frontend Caller | Backend Route Exists | Auth Required | Permissions Required | Payload & Response Alignment | Audit Result |
| :--- | :---: | :--- | :---: | :---: | :---: | :---: | :---: |
| `/api/content` | GET | `site-context.tsx` | YES | No (Public) | None | Aligned (Returns SiteContent dictionary) | **PASS** |
| `/api/content` | PUT | `site-context.tsx` | YES | Yes | `content:update` | Aligned (Partial updates accepted) | **PASS** |
| `/api/about` | GET | `site-context.tsx` | YES | No (Public) | None | Aligned | **PASS** |
| `/api/about` | PUT | `site-context.tsx` | YES | Yes | `about:update` | Aligned (`AboutPageData` payload) | **PASS** |
| `/api/departments` | GET | `site-context.tsx` | YES | No (Public) | None | Aligned (Array with virtual courses) | **PASS** |
| `/api/departments` | POST | `site-context.tsx` | YES | Yes | `departments:create` | Aligned (Zod validated) | **PASS** |
| `/api/departments/:slug` | PUT | `site-context.tsx` | YES | Yes | `departments:update` | Aligned (HOD scope checked) | **PASS** |
| `/api/departments/:slug` | DELETE | `site-context.tsx` | YES | Yes | `departments:delete` | Aligned (Dependency checked) | **PASS** |
| `/api/events` | GET | `site-context.tsx` | YES | No (Public) | None | Aligned (`{ events, guestSpeakers, eventGallery }`) | **PASS** |
| `/api/events` | POST | `site-context.tsx` | YES | Yes | Polymorphic (`events:create`) | Aligned (`{ type, id, data }`) | **PASS** |
| `/api/events/:id` | PUT | `site-context.tsx` | YES | Yes | Polymorphic (`events:update`) | Aligned (HOD & Club Head scoped) | **PASS** |
| `/api/events/:id?type=...` | DELETE | `site-context.tsx` | YES | Yes | Polymorphic (`events:delete`) | Aligned (Query parameter polymorphic delete) | **PASS** |
| `/api/news` | GET | `site-context.tsx` | YES | No (Public) | None | Aligned (`{ articles, config }`) | **PASS** |
| `/api/news` | POST | `site-context.tsx` | YES | Yes | `news:create` | Aligned | **PASS** |
| `/api/news/:id` | PUT | `site-context.tsx` | YES | Yes | `news:update` | Aligned | **PASS** |
| `/api/news/:id` | DELETE | `site-context.tsx` | YES | Yes | `news:delete` | Aligned | **PASS** |
| `/api/news/config` | PUT | `site-context.tsx` | YES | Yes | `news:update` | Aligned | **PASS** |
| `/api/iqac` | GET | `iqac-context.tsx` | YES | No (Public) | None | Aligned (10 dossier sections) | **PASS** |
| `/api/iqac/section/:section` | PUT | `iqac-context.tsx` | YES | Yes | `iqac:update` | Aligned (Dynamic section payload) | **PASS** |
| `/api/iqac/download/:sec/:id` | POST | `iqac-context.tsx` | YES | No (Public) | None | Aligned (Download increment counter) | **PASS** |
| `/api/auth/login` | POST | `AdminLoginPage.tsx` | YES | No (Public) | Rate-limited | Sets HttpOnly `bac_auth_token` | **PASS** |
| `/api/auth/logout` | POST | `admin-layout.tsx` | YES | Yes | Valid Session | Clears cookie, bumps `tokenVersion` | **PASS** |
| `/api/auth/me` | GET | `cms-store.tsx` | YES | Yes | Valid Session | Returns sanitized profile & scopes | **PASS** |
| `/api/admissions` | POST | `site-context.tsx` | YES | No (Public) | Rate-limited | Generates `BAC-ADM-YYYY-XXXX` | **PASS** |
| `/api/admissions` | GET | `cms-store.tsx` | YES | Yes | `admissions:read` | Aligned (Paginated list) | **PASS** |
| `/api/admissions` | PUT | `cms-store.tsx` | YES | Yes | `admissions:update` | Aligned (`{ id, status, notes }`) | **PASS** |
| `/api/contact/enquiries` | POST | Public Form | YES | No (Public) | Rate-limited | Aligned | **PASS** |
| `/api/contact/enquiries` | GET | `cms-store.tsx` | YES | Yes | `enquiries:read` | Aligned | **PASS** |
| `/api/contact/enquiries/:id` | PUT | `cms-store.tsx` | YES | Yes | `enquiries:read` | Aligned (`status`, `responseNotes`) | **PASS** |
| `/api/upload` | POST | Various Tabs | **NO** | N/A | N/A | Legacy upload stub, no backend route | **FAIL** |
| `/api/about/image` | POST | `about-manager.tsx` | **NO** | N/A | N/A | Legacy image upload stub, no backend route | **FAIL** |
| `/api/v1/advertisements` | POST/PUT/DELETE | `advertisement-service.ts` | **NO** | N/A | N/A | Mutations not implemented on backend | **FAIL** |
| `/api/contact` | PUT | `contact-dashboard.tsx` | YES | Yes | `contact:update` | Uses raw `fetch` without credentials | **FAIL** |
| `/api/courses` | POST/PUT/DELETE | `courses-dashboard.tsx` | YES | Yes | `courses:*` | Uses raw `fetch` without credentials | **FAIL** |
| `/api/facilities` | POST/PUT/DELETE | `facilities-dashboard.tsx` | YES | Yes | `facilities:*` | Uses raw `fetch` without credentials | **FAIL** |
| `/api/gallery` | PUT | `gallery-dashboard.tsx` | YES | Yes | `gallery:update` | Uses raw `fetch` without credentials | **FAIL** |
| `/api/placements` | PUT | `placements-dashboard.tsx` | YES | Yes | `placements:update` | Uses raw `fetch` without credentials | **FAIL** |

---

## 3. Authentication & Security Verification

| Check Item | Requirement | Verification Method | Status | Notes |
| :--- | :--- | :--- | :---: | :--- |
| **HttpOnly Cookie Auth** | Tokens must be stored in secure HttpOnly cookies | Inspect `backend/src/utils/token.ts`, `auth.controller.ts` | **PASS** | `setAuthCookie()` sets `httpOnly: true`, `sameSite: 'lax'`, `secure: production`. |
| **Credentials on Requests** | Frontend requests must send cookies | Inspect `api-client.ts` | **PASS** | `apiClient` enforces `credentials: 'include'` on all HTTP requests. |
| **Zero Token Storage** | No JWT stored in `localStorage` or `sessionStorage` | Code audit of `AdminLoginPage.tsx` & `api-client.ts` | **PASS** | Only non-sensitive user greeting profile (`name`, `role`, `email`, `initials`) is saved. |
| **Session Restoration** | Page refresh restores user session | Code audit of `cms-store.tsx` | **PASS** | `useEffect` triggers `GET /api/auth/me` on mount to restore user role, scope, and permissions. |
| **Session Revocation** | Logout terminates server session | Code audit of `auth.controller.ts` & `admin-layout.tsx` | **PASS** | Increments `tokenVersion` in database and clears `bac_auth_token` cookie. |
| **401 / 403 Differentiation** | Unauthenticated vs unauthorized responses distinct | Inspect `auth.ts` middleware & `ApiError` | **PASS** | Missing/invalid token returns 401; insufficient role/scope returns 403. |
| **Private Data Protection** | Admissions and enquiries restricted | Inspect `admin.routes.ts` & `scope-guard.ts` | **PASS** | `admissions:read` and `enquiries:read` permissions strictly required. |
| **No Private Response Caching** | Private responses never cached | Inspect `admin.controller.ts` | **PASS** | `Cache-Control: no-store, no-cache, must-revalidate, private` set on private endpoints. |
| **No Frontend Seed Invocation** | No `/api/seed` called from browser | Code audit of `site-context.tsx` | **PASS** | Legacy `POST /api/seed` invocation completely removed and replaced with CLI guidance. |

---

## 4. HOD and Club Head Scope Verification

### A. Investigation of `departmentCode` vs `departmentId`
- **Finding:** The Sub-Phase 3E implementation report narrative mentioned that HOD scope was checked against `departmentCode`.
- **Codebase Verification:** 
  - In `backend/src/models/user.model.ts`: Field is explicitly named `departmentId` (line 96).
  - In `backend/src/types/index.ts`: `IAuthUser` defines `departmentId?: string` (line 9).
  - In `backend/src/middleware/scope-guard.ts`: Guard verifies `user.departmentId` against target department slug (lines 39, 74, 122).
  - In `frontend/src/lib/cms-store.tsx`: `AdminUser` defines `departmentId?: string` (line 18).
- **Audit Conclusion:** The reference to `departmentCode` in the previous narrative report was a minor documentation discrepancy. The actual codebase correctly and consistently uses `departmentId` across models, types, guards, and frontend state. **(PASS)**

### B. Club Head Scope Enforcement
- Verified in `backend/src/middleware/scope-guard.ts` (`assertEventScope`):
  - Club Head is strictly limited to mutations where `eventScope.clubId === user.clubId`.
  - Missing `clubId` or mismatched `clubId` triggers immediate 403 Forbidden (`FORBIDDEN_CLUB_SCOPE`).
- Club Heads are explicitly barred from mutating global guest speakers (`assertSpeakerManagementRole`) and photo galleries (`assertGalleryManagement`). **(PASS)**

### C. Backend vs Frontend Authorization Separation
- Frontend UI filtering in `cms-store.tsx` (`canAccessDepartment`, `canAccessClub`, `hasPermission`) provides user interface convenience.
- **Audit Conclusion:** Backend authorization guards (`requirePermissions`, `assertDepartmentScope`, `assertEventScope`) run independently on every administrative route and never rely on frontend filtering. **(PASS)**

---

## 5. IQAC Endpoint Verification

All three required IQAC endpoints were inspected in the backend routes and controllers:
1. `GET /api/iqac`: Defined in `public.routes.ts` (line 51); handled by `getPublicIQAC` in `public.controller.ts`. Uses `publicCache` middleware. **(PASS)**
2. `PUT /api/iqac/section/:section`: Defined in `admin.routes.ts` (line 229); handled by `updateIQACSection` in `admin.controller.ts`. Requires authentication and `iqac:update` permission. **(PASS)**
3. `POST /api/iqac/download/:section/:id`: Defined in `admin.routes.ts` (line 236); handled by `incrementIQACDownload` in `admin.controller.ts`. Public tracking endpoint. **(PASS)**

---

## 6. Offline Fallback & Resilience Verification

| Context / Store | Test Case | Mechanism Inspected | Audit Result |
| :--- | :--- | :--- | :---: |
| `site-context.tsx` | Backend Offline on Boot | Catches network error and dynamically imports `university-data.ts` mock. | **PASS** |
| `site-context.tsx` | Preservation of Existing Data | `if (prev && prev.departments && prev.departments.length > 0) return prev;` ensures network drop does not wipe in-memory data. | **PASS** |
| `site-context.tsx` | Mutation Failure Handling | Mutation methods wrap in try/catch, log error, and return `false`. UI does not optimistically claim success. | **PASS** |
| `iqac-context.tsx` | Backend Offline on Boot | Catches network error and falls back to static `OFFLINE_IQAC_DATA`. | **PASS** |
| `iqac-context.tsx` | Section Update Failure | Returns `false` on network/API failure without corrupting local state. | **PASS** |
| `cms-store.tsx` | Session Verification Offline | Silent catch in `verifyLiveSession` falls back to stored administrative state. | **PASS** |
| `cms-store.tsx` | Admissions Sync Offline | Silent catch in `fetchLiveApplications` preserves local applications. | **PASS** |

---

## 7. Actual Integration Test Results

| Test Execution Suite | Executed Command | Results | Audit Status |
| :--- | :--- | :--- | :---: |
| **Backend Automated Tests** | `npm --prefix backend test` (Supertest) | 12 test suites passed, 193 tests passed, 1 skipped | **PASS** |
| **Backend TypeScript Check** | `npm --prefix backend run typecheck` | 0 errors | **PASS** |
| **Backend ESLint Check** | `npm --prefix backend run lint` | 0 warnings, 0 errors | **PASS** |
| **Backend Production Build** | `npm --prefix backend run build` | Clean compilation to `backend/dist/` | **PASS** |
| **Frontend TypeScript Check** | `npx --prefix frontend tsc --noEmit` | 0 errors | **PASS** |
| **Frontend Production Build** | `npm --prefix frontend run build` | Vite 6 build completed in 10.20s | **PASS** |
| **Live Standalone MongoDB Integration** | Persistent daemon on `localhost:27017` | Port 27017 inactive (CI_NO_MONGO=1 in unit setup) | **NOT VERIFIED** |

*Note: As per strict audit guidelines, live tests against a persistent external MongoDB daemon were NOT marked as passed because no external MongoDB service was active during this read-only audit. All Supertest integration tests passed against in-process mock instances.*

---

## 8. Security Findings

1. **HttpOnly Cookie Implementation (PASS):** Cryptographic verification using JWT and server-side secret. Token version validation ensures instant revocation upon logout or password change.
2. **Brute Force Lockout (PASS):** 5 failed attempts lock the account for 15 minutes; atomic `$inc` and `$set` eliminate concurrency race conditions.
3. **Information Disclosure Prevention (PASS):** Generic authentication failure messages ("Invalid email or password") prevent user enumeration. Error handler suppresses stack traces in all environments.
4. **Rate Limiting (PASS):** Sensitive routes (`/api/auth/login`, `POST /api/admissions`, `POST /api/contact/enquiries`) enforce strict rate limiting.
5. **Private Response Cache Guard (PASS):** Sensitive administrative routes explicitly set `Cache-Control: no-store, no-cache, must-revalidate, private`.

---

## 9. GitHub Version Control Verification

- **Repository:** `https://github.com/AkashDavidKumar/ba_college.git`
- **Active Branch:** `master` (tracking `origin/master`)
- **HEAD Commit Hash:** `030c568d3e7304af3fb7364f0a2675bcdcc8e8c9`
- **Remote HEAD Commit Hash:** `030c568d3e7304af3fb7364f0a2675bcdcc8e8c9`
- **Working Tree Status:** `nothing to commit, working tree clean`
- **Audit Result:** **PASS** (Commit exists on GitHub and matches local HEAD bit-for-bit).

---

## 10. Critical Blockers & Defects Identified

### Defect 1: Standalone Admin Pages Use Raw `fetch` Without Credentials (HIGH)
- **Files:**
  - `frontend/src/components/admin/pages/contact-dashboard.tsx`
  - `frontend/src/components/admin/pages/courses-dashboard.tsx`
  - `frontend/src/components/admin/pages/facilities-dashboard.tsx`
  - `frontend/src/components/admin/pages/gallery-dashboard.tsx`
  - `frontend/src/components/admin/pages/placements-dashboard.tsx`
  - `frontend/src/components/admin/admissions-tab.tsx`
- **Description:** These pages call native `fetch()` without `{ credentials: 'include' }` or `apiClient`. While the main site context (`site-context.tsx`, `iqac-context.tsx`, `cms-store.tsx`) uses `apiClient`, navigating to these specific sub-dashboards causes 401 Unauthorized errors on cross-port calls because HttpOnly session cookies are omitted.

### Defect 2: Nonexistent Asset Upload Endpoints (MEDIUM)
- **Files:**
  - `frontend/src/components/admin/about-manager.tsx` (`/api/about/image`)
  - `frontend/src/components/admin/departments-tab.tsx` (`/api/upload`)
  - `frontend/src/components/admin/events-tab.tsx` (`/api/upload`)
  - `frontend/src/components/admin/general-settings-tab.tsx` (`/api/upload`)
  - `frontend/src/components/admin/hero-video-manager.tsx` (`/api/upload`)
  - `frontend/src/components/admin/virtual-tour-manager.tsx` (`/api/upload`)
- **Description:** Frontend file picker components attempt to upload binary assets to `POST /api/upload` or `POST /api/about/image`. Neither endpoint exists in the backend routes (which are purely JSON metadata endpoints). Although errors are caught and surfaced via toast, this causes upload failures when administrators attempt to select local files.

### Defect 3: Nonexistent Advertisement Mutation Endpoints (LOW)
- **File:** `frontend/src/lib/api/advertisement-service.ts`
- **Description:** `POST /api/v1/advertisements`, `PUT /api/v1/advertisements/:id`, and `DELETE /api/v1/advertisements/:id` do not exist on the backend. The service safely catches errors and falls back to `localStorage`, but backend persistence for advertisement mutations is missing.

---

## 11. Recommended Corrections (Remediation Plan)

1. **Refactor Standalone Dashboard Pages to `apiClient`:**
   Replace all raw `fetch("/api/...", ...)` in `contact-dashboard.tsx`, `courses-dashboard.tsx`, `facilities-dashboard.tsx`, `gallery-dashboard.tsx`, `placements-dashboard.tsx`, and `admissions-tab.tsx` with `apiClient` methods (`apiClient.get`, `apiClient.post`, `apiClient.put`, `apiClient.delete`). This guarantees automatic cookie inclusion, unified base URLs, and structured error propagation.

2. **Asset Handling Standardization:**
   For Phase 3, clarify asset management: either add URL input fields alongside file pickers (with Base64 / cloud storage integration), or implement a dedicated multipart asset upload endpoint (`POST /api/upload`) using `multer` with strict MIME validation.

3. **Sub-Admin Department Scoping UI Adjustment:**
   In `frontend/src/lib/cms-store.tsx` (line 938), remove `currentUser.role === "sub_admin"` from `canAccessDepartment` so that Sub-Admins are not falsely restricted to a single department in the UI when the backend grants them global departmental authority.

---

## 12. Conclusion & Next Step Authorization

Sub-Phase 3E has successfully established the core frontend-to-backend communication architecture, cookie authentication pipeline, and offline resilience layer. All automated regression suites pass.

---

## 13. Post-Audit Targeted Corrections Status (November 2, 2026)

All actionable defects identified in this audit were systematically remediated and verified under the approved targeted correction pass:

1. **Correction A — Centralized API Client (RESOLVED - PASS):**
   - Replaced raw `fetch()` with `apiClient` across all six standalone files (`contact-dashboard.tsx`, `courses-dashboard.tsx`, `facilities-dashboard.tsx`, `gallery-dashboard.tsx`, `placements-dashboard.tsx`, `admissions-tab.tsx`).
   - Verified that `credentials: 'include'` is automatically transmitted for session authentication cookies. Zero raw fetch calls remain in these files.

2. **Correction B — Asset Management (RESOLVED - PASS):**
   - Audited `about-manager.tsx`, `departments-tab.tsx`, `events-tab.tsx`, `general-settings-tab.tsx`, `hero-video-manager.tsx`, and `virtual-tour-manager.tsx`.
   - Removed calls to nonexistent `/api/upload` and `/api/about/image`.
   - Enabled robust URL-based asset management with helper text ("Asset URL mode active: Enter a hosted image URL").
   - Explicitly inform administrators that direct binary file uploads require a dedicated upcoming backend media service.

3. **Correction C — Advertisement Service (RESOLVED - PASS):**
   - Removed nonexistent mutation calls to `/api/v1/advertisements` from `advertisement-service.ts`.
   - Added an alert notice banner to `advertisements-cms.tsx` informing administrators that campaigns are managed in local browser preview mode pending backend schema approval.

4. **Correction D — Sub-Admin Scope (RESOLVED - PASS):**
   - Removed `currentUser.role === "sub_admin"` restriction from `canAccessDepartment` in `cms-store.tsx`.
   - Sub-Admins now have global departmental visibility in the UI, aligned with backend authorization in `scope-guard.ts`. HOD scoping remains strictly enforced.

5. **Regression Verification:**
   - Frontend TypeScript check (`tsc --noEmit`): 0 errors.
   - Frontend build (`vite build`): Built in 10.54s.
   - Backend TypeScript check (`tsc --noEmit`): 0 errors.
   - Backend ESLint: 0 warnings, 0 errors.
   - Backend Jest test suite: 12 passed, 193 passed, 1 skipped.
   - Backend build (`tsc`): Clean compilation to `dist/`.
