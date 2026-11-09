/**
 * media-asset.controller.ts — Media Library Controller (Metadata & External URL Management Only)
 *
 * Implements:
 *  1. Admin CRUD endpoints for media assets (images, videos, documents, audio, other).
 *  2. Search, folder/category filtering, mediaType filtering, and pagination.
 *  3. Reference Protection: verifies whether a media asset URL is currently embedded
 *     in DynamicPage banner images or content blocks before allowing deletion (409 Conflict / soft-archive).
 *  4. Public read-only endpoint returning sanitized active assets with internal fields stripped.
 *  5. Strict RBAC and resource scoping guards for HOD (departmentId) and Club Head (clubId).
 *  6. Persistent audit logging for all mutations.
 *
 * Strictly Prohibited & Enforced:
 *  - ZERO file uploads, multipart parsing, or filesystem writes.
 *  - ZERO binary or base64 storage.
 *  - ZERO backend remote URL fetching or proxying.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { MediaAsset, IMediaAsset, IMediaAssetDocument } from '../models/media-asset.model';
import { DynamicPage } from '../models/dynamic-page.model';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from '../utils/audit-log';

/**
 * Checks if a given media URL is referenced in any dynamic page
 * (bannerImage or content blocks).
 */
async function findReferencingPages(mediaUrl: string): Promise<Array<{ id: string; title: string; slug: string }>> {
  if (!mediaUrl || mediaUrl.trim() === '') return [];
  const trimmedUrl = mediaUrl.trim();

  const pages = await DynamicPage.find({
    $or: [
      { bannerImage: trimmedUrl },
      { 'seo.ogImage': trimmedUrl },
      { 'blocks.content.url': trimmedUrl },
      { 'blocks.content.src': trimmedUrl },
      { 'blocks.content.fileUrl': trimmedUrl },
      { 'blocks.content.videoUrl': trimmedUrl },
      { 'blocks.content.poster': trimmedUrl },
      { 'blocks.content.backgroundImage': trimmedUrl },
      { 'blocks.content.images.url': trimmedUrl },
      { 'blocks.content.images.src': trimmedUrl },
      { 'blocks.content.items.url': trimmedUrl },
      { 'blocks.content.items.fileUrl': trimmedUrl },
      { 'blocks.content.items.imageUrl': trimmedUrl },
      { 'blocks.content.cards.imageUrl': trimmedUrl },
      { 'blocks.content.cards.image': trimmedUrl },
      { 'blocks.content.documents.url': trimmedUrl },
      { 'blocks.content.documents.fileUrl': trimmedUrl },
    ],
  })
    .select('_id title slug')
    .lean();

  return pages.map((p) => ({
    id: String(p._id),
    title: p.title,
    slug: p.slug,
  }));
}

/**
 * GET /api/admin/media (Protected Admin Listing)
 */
