/**
 * notice.controller.ts — Scoped Controllers for Notices Management System
 *
 * Implements:
 *  1. Full Administrative Governance (CRUD, scoped authoring, lifecycle management).
 *  2. Self-Approval Prohibition (authors cannot approve their own submissions).
 *  3. Scheduled Publication and Expiry Management.
 *  4. Immutable Audit Logging via logAdminAction.
 *  5. Public Notice Retrieval with strict publication gating and privacy projections.
 */
import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Notice, resolveNoticeDocument } from '../models/notice.model';
import { Approval } from '../models/approval.model';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from '../utils/audit-log';
import { assertNoticeScope } from '../middleware/scope-guard';

/**
 * Express 5 parameter resolution helper
 */
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || '';
  return param || '';
}

/**
 * Generates URL-safe lowercase slug from title
 */
function slugifyTitle(title: string): string {
  const clean = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return clean || `notice-${Date.now()}`;
}

/**
 * Ensures unique slug in collection
 */
async function generateUniqueSlug(title: string, currentId?: string): Promise<string> {
  const baseSlug = slugifyTitle(title);
  let candidate = baseSlug;
  let counter = 1;

  while (true) {
    const query: Record<string, unknown> = { slug: candidate };
    if (currentId && Types.ObjectId.isValid(currentId)) {
      query._id = { $ne: new Types.ObjectId(currentId) };
    }
    const existing = await Notice.findOne(query);
    if (!existing) {
      return candidate;
    }
    candidate = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. ADMINISTRATIVE CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /api/admin/notices & /api/v1/admin/notices
 * Creates a new Notice document with governance controls.
 */
export async function createAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const {
      title,
      slug: customSlug,
      content,
      summary,
      category,
      noticeType,
      priority,
      targetAudience,
      departmentId,
      status: requestedStatus,
      publishAt: rawPublishAt,
      expiresAt: rawExpiresAt,
      isPinned,
      attachmentUrl,
      attachmentName,
    } = req.body;

    // 1. Enforce department scope
    assertNoticeScope(user, departmentId);

    // 2. Generate unique slug
    let finalSlug: string;
    if (customSlug && customSlug.trim()) {
      const candidate = customSlug.toLowerCase().trim();
      const existing = await Notice.findOne({ slug: candidate });
      if (existing) {
        throw ApiError.conflict(`A notice with slug "${candidate}" already exists.`);
      }
      finalSlug = candidate;
    } else {
      finalSlug = await generateUniqueSlug(title);
    }

    // 3. Resolve publication dates
    const publishAt = rawPublishAt ? new Date(rawPublishAt) : new Date();
    const expiresAt = rawExpiresAt ? new Date(rawExpiresAt) : undefined;

    if (expiresAt && expiresAt <= publishAt) {
      throw ApiError.badRequest('Expiry date must be strictly after the publication date.');
    }

    // 4. Resolve initial status based on role and publication timing
    let resolvedStatus: string = requestedStatus || 'draft';
    const isGlobalAdmin = user.role === 'master_admin' || user.role === 'ADMIN' || user.role === 'sub_admin';

    if (resolvedStatus === 'published') {
      if (!isGlobalAdmin && !user.permissions?.includes('notices:publish')) {
        // Non-publishing authors must submit for approval
        resolvedStatus = 'pending';
      } else if (publishAt > new Date()) {
        resolvedStatus = 'scheduled';
      }
    } else if (resolvedStatus === 'scheduled' && publishAt <= new Date()) {
      resolvedStatus = 'published';
    }

    // 5. Create Notice document
    const notice = new Notice({
      title,
      slug: finalSlug,
      content,
      summary: summary || (content.length > 200 ? content.slice(0, 197) + '...' : content),
      category: category || 'General',
      noticeType: noticeType || 'Circular',
      priority: priority || 'Medium',
      targetAudience: targetAudience || 'All',
      departmentId: departmentId ? departmentId.toLowerCase().trim() : null,
      status: resolvedStatus,
      publishAt,
      expiresAt,
      isPinned: !!isPinned,
      attachmentUrl: attachmentUrl || null,
      attachmentName: attachmentName || null,
      author: {
        userId: new Types.ObjectId(user.id),
        name: user.name || 'Administrative Staff',
        role: user.role,
        departmentId: user.departmentId || undefined,
      },
      viewsCount: 0,
    });

    await notice.save();

    // 6. If submitted as pending, sync with Approval model
    if (resolvedStatus === 'pending') {
      await Approval.create({
        entityType: 'notice',
        entityId: String(notice._id),
        title: notice.title,
        departmentId: notice.departmentId || undefined,
        authorId: String(user.id),
        authorName: user.name || 'Administrative Staff',
        authorRole: user.role,
        status: 'pending',
        submittedAt: new Date(),
        previewData: {
          slug: notice.slug,
          category: notice.category,
          priority: notice.priority,
          targetAudience: notice.targetAudience,
        },
      });
    }

    // 7. Audit log
    logAdminAction(req, {
      action: 'CREATE',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: notice.title,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Notice created successfully.',
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/notices & /api/v1/admin/notices
 * Lists administrative notices with pagination and multidimensional filters.
 */
export async function listAdminNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const {
      page: rawPage = 1,
      limit: rawLimit = 20,
      search,
      category,
      priority,
      status,
      departmentId,
      targetAudience,
    } = req.query;

    const page = Math.max(1, parseInt(String(rawPage), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(rawLimit), 10) || 20));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    // Scope check: If HOD or staff without global privileges, filter by their department unless explicitly requesting
    if ((user.role === 'hod' || user.role === 'staff') && user.departmentId) {
      if (departmentId && departmentId !== user.departmentId) {
        throw ApiError.forbidden(
          `You are only authorized to view notices for your department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      filter.$or = [{ departmentId: user.departmentId.toLowerCase().trim() }, { departmentId: null }];
    } else if (departmentId && departmentId !== 'all') {
      filter.departmentId = String(departmentId).toLowerCase().trim();
    }

    if (category && category !== 'all') {
      filter.category = category;
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (targetAudience && targetAudience !== 'all') {
      filter.targetAudience = targetAudience;
    }

    if (search && String(search).trim()) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filter.$or = [{ title: searchRegex }, { summary: searchRegex }, { content: searchRegex }];
    }

    const [notices, total] = await Promise.all([
      Notice.find(filter)
        .sort({ isPinned: -1, publishAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: notices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/notices/metrics & /api/v1/admin/notices/metrics
 * Returns aggregate metrics for admin dashboard.
 */
export async function getAdminNoticeMetrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const baseFilter: Record<string, unknown> = {};
    if ((user.role === 'hod' || user.role === 'staff') && user.departmentId) {
      baseFilter.$or = [{ departmentId: user.departmentId.toLowerCase().trim() }, { departmentId: null }];
    }

    const [total, draft, pending, approved, scheduled, published, rejected, expired, archived] = await Promise.all([
      Notice.countDocuments(baseFilter),
      Notice.countDocuments({ ...baseFilter, status: 'draft' }),
      Notice.countDocuments({ ...baseFilter, status: 'pending' }),
      Notice.countDocuments({ ...baseFilter, status: 'approved' }),
      Notice.countDocuments({ ...baseFilter, status: 'scheduled' }),
      Notice.countDocuments({ ...baseFilter, status: 'published' }),
      Notice.countDocuments({ ...baseFilter, status: 'rejected' }),
      Notice.countDocuments({ ...baseFilter, status: 'expired' }),
      Notice.countDocuments({ ...baseFilter, status: 'archived' }),
    ]);

    res.status(200).json({
      success: true,
      metrics: {
        total,
        draft,
        pending,
        approved,
        scheduled,
        published,
        rejected,
        expired,
        archived,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/notices/:id & /api/v1/admin/notices/:id
 * Retrieves full details for a single notice by ID or slug.
 */
export async function getAdminNoticeById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    res.status(200).json({
      success: true,
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/notices/:id & /api/v1/admin/notices/:id
 * Full update for a notice. Enforces department scoping and transition validity.
 */
export async function updateAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    // 1. Enforce scope on existing notice
    assertNoticeScope(user, notice.departmentId);

    const {
      title,
      content,
      summary,
      category,
      noticeType,
      priority,
      targetAudience,
      departmentId,
      status: requestedStatus,
      publishAt: rawPublishAt,
      expiresAt: rawExpiresAt,
      isPinned,
      attachmentUrl,
      attachmentName,
    } = req.body;

    // 2. Enforce scope if updating target department
    if (departmentId !== undefined) {
      assertNoticeScope(user, departmentId);
      notice.departmentId = departmentId ? departmentId.toLowerCase().trim() : null;
    }

    if (title && title.trim()) {
      notice.title = title.trim();
    }
    if (content && content.trim()) {
      notice.content = content.trim();
      notice.summary = summary || (notice.content.length > 200 ? notice.content.slice(0, 197) + '...' : notice.content);
    }
    if (summary !== undefined) {
      notice.summary = summary ? summary.trim() : undefined;
    }
    if (category) notice.category = category;
    if (noticeType) notice.noticeType = noticeType;
    if (priority) notice.priority = priority;
    if (targetAudience) notice.targetAudience = targetAudience;
    if (isPinned !== undefined) notice.isPinned = !!isPinned;
    if (attachmentUrl !== undefined) notice.attachmentUrl = attachmentUrl || null;
    if (attachmentName !== undefined) notice.attachmentName = attachmentName || null;

    if (rawPublishAt) notice.publishAt = new Date(rawPublishAt);
    if (rawExpiresAt !== undefined) {
      notice.expiresAt = rawExpiresAt ? new Date(rawExpiresAt) : undefined;
    }

    if (notice.expiresAt && notice.expiresAt <= notice.publishAt) {
      throw ApiError.badRequest('Expiry date must be strictly after the publication date.');
    }

    // 3. Handle status change if requested
    if (requestedStatus && requestedStatus !== notice.status) {
      const isGlobalAdmin = user.role === 'master_admin' || user.role === 'ADMIN' || user.role === 'sub_admin';

      if (requestedStatus === 'published') {
        if (!isGlobalAdmin && !user.permissions?.includes('notices:publish')) {
          notice.status = 'pending';
        } else if (notice.publishAt > new Date()) {
          notice.status = 'scheduled';
        } else {
          notice.status = 'published';
        }
      } else if (requestedStatus === 'scheduled') {
        notice.status = notice.publishAt <= new Date() ? 'published' : 'scheduled';
      } else {
        notice.status = requestedStatus;
      }
    }

    await notice.save();

    // 4. Audit log
    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: notice.title,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/notices/:id & /api/v1/admin/notices/:id
 * Partial update for quick toggles (pin, priority).
 */
export async function patchAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    assertNoticeScope(user, notice.departmentId);

    const { isPinned, priority } = req.body;

    if (isPinned !== undefined) {
      notice.isPinned = !!isPinned;
    }
    if (priority) {
      notice.priority = priority;
    }

    await notice.save();

    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: notice.title,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/notices/:id/submit & /api/v1/admin/notices/:id/submit
 * Submits a draft or rejected notice for review.
 */
export async function submitAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    assertNoticeScope(user, notice.departmentId);

    if (notice.status !== 'draft' && notice.status !== 'rejected') {
      throw ApiError.badRequest(
        `Notice in "${notice.status}" state cannot be submitted for review. Only draft or rejected notices can be submitted.`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    notice.status = 'pending';
    notice.rejectionReason = undefined;
    await notice.save();

    // Create or update Approval record
    await Approval.findOneAndUpdate(
      { entityType: 'notice', entityId: String(notice._id) },
      {
        entityType: 'notice',
        entityId: String(notice._id),
        title: notice.title,
        departmentId: notice.departmentId || undefined,
        authorId: String(notice.author.userId),
        authorName: notice.author.name,
        authorRole: notice.author.role,
        status: 'pending',
        submittedAt: new Date(),
        rejectionReason: undefined,
        previewData: {
          slug: notice.slug,
          category: notice.category,
          priority: notice.priority,
          targetAudience: notice.targetAudience,
        },
      },
      { upsert: true, new: true }
    );

    logAdminAction(req, {
      action: 'SUBMIT',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: notice.title,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Notice submitted for review successfully.',
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/notices/:id/review & /api/v1/admin/notices/:id/review
 * Approves or rejects a notice. Enforces strict self-approval prohibition.
 */
export async function reviewAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    // 1. Notice must be in pending status
    if (notice.status !== 'pending') {
      throw ApiError.badRequest(
        `Notice is in "${notice.status}" status and cannot be reviewed. Only pending notices can be reviewed.`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // 2. Strict self-approval prevention
    if (String(notice.author.userId) === String(user.id)) {
      throw ApiError.forbidden(
        'Self-approval is strictly prohibited. An author cannot approve or review their own submission.',
        'SELF_APPROVAL_PROHIBITED'
      );
    }

    // 3. Department scope verification for departmental reviewers
    if (user.role === 'hod') {
      if (
        !notice.departmentId ||
        notice.departmentId.toLowerCase().trim() !== user.departmentId?.toLowerCase().trim()
      ) {
        throw ApiError.forbidden(
          'You are only authorized to review notice approval requests within your assigned department.',
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
    }

    const action =
      req.body.action ||
      (req.path.endsWith('/approve') ? 'approve' : req.path.endsWith('/reject') ? 'reject' : undefined);
    const rejectionReason = req.body.rejectionReason;

    if (action === 'approve') {
      notice.status = 'approved';
      notice.rejectionReason = undefined;
      notice.reviewer = {
        userId: new Types.ObjectId(user.id),
        name: user.name || 'Reviewer',
        role: user.role,
        reviewedAt: new Date(),
      };
    } else if (action === 'reject') {
      if (!rejectionReason || rejectionReason.trim().length < 5) {
        throw ApiError.badRequest('A rejection reason of at least 5 characters is required.');
      }
      notice.status = 'rejected';
      notice.rejectionReason = rejectionReason.trim();
      notice.reviewer = {
        userId: new Types.ObjectId(user.id),
        name: user.name || 'Reviewer',
        role: user.role,
        reviewedAt: new Date(),
      };
    } else {
      throw ApiError.badRequest('Invalid review action. Allowed actions are "approve" or "reject".');
    }

    await notice.save();

    // Synchronize Approval model
    await Approval.findOneAndUpdate(
      { entityType: 'notice', entityId: String(notice._id), status: 'pending' },
      {
        status: action === 'approve' ? 'approved' : 'rejected',
        reviewedAt: new Date(),
        reviewerId: user.id,
        reviewerName: user.name || user.email,
        rejectionReason: action === 'reject' ? rejectionReason : undefined,
      }
    );

    logAdminAction(req, {
      action: action === 'approve' ? 'APPROVE' : 'REJECT',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: `${action === 'approve' ? 'Approved' : 'Rejected'}: ${notice.title}`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: `Notice ${action === 'approve' ? 'approved' : 'rejected'} successfully.`,
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/notices/:id/publish & /api/v1/admin/notices/:id/publish
 * Publishes or schedules an approved or draft notice.
 */
export async function publishAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    assertNoticeScope(user, notice.departmentId);

    const isGlobalAdmin = user.role === 'master_admin' || user.role === 'ADMIN' || user.role === 'sub_admin';
    const hasPublishPerm = user.permissions?.includes('notices:publish') || isGlobalAdmin;

    if (!hasPublishPerm) {
      throw ApiError.forbidden(
        'You do not have permission to publish notices. Please submit for approval instead.',
        'FORBIDDEN_PERMISSION'
      );
    }

    const { publishAt: rawPublishAt, expiresAt: rawExpiresAt } = req.body;

    if (rawPublishAt) {
      notice.publishAt = new Date(rawPublishAt);
    }
    if (rawExpiresAt !== undefined) {
      notice.expiresAt = rawExpiresAt ? new Date(rawExpiresAt) : undefined;
    }

    if (notice.expiresAt && notice.expiresAt <= notice.publishAt) {
      throw ApiError.badRequest('Expiry date must be strictly after the publication date.');
    }

    // Gating check
    if (notice.publishAt > new Date()) {
      notice.status = 'scheduled';
    } else {
      notice.status = 'published';
    }

    await notice.save();

    logAdminAction(req, {
      action: notice.status === 'scheduled' ? 'SCHEDULE' : 'PUBLISH',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: notice.title,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: `Notice ${notice.status === 'scheduled' ? 'scheduled' : 'published'} successfully.`,
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/notices/:id/archive & /api/v1/admin/notices/:id/archive
 * Transitions notice to archived state.
 */
export async function archiveAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    assertNoticeScope(user, notice.departmentId);

    notice.status = 'archived';
    await notice.save();

    logAdminAction(req, {
      action: 'ARCHIVE',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: notice.title,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Notice archived successfully.',
      notice,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/notices/:id & /api/v1/admin/notices/:id
 * Deletes or archives a notice.
 */
export async function deleteAdminNotice(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    if (!user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const id = getParam(req.params.id);
    const notice = await resolveNoticeDocument(id);

    assertNoticeScope(user, notice.departmentId);

    const isGlobalAdmin = user.role === 'master_admin' || user.role === 'ADMIN' || user.role === 'sub_admin';

    // If draft, author or admin can delete
    if (notice.status === 'draft') {
      await Notice.findByIdAndDelete(notice._id);
    } else if (isGlobalAdmin) {
      // Global admin can delete permanently
      await Notice.findByIdAndDelete(notice._id);
    } else {
      // Scoped users can only transition to archived
      notice.status = 'archived';
      await notice.save();
    }

    logAdminAction(req, {
      action: 'DELETE',
      module: 'Notices',
      recordId: String(notice._id),
      recordTitle: notice.title,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Notice deleted or archived successfully.',
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. PUBLIC CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Public notice projection filter ensuring zero leaks of administrative metadata.
 */
const PUBLIC_NOTICE_PROJECTION = {
  _id: 1,
  title: 1,
  slug: 1,
  content: 1,
  summary: 1,
  category: 1,
  noticeType: 1,
  priority: 1,
  targetAudience: 1,
  departmentId: 1,
  publishAt: 1,
  expiresAt: 1,
  isPinned: 1,
  attachmentUrl: 1,
  attachmentName: 1,
  viewsCount: 1,
  createdAt: 1,
  updatedAt: 1,
  'author.name': 1,
  'author.role': 1,
};

/**
 * Shared publication and expiry gating filter for all public notice endpoints.
 * Automatically surfaces notices with status 'published' or 'scheduled' once publishAt <= now.
 * Excludes drafts, pending, rejected, and archived notices.
 * Excludes expired notices (expiresAt <= now).
 */
function getPublicNoticeBaseFilter(): Record<string, unknown> {
  const now = new Date();
  return {
    status: { $in: ['published', 'scheduled'] },
    publishAt: { $lte: now },
    $or: [{ expiresAt: { $exists: false } }, { expiresAt: null }, { expiresAt: { $gt: now } }],
  };
}

/**
 * GET /api/notices & /api/v1/notices
 * Retrieves active published notices for public college website.
 */
export async function getPublicNotices(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      page: rawPage = 1,
      limit: rawLimit = 10,
      search,
      category,
      departmentId,
      targetAudience,
    } = req.query;

    const page = Math.max(1, parseInt(String(rawPage), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(rawLimit), 10) || 10));
    const skip = (page - 1) * limit;

    // Strict publication and expiry gating (surfaces published and scheduled-due notices)
    const filter: Record<string, unknown> = {
      ...getPublicNoticeBaseFilter(),
    };

    if (category && category !== 'all' && category !== 'All') {
      filter.category = String(category).trim();
    }

    if (departmentId && departmentId !== 'all' && departmentId !== 'All') {
      filter.departmentId = String(departmentId).toLowerCase().trim();
    }

    if (targetAudience && targetAudience !== 'all' && targetAudience !== 'All') {
      filter.targetAudience = { $in: [String(targetAudience).trim(), 'All'] };
    }

    if (search && String(search).trim()) {
      const searchRegex = new RegExp(String(search).trim(), 'i');
      filter.$and = [
        {
          $or: [{ title: searchRegex }, { summary: searchRegex }, { content: searchRegex }],
        },
      ];
    }

    const [rawNotices, total] = await Promise.all([
      Notice.find(filter, PUBLIC_NOTICE_PROJECTION)
        .sort({ isPinned: -1, publishAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Notice.countDocuments(filter),
    ]);

    const notices = rawNotices.map((n) => ({
      id: String(n._id),
      ...n,
    }));

    res.status(200).json({
      success: true,
      data: notices,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notices/pinned & /api/v1/notices/pinned
 * Retrieves pinned and high-priority notices for flash announcements.
 */
export async function getPublicPinnedNotices(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filter = {
      ...getPublicNoticeBaseFilter(),
      $and: [{ $or: [{ isPinned: true }, { priority: 'High' }] }],
    };

    const rawPinned = await Notice.find(filter, PUBLIC_NOTICE_PROJECTION)
      .sort({ isPinned: -1, priority: 1, publishAt: -1 })
      .limit(5)
      .lean();

    const pinned = rawPinned.map((n) => ({
      id: String(n._id),
      ...n,
    }));

    res.status(200).json({
      success: true,
      data: pinned,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notices/categories & /api/v1/notices/categories
 * Retrieves category counts for active published notices.
 */
export async function getPublicNoticeCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const match = getPublicNoticeBaseFilter();

    const aggregated = await Notice.aggregate([
      { $match: match },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    const categories = aggregated.map((item) => ({
      category: item._id,
      count: item.count,
    }));

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/notices/:slug & /api/v1/notices/:slug
 * Retrieves a single published notice by slug or ID with atomic view increment.
 */
export async function getPublicNoticeBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const slugOrId = getParam(req.params.slug);

    const isObjectId = /^[0-9a-fA-F]{24}$/.test(slugOrId);
    const identifierFilter = isObjectId
      ? { _id: new Types.ObjectId(slugOrId) }
      : { slug: slugOrId.toLowerCase().trim() };

    const filter = {
      ...identifierFilter,
      ...getPublicNoticeBaseFilter(),
    };

    const notice = await Notice.findOneAndUpdate(
      filter,
      { $inc: { viewsCount: 1 } },
      { new: true, projection: PUBLIC_NOTICE_PROJECTION }
    ).lean();

    if (!notice) {
      throw ApiError.notFound(`Notice "${slugOrId}" not found or is not available for public view.`);
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(notice._id),
        ...notice,
      },
    });
  } catch (err) {
    next(err);
  }
}
