/**
 * admin.routes.ts — Protected Administrative Routes & Public Submission Endpoints
 *
 * Implements:
 *  1. Protected administrative mutation routes across all 12 college domains.
 *  2. Public submission routes for Admissions Applications and Contact Enquiries (anti-abuse rate-limited).
 *  3. Protected admissions and enquiry listing/review routes.
 *  4. Granular RBAC permissions and strict Zod payload validation.
 */
import { Router } from 'express';
import { requireAuth, requirePermissions, requireAnyPermission } from '../middleware/auth';
import { strictRateLimit } from '../middleware/rate-limit';
import { validateBody } from '../validations/auth.validation';
import * as adminController from '../controllers/admin.controller';
import * as adminCmsController from '../controllers/admin-cms.controller';
import {
  updateSiteContentSchema,
  updateAboutPageSchema,
  createDepartmentSchema,
  updateDepartmentSchema,
  createCourseSchema,
  updateCourseSchema,
  updateGallerySchema,
  createNewsArticleSchema,
  updateNewsArticleSchema,
  updateIQACDossierSchema,
  createFacilitySchema,
  updateFacilitySchema,
  updatePlacementSchema,
  updateContactInfoSchema,
  submitAdmissionsApplicationSchema,
  updateAdmissionsApplicationStatusSchema,
  submitContactEnquirySchema,
  updateContactEnquiryStatusSchema,
  createUserSchema,
  updateUserSchema,
  createApprovalSchema,
  reviewApprovalSchema,
  resubmitApprovalSchema,
} from '../validations';

export const adminRouter = Router();

// ── 1. Site Content Administration ──────────────────────────────────────────
adminRouter.put(
  '/content',
  requireAuth,
  requirePermissions('content:update'),
  validateBody(updateSiteContentSchema),
  adminController.updateSiteContent
);

// ── 2. About Page Administration ────────────────────────────────────────────
adminRouter.put(
  '/about',
  requireAuth,
  requirePermissions('about:update'),
  validateBody(updateAboutPageSchema),
  adminController.updateAboutPage
);

// ── 3. Academic Departments ──────────────────────────────────────────────────
adminRouter.post(
  '/departments',
  requireAuth,
  requirePermissions('departments:create'),
  validateBody(createDepartmentSchema),
  adminController.createDepartment
);

adminRouter.put(
  '/departments/:slug',
  requireAuth,
  requirePermissions('departments:update'),
  validateBody(updateDepartmentSchema),
  adminController.updateDepartment
);

adminRouter.put(
  '/departments',
  requireAuth,
  requirePermissions('departments:update'),
  validateBody(updateDepartmentSchema),
  adminController.updateDepartment
);

adminRouter.delete(
  '/departments/:slug',
  requireAuth,
  requirePermissions('departments:delete'),
  adminController.deleteDepartment
);

adminRouter.delete(
  '/departments',
  requireAuth,
  requirePermissions('departments:delete'),
  adminController.deleteDepartment
);

// ── 4. Courses & Degree Programmes ──────────────────────────────────────────
adminRouter.post(
  '/courses',
  requireAuth,
  requirePermissions('courses:create'),
  validateBody(createCourseSchema),
  adminController.createCourse
);

adminRouter.put(
  '/courses/:id',
  requireAuth,
  requirePermissions('courses:update'),
  validateBody(updateCourseSchema),
  adminController.updateCourse
);

adminRouter.delete(
  '/courses/:id',
  requireAuth,
  requirePermissions('courses:delete'),
  adminController.deleteCourse
);

// ── 5. Polymorphic Campus Events Bundle ──────────────────────────────────────
adminRouter.post(
  '/events',
  requireAuth,
  adminController.handlePolymorphicEventCreate
);

adminRouter.put(
  '/events',
  requireAuth,
  adminController.handlePolymorphicEventUpdate
);

adminRouter.put(
  '/events/:id',
  requireAuth,
  adminController.handlePolymorphicEventUpdate
);

adminRouter.delete(
  '/events',
  requireAuth,
  adminController.handlePolymorphicEventDelete
);

adminRouter.delete(
  '/events/:id',
  requireAuth,
  adminController.handlePolymorphicEventDelete
);

