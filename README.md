# Veritas Global University - ERP & Academic Portal

A fullstack academic department, ERP, admissions, and content management system built with **Express.js (Node.js/TypeScript)** and **React 19 (Vite/TypeScript)**.

## Project Architecture

```
project/
├── frontend/                 # React 19 SPA (Vite)
│   ├── src/
│   │   ├── components/       # UI & section components
│   │   ├── pages/            # HomePage, AdminPage, AdminLoginPage
│   │   ├── hooks/            # Custom hooks
│   │   ├── lib/              # Contexts & utilities
│   │   ├── App.tsx           # React Router DOM configuration
│   │   ├── main.tsx          # React entry point
│   │   └── index.css         # Tailwind CSS v4 design system
│   ├── public/               # Static web assets
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── .env
│
├── backend/                  # Express.js REST API Backend
│   ├── src/
│   │   ├── config/           # Database connection (Mongoose)
│   │   ├── controllers/      # Express route controllers
│   │   ├── routes/           # API router definitions
│   │   ├── middleware/       # JWT Authentication middleware
│   │   ├── models/           # Mongoose schemas (AdminUser, SiteContent)
│   │   ├── services/         # Database store & seed services
│   │   └── index.ts          # Server entry point (Port 5000)
│   ├── uploads/              # Static upload storage
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── package.json              # Workspace runner
├── README.md                 # Documentation
└── .env
```

---

## Quick Start

### 1. Run Everything Together
From the root project directory:
```bash
npm run dev
```
This launches:
- **Express Backend**: `http://localhost:5000`
- **Vite Frontend**: `http://localhost:3000`

---

### 2. Run Backend Independently
```bash
cd backend
npm run dev
```

### 3. Run Frontend Independently
```bash
cd frontend
npm run dev
```

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Health check endpoint | No |
| `GET` | `/api/db-status` | MongoDB connection status | No |
| `POST` | `/api/auth/login` | Admin authentication login | No |
| `GET` | `/api/auth/me` | Fetch authenticated session | No |
| `POST` | `/api/auth/me` | Admin sign-out | No |
| `GET` | `/api/content` | Fetch site content & branding | No |
| `PUT` | `/api/content` | Update site content | **Yes (Admin)** |
| `GET` | `/api/departments` | Fetch academic departments | No |
| `POST` | `/api/departments` | Create academic department | **Yes (Admin)** |
| `PUT` | `/api/departments` | Update department details | **Yes (Admin)** |
| `DELETE` | `/api/departments` | Remove academic department | **Yes (Admin)** |
| `GET` | `/api/events` | Fetch events & guest speakers | No |
| `POST` | `/api/events` | Add event or guest speaker | **Yes (Admin)** |
| `PUT` | `/api/events` | Update event or guest speaker | **Yes (Admin)** |
| `DELETE` | `/api/events` | Remove event or speaker | **Yes (Admin)** |
| `POST` | `/api/admissions` | Submit student application | No |
| `GET` | `/api/admissions` | List student applications | **Yes (Admin)** |
| `PUT` | `/api/admissions` | Update application status | **Yes (Admin)** |
| `POST` | `/api/upload` | Upload static files/images | **Yes (Admin)** |
| `POST` | `/api/seed` | Reset database to default seed | **Yes (Admin)** |

---

## Admin Credentials

- **Email**: `admin@veritas.edu`
- **Password**: `Admin@2026`
- Login URL: `http://localhost:3000/admin/login`
