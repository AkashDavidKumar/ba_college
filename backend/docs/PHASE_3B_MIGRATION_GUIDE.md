# Bishop Ambrose College Website Backend
# Sub-Phase 3B: Hardened Seeding & Migration Guide

## 1. Architectural Overview & Security Guarantees

The Bishop Ambrose College Migration & Seeding System (`backend/src/migration/`) is an enterprise-grade, auditable data ingestion tool designed to safely transition legacy unstructured CMS data (`data/cms-database.json`) into 14 normalized Mongoose collections.

### Core Security & Isolation Principles

1. **100% Offline Dry-Run Isolation (Phase A):**
   - Operates with zero network connections and zero MongoDB socket initialization (`readyState === 0`).
   - Strictly validates all entities against Phase 3A Zod validation schemas.
   - Detects intra-file duplicate slugs, codes, and broken cross-collection references without touching the database.
   - Returns exit code `0` on validation success, `1` on error.

2. **Read-Only Preflight & Conflict Guard (Phase B):**
   - Connects to target MongoDB in read-only preflight mode.
   - Redacts all sensitive credentials from connection URIs in logs, stdout, and error reports (`mongodb://***:***@...`).
   - Checks accessibility of all 15 collections.
   - Inspects existing documents for administrator customizations (`isSeedManaged: false`). If an admin customized a record via the CMS, the seeder automatically skips overwriting it, preserving live content.

3. **Pre-Write Cryptographic Backup & Verification:**
   - Dumps all 15 collections to timestamped JSON files in `backend/backups/bac_backup_YYYYMMDD_HHMMSS/` BEFORE modifying a single document in MongoDB.
   - Computes SHA-256 cryptographic hashes and byte counts for every collection dump.
   - Validates backup integrity (file exists, size matches, parseable JSON, doc count matches, hash matches).
   - If any verification check fails, the migration aborts immediately with zero database mutations.

4. **Admissions Applicant PII Isolation:**
   - Sample applicant records in `data/cms-database.json` (`Aarav Sharma`, `Priya Nair`) are strictly excluded by default (`includeSampleAdmissions: false`).
   - Migration logs and reports are barred from printing candidate names, emails, phones, or addresses (zero PII exposure).

5. **Immutability of Administrative Credentials (`users`):**
   - The `users` collection is NEVER touched, modified, or overwritten by migration or default restore operations.
   - Administrative credentials and active sessions are fully preserved.

6. **Idempotency:**
   - All migration writes use natural-key upserts (`slug` for departments, courses, events, news; `name` for guest speakers, facilities; singletons for institutional configs).
   - Running the migration multiple times produces identical, consistent state without duplicating records.

---

## 2. Command Reference

All migration commands can be run via npm scripts from `backend/`:

### 2.1 Dry-Run Mode (100% Offline)
Executes offline schema validation and relationship integrity checks against `data/cms-database.json`.
```bash
npm run migrate:dry-run
# Or equivalent legacy command:
npm run db:seed -- --dry-run
```

**Options:**
- `--source=<path>`: Custom path to source JSON file.

### 2.2 Preflight Mode (Read-Only)
Connects to MongoDB, validates collection accessibility, and inspects database records for collisions or CMS customizations.
```bash
npm run migrate:preflight
```

**Options:**
- `--overwrite-customized`: Marks administrator-customized records (`isSeedManaged: false`) for overwrite rather than skipping.

### 2.3 Migration Execution (Requires Confirmation)
Performs dry-run, preflight, creates a verified pre-write backup of all 15 collections, and executes idempotent writes.
```bash
npm run migrate:execute -- --confirm
# Or equivalent command:
npm run db:seed -- --confirm
```

> [!CAUTION]
> `--confirm` is strictly mandatory. Running `npm run migrate:execute` without `--confirm` will fail immediately with an exit code of `1` and perform zero database writes.

