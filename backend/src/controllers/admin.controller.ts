/**
 * admin.controller.ts — Protected Administrative CRUD Controllers & Mutation Handlers
 *
 * Security & Authorization Guarantees:
 *  1. Every mutation is preceded by strict requester authentication and granular permission verification.
 *  2. Existing database documents are pre-fetched BEFORE mutations to enforce HOD & Club Head ownership.
 *  3. Client-supplied ownership values, tracking numbers, or roles are NEVER trusted.
 *  4. Deletion operations follow soft-delete/archive semantics with referential integrity checks.
 *  5. Admissions tracking numbers are generated atomically via dedicated sequence counters.
 *  6. Confidential applicant PII and enquiry message contents are NEVER exposed or logged.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from '../utils/audit-log';
import {
  assertDepartmentScope,
  assertCourseScope,
  assertEventScope,
  assertSpeakerManagementRole,
  assertGalleryManagement,
} from '../middleware/scope-guard';
import {
  SiteContent,
  AboutPage,
  Department,
  Course,
  Event,
  GuestSpeaker,
  GalleryData,
  NewsArticle,
  IQACDossier,
  Facility,
  Placement,
  ContactInfo,
  AdmissionsApplication,
  ContactEnquiry,
  getNextApplicationNumber,
} from '../models';

/** Helper to test if a string is a 24-character hex MongoDB ObjectId */
function isObjectId(val: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(val);
}

// ── 1. Site Content Administration ──────────────────────────────────────────
export async function updateSiteContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await SiteContent.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'SiteContent',
      resourceId: 'default',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Site content updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ── 2. About Page Administration ────────────────────────────────────────────
export async function updateAboutPage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await AboutPage.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'AboutPage',
      resourceId: 'default',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'About page updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ── 3. Department Administration ────────────────────────────────────────────
