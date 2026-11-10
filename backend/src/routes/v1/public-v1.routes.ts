/**
 * public-v1.routes.ts — Versioned Public REST Routes (`/api/v1/...`)
 *
 * Implements standard RESTful endpoints for external consumers and versioned integrations.
 * Applies publicCache middleware for HTTP 304 ETag negotiation and Cache-Control headers.
 */
import { Router } from 'express';
import { publicCache } from '../../middleware/public-cache';
import {
  getPublicSiteContent,
  getPublicAboutPage,
  getPublicDepartments,
  getPublicDepartmentBySlug,
  getPublicCourses,
  getPublicCourseByIdOrSlug,
  getPublicEvents,
  getPublicEventBySlug,
  getPublicGuestSpeakers,
  getPublicGallery,
  getPublicNewsBundle,
  getPublicNewsArticleBySlug,
  getPublicIQAC,
  getPublicFacilities,
  getPublicFacilityById,
  getPublicPlacements,
  getPublicContactInfo,
  getPublicActiveAdvertisement,
} from '../../controllers/public.controller';
import { getPublicPageBySlug } from '../../controllers/dynamic-page.controller';
import { getPublicNavigationMenus } from '../../controllers/navigation-menu.controller';
import { getPublicMedia } from '../../controllers/media-asset.controller';
import { getPublicFormBySlug, submitFormAnswers } from '../../controllers/form.controller';
import { strictRateLimit } from '../../middleware/rate-limit';
import { validateBody } from '../../validations/auth.validation';
import { submitAnswersSchema } from '../../validations';

const publicV1Router = Router();

// Apply public caching & ETag middleware to all public v1 read routes
publicV1Router.use(publicCache());

// ── 1. Content & Institutional Info ──────────────────────────────────────────
publicV1Router.get('/content', getPublicSiteContent);
publicV1Router.get('/about', getPublicAboutPage);

// ── 2. Departments & Courses ─────────────────────────────────────────────────
publicV1Router.get('/departments', getPublicDepartments);
publicV1Router.get('/departments/:slug', getPublicDepartmentBySlug);
publicV1Router.get('/courses', getPublicCourses);
publicV1Router.get('/courses/:id', getPublicCourseByIdOrSlug);

// ── 3. Events, Speakers & Gallery ────────────────────────────────────────────
publicV1Router.get('/events', getPublicEvents);
publicV1Router.get('/events/:slug', getPublicEventBySlug);
publicV1Router.get('/guest-speakers', getPublicGuestSpeakers);
publicV1Router.get('/gallery', getPublicGallery);

// ── 4. News & Press Releases ─────────────────────────────────────────────────
publicV1Router.get('/news', getPublicNewsBundle);
publicV1Router.get('/news/:id', getPublicNewsArticleBySlug);

// ── 5. IQAC, Facilities, Placements & Contact ────────────────────────────────
publicV1Router.get('/iqac', getPublicIQAC);
publicV1Router.get('/facilities', getPublicFacilities);
publicV1Router.get('/facilities/:id', getPublicFacilityById);
publicV1Router.get('/placements', getPublicPlacements);
publicV1Router.get('/contact', getPublicContactInfo);

// ── 6. Advertisements ────────────────────────────────────────────────────────
publicV1Router.get('/advertisements/active', getPublicActiveAdvertisement);
publicV1Router.get('/advertisements', getPublicActiveAdvertisement);

// ── 7. Dynamic Pages ────────────────────────────────────────────────────────
publicV1Router.get('/pages/:slug', getPublicPageBySlug);

// ── 8. Navigation Menus ─────────────────────────────────────────────────────
publicV1Router.get('/menus', getPublicNavigationMenus);

// ── 9. Media Library ────────────────────────────────────────────────────────
publicV1Router.get('/media', getPublicMedia);

// ── 10. Forms & Inquiries Engine ────────────────────────────────────────────
publicV1Router.get('/forms/:slug', getPublicFormBySlug);
publicV1Router.post(
  '/forms/:slug/submissions',
  strictRateLimit,
  validateBody(submitAnswersSchema),
  submitFormAnswers
);

export default publicV1Router;
