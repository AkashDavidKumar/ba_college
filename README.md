# Bishop Ambrose College — Full-Stack Web Portal & Administrative CMS

A modern institutional website, academic portal, and content management system built with **React 19 (Vite, TypeScript, Tailwind CSS v4)** and **Node.js / Express (TypeScript, MongoDB, Mongoose 8)**.

---

## 1. System Architecture

```text
ba_college/
├── frontend/                 # React 19 SPA (Vite 6, TypeScript, Tailwind CSS v4)
│   ├── src/
│   │   ├── components/       # Public portals, UI primitives, and Admin CMS modules
│   │   ├── pages/            # HomePage, AdminPage, AdminLoginPage
│   │   ├── hooks/            # Context hooks and UI utilities
│   │   ├── lib/              # API client, routing engine, and CMS stores
│   │   ├── tests/            # Automated frontend unit/integration test suites
│   │   ├── App.tsx           # History-based SPA routing with code-splitting
│   │   └── main.tsx          # Application entry point
│   ├── public/               # Static assets (logo.svg, robots.txt)
│   ├── package.json          # Package name: bac-frontend
│   └── vite.config.ts        # Rollup vendor cache chunking & proxy configuration
│
├── backend/                  # Express.js REST API (Node.js 18+, TypeScript, Mongoose 8)
│   ├── src/
│   │   ├── config/           # Database connection, environment validator (Port 5001)
│   │   ├── controllers/      # REST API route controllers
│   │   ├── middleware/       # Auth (JWT/HttpOnly), RBAC scope guard, rate limiters, CSP
│   │   ├── models/           # 15 core Mongoose schemas with compound indexes
│   │   ├── migration/        # Idempotent migration, dry-run, backup & restore engine
│   │   ├── routes/           # Versioned (/api/v1/...) & legacy (/api/...) routers
│   │   ├── scripts/          # Admin provisioning, seeding, and migration CLI
│   │   ├── serializers/      # Privacy-preserving data sanitizers
│   │   ├── tests/            # Jest automated test suites
│   │   ├── validations/      # Zod request payload schemas
│   │   └── server.ts         # Process entry point with graceful shutdown
│   ├── package.json          # Package name: bac-backend
│   └── tsconfig.json         # TypeScript strict configuration
│
├── package.json              # Workspace root runner
├── README.md                 # Project technical overview
├── HANDOVER_RUNBOOK.md       # Operational deployment & maintenance guide
├── ADMIN_OPERATIONS_GUIDE.md # CMS administration & 6-role RBAC reference
└── FINAL_TEST_REPORT.md      # Automated test evidence & verification results
```

---

## 2. Core Technologies

- **Frontend:** React 19, Vite 6, TypeScript 5.7, Tailwind CSS v4, Framer Motion, Radix UI primitives, Lucide Icons, Leaflet.
- **Backend:** Node.js (>= 18.0.0), Express 4.21, TypeScript 5.7, Mongoose 8.9, Zod 4, Helmet 8, Winston, bcryptjs, jsonwebtoken, cookie-parser.
- **Database:** MongoDB 6.0+ / 7.0+ (Self-hosted or MongoDB Atlas).
- **Process & Reverse Proxy:** PM2, Nginx with TLS termination and SPA deep-link fallback.

---

## 3. Local Development Setup

### Prerequisites
- Node.js: `>= 18.0.0` (LTS recommended)
- npm: `>= 9.0.0`
- MongoDB: Running locally on `mongodb://localhost:27017` or a cloud MongoDB Atlas cluster URI.

### 1. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Edit .env to set MONGODB_URI and JWT_SECRET (see backend/README.md)

# Start backend development server (binds to port 5001)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start Vite development server (binds to port 3000, proxies /api to port 5001)
npm run dev
```
*(Note: Frontend API requests use `VITE_API_BASE_URL`, which defaults to `/api` for relative routing via proxy/Nginx).*

---

## 4. Verified Ports & Network Configuration

- **Backend Development Port:** `5001` (`http://localhost:5001`)  
  *(Validated by `backend/src/config/env.ts`. Do not assume port 5000.)*
- **Frontend Development Port:** `3000` (`http://localhost:3000`)
- **API Proxy:** In development, Vite automatically forwards `/api` requests to `http://localhost:5001`.
- **In Production:** Nginx serves compiled frontend assets from `frontend/dist/` and proxies `/api/` requests internally to `127.0.0.1:5001`.

---

## 5. Administrative Account Provisioning

Administrative accounts are created via an interactive CLI script enforcing bcrypt hashing and password complexity rules:

```bash
cd backend
npm run admin:provision
```
- The script securely prompts for Name, Email, and Password via masked terminal input.
- Initial super-admin contact email placeholder: `[OFFICIAL COLLEGE EMAIL TO BE CONFIRMED]`.
- Login portal: `http://localhost:3000/admin/login`

---

## 6. Testing & Quality Verification

### Frontend Tests & Typecheck
```bash
npm --prefix frontend test
npm --prefix frontend run typecheck
npm --prefix frontend run build
```

### Backend Tests & Typecheck
```bash
npm --prefix backend test
npm --prefix backend run typecheck
npm --prefix backend run build
```

---

## 7. Important Handover Documentation

- [HANDOVER_RUNBOOK.md](./HANDOVER_RUNBOOK.md): Complete production deployment, Nginx configuration, PM2 setup, environment variables, and disaster recovery procedures for the college IT team.
- [ADMIN_OPERATIONS_GUIDE.md](./ADMIN_OPERATIONS_GUIDE.md): Operational guide for the 6 verified RBAC roles, department/club scopes, approval workflows, and audit logging.
- [FINAL_TEST_REPORT.md](./FINAL_TEST_REPORT.md): Comprehensive test run evidence and verification results.
- [BACKEND_API_SPECIFICATION.md](./BACKEND_API_SPECIFICATION.md): Full REST API contract documentation.
