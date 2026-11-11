# Bishop Ambrose College — Admin Operations & Governance Guide

**Target Audience:** College Administrators, Department Heads (HODs), Club In-Charges, Content Editors, Staff  
**Document Version:** 1.0.0 (Phase 6B Handover)  
**System Access URL:** `https://<CONFIRMED_COLLEGE_DOMAIN>/admin/login`  

---

## 1. Overview & Administrative Access

The Bishop Ambrose College Content Management & Administrative System (CMS) enables authorized faculty and administrative staff to manage public website content, academic departments, clubs, events, announcements, and inquiries safely and efficiently.

### 1.1 Accessing the Admin Console
1. Navigate to: `https://<CONFIRMED_COLLEGE_DOMAIN>/admin/login`
2. Enter your institutional email and authorized password.
3. Upon successful authentication, your browser receives an `HttpOnly`, secure authentication token.
4. If your session is inactive for more than 60 minutes, the system automatically terminates the session and redirects to the login screen for security.

> [!SECURITY]
> Administrative accounts must never be shared across individuals. Every user must have their own designated credential set.

---

## 2. Role-Based Access Control (RBAC) Hierarchy

The administrative portal enforces a 6-tier Role-Based Access Control hierarchy. Permissions are enforced both in the frontend interface and at every backend API route.

```
                  ┌──────────────────────┐
                  │    master_admin      │ (Full System Sovereignty)
                  └──────────┬───────────┘
                             │
                  ┌──────────▼───────────┐
                  │      sub_admin       │ (Institutional Administration)
                  └──────────┬───────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
┌────────▼─────────┐┌────────▼─────────┐┌────────▼─────────┐
│       hod        ││    club_head     ││ content_editor   │
│(Department Scope)││   (Club Scope)   ││ (Global Content) │
└──────────────────┘└──────────────────┘└────────┬─────────┘
                                                 │
                                        ┌────────▼─────────┐
                                        │      staff       │
                                        │(Draft Submissions│
                                        └──────────────────┘
```

### 2.1 Role Matrix & Permissions:

| Role Name | Scope | Capabilities | Typical Assignee |
| :--- | :--- | :--- | :--- |
| **`master_admin`** | Global (Full) | Complete administrative sovereignty: user creation, role assignment, system settings, approval overrides, audit log inspection, schema migrations. | Chief Technology Officer / Principal |
| **`sub_admin`** | Global (Admin) | Content management across all departments, clubs, notices, events, and approval queue triage. Cannot modify master admin accounts. | Vice Principal / Dean of Academics |
| **`hod`** | Department-Scoped | Manage faculty profiles, departmental achievements, syllabus links, and department announcements for their assigned department only. | Head of Department |
| **`club_head`** | Club-Scoped | Manage club profile, student office bearers, club events, and membership applications for their assigned club only. | Club Faculty Coordinator |
| **`content_editor`** | Global (Editorial) | Create, edit, and schedule global college news, announcements, press releases, and general events. Submits for review or publishes according to policy. | Media Cell / PR Committee |
| **`staff`** | Scoped Draft | Create draft notices, news, and event proposals within their assigned department or committee. Cannot publish directly. | Faculty Members / Office Staff |

*(Note: Internal database schema maps legacy aliases `ADMIN` to `sub_admin`, `EDITOR` to `content_editor`, and `VIEWER` to `staff` for full backwards compatibility).*

---

## 3. Scope Restrictions & Data Isolation Rules

To protect institutional integrity and prevent accidental cross-departmental modification, strict data isolation boundaries are enforced:

### 3.1 Department Scope (`hod`):
- An `hod` assigned to Computer Science (`departmentSlug: "computer-science"`) can **only** edit Computer Science faculty, laboratories, and announcements.
- Any attempt to modify another department's records via direct API requests returns an immediate `403 Forbidden` response and is logged in the security audit trail.

### 3.2 Club Scope (`club_head`):
- A `club_head` assigned to the Rotaract Club (`clubSlug: "rotaract"`) can **only** manage Rotaract events, member lists, and club descriptions.
- **Strict Prohibition:** `club_head` users are strictly barred from modifying global campus galleries, institutional hero banners, or institutional guest speaker sections.

---

## 4. Content Publication & Approval Workflow

The portal follows a strict governance lifecycle for all public notices, news articles, and events:

```
[Draft Created by Staff/HOD] ──▶ [Submitted for Review] ──▶ [Approval Queue] ──▶ [Published to Public]
                                                                  │
                                                                  └──▶ [Rejected with Feedback]
```

### 4.1 Publication Steps:
1. **Creation:** Navigate to **CMS Management > Notices / News / Events** and click **Create New**.
2. **Metadata & Content:** Fill in Title, Category, Summary, Content (Markdown supported), and an external HTTPS Image/Document URL.
3. **Publication Status:**
   - **Draft:** Visible only within the admin console. Use while compiling details.
   - **Under Review:** Automatically placed into the central **Approval Queue** for review by `sub_admin` or `master_admin`.
   - **Published:** Instantly visible on the public website and sorted chronologically.
   - **Archived:** Removed from public view but retained in the audit history.
4. **Scheduled Publishing:** You may set a future `publishDate`. The item will remain hidden from the public website until that timestamp is reached.

---

## 5. Central Approval Queue & Governance

Users with `master_admin` or `sub_admin` privileges oversee the **Approval Queue**:

1. Navigate to **Admin Dashboard > Approval Queue**.
2. Items awaiting review (draft news, event proposals, faculty updates) are displayed with the author's name, timestamp, and proposed changes.
3. Click **Review Changes** to inspect a side-by-side comparison of the draft.
4. **Action:**
   - **Approve:** The item is promoted to `Published` status and synchronized with the public website cache.
   - **Reject:** Requires entering an explanatory rejection note. The item is returned to the author as `Draft` with the feedback attached.

