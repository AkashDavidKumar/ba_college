/**
 * public.routes.ts — Legacy Compatibility Public Routes (`/api/...`)
 *
 * Directly powers the existing React frontend (site-context.tsx, iqac-context.tsx, admin dashboards).
 * Applies publicCache middleware for HTTP 304 ETag negotiation and Cache-Control headers.
 */
import { Router } from 'express';
import { publicCache } from '../middleware/public-cache';
import {
  getPublicSiteContent,
  getPublicAboutPage,
  getPublicDepartments,
  getPublicDepartmentBySlug,
  getPublicCourses,
  getPublicCourseByIdOrSlug,
  getPublicEventsBundle,
  getPublicGallery,
  getPublicNewsBundle,
  getPublicNewsArticleBySlug,
  getPublicIQAC,
  getPublicFacilities,
  getPublicFacilityById,
  getPublicPlacements,
  getPublicContactInfo,
} from '../controllers/public.controller';

const publicRouter = Router();

// Apply public caching & ETag middleware to all public read routes
publicRouter.use(publicCache());

// ── 1. Content & Institutional Info ──────────────────────────────────────────
publicRouter.get('/content', getPublicSiteContent);
publicRouter.get('/about', getPublicAboutPage);

// ── 2. Departments & Courses ─────────────────────────────────────────────────
publicRouter.get('/departments', getPublicDepartments);
publicRouter.get('/departments/:slug', getPublicDepartmentBySlug);
publicRouter.get('/courses', getPublicCourses);
publicRouter.get('/courses/:id', getPublicCourseByIdOrSlug);

// ── 3. Events, Speakers & Gallery ────────────────────────────────────────────
publicRouter.get('/events', getPublicEventsBundle);
publicRouter.get('/gallery', getPublicGallery);

// ── 4. News & Press Releases ─────────────────────────────────────────────────
publicRouter.get('/news', getPublicNewsBundle);
publicRouter.get('/news/:id', getPublicNewsArticleBySlug);

// ── 5. IQAC, Facilities, Placements & Contact ────────────────────────────────
publicRouter.get('/iqac', getPublicIQAC);
publicRouter.get('/facilities', getPublicFacilities);
publicRouter.get('/facilities/:id', getPublicFacilityById);
publicRouter.get('/placements', getPublicPlacements);
publicRouter.get('/contact', getPublicContactInfo);

export default publicRouter;
