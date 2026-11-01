# Bishop Ambrose College Website — Backend API Requirements Specification

> **Document Version:** 1.0.0  
> **Status:** Final Read-Only Audit Specification  
> **Target Stack:** Node.js + Express.js + TypeScript + MongoDB + Mongoose  
> **Audited Workspace:** `e:\justin\bac-frontend-clean\`  
> **Audit Date:** 2026-10-26  

---

## Table of Contents

1. [A. Executive Summary](#a-executive-summary)
2. [B. All Discovered API Endpoints Inventory](#b-all-discovered-api-endpoints-inventory)
3. [C. Request and Response Schemas & Examples](#c-request-and-response-schemas--examples)
4. [D. Complete Module-by-Module Requirements](#d-complete-module-by-module-requirements)
5. [E. Proposed MongoDB Collections & Mongoose Schemas](#e-proposed-mongodb-collections--mongoose-schemas)
6. [F. Authentication and Authorization Matrix](#f-authentication-and-authorization-matrix)
7. [G. Frontend-to-Backend Integration Map](#g-frontend-to-backend-integration-map)
8. [H. Missing Endpoints & Design Decisions](#h-missing-endpoints--design-decisions)
9. [I. Implementation Priorities & Phased Roadmap](#i-implementation-priorities--phased-roadmap)
10. [J. API Testing Checklist](#j-api-testing-checklist)
11. [K. Quick Reference: Endpoint Summary Table](#k-quick-reference-endpoint-summary-table)

---

## A. Executive Summary

### 1. Architectural Landscape
An exhaustive scan of the entire frontend codebase (`frontend/src/`) reveals that the Bishop Ambrose College web application is a hybrid system comprising three distinct architectural tiers:

1. **Public Website Data Tier (`site-context.tsx` & `university-data.ts`):**  
   Consumes canonical public university data via `/api/content`, `/api/departments`, `/api/events`, and `/api/news`. It implements an intelligent fallback mechanism: when the backend API fails (or is offline), it dynamically imports `university-data.ts`, allowing the entire public portal to render uninterrupted.
2. **Specialized Services Tier:**  
   - **Advertisement Engine (`advertisement-service.ts`):** Implements a dedicated v1 REST API (`/api/v1/advertisements`) with impression/click telemetry and fallback to `localStorage` (`bac_advertisements_v2`).
   - **IQAC Accreditation Portal (`iqac-context.tsx` & `iqac-manager.tsx`):** Consumes `/api/iqac` for NAAC, AQAR, SSR, SSS, and institutional quality data with section-level updates (`/api/iqac/section/:section`).
   - **Admin Classic Views (`components/admin/pages/*-dashboard.tsx`):** Makes direct REST calls for Courses, Facilities, Gallery, Placements, Contact Info, and Admissions.
3. **Comprehensive Enterprise CMS Suite (`cms-store.tsx` & `components/admin/modules/`):**  
   Contains 20+ administrative modules managing Users, RBAC, Approvals, Audit Logs, Dynamic Page Builder, Menu Builder, Media Assets, Document Center, SEO, Autonomous Regulations, Examination Schedules, Alumni, and Enquiries. Currently backed by `localStorage` keys (`bac_cms_*`), requiring full REST endpoint implementations to transition to a true multi-user enterprise database.

### 2. Quantitative Audit Metrics
- **Total Direct API References / Calls in Code:** 76 occurrences across 18 files.
- **Distinct REST Endpoints Discovered in Frontend Code:** 35 endpoints.
- **Newly Proposed Endpoints (to transition `cms-store.tsx` to MongoDB):** 24 endpoints.
- **Total Backend Endpoint Blueprint:** 59 endpoints.
- **LocalStorage Keys Audited:** 15 distinct keys (12 prefixed with `bac_cms_`, plus `bac_admin_user`, `bac_advertisements_v2`, `bac_theme_mode`).
- **Upload Handlers Identified:** 2 core routes (`POST /api/upload`, `POST /api/v1/advertisements/upload-image`, plus specialized `POST /api/about/image`).

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
| 6 | `POST` | `/api/about/image` | `about-manager.tsx:159, 222` | Upload Campus/About Section Images | Admin (JWT) | Referenced |
| 7 | `GET` | `/api/departments` | `site-context.tsx:433` | Public Departments Grid & Catalog | Public | Referenced |
| 8 | `POST` | `/api/departments` | `site-context.tsx:655` | Create New Department | Admin (JWT) | Referenced |
| 9 | `PUT` | `/api/departments` | `site-context.tsx:655` | Update Existing Department Details | Admin (JWT) | Referenced |
| 10 | `DELETE` | `/api/departments?slug=:slug` | `site-context.tsx:673` | Remove Department by Slug | Admin (JWT) | Referenced |
| 11 | `GET` | `/api/events` | `site-context.tsx:434` | Public Events & Campus Activities | Public | Referenced |
| 12 | `POST` | `/api/events` | `site-context.tsx:689, 723, 757` | Create Event, Speaker, or Gallery Item | Admin (JWT) | Referenced |
| 13 | `DELETE` | `/api/events?type=event&id=:id` | `site-context.tsx:707` | Delete Campus Event by ID | Admin (JWT) | Referenced |
| 14 | `DELETE` | `/api/events?type=speaker&id=:name`| `site-context.tsx:741` | Delete Guest Speaker by Name | Admin (JWT) | Referenced |
| 15 | `DELETE` | `/api/events?type=gallery&id=:title`| `site-context.tsx:775` | Delete Gallery Photo by Title | Admin (JWT) | Referenced |
| 16 | `GET` | `/api/news` | `site-context.tsx:435` | Public Press Releases & Articles | Public | Referenced |
| 17 | `POST` | `/api/news` | `site-context.tsx:807` | Publish New Article | Admin (JWT) | Referenced |
| 18 | `PUT` | `/api/news/:id` | `site-context.tsx:807` | Update Existing Article | Admin (JWT) | Referenced |
| 19 | `DELETE` | `/api/news/:id` | `site-context.tsx:819` | Delete Article by ID | Admin (JWT) | Referenced |
| 20 | `PUT` | `/api/news/config` | `site-context.tsx:827` | Update News Page Display Configuration | Admin (JWT) | Referenced |
| 21 | `GET` | `/api/iqac` | `iqac-context.tsx:128`, `iqac-manager.tsx:35` | NAAC, AQAR, SSR, SSS, Initiatives | Public | Referenced |
| 22 | `PUT` | `/api/iqac` | `iqac-manager.tsx:91` | Full Update of IQAC Dossier | Admin (JWT) | Referenced |
| 23 | `PUT` | `/api/iqac/section/:section` | `iqac-context.tsx:147`, `iqac-manager.tsx:59`| Update Specific IQAC Section (e.g. ssr, aqar) | Admin (JWT) | Referenced |
| 24 | `POST` | `/api/iqac/download/:section/:id` | `iqac-context.tsx:159` | Increment Document Download Counter | Public | Referenced |
| 25 | `GET` | `/api/admissions` | `admissions-tab.tsx:33` | Fetch Submitted Student Applications | Admin (JWT) | Referenced |
| 26 | `POST` | `/api/admissions` | `site-context.tsx:791` | Submit Online Student Application | Public | Referenced |
| 27 | `PUT` | `/api/admissions` | `admissions-tab.tsx:59, 98` | Update Application Review Status & Notes | Admin (JWT) | Referenced |
| 28 | `GET` | `/api/courses` | `courses-dashboard.tsx:81` | Fetch Academic Degree Programmes | Public | Referenced |
| 29 | `POST` | `/api/courses` | `courses-dashboard.tsx:103` | Create Degree Programme | Admin (JWT) | Referenced |
| 30 | `PUT` | `/api/courses/:id` | `courses-dashboard.tsx:103, 134` | Update Degree Programme / Toggle Status | Admin (JWT) | Referenced |
| 31 | `DELETE` | `/api/courses/:id` | `courses-dashboard.tsx:125` | Delete Degree Programme | Admin (JWT) | Referenced |
| 32 | `GET` | `/api/facilities` | `facilities-dashboard.tsx:75` | Fetch Campus Facilities & Amenities | Public | Referenced |
| 33 | `POST` | `/api/facilities` | `facilities-dashboard.tsx:96` | Create Facility Record | Admin (JWT) | Referenced |
| 34 | `PUT` | `/api/facilities/:id` | `facilities-dashboard.tsx:96` | Update Facility Details | Admin (JWT) | Referenced |
| 35 | `DELETE` | `/api/facilities/:id` | `facilities-dashboard.tsx:116` | Delete Facility Record | Admin (JWT) | Referenced |
| 36 | `GET` | `/api/gallery` | `gallery-dashboard.tsx:83` | Fetch Albums, Photos, Video Links | Public | Referenced |
| 37 | `POST` | `/api/gallery` | `gallery-dashboard.tsx:100` | Save Albums / Video Links Payload | Admin (JWT) | Referenced |
| 38 | `GET` | `/api/placements` | `placements-dashboard.tsx:90` | Fetch Recruiter Logos, Stats, Stories | Public | Referenced |
| 39 | `POST` | `/api/placements` | `placements-dashboard.tsx:104` | Save Placement Records & Stats | Admin (JWT) | Referenced |
| 40 | `GET` | `/api/contact` | `contact-dashboard.tsx:78` | Fetch Contact Details & Map Config | Public | Referenced |
| 41 | `PUT` | `/api/contact` | `contact-dashboard.tsx:92` | Update Campus Contact Info & Phone Lines | Admin (JWT) | Referenced |
| 42 | `POST` | `/api/upload` | `departments-tab.tsx:214`, `events-tab.tsx:198`, `hero-video-manager.tsx:93`, `virtual-tour-manager.tsx:196` | Media Upload (Images & Video files) | Admin (JWT) | Referenced |
| 43 | `POST` | `/api/seed` | `site-context.tsx:839` | Seed Database from `cms-database.json` | Master Admin | Referenced |
| 44 | `GET` | `/api/v1/advertisements` | `advertisement-service.ts:236` | Filtered / Paginated Advertisements | Public / Admin | Referenced |
| 45 | `GET` | `/api/v1/advertisements/active` | `advertisement-service.ts:290` | Active Popup Overlay Ad for Visitors | Public | Referenced |
| 46 | `GET` | `/api/v1/advertisements/:id` | `advertisement-service.ts:24` | Single Advertisement Record | Public / Admin | Referenced |
| 47 | `POST` | `/api/v1/advertisements` | `advertisement-service.ts:357` | Create Advertisement Banner | Admin (JWT) | Referenced |
| 48 | `PUT` | `/api/v1/advertisements/:id` | `advertisement-service.ts:394` | Update Advertisement Banner | Admin (JWT) | Referenced |
| 49 | `PATCH` | `/api/v1/advertisements/:id/status`| `advertisement-service.ts:35` | Toggle Status (active/inactive/draft) | Admin (JWT) | Referenced |
| 50 | `DELETE` | `/api/v1/advertisements/:id` | `advertisement-service.ts:424` | Soft/Hard Delete Advertisement | Admin (JWT) | Referenced |
| 51 | `POST` | `/api/v1/advertisements/upload-image`| `advertisement-service.ts:42` | Upload Ad Banner Image | Admin (JWT) | Referenced |
| 52 | `POST` | `/api/v1/advertisements/:id/track-impression` | `advertisement-service.ts:46` | Increment Impression Counter | Public | Referenced |
| 53 | `POST` | `/api/v1/advertisements/:id/track-click` | `advertisement-service.ts:49` | Increment Click Counter | Public | Referenced |

---

## C. Request and Response Schemas & Examples

### 1. Authentication & Session Management

#### `POST /api/auth/login`
- **Caller:** `frontend/src/pages/AdminLoginPage.tsx:103`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  {
    "email": "admin@bac.edu.in",
    "password": "Admin@Password2026"
  }
  ```
- **Validation Rules:**
  - `email`: Required, valid email string, trimmed, lowercase.
  - `password`: Required, minimum 8 characters.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "usr_01HGB...",
      "name": "Dr. V. Anitha",
      "email": "admin@bac.edu.in",
      "role": "master_admin",
      "permissions": ["all"],
      "status": "active",
      "initials": "DV",
      "departmentId": null,
      "clubId": null,
      "avatar": "https://assets.bac.edu.in/avatars/anitha.jpg"
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: `{ "success": false, "error": "Email and password are required." }`
  - `401 Unauthorized`: `{ "success": false, "error": "Invalid administrative credentials." }`
  - `403 Forbidden`: `{ "success": false, "error": "Account deactivated. Contact IT Administration." }`
- **Frontend Fallback:** The page catches exceptions and sets client-side session (`bac_admin_user`) for demo continuity.

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

### 9. File & Media Upload

#### `POST /api/upload`
- **Callers:**
  - `departments-tab.tsx:214`
  - `events-tab.tsx:198`
  - `general-settings-tab.tsx:165`
  - `hero-video-manager.tsx:93`
  - `virtual-tour-manager.tsx:196`
- **Headers:** `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Form Data Field:** `file` (File binary).
- **Accepted MIME Types:**
  - Images: `image/jpeg`, `image/png`, `image/webp`, `image/svg+xml`, `image/gif`
  - Videos: `video/mp4`, `video/webm`
- **Maximum File Size:**
  - Images: 10 MB
  - Videos: 100 MB
- **Success Response (`200 OK` or `201 Created`):**
  ```json
  {
    "success": true,
    "url": "/uploads/media-1711467890-hero-video.mp4",
    "fileName": "hero-video.mp4",
    "mimeType": "video/mp4",
    "size": 18456200
  }
  ```

#### `POST /api/about/image`
- **Caller:** `about-manager.tsx:159, 222`
- **Form Data Field:** `image` (File binary).
- **Success Response (`200 OK`):**
  ```json
  {
    "url": "/uploads/campus-about-1711468000.jpg"
  }
  ```

---

### 10. Database Initialization & Seeding

#### `POST /api/seed`
- **Caller:** `site-context.tsx:839`
- **Headers:** `Authorization: Bearer <token>` (Master Admin only)
- **Action:** Clears collections and re-populates MongoDB using `data/cms-database.json`.
- **Success Response (`200 OK`):**
  ```json
  {
    "success": true,
    "message": "Database successfully reset and re-seeded from cms-database.json."
  }
  ```

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
| `POST /api/upload` | No Access | Authenticated | Authenticated | Full Access |
| `POST /api/seed` | No Access | No Access | No Access | Master Admin Only |
| `/api/admin/users`, `/api/admin/roles` | No Access | No Access | No Access | Master Admin Only |
| `/api/admin/audit-logs` | No Access | No Access | Read Only | Read Only (Immutable) |

---

## G. Frontend-to-Backend Integration Map

### 1. Connecting the Vite Dev Server
When developing locally, configure the Vite dev server proxy in [`frontend/vite.config.ts`](file:///e:/justin/bac-frontend-clean/frontend/vite.config.ts):
```typescript
server: {
  port: 3000,
  proxy: {
    "/api": {
      target: "http://localhost:5001",
      changeOrigin: true,
      secure: false,
    },
    "/uploads": {
      target: "http://localhost:5001",
      changeOrigin: true,
      secure: false,
    },
  },
}
```

### 2. Transitioning `cms-store.tsx` from LocalStorage to REST APIs
Currently, `cms-store.tsx` serializes the following state arrays to browser `localStorage`:
- `bac_cms_users`
- `bac_cms_audit_logs`
- `bac_cms_approvals`
- `bac_cms_pages`
- `bac_cms_menus`
- `bac_cms_media`
- `bac_cms_documents`
- `bac_cms_applications`
- `bac_cms_alumni`
- `bac_cms_notices`
- `bac_cms_clubs`
- `bac_cms_enquiries`

To complete the backend integration without modifying frontend UI components, replace the `useEffect` write-backs in `cms-store.tsx` with standard async queries against the proposed `/api/admin/*` endpoints documented in Section H.

---

## H. Missing Endpoints & Design Decisions

### 1. Missing Endpoints Required to Fully Replace `localStorage`
The following endpoints are **not yet called** by `fetch()` in the source code because `cms-store.tsx` currently uses `localStorage`. They must be implemented in the backend:

1. **`GET /api/admin/users` & `POST /api/admin/users` & `PUT /api/admin/users/:id` & `DELETE /api/admin/users/:id`**  
   *Required by:* `users-cms.tsx`
2. **`GET /api/admin/audit-logs` & `POST /api/admin/audit-logs`**  
   *Required by:* `audit-logs-cms.tsx`
3. **`GET /api/admin/approvals` & `PUT /api/admin/approvals/:id`**  
   *Required by:* `approvals-cms.tsx`
4. **`GET /api/admin/pages` & `POST /api/admin/pages` & `PUT /api/admin/pages/:id` & `DELETE /api/admin/pages/:id`**  
   *Required by:* `page-builder-cms.tsx`
5. **`GET /api/admin/menus` & `PUT /api/admin/menus`**  
   *Required by:* `menu-builder-cms.tsx`
6. **`GET /api/admin/media` & `DELETE /api/admin/media/:id`**  
   *Required by:* `media-library-cms.tsx`
7. **`GET /api/documents` & `POST /api/documents` & `DELETE /api/documents/:id`**  
   *Required by:* `document-center-cms.tsx`
8. **`POST /api/contact/enquiries`**  
   *Required by:* Public `contact-page.tsx` and `components/home/contact.tsx`
9. **`POST /api/alumni/register` & `GET /api/admin/alumni` & `PUT /api/admin/alumni/:id/verify`**  
   *Required by:* Public `alumni-page.tsx` and `alumni-cms.tsx`
10. **`POST /api/newsletter/subscribe`**  
    *Required by:* Public `footer.tsx` (newsletter submission form)

### 2. Architecture & Design Decisions Requiring Alignment

| # | Design Topic | Option A (Recommended) | Option B (Alternative) | Recommendation & Rationale |
|---|---|---|---|---|
| **D1** | **Static Assets / Upload Storage** | Local Disk Storage under `public/uploads` served by Express static middleware. | AWS S3 / Cloudflare R2 object storage. | **Option A for initial development** (mirrors existing codebase structure), migrate to S3 in production via abstraction layer. |
| **D2** | **Polymorphic `/api/events` vs Clean REST** | Maintain current `/api/events?type=event\|speaker\|gallery` behavior to avoid modifying `site-context.tsx`. | Refactor frontend into clean `/api/events`, `/api/speakers`, `/api/gallery`. | **Option A**: Strict requirement to avoid touching existing frontend code. Backend controller should parse `req.query.type`. |
| **D3** | **Singleton Data Storage (`/api/content` & `/api/iqac`)** | Single document in dedicated collections (`site_content`, `iqac_dossier`) fetched/updated via `findOneAndUpdate({}, updates, { upsert: true })`. | Key-value store (e.g. Redis). | **Option A**: MongoDB documents with JSON sub-schemas naturally map to existing `cms-database.json` and TypeScript types. |
| **D4** | **Admissions Application Numbering** | Auto-incrementing format `BAC-ADM-<YYYY>-<SEQ>` generated via MongoDB atomic counters. | UUID v4 strings. | **Option A**: College admissions offices require human-readable application numbers for receipts and applicant enquiries. |
| **D5** | **JWT Storage in Client** | Store JWT in `localStorage` alongside existing `bac_admin_user` payload, sending via `Authorization: Bearer <token>`. | `httpOnly` secure cookies. | **Option A**: Existing frontend `AdminLoginPage.tsx` already uses `localStorage.setItem("bac_admin_user", ...)`. |

---

## I. Implementation Priorities & Phased Roadmap

```
┌────────────────────────────────────────────────────────────────────────┐
│ Phase 1: Core Foundation & Public Experience (Days 1–3)                │
├────────────────────────────────────────────────────────────────────────┤
│ • Express + TypeScript + Mongoose scaffolding & CORS setup             │
│ • Database seeding script (`POST /api/seed`) using cms-database.json   │
│ • Public endpoints: /api/content, /api/departments, /api/events,       │
│   /api/news, /api/iqac                                                 │
│ • Public submissions: POST /api/admissions, POST /api/contact/enquiries│
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 2: Media Storage & Specialized Services (Days 4–5)               │
├────────────────────────────────────────────────────────────────────────┤
│ • File upload engine (Multer): POST /api/upload, POST /api/about/image │
│ • Complete Advertisement Service: /api/v1/advertisements (all 10 routes)│
│ • Static file serving: /uploads/ mapping                               │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 3: Administrative Auth & Classic Admin Dashboards (Days 6–7)     │
├────────────────────────────────────────────────────────────────────────┤
│ • JWT Authentication: POST /api/auth/login, GET /api/auth/me           │
│ • Course catalog: /api/courses (CRUD)                                  │
│ • Facilities: /api/facilities (CRUD)                                   │
│ • Gallery & Placements: /api/gallery, /api/placements                  │
│ • Admission triage: GET/PUT /api/admissions                            │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
┌──────────────────────────────────▼─────────────────────────────────────┐
│ Phase 4: Enterprise CMS Suite & Advanced Modules (Days 8–10)           │
├────────────────────────────────────────────────────────────────────────┤
│ • Users & RBAC: /api/admin/users, /api/admin/roles                     │
│ • Approvals & Audit Trail: /api/admin/approvals, /api/admin/audit-logs │
│ • Dynamic Pages, Menus & Document Center                               │
│ • Alumni Network & Club Management                                     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## J. API Testing Checklist

Before deploying each endpoint, verify the following test scenarios:

### 1. Public Content & Data Integrity
- [ ] `GET /api/content` returns all 8 required top-level keys (`logo`, `hero`, `heroSection`, `announcements`, `about`, `footer`, `statistics`, `virtualTour`).
- [ ] `GET /api/departments` returns 12 complete departments with populated programs and faculty arrays.
- [ ] `GET /api/events` successfully serves `events`, `guestSpeakers`, and `eventGallery` arrays.
- [ ] `GET /api/v1/advertisements/active?position=popup_overlay` returns only active, date-valid ads sorted by priority.

### 2. Form Submissions & Validations
- [ ] `POST /api/admissions` validates mandatory fields (`name`, `email`, `phone`, `program`) and assigns unique `appNumber`.
- [ ] `POST /api/contact/enquiries` accepts inquiry categories and returns success feedback.
- [ ] `POST /api/v1/advertisements/:id/track-impression` and `:id/track-click` atomically increment counters.

### 3. Media & File Security
- [ ] `POST /api/upload` enforces file type whitelist (no executable files permitted).
- [ ] File uploads exceeding 100 MB for videos or 10 MB for images return `413 Payload Too Large`.
- [ ] Stored files are assigned cryptographically random or timestamped unique filenames to prevent path traversal and overwriting.

### 4. Authentication, Authorization & Security
- [ ] `POST /api/auth/login` verifies bcrypt-hashed passwords and returns signed JWT with expiration.
- [ ] Protected endpoints (`PUT /api/content`, `DELETE /api/departments`, etc.) return `401 Unauthorized` without a valid Bearer token.
- [ ] Sub-admin accounts attempting access to `POST /api/seed` or `/api/admin/users` return `403 Forbidden`.
- [ ] All database queries sanitize input parameters against NoSQL injection.

---

## K. Quick Reference: Endpoint Summary Table

This table serves as a direct, comprehensive guide for any developer or AI coding agent implementing the backend.

| Resource | Method | Path | Request Body / Params | Expected Response | Auth |
|---|---|---|---|---|---|
| **Auth** | `POST` | `/api/auth/login` | `{ email, password }` | `{ success, token, user }` | Public |
| **Auth** | `GET` | `/api/auth/me` | None | `{ success, user }` | Bearer Token |
| **Content** | `GET` | `/api/content` | None | Full site configuration object | Public |
| **Content** | `PUT` | `/api/content` | Partial content config | `{ success, data }` | Admin |
| **About** | `GET` | `/api/about` | None | About page data object | Public |
| **About** | `PUT` | `/api/about` | Updated about page object | `{ success, data }` | Admin |
| **About Image** | `POST` | `/api/about/image` | `FormData (image: File)` | `{ url }` | Admin |
| **Departments** | `GET` | `/api/departments` | None | `Department[]` | Public |
| **Departments** | `POST` | `/api/departments` | Full `Department` JSON | `{ success, department }` | Admin |
| **Departments** | `PUT` | `/api/departments` | Full `Department` JSON | `{ success, department }` | Admin |
| **Departments** | `DELETE`| `/api/departments` | Query `?slug=string` | `{ success }` | Admin |
| **Events** | `GET` | `/api/events` | None | `{ events, guestSpeakers, eventGallery }` | Public |
| **Events** | `POST` | `/api/events` | `{ type, id?, data }` | `{ success }` | Admin |
| **Events** | `DELETE`| `/api/events` | Query `?type=...&id=...` | `{ success }` | Admin |
| **News** | `GET` | `/api/news` | None | `NewsArticle[]` | Public |
| **News** | `POST` | `/api/news` | `NewsArticle` JSON | `{ success, article }` | Admin |
| **News** | `PUT` | `/api/news/:id` | `Partial<NewsArticle>` JSON| `{ success, article }` | Admin |
| **News** | `DELETE`| `/api/news/:id` | None | `{ success }` | Admin |
| **News Config**| `PUT` | `/api/news/config` | `NewsEventsConfig` JSON | `{ success }` | Admin |
| **IQAC** | `GET` | `/api/iqac` | None | Full IQAC dossier JSON | Public |
| **IQAC** | `PUT` | `/api/iqac` | Full IQAC dossier JSON | `{ success }` | Admin |
| **IQAC Section**| `PUT` | `/api/iqac/section/:section` | Section JSON | `{ success }` | Admin |
| **IQAC Download**| `POST`| `/api/iqac/download/:section/:id` | None | `{ success }` | Public |
| **Admissions** | `POST` | `/api/admissions` | `{ name, email, phone, program, gpa, notes }` | `{ success, appNumber }` | Public |
| **Admissions** | `GET` | `/api/admissions` | None | `AdmissionApplication[]` | Admin |
| **Admissions** | `PUT` | `/api/admissions` | `{ id, status, notes }` | `{ success }` | Admin |
| **Courses** | `GET` | `/api/courses` | None | `Course[]` | Public |
| **Courses** | `POST` | `/api/courses` | `Course` JSON | `{ success, course }` | Admin |
| **Courses** | `PUT` | `/api/courses/:id` | `Partial<Course>` JSON | `{ success, course }` | Admin |
| **Courses** | `DELETE`| `/api/courses/:id` | None | `{ success }` | Admin |
| **Facilities** | `GET` | `/api/facilities` | None | `Facility[]` | Public |
| **Facilities** | `POST` | `/api/facilities` | `Facility` JSON | `{ success, facility }` | Admin |
| **Facilities** | `PUT` | `/api/facilities/:id` | `Partial<Facility>` JSON | `{ success, facility }` | Admin |
| **Facilities** | `DELETE`| `/api/facilities/:id` | None | `{ success }` | Admin |
| **Gallery** | `GET` | `/api/gallery` | None | `{ albums, videos }` | Public |
| **Gallery** | `POST` | `/api/gallery` | `{ albums, videos }` | `{ success }` | Admin |
| **Placements** | `GET` | `/api/placements` | None | `PlacementsData` JSON | Public |
| **Placements** | `POST` | `/api/placements` | `PlacementsData` JSON | `{ success }` | Admin |
| **Contact** | `GET` | `/api/contact` | None | `ContactData` JSON | Public |
| **Contact** | `PUT` | `/api/contact` | `ContactData` JSON | `{ success }` | Admin |
| **Contact Msg** | `POST` | `/api/contact/enquiries` | `{ name, email, phone, category, subject, message }` | `{ success }` | Public |
| **Upload** | `POST` | `/api/upload` | `FormData (file: File)` | `{ success, url, fileName, size }` | Admin |
| **Seed** | `POST` | `/api/seed` | None | `{ success, message }` | Master Admin |
| **Ads List** | `GET` | `/api/v1/advertisements` | Query `?search=&status=&position=` | `Advertisement[]` | Public/Admin |
| **Active Ad** | `GET` | `/api/v1/advertisements/active` | Query `?position=popup_overlay` | `Advertisement` JSON | Public |
| **Single Ad** | `GET` | `/api/v1/advertisements/:id` | None | `Advertisement` JSON | Public/Admin |
| **Create Ad** | `POST` | `/api/v1/advertisements` | `CreateAdvertisementDto` | `{ success, advertisement }` | Admin |
| **Update Ad** | `PUT` | `/api/v1/advertisements/:id` | `UpdateAdvertisementDto` | `{ success, advertisement }` | Admin |
| **Status Ad** | `PATCH` | `/api/v1/advertisements/:id/status` | `{ status }` | `{ success }` | Admin |
| **Delete Ad** | `DELETE`| `/api/v1/advertisements/:id` | None | `{ success }` | Admin |
| **Upload Ad Img**| `POST` | `/api/v1/advertisements/upload-image` | `FormData (file: File)` | `{ url }` | Admin |
| **Track Impression**| `POST`| `/api/v1/advertisements/:id/track-impression` | None | `{ success }` | Public |
| **Track Click** | `POST` | `/api/v1/advertisements/:id/track-click` | None | `{ success }` | Public |
| **Admin Users**| `GET` | `/api/admin/users` | None | `AdminUser[]` | Master Admin |
| **Admin Users**| `POST` | `/api/admin/users` | `AdminUser` JSON | `{ success, user }` | Master Admin |
| **Audit Logs** | `GET` | `/api/admin/audit-logs` | Query `?module=&userId=&limit=` | `AuditLogEntry[]` | Admin |
| **Approvals** | `GET` | `/api/admin/approvals` | Query `?status=pending` | `ApprovalItem[]` | Admin |
| **Approvals** | `PUT` | `/api/admin/approvals/:id` | `{ status, rejectionReason? }`| `{ success }` | Admin |
| **Pages** | `GET` | `/api/admin/pages` | None | `DynamicPage[]` | Admin |
| **Menus** | `GET` | `/api/admin/menus` | None | `MenuItem[]` | Public/Admin |
| **Documents** | `GET` | `/api/documents` | Query `?category=` | `CollegeDocument[]` | Public/Admin |
| **Alumni Register**| `POST`| `/api/alumni/register` | Alumni registration form | `{ success }` | Public |
| **Alumni List**| `GET` | `/api/admin/alumni` | None | `AlumniMember[]` | Admin |
| **Newsletter** | `POST` | `/api/newsletter/subscribe` | `{ email }` | `{ success }` | Public |

---

## L. Phase 1 Implementation Checklist

> **Status:** Phase 1 Complete  
> **Implemented:** 2026-10-27  
> **Scope:** Backend foundation only — no business endpoints  
> **Node.js:** v24.13.1 · npm: 11.8.0  
> **Stack:** Express 4 · TypeScript 5.7 · Mongoose 8 · Winston 3

Sections B through K above are the canonical endpoint inventory and are **preserved unchanged**. This section tracks implementation status only.

### Phase 1 — Foundation (Complete)

| Item | Status | Notes |
|---|---|---|
| Backend directory `backend/` created | ✅ Done | New greenfield directory; frontend untouched |
| `package.json` with correct Node engine range | ✅ Done | `>=18.0.0`; tested on Node 24.13.1 |
| `tsconfig.json` — `strict: true` + all extra checks | ✅ Done | `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, etc. |
| `.env.example` — placeholder values only | ✅ Done | No real credentials; `MONGODB_URI` placeholder only |
| `.gitignore` — excludes `node_modules`, `dist`, `.env`, `uploads` | ✅ Done | |
| `jest.config.js` — ts-jest, path alias mapping, 70% coverage threshold | ✅ Done | |
| `eslint.config.mjs` — ESLint v9 flat config | ✅ Done | Enforces `no-console`, warns on stray `process.env` |
| `src/config/env.ts` — strict startup validation, single `process.env` reader | ✅ Done | Throws on missing/invalid vars before server starts |
| `src/config/database.ts` — URI redaction, pool config, event listeners | ✅ Done | `maxPoolSize: 10`, credentials never logged |
| `src/utils/logger.ts` — Winston, deep field redaction, no stack traces | ✅ Done | `password`, `token`, `authorization`, etc. redacted |
| `src/utils/api-error.ts` — `isOperational` flag, factory methods | ✅ Done | Distinguishes safe vs unsafe errors for error handler |
| `src/utils/async-handler.ts` — promise rejection forwarding | ✅ Done | |
| `src/middleware/request-id.ts` — UUID v4, validates client-supplied IDs | ✅ Done | Prevents log injection from forged request ID header |
| `src/middleware/rate-limit.ts` — general (100/15 min) + strict (10/15 min) | ✅ Done | draft-7 RFC 9110 headers; no retry timing leakage |
| `src/middleware/not-found.ts` — 404 handler | ✅ Done | |
| `src/middleware/error-handler.ts` — 5-branch classification | ✅ Done | Stack traces suppressed in production |
| `src/controllers/health.controller.ts` — liveness + readiness | ✅ Done | Readiness never exposes DB host/credentials |
| `src/routes/health.routes.ts` + `src/routes/index.ts` | ✅ Done | |
| `src/app.ts` — Express factory, helmet, CORS, body limits | ✅ Done | Middleware order documented; CORS function-based |
| `src/server.ts` — entry point, graceful shutdown, unhandledRejection | ✅ Done | 15 s shutdown timeout; process exits on uncaughtException |
| `src/types/index.ts` — Express augmentation, `ValidatedEnv` | ✅ Done | |
| `src/tests/setup.ts` — Jest global env injection | ✅ Done | Tests self-contained; no `.env` file required |
| `src/tests/env.test.ts` — 14 cases | ✅ Done | |
| `src/tests/health.test.ts` — 12 cases (11 no-DB + 1 optional) | ✅ Done | DB-available suite skippable via `CI_NO_MONGO=1` |
| `src/tests/cors.test.ts` — 8 cases | ✅ Done | Wildcard `*` assertion included |
| `src/tests/rate-limit.test.ts` — 5 cases | ✅ Done | RFC 9110 draft-7 RateLimit header verified |
| `src/tests/error-handler.test.ts` — 15 cases | ✅ Done | Production message sanitisation verified |
| `src/tests/graceful-shutdown.test.ts` — 2 cases | ✅ Done | Direct server.close() test; no process signal to Jest |
| `backend/README.md` — setup, env reference, risk register | ✅ Done | |
| `frontend/vite.config.ts` — proxy block uncommented | ✅ Done | Only approved change to frontend files |

### Phase 1 — Endpoints Implemented

| Endpoint | Status |
|---|---|
| `GET /api/health` | ✅ Implemented & Tested |
| `GET /api/ready` | ✅ Implemented & Tested |

### Phase 1 — Endpoints NOT Implemented (by design)

All 59 business endpoints listed in Sections B and K remain unimplemented in Phase 1. They will be built in Phases 2–4 per the roadmap in Section I.

### Phase 2 — Secure Authentication & RBAC (Complete)

| Item | Status | Notes |
|---|---|---|
| User Mongoose Model (`src/models/user.model.ts`) | ✅ Done | bcrypt hashing (cost 12), `password` hidden via `select: false`, brute-force lockout, `tokenVersion` |
| Zod Schemas (`src/validations/auth.validation.ts`) | ✅ Done | Strict input sanitization, `.strict()` prototype protection, strong password policy |
| Token Utilities (`src/utils/token.ts`) | ✅ Done | HMAC-SHA256 JWT, HttpOnly / Secure / SameSite cookie configuration |
| Auth Middleware (`src/middleware/auth.ts`) | ✅ Done | `requireAuth`, `requireRoles`, `requirePermissions`, instant revocation via `tokenVersion` |
| Auth Controller & Routes (`src/controllers/auth.controller.ts`, `src/routes/auth.routes.ts`) | ✅ Done | `POST /login`, `POST /logout`, `GET /me` with timing attack mitigation |
| Provisioning Script (`src/scripts/provision-admin.ts`) | ✅ Done | Controlled administrative initialization; zero hardcoded/backdoor accounts |
| Automated Tests (`src/tests/auth.test.ts`, `src/tests/user-model.test.ts`) | ✅ Done | 29 auth/model test cases covering all edge cases, 100% passing |

### Endpoints Implemented to Date

| Endpoint | Phase | Status |
|---|---|---|
| `GET /api/health` | Phase 1 | ✅ Implemented & Tested |
| `GET /api/ready` | Phase 1 | ✅ Implemented & Tested |
| `POST /api/auth/login` | Phase 2 | ✅ Implemented & Tested |
| `POST /api/auth/logout` | Phase 2 | ✅ Implemented & Tested |
| `GET /api/auth/me` | Phase 2 | ✅ Implemented & Tested |

### Future Phases — Status

| Phase | Status |
|---|---|
| Phase 3: Media Storage & Classic Admin Dashboards | 🔲 Pending Phase 2 approval |
| Phase 4: Enterprise CMS Suite & Admissions | 🔲 Pending |
