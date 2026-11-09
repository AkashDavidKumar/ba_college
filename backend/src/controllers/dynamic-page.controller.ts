/**
 * dynamic-page.controller.ts — Dynamic Page Builder Controller
 *
 * Implements:
 *  1. Admin CRUD endpoints for dynamic pages with block-based layouts.
 *  2. Public read-only endpoint returning strictly published pages.
 *  3. Granular RBAC and direct publication permissions (pages:publish).
 *  4. Scope guards for Department Heads (HOD) and Club Heads.
 *  5. Automated submission to Phase 4A Approvals when published without direct publish permission.
 *  6. Centralized persistent audit logging for all mutations.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { DynamicPage, IDynamicPageDocument } from '../models/dynamic-page.model';
import { Approval } from '../models/approval.model';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from '../utils/audit-log';
import logger from '../utils/logger';

/**
 * Checks whether the authenticated actor is authorized to directly publish pages
 * without requiring intermediate editorial approval.
 */
function canPublishDirectly(user?: { role?: string; permissions?: string[] }): boolean {
  if (!user) return false;
  if (user.role === 'master_admin' || user.role === 'ADMIN' || user.role === 'sub_admin') {
    return true;
  }
  const perms = user.permissions || [];
  return (
    perms.includes('*') ||
    perms.includes('all') ||
    perms.includes('pages:publish') ||
    perms.includes('pages:manage')
  );
}

/**
 * GET /api/admin/pages & /api/pages (Protected Admin Listing)
 */
