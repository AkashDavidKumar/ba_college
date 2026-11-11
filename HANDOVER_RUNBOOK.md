# Bishop Ambrose College — Production Handover & Deployment Runbook

**Target Audience:** College Senior Technical Team / Systems Administrators  
**Project:** Bishop Ambrose College Full-Stack Application  
**Repository:** `https://github.com/AkashDavidKumar/ba_college.git`  
**Branch:** `master`  
**Document Version:** 1.0.0 (Phase 6B Handover)  
**Classification:** Operational Technical Documentation  

---

## 1. System Architecture Overview

The Bishop Ambrose College application is engineered as a decoupled, multi-tier web application designed for high security, maintainability, and horizontal scalability:

```
                  Internet (HTTPS :443 / HTTP :80)
                                 │
                                 ▼
                     ┌───────────────────────┐
                     │     Nginx Gateway     │
                     │  (SSL, Security, Gzip)│
                     └───────────┬───────────┘
                                 │
                ┌────────────────┴────────────────┐
                │                                 │
     Static Web Requests                   Dynamic API Requests
       Path: /                             Path: /api/*
                │                                 │
                ▼                                 ▼
     ┌───────────────────────┐         ┌───────────────────────┐
     │   Frontend SPA (Vite) │         │   Backend API (Node)  │
     │   HTML/CSS/JS Assets  │         │   Express + TypeScript│
     │   (Served by Nginx)   │         │   PM2 Fork on :5001   │
     └───────────────────────┘         └───────────┬───────────┘
                                                   │
                                                   ▼
                                       ┌───────────────────────┐
                                       │   MongoDB Database    │
                                       │   ReplicaSet / Standby│
                                       └───────────────────────┘
```