// Dedicated Guest Speakers Endpoints
adminRouter.post(
  '/guest-speakers',
  requireAuth,
  (req, res, next) => {
    req.body.type = 'speaker';
    adminController.handlePolymorphicEventCreate(req, res, next);
  }
);

adminRouter.put(
  '/guest-speakers/:id',
  requireAuth,
  (req, res, next) => {
    req.body.type = 'speaker';
    req.body.data = { ...(req.body.data || req.body), id: req.params.id };
    adminController.handlePolymorphicEventUpdate(req, res, next);
  }
);

adminRouter.delete(
  '/guest-speakers/:id',
  requireAuth,
  (req, res, next) => {
    req.query.type = 'speaker';
    req.query.id = req.params.id;
    adminController.handlePolymorphicEventDelete(req, res, next);
  }
);

// ── 6. Photo Gallery Archives ───────────────────────────────────────────────
adminRouter.put(
  '/gallery',
  requireAuth,
  requirePermissions('gallery:update'),
  validateBody(updateGallerySchema),
  adminController.updateGallery
);

// ── 7. News & Press Releases ────────────────────────────────────────────────
adminRouter.post(
  '/news',
  requireAuth,
  requirePermissions('news:create'),
  validateBody(createNewsArticleSchema),
  adminController.createNewsArticle
);

adminRouter.put(
  '/news/config',
  requireAuth,
  requirePermissions('news:update'),
  adminController.updateNewsConfig
);

adminRouter.put(
  '/news/:id',
  requireAuth,
  requirePermissions('news:update'),
  validateBody(updateNewsArticleSchema),
  adminController.updateNewsArticle
);

adminRouter.delete(
  '/news/:id',
  requireAuth,
  requirePermissions('news:delete'),
  adminController.deleteNewsArticle
);

// ── 8. IQAC Accreditation Dossier ───────────────────────────────────────────
adminRouter.put(
  '/iqac',
  requireAuth,
  requirePermissions('iqac:update'),
  validateBody(updateIQACDossierSchema),
  adminController.updateIQACDossier
);

adminRouter.put(
  '/iqac/section/:section',
  requireAuth,
  requirePermissions('iqac:update'),
  adminController.updateIQACSection
);

adminRouter.post(
  '/iqac/download/:section/:id',
  adminController.incrementIQACDownload
);

// ── 9. Campus Facilities ────────────────────────────────────────────────────
adminRouter.post(
  '/facilities',
  requireAuth,
  requirePermissions('facilities:create'),
  validateBody(createFacilitySchema),
  adminController.createFacility
);

adminRouter.put(
  '/facilities/:id',
  requireAuth,
  requirePermissions('facilities:update'),
  validateBody(updateFacilitySchema),
  adminController.updateFacility
);

adminRouter.delete(
  '/facilities/:id',
  requireAuth,
  requirePermissions('facilities:delete'),
  adminController.deleteFacility
);

// ── 10. Placements & Career Cell ────────────────────────────────────────────
adminRouter.put(
  '/placements',
  requireAuth,
  requirePermissions('placements:update'),
  validateBody(updatePlacementSchema),
  adminController.updatePlacements
);

// ── 11. Contact Info & Institutional Directory ──────────────────────────────
adminRouter.put(
  '/contact',
  requireAuth,
  requirePermissions('contact:update'),
  validateBody(updateContactInfoSchema),
  adminController.updateContactInfo
);

// ── 12. Admissions Application Administration ───────────────────────────────
// Public application submission (rate-limited)
adminRouter.post(
  '/admissions',
  strictRateLimit,
  validateBody(submitAdmissionsApplicationSchema),
  adminController.submitAdmissionsApplication
);

// Protected admissions review routes
adminRouter.get(
  '/admissions',
  requireAuth,
  requirePermissions('admissions:read'),
  adminController.listAdmissionsApplications
);

adminRouter.get(
  '/admissions/:id',
  requireAuth,
  requirePermissions('admissions:read'),
  adminController.getAdmissionsApplicationById
);

adminRouter.put(
  '/admissions',
  requireAuth,
  requirePermissions('admissions:update'),
  validateBody(updateAdmissionsApplicationStatusSchema),
  adminController.updateAdmissionsApplication
);