**Execution Flags:**
| Flag | Description | Default |
| :--- | :--- | :--- |
| `--confirm` | Mandatory confirmation flag to authorize database writes | `false` |
| `--source=<path>` | Alternative source JSON file path | `data/cms-database.json` |
| `--backup-dir=<path>` | Custom directory for pre-write backup output | `backups/bac_backup_YYYYMMDD_HHMMSS/` |
| `--overwrite-customized` | Allow overwriting admin-customized records (`isSeedManaged: false`) | `false` (skip/preserve) |
| `--include-sample-admissions` | Test sandbox flag to import sample applicants | `false` (strictly excluded) |

### 2.4 Restore / Rollback Utility
Restores database state from a verified backup directory.
```bash
npm run migrate:restore -- --backup-dir=backups/bac_backup_YYYYMMDD_HHMMSS --confirm
# Or equivalent legacy command:
npm run db:restore -- --backup-dir=backups/bac_backup_YYYYMMDD_HHMMSS --confirm
```

**Restore Safety Features:**
- Re-verifies SHA-256 cryptographic hashes and JSON integrity before modifying any collection.
- Never restores the `users` collection by default (preserves active administrative accounts).
- Restores collections idempotently using `bulkWrite` with `upsert: true` on document `_id`.

---

## 3. Normalized Entity Inventory

From `data/cms-database.json`, the migration engine normalizes and seeds:

| Collection | Entity Type | Count | Natural Key | Notes |
| :--- | :--- | :---: | :--- | :--- |
| `site_contents` | Singleton | 1 | Singleton (`singletonKey: 'default'`) | Hero banner, announcements, footer, ERP modules, stats, virtual tour, location |
| `about_pages` | Singleton | 1 | Singleton (`singletonKey: 'default'`) | Principal message, milestones, awards, vision/mission |
| `departments` | Document | 12 | `slug` (unique) & `code` (unique) | Embedded faculty, labs, researchStats, alumni, contact |
| `courses` | Document | 30 | `slug` (unique) | Extracted from department degree programmes |
| `events` | Document | 12 | `slug` (unique) | Embedded session speakers and schedule items |
| `guest_speakers` | Document | 4 | `name` | Global distinguished guest lecturers |
| `gallery_data` | Singleton | 1 | Singleton (`singletonKey: 'default'`) | 9 campus photo albums |
| `news_articles` | Document | 2 | `slug` (unique) | Official press releases / accreditation announcements |
| `iqac_dossiers` | Singleton | 1 | Singleton (`singletonKey: 'default'`) | NAAC reports, AQAR submissions, committee members |
| `facilities` | Document | 3 | `name` | Central library, sports pavilion, computing labs |
| `placements` | Singleton | 1 | Singleton (`singletonKey: 'default'`) | Placement records, corporate recruiters, success stories |
| `contact_info` | Singleton | 1 | Singleton (`singletonKey: 'default'`) | Campus address, departments directory, office hours |
| `admissions_applications` | Operational | 0 (2 excluded) | `appNumber` | Excluded by default under sensitive PII policy |
| `contact_enquiries` | Operational | 0 | `enquiryNumber` | Never seeded (operational inquiries only) |
| `users` | Auth | Read-only | `email` | Never touched or overwritten by migration |

---

## 4. Troubleshooting & Verification Checklist

1. **Dry-Run Fails:**
   - Check error messages in the terminal report.
   - Verify that all image URLs are secure HTTPS links (`https://...`) or relative asset paths (`/...`).
   - Confirm all department codes and course slugs are unique.

2. **Preflight Reports Conflicts:**
   - Inspect the conflict details in the preflight report.
   - If an existing record was customized by an administrator (`isSeedManaged: false`), the migration seeder will automatically skip it to prevent data loss.
   - If an intentional overwrite is desired, pass `--overwrite-customized`.

3. **Backup Verification Fails:**
   - Check filesystem permissions in `backend/backups/`.
   - Ensure disk space is available for full collection dumps.
   - Never manually modify backup JSON files inside a backup folder; doing so invalidates the cryptographic SHA-256 hash.

4. **CI Testing:**
   - Execute all tests: `npm test`
   - Run type checking: `npm run typecheck`
   - Run linter: `npm run lint`