export async function listAdminMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const {
      search,
      mediaType,
      folder,
      status,
      departmentId,
      clubId,
      sort = 'createdAt:desc',
      page = 1,
      limit = 50,
    } = req.query as {
      search?: string;
      mediaType?: string;
      folder?: string;
      status?: string;
      departmentId?: string;
      clubId?: string;
      sort?: string;
      page?: number;
      limit?: number;
    };

    const filter: FilterQuery<IMediaAssetDocument> = {};

    // 1. Scoping Enforcement
    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (departmentId && departmentId.toLowerCase().trim() !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only query media for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      filter.departmentId = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (clubId && clubId.toLowerCase().trim() !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only query media for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      filter.clubId = userClub;
    } else {
      if (departmentId) filter.departmentId = departmentId.toLowerCase().trim();
      if (clubId) filter.clubId = clubId.toLowerCase().trim();
    }

    // 2. Metadata Filters
    if (mediaType) filter.mediaType = mediaType;
    if (folder) filter.folder = new RegExp(`^${folder.trim()}$`, 'i');
    if (status) filter.status = status;

    // 3. Substring Search
    if (search && search.trim() !== '') {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { title: searchRegex },
        { description: searchRegex },
        { fileName: searchRegex },
        { tags: searchRegex },
        { url: searchRegex },
      ];
    }

    // 4. Sorting
    const sortOptions: Record<string, 1 | -1> = {};
    if (sort === 'createdAt:asc') sortOptions.createdAt = 1;
    else if (sort === 'title:asc') sortOptions.title = 1;
    else if (sort === 'title:desc') sortOptions.title = -1;
    else sortOptions.createdAt = -1;

    // 5. Query execution with pagination
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, assets] = await Promise.all([
      MediaAsset.countDocuments(filter),
      MediaAsset.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    ]);

    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: assets.map((a) => ({
        id: String(a._id),
        title: a.title,
        altText: a.altText,
        description: a.description,
        mediaType: a.mediaType,
        url: a.url,
        thumbnailUrl: a.thumbnailUrl,
        mimeType: a.mimeType,
        fileName: a.fileName,
        fileSize: a.fileSize,
        width: a.width,
        height: a.height,
        folder: a.folder,
        tags: a.tags,
        status: a.status,
        departmentId: a.departmentId,
        clubId: a.clubId,
        createdAt: a.createdAt,
        updatedAt: a.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/media/:id (Protected Admin Single Retrieval)
 */
export async function getAdminMediaById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    const asset = (await MediaAsset.findById(id).lean()) as (IMediaAsset & { _id: unknown }) | null;
    if (!asset) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    // Scope check
    if (user?.role === 'hod' && asset.departmentId && asset.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view media assets belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && asset.clubId && asset.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view media assets belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(asset._id),
        title: asset.title,
        altText: asset.altText,
        description: asset.description,
        mediaType: asset.mediaType,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        folder: asset.folder,
        tags: asset.tags,
        status: asset.status,
        departmentId: asset.departmentId,
        clubId: asset.clubId,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/media (Protected Admin Register External Media)
 */
export async function createMediaAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const {
      title,
      altText,
      description,
      mediaType,
      url,
      thumbnailUrl,
      mimeType,
      fileName,
      fileSize,
      width,
      height,
      folder,
      tags,
      status,
      departmentId,
      clubId,
    } = req.body;

    // 1. Role Scope Boundary Check
    let resolvedDept = departmentId ? departmentId.trim().toLowerCase() : undefined;
    let resolvedClub = clubId ? clubId.trim().toLowerCase() : undefined;

    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (resolvedDept && resolvedDept !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only register media for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      resolvedDept = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (resolvedClub && resolvedClub !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only register media for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      resolvedClub = userClub;
    }

    // 2. Derive fileName from URL if not specified
    let resolvedFileName = fileName;
    if (!resolvedFileName && url) {
      try {
        const parsed = new URL(url);
        const segments = parsed.pathname.split('/').filter(Boolean);
        resolvedFileName = segments.length > 0 ? segments[segments.length - 1] : 'media-asset';
      } catch {
        resolvedFileName = 'media-asset';
      }
    }

    // 3. Persistence
    const newAsset = await MediaAsset.create({
      title: title.trim(),
      altText: altText ? altText.trim() : title.trim(),
      description: description ? description.trim() : '',
      mediaType: mediaType || 'image',
      url: url.trim(),
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : undefined,
      mimeType: mimeType ? mimeType.trim() : undefined,
      fileName: resolvedFileName,
      fileSize,
      width,
      height,
      folder: folder ? folder.trim() : 'General',
      tags: tags || [],
      status: status || 'active',
      departmentId: resolvedDept,
      clubId: resolvedClub,
      createdBy: user?.id,
      updatedBy: user?.id,
    });

    // 4. Audit Logging
    logAdminAction(req, {
      action: 'CREATE',
      module: 'Media Library',
      recordId: String(newAsset._id),
      recordTitle: `Registered external media: "${newAsset.title}" (${newAsset.mediaType})`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Media asset registered successfully.',
      data: {
        id: String(newAsset._id),
        title: newAsset.title,
        altText: newAsset.altText,
        description: newAsset.description,
        mediaType: newAsset.mediaType,
        url: newAsset.url,
        thumbnailUrl: newAsset.thumbnailUrl,
        mimeType: newAsset.mimeType,
        fileName: newAsset.fileName,
        fileSize: newAsset.fileSize,
        width: newAsset.width,
        height: newAsset.height,
        folder: newAsset.folder,
        tags: newAsset.tags,
        status: newAsset.status,
        departmentId: newAsset.departmentId,
        clubId: newAsset.clubId,
        createdAt: newAsset.createdAt,
        updatedAt: newAsset.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT & PATCH /api/admin/media/:id (Protected Admin Single Item Update)
 */
export async function updateMediaAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    const asset = await MediaAsset.findById(id);
    if (!asset) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    // 1. Role Scope Boundary Check on existing asset
    if (user?.role === 'hod' && asset.departmentId && asset.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only update media assets scoped to your assigned department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && asset.clubId && asset.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only update media assets scoped to your assigned club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    const {
      title,
      altText,
      description,
      mediaType,
      url,
      thumbnailUrl,
      mimeType,
      fileName,
      fileSize,
      width,
      height,
      folder,
      tags,
      status,
      departmentId,
      clubId,
    } = req.body;

    // 2. Verify new departmentId / clubId if being modified
    if (departmentId !== undefined) {
      const normalizedDept = departmentId ? departmentId.trim().toLowerCase() : undefined;
      if (user?.role === 'hod' && normalizedDept !== user.departmentId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          `Department scope mismatch: You cannot reassign media to another department (${departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      asset.departmentId = normalizedDept;
    }

    if (clubId !== undefined) {
      const normalizedClub = clubId ? clubId.trim().toLowerCase() : undefined;
      if (user?.role === 'club_head' && normalizedClub !== user.clubId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          `Club scope mismatch: You cannot reassign media to another club (${clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      asset.clubId = normalizedClub;
    }

    // Check if URL is being changed and whether the existing URL is currently referenced
    if (url !== undefined && url.trim() !== asset.url) {
      const referencingPages = await findReferencingPages(asset.url);
      if (referencingPages.length > 0) {
        const pageList = referencingPages.map((p) => `"${p.title}" (/${p.slug})`).join(', ');
        throw new ApiError(
          409,
          `Cannot modify the URL of media asset "${asset.title}" because the existing URL is currently referenced by ${referencingPages.length} dynamic page(s): ${pageList}. Remove the references from the page(s) before altering the URL.`,
          'MEDIA_URL_IN_USE'
        );
      }
      asset.url = url.trim();
    }
    if (title !== undefined) asset.title = title.trim();
    if (altText !== undefined) asset.altText = altText.trim();
    if (description !== undefined) asset.description = description ? description.trim() : '';
    if (mediaType !== undefined) asset.mediaType = mediaType;
    if (thumbnailUrl !== undefined) asset.thumbnailUrl = thumbnailUrl ? thumbnailUrl.trim() : undefined;
    if (mimeType !== undefined) asset.mimeType = mimeType ? mimeType.trim() : undefined;
    if (fileName !== undefined) asset.fileName = fileName ? fileName.trim() : undefined;
    if (fileSize !== undefined) asset.fileSize = fileSize;
    if (width !== undefined) asset.width = width;
    if (height !== undefined) asset.height = height;
    if (folder !== undefined) asset.folder = folder ? folder.trim() : 'General';
    if (tags !== undefined) asset.tags = tags;
    if (status !== undefined) asset.status = status;

    asset.updatedBy = user?.id;
    await asset.save();

    // 3. Audit Logging
    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Media Library',
      recordId: String(asset._id),
      recordTitle: `Updated media asset: "${asset.title}"`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Media asset updated successfully.',
      data: {
        id: String(asset._id),
        title: asset.title,
        altText: asset.altText,
        description: asset.description,
        mediaType: asset.mediaType,
        url: asset.url,
        thumbnailUrl: asset.thumbnailUrl,
        mimeType: asset.mimeType,
        fileName: asset.fileName,
        fileSize: asset.fileSize,
        width: asset.width,
        height: asset.height,
        folder: asset.folder,
        tags: asset.tags,
        status: asset.status,
        departmentId: asset.departmentId,
        clubId: asset.clubId,
        createdAt: asset.createdAt,
        updatedAt: asset.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/media/:id (Protected Admin Asset Removal / Archival)
 *
 * Implements Reference Protection:
 *  - Verifies whether the asset's URL is referenced in any DynamicPage.
 *  - If referenced:
 *     - If ?archive=true: soft-archives the asset (status: 'archived').
 *     - If not archiving: rejects deletion with 409 Conflict (MEDIA_ASSET_IN_USE) detailing referencing pages.
 *  - If not referenced: deletes permanently or archives as requested.
 */
export async function deleteMediaAsset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');
    const { archive } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    const asset = await MediaAsset.findById(id);
    if (!asset) {
      throw ApiError.notFound(`Media asset with ID '${id}' not found.`);
    }

    // 1. Role Scope Boundary Check
    if (user?.role === 'hod' && asset.departmentId && asset.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only delete media assets scoped to your assigned department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && asset.clubId && asset.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only delete media assets scoped to your assigned club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    // 2. Reference Protection Check against Dynamic Pages
    const referencingPages = await findReferencingPages(asset.url);
    const isReferenced = referencingPages.length > 0;

    if (isReferenced && archive !== 'true') {
      const pageList = referencingPages.map((p) => `"${p.title}" (/${p.slug})`).join(', ');
      throw new ApiError(
        409,
        `Cannot permanently delete media asset "${asset.title}" because it is currently referenced by ${referencingPages.length} dynamic page(s): ${pageList}. Archive the asset (?archive=true) or remove the references from the page(s) first.`,
        'MEDIA_ASSET_IN_USE'
      );
    }

    // 3. Soft Archival
    if (archive === 'true' || (isReferenced && archive === 'true')) {
      asset.status = 'archived';
      asset.updatedBy = user?.id;
      await asset.save();

      logAdminAction(req, {
        action: 'ARCHIVE',
        module: 'Media Library',
        recordId: String(asset._id),
        recordTitle: `Archived media asset: "${asset.title}" [in use by ${referencingPages.length} pages]`,
        status: 'SUCCESS',
      });

      res.status(200).json({
        success: true,
        message: 'Media asset successfully archived.',
        data: {
          id: String(asset._id),
          status: 'archived',
          referencingPagesCount: referencingPages.length,
        },
      });
      return;
    }

    // 4. Permanent Deletion
    await MediaAsset.findByIdAndDelete(asset._id);

    logAdminAction(req, {
      action: 'DELETE',
      module: 'Media Library',
      recordId: String(asset._id),
      recordTitle: `Deleted media asset: "${asset.title}"`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Media asset permanently removed.',
      deletedId: String(asset._id),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/media & /api/v1/media (Public Read-Only)
 *
 * Strictly returns ONLY active, sanitized assets. Internal creator, audit,
 * and archived records are completely omitted.
 */
export async function getPublicMedia(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { mediaType, folder, departmentId, clubId, search, page = 1, limit = 50 } = req.query as {
      mediaType?: string;
      folder?: string;
      departmentId?: string;
      clubId?: string;
      search?: string;
      page?: number;
      limit?: number;
    };

    const filter: FilterQuery<IMediaAssetDocument> = { status: 'active' };

    if (mediaType) filter.mediaType = mediaType;
    if (folder) filter.folder = new RegExp(`^${folder.trim()}$`, 'i');
    if (departmentId) filter.departmentId = departmentId.toLowerCase().trim();
    if (clubId) filter.clubId = clubId.toLowerCase().trim();

    if (search && search.trim() !== '') {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [{ title: searchRegex }, { description: searchRegex }, { tags: searchRegex }];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 50));
    const skip = (pageNum - 1) * limitNum;

    const [total, assets] = await Promise.all([
      MediaAsset.countDocuments(filter),
      MediaAsset.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('_id title altText description mediaType url thumbnailUrl mimeType fileName fileSize width height folder tags departmentId clubId createdAt')
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      count: assets.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: assets.map((a) => ({
        id: String(a._id),
        title: a.title,
        altText: a.altText,
        description: a.description,
        mediaType: a.mediaType,
        url: a.url,
        thumbnailUrl: a.thumbnailUrl,
        mimeType: a.mimeType,
        fileName: a.fileName,
        fileSize: a.fileSize,
        width: a.width,
        height: a.height,
        folder: a.folder,
        tags: a.tags,
        departmentId: a.departmentId,
        clubId: a.clubId,
        createdAt: a.createdAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}