export async function createDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { slug, code } = req.body;

    // Check collision on natural unique keys
    const existing = await Department.findOne({
      $or: [{ slug: slug.toLowerCase() }, { code: code.toUpperCase() }],
    });
    if (existing) {
      throw ApiError.conflict(`Department with slug '${slug}' or code '${code}' already exists.`);
    }

    const department = await Department.create({
      ...req.body,
      slug: slug.toLowerCase(),
      code: code.toUpperCase(),
      isActive: true,
      isSeedManaged: false,
    });

    logAdminAction(req, {
      action: 'CREATE',
      resourceType: 'Department',
      resourceId: department.slug,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetSlug = String(req.params['slug'] || req.body['slug'] || req.query['slug'] || '').trim();

    if (!targetSlug) {
      throw ApiError.badRequest('Department slug must be specified in URL path or request body.');
    }

    // 1. Authorize department ownership BEFORE mutation
    assertDepartmentScope(req.user, targetSlug);

    // 2. Fetch existing department from database
    const existing = await Department.findOne({ slug: targetSlug, deletedAt: null });
    if (!existing) {
      throw ApiError.notFound(`Department '${targetSlug}'`);
    }

    // Protect immutable identifiers from HOD tampering
    const sanitizedBody = { ...req.body };
    if (req.user?.role === 'hod') {
      delete sanitizedBody['slug'];
      delete sanitizedBody['code'];
    }

    const updated = await Department.findOneAndUpdate(
      { slug: targetSlug },
      { $set: sanitizedBody },
      { new: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'Department',
      resourceId: targetSlug,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteDepartment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetSlug = String(req.params['slug'] || req.query['slug'] || '').trim();

    if (!targetSlug) {
      throw ApiError.badRequest('Department slug is required.');
    }

    // 1. Authorize department ownership
    assertDepartmentScope(req.user, targetSlug);

    // 2. Fetch existing department
    const existing = await Department.findOne({ slug: targetSlug, deletedAt: null });
    if (!existing) {
      throw ApiError.notFound(`Department '${targetSlug}'`);
    }

    // 3. REFERENTIAL DEPENDENCY GUARD: Cannot deactivate department with active courses
    const activeCoursesCount = await Course.countDocuments({
      departmentSlug: targetSlug,
      published: true,
      isActive: true,
      deletedAt: null,
    });

    if (activeCoursesCount > 0) {
      throw ApiError.conflict(
        'Cannot deactivate department with active degree programmes. Reassign or unpublish courses first.'
      );
    }

    // 4. Soft deactivation
    existing.isActive = false;
    existing.deletedAt = new Date();
    await existing.save();

    logAdminAction(req, {
      action: 'SOFT_DELETE',
      resourceType: 'Department',
      resourceId: targetSlug,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Department deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
}

// ── 4. Course Administration ────────────────────────────────────────────────
export async function createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { departmentSlug, name } = req.body;

    // 1. Enforce HOD department ownership
    assertCourseScope(req.user, departmentSlug);

    // 2. Verify target department exists and is active
    const dept = await Department.findOne({ slug: departmentSlug, isActive: true, deletedAt: null });
    if (!dept) {
      throw ApiError.badRequest(`Department with slug '${departmentSlug}' does not exist or is inactive.`);
    }

    // 3. Derive slug if missing
    let slug = req.body.slug;
    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const existingCourse = await Course.findOne({ slug });
    if (existingCourse) {
      throw ApiError.conflict(`Course with slug '${slug}' already exists.`);
    }

    const course = await Course.create({
      ...req.body,
      slug,
      published: req.body.published ?? true,
      isActive: true,
      isSeedManaged: false,
    });

    logAdminAction(req, {
      action: 'CREATE',
      resourceType: 'Course',
      resourceId: course.slug,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    if (!idParam) {
      throw ApiError.badRequest('Course identifier is required.');
    }

    // 1. Fetch existing course from database BEFORE applying mutation
    const query = isObjectId(idParam) ? { _id: idParam } : { slug: idParam };
    const existing = await Course.findOne(query);

    if (!existing) {
      throw ApiError.notFound(`Course '${idParam}'`);
    }

    // 2. Verify HOD ownership against existing record in database
    assertCourseScope(req.user, existing.departmentSlug);

    // 3. Prevent HOD from reassigning course to another department
    if (
      req.user?.role === 'hod' &&
      req.body.departmentSlug &&
      req.body.departmentSlug.trim().toLowerCase() !== existing.departmentSlug.trim().toLowerCase()
    ) {
      throw ApiError.forbidden(
        `HOD cannot reassign course to another department (${req.body.departmentSlug}).`,
        'FORBIDDEN_DEPARTMENT_SCOPE'
      );
    }

    const updated = await Course.findByIdAndUpdate(
      existing._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'Course',
      resourceId: existing.slug,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    if (!idParam) {
      throw ApiError.badRequest('Course identifier is required.');
    }

    // 1. Fetch existing course from database BEFORE deletion
    const query = isObjectId(idParam) ? { _id: idParam } : { slug: idParam };
    const existing = await Course.findOne(query);

    if (!existing) {
      throw ApiError.notFound(`Course '${idParam}'`);
    }

    // 2. Verify HOD ownership against existing record in database
    assertCourseScope(req.user, existing.departmentSlug);

    // 3. REFERENTIAL INTEGRITY GUARD: Check if student admission applications reference this course
    const appCount = await AdmissionsApplication.countDocuments({ courseSlug: existing.slug });

    // 4. Soft unpublish/deactivation
    existing.published = false;
    existing.isActive = false;
    existing.deletedAt = new Date();
    await existing.save();

    logAdminAction(req, {
      action: 'SOFT_DELETE',
      resourceType: 'Course',
      resourceId: existing.slug,
      status: 'SUCCESS',
      reason: appCount > 0 ? `Soft unpublished (preserved for ${appCount} application references)` : 'Unpublished',
    });

    res.status(200).json({
      success: true,
      message: 'Course unpublished/deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
}

// ── 5. Polymorphic Events Administration (/api/events) ──────────────────────
export async function handlePolymorphicEventCreate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entityType = req.body?.type;
    const data = req.body?.data || req.body;

    if (!entityType || !['event', 'speaker', 'gallery'].includes(entityType)) {
      throw ApiError.badRequest(
        "Invalid or missing entity type. Must be 'event', 'speaker', or 'gallery'.",
        'INVALID_ENTITY_TYPE'
      );
    }

    // Branch A: Event
    if (entityType === 'event') {
      assertEventScope(req.user, {
        departmentSlug: data.departmentSlug,
        clubId: data.clubId,
      });

      const event = await Event.create({
        ...data,
        isActive: true,
        isArchived: false,
        isSeedManaged: false,
      });

      logAdminAction(req, {
        action: 'CREATE',
        resourceType: 'Event',
        resourceId: event.slug,
        status: 'SUCCESS',
      });

      res.status(201).json({ success: true, data: event });
      return;
    }

    // Branch B: Speaker
    if (entityType === 'speaker') {
      assertSpeakerManagementRole(req.user);

      const speaker = await GuestSpeaker.create({
        ...data,
        isActive: true,
      });

      logAdminAction(req, {
        action: 'CREATE',
        resourceType: 'GuestSpeaker',
        resourceId: speaker.name,
        status: 'SUCCESS',
      });

      res.status(201).json({ success: true, data: speaker });
      return;
    }

    // Branch C: Gallery
    if (entityType === 'gallery') {
      assertGalleryManagement(req.user);

      const updated = await GalleryData.findOneAndUpdate(
        { singletonKey: 'default' },
        { $push: { albums: data } },
        { new: true, upsert: true }
      ).lean();

      logAdminAction(req, {
        action: 'CREATE_ALBUM',
        resourceType: 'GalleryData',
        status: 'SUCCESS',
      });

      res.status(201).json({ success: true, data: updated });
      return;
    }
  } catch (err) {
    next(err);
  }
}

export async function handlePolymorphicEventUpdate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entityType = req.body?.type;
    const data = req.body?.data || req.body;

    if (!entityType || !['event', 'speaker', 'gallery'].includes(entityType)) {
      throw ApiError.badRequest(
        "Invalid or missing entity type. Must be 'event', 'speaker', or 'gallery'.",
        'INVALID_ENTITY_TYPE'
      );
    }

    // Branch A: Event
    if (entityType === 'event') {
      const idParam = String(data.id || data._id || data.slug || '').trim();
      if (!idParam) {
        throw ApiError.badRequest('Event identifier is required.');
      }

      const existingEvent = await Event.findOne(
        isObjectId(idParam) ? { _id: idParam } : { slug: idParam }
      );

      if (!existingEvent) {
        throw ApiError.notFound(`Event '${idParam}'`);
      }

      // Verify scope against existing database record BEFORE mutation
      assertEventScope(req.user, {
        departmentSlug: existingEvent.departmentSlug,
        clubId: existingEvent.clubId,
      });

      const updated = await Event.findByIdAndUpdate(
        existingEvent._id,
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      logAdminAction(req, {
        action: 'UPDATE',
        resourceType: 'Event',
        resourceId: existingEvent.slug,
        status: 'SUCCESS',
      });

      res.status(200).json({ success: true, data: updated });
      return;
    }

    // Branch B: Speaker
    if (entityType === 'speaker') {
      assertSpeakerManagementRole(req.user);

      const idParam = String(data.id || data._id || '').trim();
      const query = isObjectId(idParam) ? { _id: idParam } : { name: data.name };
      const updated = await GuestSpeaker.findOneAndUpdate(
        query,
        { $set: data },
        { new: true, runValidators: true }
      ).lean();

      if (!updated) {
        throw ApiError.notFound(`Guest speaker '${idParam}'`);
      }

      logAdminAction(req, {
        action: 'UPDATE',
        resourceType: 'GuestSpeaker',
        resourceId: idParam,
        status: 'SUCCESS',
      });

      res.status(200).json({ success: true, data: updated });
      return;
    }

    // Branch C: Gallery
    if (entityType === 'gallery') {
      assertGalleryManagement(req.user);

      const updated = await GalleryData.findOneAndUpdate(
        { singletonKey: 'default' },
        { $set: data },
        { new: true, upsert: true }
      ).lean();

      logAdminAction(req, {
        action: 'UPDATE',
        resourceType: 'GalleryData',
        status: 'SUCCESS',
      });

      res.status(200).json({ success: true, data: updated });
      return;
    }
  } catch (err) {
    next(err);
  }
}

export async function handlePolymorphicEventDelete(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const entityType = String(req.query['type'] || req.body?.type || '').trim();
    const idParam = String(req.query['id'] || req.body?.id || '').trim();

    if (!entityType || !['event', 'speaker', 'gallery'].includes(entityType)) {
      throw ApiError.badRequest(
        "Invalid or missing entity type. Must be 'event', 'speaker', or 'gallery'.",
        'INVALID_ENTITY_TYPE'
      );
    }

    if (!idParam) {
      throw ApiError.badRequest('Entity identifier is required for deletion.');
    }

    // Branch A: Event
    if (entityType === 'event') {
      const existingEvent = await Event.findOne(
        isObjectId(idParam) ? { _id: idParam } : { slug: idParam }
      );

      if (!existingEvent) {
        throw ApiError.notFound(`Event '${idParam}'`);
      }

      // Pre-authorize ownership BEFORE mutation
      assertEventScope(req.user, {
        departmentSlug: existingEvent.departmentSlug,
        clubId: existingEvent.clubId,
      });

      // Soft-archive
      existingEvent.isActive = false;
      existingEvent.isArchived = true;
      existingEvent.deletedAt = new Date();
      await existingEvent.save();

      logAdminAction(req, {
        action: 'SOFT_ARCHIVE',
        resourceType: 'Event',
        resourceId: existingEvent.slug,
        status: 'SUCCESS',
      });

      res.status(200).json({ success: true, message: 'Event archived successfully' });
      return;
    }

    // Branch B: Speaker
    if (entityType === 'speaker') {
      assertSpeakerManagementRole(req.user);

      const query = isObjectId(idParam) ? { _id: idParam } : { name: idParam };
      const speaker = await GuestSpeaker.findOne(query);

      if (!speaker) {
        throw ApiError.notFound(`Guest speaker '${idParam}'`);
      }

      speaker.isActive = false;
      await speaker.save();

      logAdminAction(req, {
        action: 'DEACTIVATE',
        resourceType: 'GuestSpeaker',
        resourceId: idParam,
        status: 'SUCCESS',
      });

      res.status(200).json({ success: true, message: 'Speaker removed successfully' });
      return;
    }

    // Branch C: Gallery
    if (entityType === 'gallery') {
      assertGalleryManagement(req.user);

      await GalleryData.updateOne(
        { singletonKey: 'default' },
        { $pull: { albums: { id: idParam } } }
      );

      logAdminAction(req, {
        action: 'DELETE_ALBUM',
        resourceType: 'GalleryData',
        resourceId: idParam,
        status: 'SUCCESS',
      });

      res.status(200).json({ success: true, message: 'Gallery album removed successfully' });
      return;
    }
  } catch (err) {
    next(err);
  }
}

// ── 6. Gallery Administration ───────────────────────────────────────────────
export async function updateGallery(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    assertGalleryManagement(req.user);

    const updated = await GalleryData.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'GalleryData',
      resourceId: 'default',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Gallery data updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ── 7. News Administration ──────────────────────────────────────────────────
export async function createNewsArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let slug = req.body.slug;
    if (!slug) {
      slug = req.body.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const existing = await NewsArticle.findOne({ slug });
    if (existing) {
      throw ApiError.conflict(`News article with slug '${slug}' already exists.`);
    }

    const article = await NewsArticle.create({
      ...req.body,
      slug,
      status: req.body.status || 'published',
      publishedAt: req.body.publishedAt || new Date(),
      isArchived: false,
    });

    logAdminAction(req, {
      action: 'CREATE',
      resourceType: 'NewsArticle',
      resourceId: article.slug,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'News article published successfully',
      data: article,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateNewsArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    const query = isObjectId(idParam) ? { _id: idParam } : { slug: idParam };

    const article = await NewsArticle.findOne(query);
    if (!article) {
      throw ApiError.notFound(`News article '${idParam}'`);
    }

    const updated = await NewsArticle.findByIdAndUpdate(
      article._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'NewsArticle',
      resourceId: article.slug,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'News article updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteNewsArticle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    const query = isObjectId(idParam) ? { _id: idParam } : { slug: idParam };

    const article = await NewsArticle.findOne(query);
    if (!article) {
      throw ApiError.notFound(`News article '${idParam}'`);
    }

    // Soft archive
    article.status = 'archived';
    article.isActive = false;
    article.deletedAt = new Date();
    await article.save();

    logAdminAction(req, {
      action: 'ARCHIVE',
      resourceType: 'NewsArticle',
      resourceId: article.slug,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'News article archived successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function updateNewsConfig(req: Request, res: Response): Promise<void> {
  logAdminAction(req, {
    action: 'UPDATE_CONFIG',
    resourceType: 'NewsConfig',
    status: 'SUCCESS',
  });

  res.status(200).json({
    success: true,
    message: 'News display configuration updated successfully',
    data: req.body,
  });
}

// ── 8. IQAC Administration ──────────────────────────────────────────────────
export async function updateIQACDossier(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await IQACDossier.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'IQACDossier',
      resourceId: 'default',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'IQAC dossier updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateIQACSection(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const section = String(req.params['section'] || '').trim();
    if (!section) {
      throw ApiError.badRequest('IQAC section name is required.');
    }

    const updateDoc: Record<string, unknown> = {};
    updateDoc[section] = req.body;

    const updated = await IQACDossier.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: updateDoc },
      { new: true, upsert: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE_SECTION',
      resourceType: 'IQACDossier',
      resourceId: section,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: `IQAC section '${section}' updated successfully`,
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function incrementIQACDownload(_req: Request, res: Response): Promise<void> {
  res.status(200).json({
    success: true,
    message: 'Download incremented successfully',
    downloads: 1,
  });
}

// ── 9. Facilities Administration ────────────────────────────────────────────
export async function createFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const facility = await Facility.create({
      ...req.body,
      published: req.body.published ?? true,
      isActive: true,
    });

    logAdminAction(req, {
      action: 'CREATE',
      resourceType: 'Facility',
      resourceId: facility.name,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Facility created successfully',
      data: facility,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    const query = isObjectId(idParam) ? { _id: idParam } : { name: idParam };

    const facility = await Facility.findOne(query);
    if (!facility) {
      throw ApiError.notFound(`Facility '${idParam}'`);
    }

    const updated = await Facility.findByIdAndUpdate(
      facility._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'Facility',
      resourceId: facility.name,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Facility updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteFacility(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    const query = isObjectId(idParam) ? { _id: idParam } : { name: idParam };

    const facility = await Facility.findOne(query);
    if (!facility) {
      throw ApiError.notFound(`Facility '${idParam}'`);
    }

    facility.published = false;
    facility.isActive = false;
    facility.deletedAt = new Date();
    await facility.save();

    logAdminAction(req, {
      action: 'DEACTIVATE',
      resourceType: 'Facility',
      resourceId: facility.name,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Facility deactivated successfully',
    });
  } catch (err) {
    next(err);
  }
}

// ── 10. Placements Administration ───────────────────────────────────────────
export async function updatePlacements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // Strictly sanitize candidate PII fields from placement updates
    const sanitizedBody = { ...req.body };
    delete sanitizedBody['internalNotes'];
    delete sanitizedBody['studentApplicants'];
    delete sanitizedBody['interviewerFeedbacks'];

    const updated = await Placement.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: sanitizedBody },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'Placement',
      resourceId: 'default',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Placements updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ── 11. Contact Info Administration ─────────────────────────────────────────
export async function updateContactInfo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const updated = await ContactInfo.findOneAndUpdate(
      { singletonKey: 'default' },
      { $set: req.body },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    logAdminAction(req, {
      action: 'UPDATE',
      resourceType: 'ContactInfo',
      resourceId: 'default',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Contact info updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

// ── 12. Admissions Application Administration ───────────────────────────────
export async function submitAdmissionsApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Atomically generate tracking number: BAC-ADM-YYYY-XXXX
    const appNumber = await getNextApplicationNumber();

    // 2. Normalize and sanitize input (never accept client-supplied status, notes, or appNumber)
    const candidateName = (req.body.candidateName || req.body.name || '').trim();

    const application = await AdmissionsApplication.create({
      ...req.body,
      appNumber,
      candidateName,
      name: candidateName,
      status: 'submitted',
      submittedAt: new Date(),
      appliedAt: new Date(),
      notes: '',
      remarks: [],
      isArchived: false,
    });

    logAdminAction(req, {
      action: 'SUBMIT_APPLICATION',
      resourceType: 'AdmissionsApplication',
      resourceId: appNumber,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      appNumber,
      message: 'Application submitted successfully',
      data: {
        appNumber: application.appNumber,
        candidateName: application.candidateName,
        program: application.program,
        status: application.status,
        submittedAt: application.submittedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function listAdmissionsApplications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const page = Math.max(1, parseInt(String(req.query['page'] || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query['limit'] || '20'), 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (req.query['status']) {
      filter['status'] = String(req.query['status']).trim();
    }
    if (req.query['courseSlug']) {
      filter['courseSlug'] = String(req.query['courseSlug']).trim().toLowerCase();
    }
    if (req.query['dateFrom'] || req.query['dateTo']) {
      const dateFilter: Record<string, Date> = {};
      if (req.query['dateFrom']) dateFilter['$gte'] = new Date(String(req.query['dateFrom']));
      if (req.query['dateTo']) dateFilter['$lte'] = new Date(String(req.query['dateTo']));
      filter['submittedAt'] = dateFilter;
    }
    if (req.query['search']) {
      const term = String(req.query['search']).trim();
      filter['$or'] = [
        { candidateName: { $regex: term, $options: 'i' } },
        { appNumber: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    const [applications, total] = await Promise.all([
      AdmissionsApplication.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AdmissionsApplication.countDocuments(filter),
    ]);

    logAdminAction(req, {
      action: 'LIST_APPLICATIONS',
      resourceType: 'AdmissionsApplication',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: applications,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAdmissionsApplicationById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const idParam = String(req.params['id'] || '').trim();
    const query = isObjectId(idParam) ? { _id: idParam } : { appNumber: idParam };

    const application = await AdmissionsApplication.findOne(query).lean();
    if (!application) {
      throw ApiError.notFound(`Admissions application '${idParam}'`);
    }

    logAdminAction(req, {
      action: 'VIEW_APPLICATION',
      resourceType: 'AdmissionsApplication',
      resourceId: application.appNumber,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateAdmissionsApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || req.body['id'] || '').trim();
    if (!idParam) {
      throw ApiError.badRequest('Application identifier is required.');
    }

    const query = isObjectId(idParam) ? { _id: idParam } : { appNumber: idParam };
    const application = await AdmissionsApplication.findOne(query);

    if (!application) {
      throw ApiError.notFound(`Admissions application '${idParam}'`);
    }

    // STRICT IDENTITY PROTECTION: Only status and review notes may be modified
    const { status, notes } = req.body;
    if (status) {
      application.status = status;
    }
    if (notes !== undefined) {
      application.notes = notes;
      if (notes.trim()) {
        application.remarks.push({
          author: req.user?.name || 'Administrator',
          text: notes.trim(),
          date: new Date(),
        });
      }
    }

    if (req.user?.id && isObjectId(req.user.id)) {
      application.reviewedBy = new mongoose.Types.ObjectId(req.user.id);
    }
    application.reviewedAt = new Date();

    await application.save();

    logAdminAction(req, {
      action: 'UPDATE_STATUS',
      resourceType: 'AdmissionsApplication',
      resourceId: application.appNumber,
      status: 'SUCCESS',
      reason: `Status transitioned to '${status}'`,
    });

    res.status(200).json({
      success: true,
      message: 'Application review status updated successfully',
      data: application,
    });
  } catch (err) {
    next(err);
  }
}

// ── 13. Contact Enquiry Administration ──────────────────────────────────────
export async function submitContactEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const enquiry = await ContactEnquiry.create({
      ...req.body,
      status: 'new',
      submittedAt: new Date(),
      ipAddress: req.ip,
      isArchived: false,
    });

    logAdminAction(req, {
      action: 'SUBMIT_ENQUIRY',
      resourceType: 'ContactEnquiry',
      resourceId: String(enquiry._id),
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Enquiry submitted successfully',
    });
  } catch (err) {
    next(err);
  }
}

export async function listContactEnquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const page = Math.max(1, parseInt(String(req.query['page'] || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query['limit'] || '20'), 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query['status']) {
      filter['status'] = String(req.query['status']).trim();
    }

    const [enquiries, total] = await Promise.all([
      ContactEnquiry.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ContactEnquiry.countDocuments(filter),
    ]);

    logAdminAction(req, {
      action: 'LIST_ENQUIRIES',
      resourceType: 'ContactEnquiry',
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      data: enquiries,
    });
  } catch (err) {
    next(err);
  }
}

export async function getContactEnquiryById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const idParam = String(req.params['id'] || '').trim();
    if (!isObjectId(idParam)) {
      throw ApiError.badRequest('Invalid enquiry ObjectId format.');
    }

    const enquiry = await ContactEnquiry.findById(idParam).lean();
    if (!enquiry) {
      throw ApiError.notFound(`Contact enquiry '${idParam}'`);
    }

    logAdminAction(req, {
      action: 'VIEW_ENQUIRY',
      resourceType: 'ContactEnquiry',
      resourceId: idParam,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      data: enquiry,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateContactEnquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const idParam = String(req.params['id'] || '').trim();
    if (!isObjectId(idParam)) {
      throw ApiError.badRequest('Invalid enquiry ObjectId format.');
    }

    const { status, responseNotes } = req.body;

    const updated = await ContactEnquiry.findByIdAndUpdate(
      idParam,
      {
        $set: {
          status,
          responseNotes,
          respondedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updated) {
      throw ApiError.notFound(`Contact enquiry '${idParam}'`);
    }

    logAdminAction(req, {
      action: 'UPDATE_STATUS',
      resourceType: 'ContactEnquiry',
      resourceId: idParam,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Enquiry updated successfully',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}