### Architectural Principles:
1. **Frontend Tier:** Single-Page Application (SPA) built with React 19, TypeScript, and Tailwind CSS. Compiled into static assets (`frontend/dist/`) and served directly by Nginx with client-side routing fallback (`try_files $uri $uri/ /index.html`).
2. **Backend Tier:** RESTful API built with Express, TypeScript, and Mongoose. Managed via PM2 in standalone fork mode listening exclusively on internal localhost port `5001` (`http://127.0.0.1:5001`). External direct access to port 5001 is prohibited by firewall.
3. **Database Tier:** MongoDB (v6.0 or v7.0 LTS). Access secured via authenticated connection URI with strict credentials, connection pooling, and SSL/TLS.
4. **Media Handling Architecture:** All media (hero banners, faculty photos, department icons, gallery images, event flyers) utilize **external HTTPS URLs** (e.g., Cloudinary, AWS S3, or college CDN). No local directory file uploads are executed on the host, preventing storage exhaustion and unauthenticated shell execution risks.
5. **Reverse Proxy & Gateway:** Nginx terminates SSL/TLS (Let's Encrypt / Certbot), enforces HSTS, CSP, and CORS boundaries, serves static assets with optimal caching, and reverse-proxies `/api/` requests to the Node.js daemon.

---

## 2. Server & Infrastructure Prerequisites

The target deployment host must meet the following minimum requirements:

### Operating System:
- **Recommended:** Ubuntu 22.04 LTS or Ubuntu 24.04 LTS (x86_64 / arm64)
- **Minimum Hardware:** 2 vCPU, 4 GB RAM, 20 GB SSD storage.

### Core Software Dependencies:
| Dependency | Required Version | Verification Command | Purpose |
| :--- | :--- | :--- | :--- |
| **Node.js** | `>= 18.18.0` (LTS 20.x or 22.x recommended) | `node -v` | Application runtime |
| **npm** | `>= 9.0.0` | `npm -v` | Package manager |
| **MongoDB** | `6.0.x` or `7.0.x` | `mongod --version` | Primary datastore |
| **Nginx** | `>= 1.18.0` (with HTTP/2 support) | `nginx -v` | Reverse proxy & web server |
| **PM2** | Latest (`npm install -g pm2`) | `pm2 -v` | Process supervisor |
| **Certbot** | Latest (`snap install --classic certbot`) | `certbot --version` | Automated TLS management |
| **OpenSSL** | Modern system OpenSSL | `openssl version` | Cryptographic secret generation |

---

## 3. Environment Configuration & Secrets Management

Both frontend and backend rely on environment variables for runtime configuration. **Never commit production environment files to version control.**

### 3.1 Backend Configuration: `backend/.env`
Create `/var/www/bac-app/backend/.env` (read-only by application user, e.g. `chmod 600`):

```bash
# ==============================================================================
# BISHOP AMBROSE COLLEGE — BACKEND PRODUCTION ENVIRONMENT CONFIGURATION
# ==============================================================================

# Runtime Environment
NODE_ENV=production
PORT=5001

# Database Connection (Replace with production credentials)
# Supports local MongoDB ("mongodb://...") or MongoDB Atlas ("mongodb+srv://...")
MONGODB_URI=mongodb://bac_app_user:<STRONG_DB_PASSWORD>@127.0.0.1:27017/bac_production?authSource=admin

# Cryptographic Secrets (MUST be unique 32+ character high-entropy tokens)
# Generate with: openssl rand -base64 36
JWT_SECRET=<GENERATE_WITH_OPENSSL_RAND_BASE64_36>
COOKIE_SECRET=<GENERATE_WITH_OPENSSL_RAND_BASE64_36>

# Token Expiration Settings (optional, defaults to "8h")
JWT_EXPIRES_IN=8h

# Reverse Proxy Trust Configuration
# When behind Nginx reverse proxy on the same host, set to "1" or "true"
TRUST_PROXY=1

# CORS Configuration
# Comma-separated list of fully qualified allowed origins (HTTPS required, NO wildcard)
CORS_ORIGINS=https://<CONFIRMED_COLLEGE_DOMAIN>,https://www.<CONFIRMED_COLLEGE_DOMAIN>

# Logging & Observability (optional)
LOG_LEVEL=info
REQUEST_ID_HEADER=X-Request-Id
```

> [!SECURITY]
> **Production Cookie Attributes:**  
> The backend application automatically configures authentication cookie security attributes via `backend/src/utils/token.ts`:
> - `httpOnly: true` (prevents client-side JavaScript access)
> - `secure: true` (strictly enforced when `NODE_ENV=production`)
> - `sameSite: 'strict'` (enforced in production to prevent CSRF)
> - `path: '/'` (scoped to entire site)
> These flags are managed internally by the runtime and do not require external override variables.

#### Secret Generation Procedure:
Execute on the deployment server:
```bash
openssl rand -base64 36
```
Copy the resulting string into `JWT_SECRET` and generate another for `COOKIE_SECRET`. Both must be at least 32 characters long and free of predictable placeholders.

### 3.2 Frontend Configuration: `frontend/.env.production`
Create `/var/www/bac-app/frontend/.env.production` before executing `npm run build`:

```bash
# ==============================================================================
# BISHOP AMBROSE COLLEGE — FRONTEND PRODUCTION BUILD CONFIGURATION
# ==============================================================================

# API Base URL (defaults to '/api' in frontend/src/lib/api-client.ts)
# Setting relative '/api' ensures seamless reverse proxy routing via Nginx without CORS
VITE_API_BASE_URL=/api

# Application Metadata
VITE_APP_TITLE=Bishop Ambrose College
```

> [!IMPORTANT]
> The frontend is statically compiled by Vite. The API client in `frontend/src/lib/api-client.ts` uses `VITE_API_BASE_URL` (falling back to `'/api'`). In production, this routes all API traffic through Nginx's `location /api/` proxy. Any change to `frontend/.env.production` requires re-running `npm run build` inside `frontend/` to take effect.

---

## 4. Installation & Build Runbook

Execute these steps sequentially on the production server under a dedicated, non-root user (e.g. `deploy` or `bac-svc`):

```bash
# 1. Clone repository
cd /var/www
git clone https://github.com/AkashDavidKumar/ba_college.git bac-app
cd bac-app
git checkout master

# 2. Install and build backend dependencies
cd /var/www/bac-app/backend
npm ci
npm run typecheck
npm run build
# Prune development dependencies after compiling TypeScript
npm prune --omit=dev

# 3. Install and build frontend application
cd /var/www/bac-app/frontend
npm ci
npm run typecheck
npm run build
# Compiled static assets will now reside in /var/www/bac-app/frontend/dist
```

---

## 5. Database Setup, Migration & Initial Provisioning

Database setup is divided into **read-only inspection** and **explicit mutation**.

### Step 5.1: Preflight Inspection (Read-Only)
Before making any changes to the database, run the preflight verification script:
```bash
cd /var/www/bac-app/backend
npm run migrate:preflight
```
*Expected Output:* Validates database connectivity, checks existing schema collections, and logs missing indexes without writing any data.

### Step 5.2: Execute Schema Migrations (Mutation)
Once preflight passes and a database backup has been taken, apply schema migrations:
```bash
cd /var/www/bac-app/backend
npm run migrate:execute -- --confirm
```
*Expected Output:* Creates required collections, applies unique indexes (e.g. on user emails, slugs, form identifiers), and validates schema integrity.

### Step 5.3: Provision Master Administrator Account (Mutation)
Provision the initial `master_admin` account using the non-interactive CLI provisioning utility:
```bash
cd /var/www/bac-app/backend
npm run admin:provision -- \
  --email="admin@<CONFIRMED_COLLEGE_DOMAIN>" \
  --password="<SECURE_INITIAL_ADMIN_PASSWORD>" \
  --name="System Administrator" \
  --role="master_admin"
```
*Security Invariants:*
- Passwords must be at least 12 characters and contain upper, lower, numbers, and symbols.
- Immediately instruct the designated administrator to log in via `/admin/login` and change their password.

---

## 6. Process Supervision (PM2) Configuration

The application backend runs as a background daemon managed by PM2.

### 6.1 Ecosystem File: `/var/www/bac-app/backend/ecosystem.config.js`
Create this file in the backend root directory:

```javascript
module.exports = {
  apps: [
    {
      name: 'bac-backend',
      script: 'dist/server.js',
      cwd: '/var/www/bac-app/backend',
      instances: 1,                 // Fork mode: 1 instance avoids Mongoose pool exhaustion
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      kill_timeout: 16000,          // 16s timeout exceeds backend's 15s graceful shutdown
      wait_ready: false,
      listen_timeout: 10000,
      env: {
        NODE_ENV: 'production',
        PORT: 5001
      },
      error_file: '/var/log/pm2/bac-backend-err.log',
      out_file: '/var/log/pm2/bac-backend-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
    }
  ]
};
```

### 6.2 PM2 Lifecycle Commands:
```bash
# Start backend daemon
cd /var/www/bac-app/backend
pm2 start ecosystem.config.js

# Check status and resource consumption
pm2 status
pm2 show bac-backend

# View real-time logs
pm2 logs bac-backend

# Reload cleanly with zero downtime
pm2 reload bac-backend

# Persist daemon across server reboots
pm2 save
pm2 startup systemd
```

---

## 7. Nginx Web Server & Reverse Proxy Configuration

Nginx acts as the TLS termination point, static file server, and reverse proxy for API traffic.

### 7.1 Server Configuration File: `/etc/nginx/sites-available/bac.conf`

```nginx
# ==============================================================================
# BISHOP AMBROSE COLLEGE — NGINX VIRTUAL HOST CONFIGURATION
# ==============================================================================

# HTTP Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name <CONFIRMED_COLLEGE_DOMAIN> www.<CONFIRMED_COLLEGE_DOMAIN>;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS Primary Server Block
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name <CONFIRMED_COLLEGE_DOMAIN> www.<CONFIRMED_COLLEGE_DOMAIN>;

    # SSL Certificates (managed via Certbot)
    ssl_certificate /etc/letsencrypt/live/<CONFIRMED_COLLEGE_DOMAIN>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/<CONFIRMED_COLLEGE_DOMAIN>/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 1d;

    # Root Directory for Compiled Frontend
    root /var/www/bac-app/frontend/dist;
    index index.html;

    # Global Security Headers (Standard Baseline)
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Compression Configuration
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 1. API Reverse Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Repeat security headers to prevent Nginx add_header inheritance drop
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000" always;
    }

    # 2. Immutable Fingerprinted Assets
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;

        # Repeat security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000" always;
    }

    # 3. HTML Entry Point (Zero-cache for instant updates)
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0";

        # Repeat security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header Referrer-Policy "strict-origin-when-cross-origin" always;
        add_header Strict-Transport-Security "max-age=31536000" always;
    }

    # 4. SPA Client-Side Routing Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### 7.2 Activation & Testing:
```bash
sudo ln -sf /etc/nginx/sites-available/bac.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8. Backup and Disaster Recovery Strategy

Backup and recovery procedures depend on the database hosting architecture chosen by the college technical team. The application supports two production database deployment models, along with an internal application-level migration rollback engine.

---

### 8.1 Model 1: Self-Hosted MongoDB (Community Edition on Host / VM)

When MongoDB runs on the same server or a dedicated college-managed virtual machine (`mongodb://127.0.0.1:27017/...`):

#### On-Demand Database Backup:
Execute using standard MongoDB Database Tools (`mongodump`):
```bash
# Set target directory
BACKUP_DIR="/var/backups/bac_mongodb"
DATE=$(date +"%Y%m%d_%H%M%S")
mkdir -p "${BACKUP_DIR}"

# Execute compressed backup
mongodump --uri="${MONGODB_URI}" --out="${BACKUP_DIR}/dump_${DATE}" --gzip

# Calculate SHA-256 checksum of the backup directory for integrity auditing
tar -czf "${BACKUP_DIR}/bac_backup_${DATE}.tar.gz" -C "${BACKUP_DIR}" "dump_${DATE}"
rm -rf "${BACKUP_DIR}/dump_${DATE}"
sha256sum "${BACKUP_DIR}/bac_backup_${DATE}.tar.gz" > "${BACKUP_DIR}/bac_backup_${DATE}.tar.gz.sha256"
```

#### Automated Scheduling Notice:
- Automated scheduling (e.g. systemd timer or cron) is the operational responsibility of the college systems administrator.
- Ensure automated jobs follow institutional backup retention policies (e.g. 30-day retention) and verify that backup archives are periodically replicated to off-site or secondary network storage.

#### Database Disaster Recovery & Restoration:
> [!CAUTION]
> **MANDATORY AUTHORIZATION REQUIRED**  
> Database restoration with `--drop` replaces active database collections and destroys any records created since that backup snapshot. This operation must **never** be executed without formal authorization from the College Technical Lead / Principal.

```bash
# 1. Verify archive checksum
sha256sum -c bac_backup_YYYYMMDD_HHMMSS.tar.gz.sha256

# 2. Extract archive
tar -xzf bac_backup_YYYYMMDD_HHMMSS.tar.gz

# 3. Restore database with drop (Technical-team authorized only)
mongorestore --uri="${MONGODB_URI}" --gzip --drop dump_YYYYMMDD_HHMMSS/bac_production
```

---

### 8.2 Model 2: Managed Cloud Database (MongoDB Atlas)

When using MongoDB Atlas (`mongodb+srv://<user>:<password>@cluster.mongodb.net/...`), backup availability and restoration capabilities depend directly on the specific cluster tier and billing plan chosen by the college:

- **Cluster Tier Qualification:**
  - **Shared / Free Tiers (`M0` Sandbox, `M2`, `M5`):** Do **NOT** support Continuous Cloud Backups (PITR) or customizable snapshot retention policies. On free/shared clusters, automated cloud snapshots may be limited or unavailable. If using a shared tier, the college technical team must utilize standard on-demand `mongodump` dumps (as described in Model 1) or upgrade the cluster.
  - **Dedicated Tiers (`M10` and higher):** Offer native Continuous Cloud Backups and Point-in-Time Recovery (PITR) only when Cloud Backups are explicitly enabled in the Atlas project settings.
- **Continuous Cloud Backups (PITR — Dedicated Tiers Only):** When enabled on supported plans, Atlas allows point-in-time restoration to any specific minute within the configured retention window (typically up to 7 days).
- **Scheduled Cloud Snapshots (Dedicated Tiers Only):** Configured directly through the **MongoDB Atlas Console > Database > Backup** according to institutional retention requirements (e.g. daily, weekly, monthly).
- **No Local Server Cron Scripts for Atlas:** Where Atlas managed backups are active, running local `mongodump` cron jobs on the web server is unnecessary and discouraged to avoid redundant bandwidth usage.
- **Atlas Cloud Restoration Procedure:**
  1. Log in to the **MongoDB Atlas Cloud Console**.
  2. Navigate to: **Deployments > Database > Backup > Snapshots**.
  3. Select the desired restore snapshot or point in time.
  4. Choose restoration target:
     - **Restore to New Cluster (Recommended):** Provisions a separate cluster to verify data integrity without impacting the live production environment.
     - **Restore in-place (Destructive):** Overwrites the active production database cluster.
  5. > [!CAUTION]
     > Any in-place live cluster restoration destroys recent transaction data and strictly requires formal authorization from the College Technical Lead / Principal.

---

### 8.3 Model 3: Application-Level Pre-Migration Snapshots & Rollback Engine

The application codebase contains an internal 15-collection cryptographic JSON backup and rollback engine (`backend/src/migration/backup.ts` and `backend/src/migration/restore.ts`).

#### Automated Pre-Write Backup:
When executing schema migrations via `npm run migrate:execute -- --confirm`, the migration engine **automatically** exports all 15 collections to `backend/backups/bac_backup_YYYYMMDD_HHMMSS/` and creates SHA-256 cryptographic hashes for every exported collection file before applying any mutations.

#### Migration Rollback Procedure:
If a migration must be reverted, the technical team can execute the restore script:

```bash
cd /var/www/bac-app/backend

# WARNING: Requires College Technical Team Authorization.
npm run migrate:restore -- --backup-dir="backups/bac_backup_<TIMESTAMP>" --confirm
```

#### Rollback Safety Invariants:
1. **Cryptographic Validation:** The restore engine validates file existence, size, JSON parseability, document count match, and SHA-256 hash match before writing any changes.
2. **Administrative Credential Protection:** By default, the rollback engine skips the `users` collection, ensuring active administrator credentials and session tokens are preserved even if content collections are rolled back.
3. **Explicit Confirmation Required:** The `--confirm` flag is strictly enforced. The command immediately aborts if invoked without `--confirm`.

---

## 9. Comprehensive Troubleshooting Guide

| Symptom / Error | Probable Root Cause | Resolution Steps |
| :--- | :--- | :--- |
| **502 Bad Gateway** on `/api/*` | Backend Node.js process is stopped or crashed. | Check `pm2 status bac-backend`. Inspect error logs using `pm2 logs bac-backend --err --lines 50`. Verify process is listening on port 5001 with `netstat -tlpn \| grep 5001`. |
| **CORS Rejected** in browser console | Origin does not match `CORS_ORIGINS` in `backend/.env`. | Verify request domain exactly matches `CORS_ORIGINS`. Note that protocol (`https://`) and subdomain (`www.`) must match. Re-export and reload PM2. |
| **Admin Login 401 Loop** | Site accessed over plain HTTP (browsers reject `Secure` cookies in production), `JWT_SECRET` / `COOKIE_SECRET` mismatch, or server clock drift. | 1. Ensure the site is accessed strictly via HTTPS (`NODE_ENV=production` automatically enforces `Secure` and `SameSite=Strict` on `bac_token`).<br>2. Verify `JWT_SECRET` and `COOKIE_SECRET` match across backend restarts.<br>3. Check server clock synchronization with `timedatectl`.<br>4. Inspect backend authentication logs: `pm2 logs bac-backend --lines 50`. |
| **MongoDB Connection Refused** | MongoDB service down, incorrect URI, or authentication failure. | Verify MongoDB service status: `systemctl status mongod`. Check MongoDB logs in `/var/log/mongodb/mongod.log`. Verify credentials with `mongosh "<MONGODB_URI>"`. |
| **Blank Page on Page Refresh** | Nginx missing SPA fallback `try_files $uri $uri/ /index.html;`. | Check Nginx virtual host configuration. Ensure the root location has the fallback directive. Reload Nginx. |
| **PM2 Process Restarts in Loop** | Missing required environment variables (e.g. `JWT_SECRET`, `MONGODB_URI`). | Run `node dist/server.js` directly inside `backend/` to see uncaught startup errors immediately in the terminal. |

---

## 10. Technical Handover Acceptance Checklist

Before declaring production readiness, the college technical team must verify:

- [ ] Repository cloned to production server on branch `master`.
- [ ] Node.js (>= 18 LTS) and MongoDB (>= 6.0) installed and verified.
- [ ] `backend/.env` configured with production secrets and `PORT=5001`.
- [ ] `frontend/.env.production` configured with `VITE_API_BASE_URL=/api`.
- [ ] `npm run migrate:preflight` executed cleanly with 0 errors.
- [ ] `npm run migrate:execute -- --confirm` executed and verified.
- [ ] Initial `master_admin` account provisioned via `npm run admin:provision`.
- [ ] PM2 daemon started with single-instance fork mode and `kill_timeout: 16000`.
- [ ] Nginx configuration syntax tested (`nginx -t`) and loaded.
- [ ] SSL/TLS certificate issued and HTTP-to-HTTPS redirect verified.
- [ ] Production backup strategy configured (automated cloud snapshots for MongoDB Atlas, or scheduled backup procedure for self-hosted MongoDB) and restore procedure verified with technical-team authorization.
- [ ] Port 5001 confirmed blocked from public external internet access via UFW firewall.