---

## 6. Alumni Registration & Club Membership Approvals

### 6.1 Alumni Verifications:
- Prospective alumni submit registration forms through `/alumni/register`.
- In the CMS under **Alumni Directory > Pending Verifications**, staff verify graduation year and degree against college records.
- Approving an alumnus adds them to the searchable Alumni Directory; rejecting marks the entry as rejected without publishing personal details.

### 6.2 Club Membership Applications:
- Students apply to clubs via the public Clubs directory.
- Respective `club_head` coordinators access **My Club > Member Applications** to approve or reject candidates.

---

## 7. Form Builder & Inquiries Triage

The application captures prospective student inquiries, contact messages, and admission queries through the dynamic form engine.

### 7.1 Verified Inquiry Lifecycle States

The submission triage system supports exactly five verified statuses, defined identically in the backend model (`form-submission.model.ts`), validation schema (`form.validation.ts`), and frontend CMS store (`cms-store.tsx`):

| Status Code | Display Label | Description |
| :--- | :--- | :--- |
| **`new`** | **New (Unassigned / Pending Review)** | Inbound submission freshly captured from a public form. Default state for all incoming entries. |
| **`in_review`** | **In Review (Under Administrative Evaluation)** | Assigned to an admissions counselor or departmental coordinator for review and processing. |
| **`responded`** | **Responded (Applicant Contacted)** | Staff has contacted the applicant via institutional email or telephone. Initial response completed. |
| **`resolved`** | **Resolved (Completed)** | Inquiry successfully completed (e.g. admission application finalized, guidance provided). |
| **`rejected`** | **Rejected** | Duplicate, spam, or invalid submission. Filtered out from active workflow queues. |

### 7.2 Supported Status Transitions & Operational Workflow

The triage architecture supports flexible, non-blocking status transitions:

```
                          ┌───────────────────────────┐
                          │            new            │ (Inbound Capture)
                          └─────────────┬─────────────┘
                                        │
                         ┌──────────────┴──────────────┐
                         │                             │
                         ▼                             ▼
               ┌───────────────────┐         ┌───────────────────┐
               │     in_review     │         │     rejected      │ (Spam / Duplicate)
               └─────────┬─────────┘         └─────────▲─────────┘
                         │                             │
                         ▼                             │
               ┌───────────────────┐                   │
               │     responded     │───────────────────┤
               └─────────┬─────────┘                   │
                         │                             │
                         ▼                             │
               ┌───────────────────┐                   │
               │     resolved      │───────────────────┘
               └───────────────────┘
```

#### Transition Invariants:
1. **Direct Status Selection:** An authorized administrator can transition a submission directly to **any** of the five valid statuses using the Triage Status dropdown. The system does not strictly lock administrators to a linear path, allowing inquiries to be reopened (`resolved` $\rightarrow$ `in_review`) or closed immediately (`new` $\rightarrow$ `rejected`).
2. **Recommended Standard Flow:**
   - `new` $\rightarrow$ `in_review`: Officer begins evaluating the applicant's request.
   - `in_review` $\rightarrow$ `responded`: Officer sends an official reply or conducts a phone consultation.
   - `responded` $\rightarrow$ `resolved`: All inquiries answered, admission formalities concluded.
   - Any state $\rightarrow$ `rejected`: If verified as spam, test data, or invalid entry.
   - `resolved` / `rejected` $\rightarrow$ `in_review`: If the applicant follows up with subsequent questions.
3. **Internal Administrative Notes:** Up to 2,000 characters of administrative notes and counselor remarks can be recorded with every status transition. The system automatically attaches `reviewedBy` (officer name/email) and `reviewedAt` (timestamp).
4. **Scope Authorization:**
   - `master_admin` and `sub_admin` can triage submissions across all forms and departments.
   - `hod` users are strictly restricted to submissions matching their assigned `departmentId`.
   - `club_head` users are strictly restricted to submissions matching their assigned `clubId`.
   - Unauthorized cross-department triage attempts return an immediate `403 Forbidden` response.

### 7.3 Inquiries Management Workflow:
- Navigate to **Forms & Inquiries** in the left sidebar.
- Filter by Form Type (e.g. General Contact, Admission Inquiry, Grievance).
- Filter by Status: All Statuses, New, In Review, Responded, Resolved, Rejected.
- Click on an inquiry row to inspect details: Name, Email, Phone, Message, Submission Timestamp.
- In the Triage Modal, select the new Status, enter internal notes, and click **Update Status**.

---

## 8. Audit Logs & Administrative Security Best Practices

### 8.1 Security Audit Logs:
Every administrative action (login attempts, permission changes, content publishes, deletions) is recorded in the immutable Audit Log (`/admin/audit-logs`):
- **Actor:** Email and User ID.
- **Action Type:** `CREATE`, `UPDATE`, `DELETE`, `LOGIN_SUCCESS`, `LOGIN_FAILURE`, `PERMISSION_CHANGE`.
- **Target Resource:** Collection and Document ID.
- **Client IP & User Agent:** Recorded for forensic traceability.

### 8.2 Administrator Best Practices:
1. **Password Hygiene:** Passwords must be at least 12 characters. Never use default or easily guessable passwords.
2. **Account Deprovisioning:** When a faculty member or HOD leaves their position, immediately update their account status to `inactive` or reassign their role via `master_admin`.
3. **Media Links:** When uploading photos or PDFs to external media hosts (Cloudinary, AWS S3), ensure URLs begin with `https://`. Do not use expired or temporary signed links.
4. **Periodic Audit Review:** `master_admin` should review the Audit Log monthly for unexpected login locations or repeated failed authentication attempts.