export async function listAdminPages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const { status, departmentId, clubId, pageType, search, limit: rawLimit, page: rawPage } = req.query;

    const pageNum = Math.max(1, parseInt(rawPage as string, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(rawLimit as string, 10) || 20));
    const skip = (pageNum - 1) * limitNum;

    const filter: FilterQuery<IDynamicPageDocument> = {};

    // ── Scope Enforcement ──
    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (departmentId && (departmentId as string).toLowerCase().trim() !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only access pages for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      filter.departmentId = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (clubId && (clubId as string).toLowerCase().trim() !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only access pages for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      filter.clubId = userClub;
    } else {
      // Unscoped admin / editor filters
      if (departmentId) {
        filter.departmentId = (departmentId as string).toLowerCase().trim();
      }
      if (clubId) {
        filter.clubId = (clubId as string).toLowerCase().trim();
      }
    }

    if (status) {
      filter.status = status as string;
    }
    if (pageType) {
      filter.pageType = pageType as string;
    }
    if (search && typeof search === 'string') {
      const term = search.trim();
      filter.$or = [
        { title: { $regex: term, $options: 'i' } },
        { slug: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } },
      ];
    }

    const [pages, total] = await Promise.all([
      DynamicPage.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limitNum).lean(),
      DynamicPage.countDocuments(filter),
    ]);

    const formatted = pages.map((p) => ({
      id: String(p._id),
      _id: p._id,
      title: p.title,
      slug: p.slug,
      parentMenuId: p.parentMenuId,
      pageType: p.pageType,
      description: p.description,
      bannerImage: p.bannerImage,
      blocks: p.blocks,
      seo: p.seo,
      status: p.status,
      departmentId: p.departmentId,
      clubId: p.clubId,
      authorId: p.authorId,
      authorName: p.authorName,
      createdBy: p.createdBy,
      updatedBy: p.updatedBy,
      version: p.version,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/pages/:id & /api/pages/:id (Protected Admin Retrieval)
 */
export async function getAdminPageById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { slug: id.toLowerCase().trim() }] } : { slug: id.toLowerCase().trim() };

    const page = await DynamicPage.findOne(query).lean();
    if (!page) {
      throw new ApiError(404, `Dynamic page with identifier '${id}' not found.`, 'PAGE_NOT_FOUND');
    }

    // Scope check
    if (user?.role === 'hod' && page.departmentId && page.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view pages belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && page.clubId && page.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view pages belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(page._id),
        ...page,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/pages & /api/pages (Protected Admin Creation)
 */
export async function createDynamicPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const {
      title,
      slug,
      parentMenuId,
      pageType,
      description,
      bannerImage,
      blocks,
      seo,
      status: requestedStatus,
      departmentId: declaredDept,
      clubId: declaredClub,
    } = req.body;

    const normalizedSlug = slug.toLowerCase().trim();

    // 1. Slug uniqueness validation
    const existing = await DynamicPage.findOne({ slug: normalizedSlug }).lean();
    if (existing) {
      throw ApiError.conflict(
        `A page with the URL slug '/${normalizedSlug}' already exists. Please choose a unique slug.`
      );
    }

    // 2. Department & Club Scope Enforcement
    let resolvedDept = declaredDept ? declaredDept.toLowerCase().trim() : undefined;
    let resolvedClub = declaredClub ? declaredClub.toLowerCase().trim() : undefined;

    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (resolvedDept && resolvedDept !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only create pages for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      resolvedDept = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (resolvedClub && resolvedClub !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only create pages for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      resolvedClub = userClub;
    }

    // 3. Status and Publishing Permission Validation
    let finalStatus = requestedStatus || 'draft';
    const hasPublishPermission = canPublishDirectly(user);

    if (finalStatus === 'published' && !hasPublishPermission) {
      // Non-publisher attempting direct publication is automatically routed through approval workflow
      finalStatus = 'submitted';
    }

    // 4. Persistence
    const newPage = await DynamicPage.create({
      title: title.trim(),
      slug: normalizedSlug,
      parentMenuId,
      pageType: pageType || 'standard',
      description: description ? description.trim() : '',
      bannerImage: bannerImage || '',
      blocks: blocks || [],
      seo: seo || {},
      status: finalStatus,
      departmentId: resolvedDept,
      clubId: resolvedClub,
      authorId: user?.id,
      authorName: user?.name,
      createdBy: user?.id,
      updatedBy: user?.id,
      version: 1,
    });

    // 5. Automated Approval Submission if routed through review
    if (finalStatus === 'submitted' || finalStatus === 'pending') {
      try {
        await Approval.create({
          entityType: 'page',
          entityId: String(newPage._id),
          title: newPage.title,
          departmentId: newPage.departmentId,
          clubId: newPage.clubId,
          authorId: user?.id || 'unknown',
          authorName: user?.name || 'Anonymous',
          authorRole: user?.role || 'staff',
          status: 'pending',
          submittedAt: new Date(),
          previewData: {
            slug: newPage.slug,
            pageType: newPage.pageType,
            description: newPage.description,
          },
        });
      } catch (err: unknown) {
        // Log failure non-critically; page creation itself succeeded
        logger.error('[DynamicPage] Failed to create approval record', { error: (err as Error)?.message });
      }
    }

    // 6. Audit Logging
    logAdminAction(req, {
      action: 'CREATE',
      module: 'Page Builder',
      recordId: String(newPage._id),
      recordTitle: `Created dynamic page: "${newPage.title}" (/${newPage.slug}) [status: ${newPage.status}]`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message:
        finalStatus === 'submitted'
          ? 'Page created and submitted for administrative approval.'
          : 'Dynamic page created successfully.',
      data: newPage,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/pages/:id & /api/pages/:id (Protected Admin Update)
 */
export async function updateDynamicPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { slug: id.toLowerCase().trim() }] } : { slug: id.toLowerCase().trim() };

    const page = await DynamicPage.findOne(query);
    if (!page) {
      throw new ApiError(404, `Dynamic page with identifier '${id}' not found.`, 'PAGE_NOT_FOUND');
    }

    // 1. Scope boundary verification
    if (user?.role === 'hod' && page.departmentId && page.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot update pages belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && page.clubId && page.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot update pages belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    const {
      title,
      slug,
      parentMenuId,
      pageType,
      description,
      bannerImage,
      blocks,
      seo,
      status: requestedStatus,
      departmentId: declaredDept,
      clubId: declaredClub,
    } = req.body;

    // 2. Slug conflict check if changing slug
    if (slug) {
      const normalizedSlug = slug.toLowerCase().trim();
      if (normalizedSlug !== page.slug) {
        const slugConflict = await DynamicPage.findOne({
          slug: normalizedSlug,
          _id: { $ne: page._id },
        }).lean();
        if (slugConflict) {
          throw ApiError.conflict(
            `A page with the URL slug '/${normalizedSlug}' already exists. Please choose a unique slug.`
          );
        }
        page.slug = normalizedSlug;
      }
    }

    // 3. Department & Club Scope Guard on update
    if (declaredDept !== undefined) {
      const normalizedDept = declaredDept ? declaredDept.toLowerCase().trim() : undefined;
      if (user?.role === 'hod' && normalizedDept !== user.departmentId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only assign pages to your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      page.departmentId = normalizedDept;
    }

    if (declaredClub !== undefined) {
      const normalizedClub = declaredClub ? declaredClub.toLowerCase().trim() : undefined;
      if (user?.role === 'club_head' && normalizedClub !== user.clubId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only assign pages to your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      page.clubId = normalizedClub;
    }

    // 4. Status transition and permission enforcement
    if (requestedStatus) {
      if (requestedStatus === 'published' && !canPublishDirectly(user)) {
        page.status = 'submitted';
        // Create/update approval record
        try {
          await Approval.create({
            entityType: 'page',
            entityId: String(page._id),
            title: title ? title.trim() : page.title,
            departmentId: page.departmentId,
            clubId: page.clubId,
            authorId: user?.id || 'unknown',
            authorName: user?.name || 'Anonymous',
            authorRole: user?.role || 'staff',
            status: 'pending',
            submittedAt: new Date(),
            previewData: {
              slug: page.slug,
              pageType: page.pageType,
            },
          });
        } catch {
          // Non-critical
        }
      } else {
        page.status = requestedStatus;
      }
    }

    // 5. Update content fields
    if (title !== undefined) page.title = title.trim();
    if (parentMenuId !== undefined) page.parentMenuId = parentMenuId || undefined;
    if (pageType !== undefined) page.pageType = pageType;
    if (description !== undefined) page.description = description.trim();
    if (bannerImage !== undefined) page.bannerImage = bannerImage || '';
    if (blocks !== undefined) page.blocks = blocks;
    if (seo !== undefined) page.seo = { ...page.seo, ...seo };

    page.version += 1;
    page.updatedBy = user?.id;

    await page.save();

    // 6. Audit Logging
    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Page Builder',
      recordId: String(page._id),
      recordTitle: `Updated dynamic page: "${page.title}" (/${page.slug}) [status: ${page.status}, v${page.version}]`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Dynamic page updated successfully.',
      data: page,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/pages/:id & /api/pages/:id (Protected Admin Deletion / Archival)
 */
export async function deleteDynamicPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');
    const { archive } = req.query;

    const isObjectId = mongoose.Types.ObjectId.isValid(id);
    const query = isObjectId ? { $or: [{ _id: id }, { slug: id.toLowerCase().trim() }] } : { slug: id.toLowerCase().trim() };

    const page = await DynamicPage.findOne(query);
    if (!page) {
      throw new ApiError(404, `Dynamic page with identifier '${id}' not found.`, 'PAGE_NOT_FOUND');
    }

    // Scope check
    if (user?.role === 'hod' && page.departmentId && page.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot delete pages belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && page.clubId && page.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot delete pages belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    if (archive === 'true') {
      page.status = 'archived';
      page.updatedBy = user?.id;
      await page.save();

      logAdminAction(req, {
        action: 'UPDATE',
        module: 'Page Builder',
        recordId: String(page._id),
        recordTitle: `Archived dynamic page: "${page.title}" (/${page.slug})`,
        status: 'SUCCESS',
      });

      res.status(200).json({
        success: true,
        message: 'Dynamic page successfully archived.',
      });
      return;
    }

    await DynamicPage.findByIdAndDelete(page._id);

    logAdminAction(req, {
      action: 'DELETE',
      module: 'Page Builder',
      recordId: String(page._id),
      recordTitle: `Deleted dynamic page: "${page.title}" (/${page.slug})`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Dynamic page deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/pages/:slug & /api/v1/pages/:slug (Public Read-Only)
 *
 * Strictly returns ONLY published pages. Draft, submitted, pending, or archived pages return 404.
 */
export async function getPublicPageBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawSlug = req.params.slug;
    const slug = Array.isArray(rawSlug) ? rawSlug[0] : String(rawSlug || '');
    const normalizedSlug = slug.toLowerCase().trim();

    const page = await DynamicPage.findOne({
      slug: normalizedSlug,
      status: 'published',
    }).lean();

    if (!page) {
      throw new ApiError(404, `Page '/${normalizedSlug}' was not found or is not currently published.`, 'PAGE_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(page._id),
        title: page.title,
        slug: page.slug,
        parentMenuId: page.parentMenuId,
        pageType: page.pageType,
        description: page.description,
        bannerImage: page.bannerImage,
        blocks: page.blocks.filter((b) => b.visible !== false),
        seo: page.seo,
        departmentId: page.departmentId,
        clubId: page.clubId,
        createdAt: page.createdAt,
        updatedAt: page.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}