adminRouter.patch(
  '/admissions/:id/status',
  requireAuth,
  requirePermissions('admissions:update'),
  validateBody(updateAdmissionsApplicationStatusSchema),
  adminController.updateAdmissionsApplication
);

adminRouter.put(
  '/admissions/:id',
  requireAuth,
  requirePermissions('admissions:update'),
  validateBody(updateAdmissionsApplicationStatusSchema),
  adminController.updateAdmissionsApplication
);

// ── 13. Contact Enquiry Administration ──────────────────────────────────────
// Public contact enquiry submission (rate-limited)
adminRouter.post(
  '/contact/enquiries',
  strictRateLimit,
  validateBody(submitContactEnquirySchema),
  adminController.submitContactEnquiry
);

// Protected enquiry review routes
adminRouter.get(
  '/contact/enquiries',
  requireAuth,
  requirePermissions('enquiries:read'),
  adminController.listContactEnquiries
);

adminRouter.get(
  '/contact/enquiries/:id',
  requireAuth,
  requirePermissions('enquiries:read'),
  adminController.getContactEnquiryById
);

adminRouter.patch(
  '/contact/enquiries/:id/status',
  requireAuth,
  requirePermissions('enquiries:read'),
  validateBody(updateContactEnquiryStatusSchema),
  adminController.updateContactEnquiry
);

adminRouter.put(
  '/contact/enquiries/:id',
  requireAuth,
  requirePermissions('enquiries:read'),
  validateBody(updateContactEnquiryStatusSchema),
  adminController.updateContactEnquiry
);

// ── 14. Core Administration: User Management ───────────────────────────────
// List all administrative users
adminRouter.get(
  ['/admin/users', '/users'],
  requireAuth,
  requireAnyPermission('users:read', 'users:manage'),
  adminCmsController.listUsers
);

// Get single user by ID
adminRouter.get(
  ['/admin/users/:id', '/users/:id'],
  requireAuth,
  requireAnyPermission('users:read', 'users:manage'),
  adminCmsController.getUserById
);

// Create new user
adminRouter.post(
  ['/admin/users', '/users'],
  requireAuth,
  requirePermissions('users:manage'),
  validateBody(createUserSchema),
  adminCmsController.createUser
);

// Update user (safeguards against self-demotion, self-deactivation, and lockout of last admin)
adminRouter.put(
  ['/admin/users/:id', '/users/:id'],
  requireAuth,
  requirePermissions('users:manage'),
  validateBody(updateUserSchema),
  adminCmsController.updateUser
);

// Delete user (safeguards against self-deletion and deletion of last admin)
adminRouter.delete(
  ['/admin/users/:id', '/users/:id'],
  requireAuth,
  requirePermissions('users:manage'),
  adminCmsController.deleteUser
);

// ── 15. Core Administration: Persistent Audit Logs (Append-Only) ────────────
// Query audit log history (read-only; no update/delete routes exposed)
adminRouter.get(
  ['/admin/audit-logs', '/audit-logs'],
  requireAuth,
  requirePermissions('audit:read'),
  adminCmsController.listAuditLogs
);

// ── 16. Content Workflow Approvals ──────────────────────────────────────────
// List approvals (scoped by role for HOD & Club Head)
adminRouter.get(
  ['/admin/approvals', '/approvals'],
  requireAuth,
  requirePermissions('approvals:read'),
  adminCmsController.listApprovals
);

// Submit content for approval
adminRouter.post(
  ['/admin/approvals', '/approvals'],
  requireAuth,
  validateBody(createApprovalSchema),
  adminCmsController.submitApproval
);

// Review (approve or reject) content submission
adminRouter.put(
  ['/admin/approvals/:id', '/approvals/:id'],
  requireAuth,
  requirePermissions('approvals:review'),
  validateBody(reviewApprovalSchema),
  adminCmsController.reviewApproval
);

adminRouter.patch(
  ['/admin/approvals/:id', '/approvals/:id'],
  requireAuth,
  requirePermissions('approvals:review'),
  validateBody(reviewApprovalSchema),
  adminCmsController.reviewApproval
);

// Resubmit a previously rejected content submission
adminRouter.post(
  ['/admin/approvals/:id/resubmit', '/approvals/:id/resubmit'],
  requireAuth,
  validateBody(resubmitApprovalSchema),
  adminCmsController.resubmitApproval
);

export default adminRouter;
