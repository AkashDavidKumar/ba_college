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
import { getPublicPageBySlug } from '../controllers/dynamic-page.controller';
import { getPublicNavigationMenus } from '../controllers/navigation-menu.controller';
import { getPublicMedia } from '../controllers/media-asset.controller';
import { getPublicFormBySlug, submitFormAnswers } from '../controllers/form.controller';
import {
  getPublicDirectory,
  getPublicFeatured,
  registerAlumni,
} from '../controllers/alumni.controller';
import {
  getPublicClubDirectory,
  getPublicClubBySlug,
  getPublicClubMembers,
  registerClubMembership,
  withdrawPublicDirectoryConsent,
} from '../controllers/club.controller';
import {
  getPublicNotices,
  getPublicPinnedNotices,
  getPublicNoticeCategories,
  getPublicNoticeBySlug,
} from '../controllers/notice.controller';
import { strictRateLimit } from '../middleware/rate-limit';
import { validateBody } from '../validations/auth.validation';
import {
  submitAnswersSchema,
  registerAlumniSchema,
  registerMembershipSchema,
  withdrawDirectoryConsentSchema,
} from '../validations';

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

// ── 6. Dynamic Pages ────────────────────────────────────────────────────────
publicRouter.get('/pages/:slug', getPublicPageBySlug);

// ── 7. Navigation Menus ─────────────────────────────────────────────────────
publicRouter.get('/menus', getPublicNavigationMenus);

// ── 8. Media Library ────────────────────────────────────────────────────────
publicRouter.get('/media', getPublicMedia);

// ── 9. Forms & Inquiries Engine ─────────────────────────────────────────────
publicRouter.get('/forms/:slug', getPublicFormBySlug);
publicRouter.post(
  '/forms/:slug/submissions',
  strictRateLimit,
  validateBody(submitAnswersSchema),
  submitFormAnswers
);

// ── 10. Alumni Directory & Registration ─────────────────────────────────────
publicRouter.get('/alumni/directory', getPublicDirectory);
publicRouter.get('/alumni/featured', getPublicFeatured);
publicRouter.post(
  '/alumni/register',
  strictRateLimit,
  validateBody(registerAlumniSchema),
  registerAlumni
);

// ── 11. Student Clubs & Activities ──────────────────────────────────────────
publicRouter.get('/clubs/directory', getPublicClubDirectory);
publicRouter.get('/clubs/:slug', getPublicClubBySlug);
publicRouter.get('/clubs/:slug/members', getPublicClubMembers);
publicRouter.post(
  '/clubs/:slug/memberships',
  strictRateLimit,
  validateBody(registerMembershipSchema),
  registerClubMembership
);
publicRouter.post(
  '/clubs/:slug/memberships/withdraw-consent',
  strictRateLimit,
  validateBody(withdrawDirectoryConsentSchema),
  withdrawPublicDirectoryConsent
);

// ── 12. Public Notices & Circulars ───────────────────────────────────────────
publicRouter.get('/notices', getPublicNotices);
publicRouter.get('/notices/pinned', getPublicPinnedNotices);
publicRouter.get('/notices/categories', getPublicNoticeCategories);
publicRouter.get('/notices/:slug', getPublicNoticeBySlug);

export default publicRouter;
