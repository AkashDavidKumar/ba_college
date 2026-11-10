/**
 * form.controller.ts — Forms & Inquiries Engine Controller
 *
 * Implements:
 *  1. Admin CRUD endpoints for dynamic form configurations.
 *  2. Public read endpoint returning sanitized active published form schemas.
 *  3. Public submission endpoint with dynamic field validation, unknown field rejection,
 *     unique human-readable reference generation, and persistent capture.
 *  4. Inquiry management (triage, status transitions, internal notes, search, pagination).
 *  5. Strict RBAC and resource scoping for HOD (departmentId) and Club Head (clubId).
 *  6. Persistent audit logging for all administrative mutations.
 *
 * Strictly Prohibited & Enforced:
 *  - ZERO file uploads, multipart parsing, or filesystem writes.
 *  - ZERO binary or base64 storage.
 *  - ZERO backend remote URL fetching or proxying.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import crypto from 'crypto';
import { Form, IForm, IFormDocument } from '../models/form.model';
import { FormSubmission, IFormSubmissionDocument } from '../models/form-submission.model';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from '../utils/audit-log';

const DANGEROUS_TAG_REGEX = /<\s*script[^>]*>|<\s*\/\s*script\s*>|on\w+\s*=/i;

/**
 * Validates submission answers dynamically against a Form's field definitions.
 */
function validateAnswersAgainstSchema(
  form: IFormDocument,
  answers: Record<string, unknown>
): Record<string, unknown> {
  const allowedFieldIds = new Set(form.fields.map((f) => f.id));
  const sanitizedAnswers: Record<string, unknown> = {};

  // 1. Reject unknown or unexpected field IDs
  for (const key of Object.keys(answers)) {
    if (!allowedFieldIds.has(key)) {
      throw ApiError.badRequest(
        `Unexpected field "${key}". This field is not part of form "${form.title}".`,
        'UNKNOWN_FORM_FIELD'
      );
    }
  }

  // 2. Validate each defined form field
  for (const field of form.fields) {
    const rawVal = answers[field.id];
    const isMissing = rawVal === undefined || rawVal === null || (typeof rawVal === 'string' && rawVal.trim() === '');

    // Required check
    if (field.required && isMissing) {
      throw ApiError.badRequest(
        `Field "${field.label}" (${field.id}) is required.`,
        'REQUIRED_FIELD_MISSING'
      );
    }

    if (isMissing) {
      continue;
    }

    // Type and value checks
    switch (field.type) {
      case 'text':
      case 'textarea': {
        if (typeof rawVal !== 'string') {
          throw ApiError.badRequest(`Field "${field.label}" must be text.`);
        }
        const strVal = rawVal.trim();
        if (DANGEROUS_TAG_REGEX.test(strVal)) {
          throw ApiError.badRequest(`Field "${field.label}" cannot contain script tags or event handlers.`);
        }
        if (field.validation?.minLength && strVal.length < field.validation.minLength) {
          throw ApiError.badRequest(
            `Field "${field.label}" must be at least ${field.validation.minLength} characters.`
          );
        }
        if (field.validation?.maxLength && strVal.length > field.validation.maxLength) {
          throw ApiError.badRequest(
            `Field "${field.label}" cannot exceed ${field.validation.maxLength} characters.`
          );
        }
        sanitizedAnswers[field.id] = strVal;
        break;
      }

      case 'email': {
        if (typeof rawVal !== 'string') {
          throw ApiError.badRequest(`Field "${field.label}" must be an email string.`);
        }
        const emailStr = rawVal.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailStr)) {
          throw ApiError.badRequest(`Field "${field.label}" must be a valid email address.`);
        }
        sanitizedAnswers[field.id] = emailStr;
        break;
      }

      case 'phone': {
        if (typeof rawVal !== 'string') {
          throw ApiError.badRequest(`Field "${field.label}" must be a phone string.`);
        }
        const phoneStr = rawVal.trim();
        const phoneRegex = /^[+]?[\d\s-]{7,20}$/;
        if (!phoneRegex.test(phoneStr)) {
          throw ApiError.badRequest(`Field "${field.label}" must be a valid phone number.`);
        }
        sanitizedAnswers[field.id] = phoneStr;
        break;
      }

      case 'number': {
        const numVal = Number(rawVal);
        if (isNaN(numVal) || typeof rawVal === 'boolean') {
          throw ApiError.badRequest(`Field "${field.label}" must be a valid number.`);
        }
        if (field.validation?.min !== undefined && numVal < field.validation.min) {
          throw ApiError.badRequest(`Field "${field.label}" must be at least ${field.validation.min}.`);
        }
        if (field.validation?.max !== undefined && numVal > field.validation.max) {
          throw ApiError.badRequest(`Field "${field.label}" cannot exceed ${field.validation.max}.`);
        }
        sanitizedAnswers[field.id] = numVal;
        break;
      }

      case 'select':
      case 'radio': {
        if (typeof rawVal !== 'string') {
          throw ApiError.badRequest(`Field "${field.label}" must be a string selection.`);
        }
        const chosen = rawVal.trim();
        if (!field.options || !field.options.includes(chosen)) {
          throw ApiError.badRequest(
            `Selection for "${field.label}" is invalid. Valid options: ${field.options?.join(', ')}.`
          );
        }
        sanitizedAnswers[field.id] = chosen;
        break;
      }

      case 'checkbox': {
        if (Array.isArray(rawVal)) {
          // Multiple choices checked
          const invalid = rawVal.some((v) => typeof v !== 'string' || !field.options?.includes(v.trim()));
          if (invalid) {
            throw ApiError.badRequest(`One or more selections for "${field.label}" are invalid.`);
          }
          sanitizedAnswers[field.id] = rawVal.map((v) => String(v).trim());
        } else if (typeof rawVal === 'boolean') {
          // Single boolean toggle
          sanitizedAnswers[field.id] = rawVal;
        } else if (typeof rawVal === 'string') {
          const chosen = rawVal.trim();
          if (field.options && !field.options.includes(chosen)) {
            throw ApiError.badRequest(`Selection for "${field.label}" is invalid.`);
          }
          sanitizedAnswers[field.id] = chosen;
        } else {
          throw ApiError.badRequest(`Field "${field.label}" must be a boolean or array of selections.`);
        }
        break;
      }

      case 'date': {
        const dateStr = String(rawVal).trim();
        const parsed = Date.parse(dateStr);
        if (isNaN(parsed)) {
          throw ApiError.badRequest(`Field "${field.label}" must be a valid date.`);
        }
        sanitizedAnswers[field.id] = new Date(parsed).toISOString();
        break;
      }

      case 'url': {
        if (typeof rawVal !== 'string') {
          throw ApiError.badRequest(`Field "${field.label}" must be a URL string.`);
        }
        const urlStr = rawVal.trim();
        if (!urlStr.startsWith('http://') && !urlStr.startsWith('https://')) {
          throw ApiError.badRequest(`Field "${field.label}" must be a valid external URL starting with http:// or https://.`);
        }
        try {
          new URL(urlStr);
          sanitizedAnswers[field.id] = urlStr;
        } catch {
          throw ApiError.badRequest(`Field "${field.label}" is not a well-formed URL.`);
        }
        break;
      }

      default:
        sanitizedAnswers[field.id] = rawVal;
    }
  }

  return sanitizedAnswers;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. ADMIN FORM CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/forms (Protected Admin Listing)
 */
export async function listAdminForms(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const {
      search,
      category,
      status,
      departmentId,
      clubId,
      sort = 'createdAt:desc',
      page = 1,
      limit = 50,
    } = req.query as {
      search?: string;
      category?: string;
      status?: string;
      departmentId?: string;
      clubId?: string;
      sort?: string;
      page?: number;
      limit?: number;
    };

    const filter: FilterQuery<IFormDocument> = {};

    // Scope check
    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (departmentId && departmentId.toLowerCase().trim() !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only query forms for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      filter.departmentId = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (clubId && clubId.toLowerCase().trim() !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only query forms for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      filter.clubId = userClub;
    } else {
      if (departmentId) filter.departmentId = departmentId.toLowerCase().trim();
      if (clubId) filter.clubId = clubId.toLowerCase().trim();
    }

    if (category) filter.category = category;
    if (status) filter.status = status;

    if (search && search.trim() !== '') {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [{ title: searchRegex }, { slug: searchRegex }, { description: searchRegex }];
    }

    const sortOptions: Record<string, 1 | -1> = {};
    if (sort === 'createdAt:asc') sortOptions.createdAt = 1;
    else if (sort === 'title:asc') sortOptions.title = 1;
    else if (sort === 'title:desc') sortOptions.title = -1;
    else sortOptions.createdAt = -1;

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, forms] = await Promise.all([
      Form.countDocuments(filter),
      Form.find(filter).sort(sortOptions).skip(skip).limit(limitNum).lean(),
    ]);

    res.status(200).json({
      success: true,
      count: forms.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: forms.map((f) => ({
        id: String(f._id),
        title: f.title,
        slug: f.slug,
        description: f.description,
        category: f.category,
        fields: f.fields,
        status: f.status,
        isActive: f.isActive,
        submitButtonText: f.submitButtonText,
        successMessage: f.successMessage,
        departmentId: f.departmentId,
        clubId: f.clubId,
        createdAt: f.createdAt,
        updatedAt: f.updatedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/forms/:id (Protected Admin Single Retrieval)
 */
export async function getAdminFormById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id.toLowerCase() };
    const form = (await Form.findOne(query).lean()) as (IForm & { _id: unknown }) | null;

    if (!form) {
      throw ApiError.notFound(`Form with identifier '${id}' not found.`);
    }

    // Scope check
    if (user?.role === 'hod' && form.departmentId && form.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view forms belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && form.clubId && form.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view forms belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(form._id),
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        fields: form.fields,
        status: form.status,
        isActive: form.isActive,
        submitButtonText: form.submitButtonText,
        successMessage: form.successMessage,
        departmentId: form.departmentId,
        clubId: form.clubId,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/forms (Protected Admin Form Creation)
 */
export async function createForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const {
      title,
      slug,
      description,
      category,
      fields,
      status,
      isActive,
      submitButtonText,
      successMessage,
      departmentId,
      clubId,
    } = req.body;

    // 1. Role Scope Check
    let resolvedDept = departmentId ? departmentId.trim().toLowerCase() : undefined;
    let resolvedClub = clubId ? clubId.trim().toLowerCase() : undefined;

    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (resolvedDept && resolvedDept !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only create forms for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      resolvedDept = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (resolvedClub && resolvedClub !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only create forms for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      resolvedClub = userClub;
    }

    // 2. Slug Uniqueness Check
    const normalizedSlug = slug.trim().toLowerCase();
    const existing = await Form.findOne({ slug: normalizedSlug });
    if (existing) {
      throw ApiError.conflict(`A form with slug "${normalizedSlug}" already exists.`);
    }

    // 3. Publishing authorization
    const isMasterAdmin = user?.role === 'master_admin' || user?.role === 'ADMIN' || user?.role === 'sub_admin';
    const targetStatus = status || 'draft';
    if (targetStatus === 'published' && !isMasterAdmin && !user?.permissions?.includes('forms:publish')) {
      throw ApiError.forbidden(
        'You do not have permission to publish forms directly. Submit the form for approval first.',
        'FORBIDDEN_FORM_PUBLISH'
      );
    }

    // 4. Persistence
    const newForm = await Form.create({
      title: title.trim(),
      slug: normalizedSlug,
      description: description ? description.trim() : '',
      category: category || 'general',
      fields: fields || [],
      status: targetStatus,
      isActive: isActive !== undefined ? isActive : true,
      submitButtonText: submitButtonText ? submitButtonText.trim() : 'Submit',
      successMessage: successMessage ? successMessage.trim() : 'Thank you for your submission.',
      departmentId: resolvedDept,
      clubId: resolvedClub,
      createdBy: user?.id,
      updatedBy: user?.id,
    });

    logAdminAction(req, {
      action: 'CREATE',
      module: 'Form Builder',
      recordId: String(newForm._id),
      recordTitle: `Created form: "${newForm.title}" (/${newForm.slug})`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Form created successfully.',
      data: {
        id: String(newForm._id),
        title: newForm.title,
        slug: newForm.slug,
        description: newForm.description,
        category: newForm.category,
        fields: newForm.fields,
        status: newForm.status,
        isActive: newForm.isActive,
        submitButtonText: newForm.submitButtonText,
        successMessage: newForm.successMessage,
        departmentId: newForm.departmentId,
        clubId: newForm.clubId,
        createdAt: newForm.createdAt,
        updatedAt: newForm.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT & PATCH /api/admin/forms/:id (Protected Admin Form Update)
 */
export async function updateForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id.toLowerCase() };
    const form = await Form.findOne(query);

    if (!form) {
      throw ApiError.notFound(`Form with identifier '${id}' not found.`);
    }

    // 1. Role Scope Check on existing form
    if (user?.role === 'hod' && form.departmentId && form.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only update forms scoped to your assigned department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && form.clubId && form.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only update forms scoped to your assigned club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    const {
      title,
      slug,
      description,
      category,
      fields,
      status,
      isActive,
      submitButtonText,
      successMessage,
      departmentId,
      clubId,
    } = req.body;

    // 2. Slug modification uniqueness
    if (slug !== undefined) {
      const normalizedSlug = slug.trim().toLowerCase();
      if (normalizedSlug !== form.slug) {
        const existing = await Form.findOne({ slug: normalizedSlug });
        if (existing) {
          throw ApiError.conflict(`A form with slug "${normalizedSlug}" already exists.`);
        }
        form.slug = normalizedSlug;
      }
    }

    // 3. Dept/Club scope check if changing
    if (departmentId !== undefined) {
      const normalizedDept = departmentId ? departmentId.trim().toLowerCase() : undefined;
      if (user?.role === 'hod' && normalizedDept !== user.departmentId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          `Department scope mismatch: You cannot reassign forms to another department (${departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      form.departmentId = normalizedDept;
    }

    if (clubId !== undefined) {
      const normalizedClub = clubId ? clubId.trim().toLowerCase() : undefined;
      if (user?.role === 'club_head' && normalizedClub !== user.clubId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          `Club scope mismatch: You cannot reassign forms to another club (${clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      form.clubId = normalizedClub;
    }

    // 4. Publishing permission
    if (status !== undefined) {
      const isMasterAdmin = user?.role === 'master_admin' || user?.role === 'ADMIN' || user?.role === 'sub_admin';
      if (status === 'published' && form.status !== 'published' && !isMasterAdmin && !user?.permissions?.includes('forms:publish')) {
        throw ApiError.forbidden(
          'You do not have permission to publish forms directly.',
          'FORBIDDEN_FORM_PUBLISH'
        );
      }
      form.status = status;
    }

    if (title !== undefined) form.title = title.trim();
    if (description !== undefined) form.description = description ? description.trim() : '';
    if (category !== undefined) form.category = category;
    if (fields !== undefined) form.fields = fields;
    if (isActive !== undefined) form.isActive = isActive;
    if (submitButtonText !== undefined) form.submitButtonText = submitButtonText ? submitButtonText.trim() : 'Submit';
    if (successMessage !== undefined) form.successMessage = successMessage ? successMessage.trim() : 'Thank you for your submission.';

    form.updatedBy = user?.id;
    await form.save();

    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Form Builder',
      recordId: String(form._id),
      recordTitle: `Updated form: "${form.title}" (/${form.slug})`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Form updated successfully.',
      data: {
        id: String(form._id),
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        fields: form.fields,
        status: form.status,
        isActive: form.isActive,
        submitButtonText: form.submitButtonText,
        successMessage: form.successMessage,
        departmentId: form.departmentId,
        clubId: form.clubId,
        createdAt: form.createdAt,
        updatedAt: form.updatedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/forms/:id (Protected Admin Removal / Archival)
 *
 * Reference Protection:
 *  - Verifies whether any FormSubmission records exist for this form.
 *  - If submissions exist and ?archive=true is omitted: rejects with 409 Conflict (FORM_HAS_SUBMISSIONS).
 *  - If ?archive=true or no submissions exist: archives or deletes cleanly.
 */
export async function deleteForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');
    const { archive } = req.query;

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id.toLowerCase() };
    const form = await Form.findOne(query);

    if (!form) {
      throw ApiError.notFound(`Form with identifier '${id}' not found.`);
    }

    // Scope check
    if (user?.role === 'hod' && form.departmentId && form.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only delete forms scoped to your assigned department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && form.clubId && form.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only delete forms scoped to your assigned club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    // Check existing submissions
    const submissionCount = await FormSubmission.countDocuments({ formId: form._id });
    const hasSubmissions = submissionCount > 0;

    if (hasSubmissions && archive !== 'true') {
      throw new ApiError(
        409,
        `Cannot permanently delete form "${form.title}" because it has ${submissionCount} submission(s) on file. Archive the form (?archive=true) to deactivate it while preserving historical inquiry records.`,
        'FORM_HAS_SUBMISSIONS'
      );
    }

    if (archive === 'true' || hasSubmissions) {
      form.status = 'archived';
      form.isActive = false;
      form.updatedBy = user?.id;
      await form.save();

      logAdminAction(req, {
        action: 'ARCHIVE',
        module: 'Form Builder',
        recordId: String(form._id),
        recordTitle: `Archived form: "${form.title}" [${submissionCount} submissions preserved]`,
        status: 'SUCCESS',
      });

      res.status(200).json({
        success: true,
        message: 'Form successfully archived.',
        data: {
          id: String(form._id),
          status: 'archived',
          isActive: false,
          submissionCount,
        },
      });
      return;
    }

    // Permanent delete
    await Form.findByIdAndDelete(form._id);

    logAdminAction(req, {
      action: 'DELETE',
      module: 'Form Builder',
      recordId: String(form._id),
      recordTitle: `Permanently deleted form: "${form.title}"`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Form permanently removed.',
      deletedId: String(form._id),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/forms/:id/publish (Protected Admin Publish Action)
 */
export async function publishForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id.toLowerCase() };
    const form = await Form.findOne(query);

    if (!form) {
      throw ApiError.notFound(`Form with identifier '${id}' not found.`);
    }

    // Scope check
    if (user?.role === 'hod' && form.departmentId && form.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only publish forms scoped to your assigned department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && form.clubId && form.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only publish forms scoped to your assigned club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    const isMasterAdmin = user?.role === 'master_admin' || user?.role === 'ADMIN' || user?.role === 'sub_admin';
    if (!isMasterAdmin && !user?.permissions?.includes('forms:publish')) {
      throw ApiError.forbidden('You lack permissions to publish forms directly.', 'FORBIDDEN_FORM_PUBLISH');
    }

    form.status = 'published';
    form.isActive = true;
    form.updatedBy = user?.id;
    await form.save();

    logAdminAction(req, {
      action: 'PUBLISH',
      module: 'Form Builder',
      recordId: String(form._id),
      recordTitle: `Published form: "${form.title}" (/${form.slug})`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Form published successfully.',
      data: {
        id: String(form._id),
        status: form.status,
        isActive: form.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/forms/:id/archive (Protected Admin Archive Action)
 */
export async function archiveForm(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const query = mongoose.Types.ObjectId.isValid(id) ? { _id: id } : { slug: id.toLowerCase() };
    const form = await Form.findOne(query);

    if (!form) {
      throw ApiError.notFound(`Form with identifier '${id}' not found.`);
    }

    if (user?.role === 'hod' && form.departmentId && form.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only archive forms scoped to your assigned department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && form.clubId && form.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You can only archive forms scoped to your assigned club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    form.status = 'archived';
    form.isActive = false;
    form.updatedBy = user?.id;
    await form.save();

    logAdminAction(req, {
      action: 'ARCHIVE',
      module: 'Form Builder',
      recordId: String(form._id),
      recordTitle: `Archived form: "${form.title}"`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Form archived successfully.',
      data: {
        id: String(form._id),
        status: form.status,
        isActive: form.isActive,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. PUBLIC FORM RENDERING & SUBMISSION CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/forms/:slug & /api/v1/forms/:slug (Public Read-Only Form Schema)
 *
 * Strictly returns ONLY active, published forms. Omits creator, audit,
 * and internal administrative configuration.
 */
export async function getPublicFormBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : String(rawSlug || '')).trim().toLowerCase();
    if (!slug) {
      throw ApiError.badRequest('Form slug is required.');
    }

    const form = await Form.findOne({ slug, status: 'published', isActive: true })
      .select('title slug description category fields submitButtonText successMessage')
      .lean();

    if (!form) {
      throw ApiError.notFound('Form not found or is currently unavailable.');
    }

    res.status(200).json({
      success: true,
      data: {
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        fields: form.fields.map((f) => ({
          id: f.id,
          label: f.label,
          type: f.type,
          placeholder: f.placeholder,
          helpText: f.helpText,
          required: f.required,
          order: f.order,
          options: f.options,
          validation: f.validation,
        })),
        submitButtonText: form.submitButtonText,
        successMessage: form.successMessage,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/forms/:slug/submissions & /api/v1/forms/:slug/submissions (Public Form Submission)
 *
 * Validates:
 *  1. Form is active and published.
 *  2. Submissions strictly match defined fields without unknown field tampering.
 *  3. Generates unique human-readable reference number.
 *  4. Persists without leaking internal IDs or logging applicant answers in audits.
 */
export async function submitFormAnswers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rawSlug = req.params.slug;
    const slug = (Array.isArray(rawSlug) ? rawSlug[0] : String(rawSlug || '')).trim().toLowerCase();
    if (!slug) {
      throw ApiError.badRequest('Form slug is required.');
    }

    const form = await Form.findOne({ slug, status: 'published', isActive: true });
    if (!form) {
      throw ApiError.notFound('Form not found or is not accepting submissions.');
    }

    const { answers } = req.body;
    if (!answers || typeof answers !== 'object') {
      throw ApiError.badRequest('Submission payload must contain an "answers" object.');
    }

    // 1. Dynamic Server-Side Validation
    const validatedAnswers = validateAnswersAgainstSchema(form, answers);

    // 2. Generate Unique Submission Reference: SUB-YYYY-XXXXXXXX
    const currentYear = new Date().getFullYear();
    const randomHex = crypto.randomBytes(4).toString('hex').toUpperCase();
    const submissionReference = `SUB-${currentYear}-${randomHex}`;

    // 3. Persist Submission
    const submission = await FormSubmission.create({
      formId: form._id,
      formSlug: form.slug,
      formTitle: form.title,
      submissionReference,
      answers: validatedAnswers,
      status: 'new',
      departmentId: form.departmentId,
      clubId: form.clubId,
      submittedAt: new Date(),
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] ? String(req.headers['user-agent']).slice(0, 500) : undefined,
    });

    res.status(201).json({
      success: true,
      message: form.successMessage || 'Thank you for your submission.',
      data: {
        submissionReference: submission.submissionReference,
        submittedAt: submission.submittedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. INQUIRY & SUBMISSION ADMINISTRATION CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /api/admin/form-submissions (Protected Inquiry Listing)
 */
export async function listAdminInquiries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const {
      formId,
      formSlug,
      status,
      search,
      departmentId,
      clubId,
      page = 1,
      limit = 50,
    } = req.query as {
      formId?: string;
      formSlug?: string;
      status?: string;
      search?: string;
      departmentId?: string;
      clubId?: string;
      page?: number;
      limit?: number;
    };

    const filter: FilterQuery<IFormSubmissionDocument> = {};

    // Scope check
    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (departmentId && departmentId.toLowerCase().trim() !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only query submissions for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      filter.departmentId = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (clubId && clubId.toLowerCase().trim() !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only query submissions for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      filter.clubId = userClub;
    } else {
      if (departmentId) filter.departmentId = departmentId.toLowerCase().trim();
      if (clubId) filter.clubId = clubId.toLowerCase().trim();
    }

    if (formId && mongoose.Types.ObjectId.isValid(formId)) filter.formId = formId;
    if (formSlug) filter.formSlug = formSlug.toLowerCase().trim();
    if (status) filter.status = status;

    if (search && search.trim() !== '') {
      const escaped = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = new RegExp(escaped, 'i');
      filter.$or = [
        { submissionReference: searchRegex },
        { formTitle: searchRegex },
        { notes: searchRegex },
      ];
    }

    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const [total, submissions] = await Promise.all([
      FormSubmission.countDocuments(filter),
      FormSubmission.find(filter)
        .sort({ submittedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum) || 1,
      data: submissions.map((s) => ({
        id: String(s._id),
        formId: String(s.formId),
        formSlug: s.formSlug,
        formTitle: s.formTitle,
        submissionReference: s.submissionReference,
        answers: s.answers,
        status: s.status,
        departmentId: s.departmentId,
        clubId: s.clubId,
        notes: s.notes,
        submittedAt: s.submittedAt,
        reviewedBy: s.reviewedBy,
        reviewedAt: s.reviewedAt,
      })),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/form-submissions/:id (Protected Inquiry Detail View)
 */
export async function getAdminInquiryById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { submissionReference: id.toUpperCase().trim() };

    const submission = (await FormSubmission.findOne(query).lean()) as
      | (IFormSubmissionDocument & { _id: unknown })
      | null;

    if (!submission) {
      throw ApiError.notFound(`Inquiry submission with identifier '${id}' not found.`);
    }

    // Scope check
    if (user?.role === 'hod' && submission.departmentId && submission.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view submissions belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && submission.clubId && submission.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot view submissions belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(submission._id),
        formId: String(submission.formId),
        formSlug: submission.formSlug,
        formTitle: submission.formTitle,
        submissionReference: submission.submissionReference,
        answers: submission.answers,
        status: submission.status,
        departmentId: submission.departmentId,
        clubId: submission.clubId,
        notes: submission.notes,
        submittedAt: submission.submittedAt,
        reviewedBy: submission.reviewedBy,
        reviewedAt: submission.reviewedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/admin/form-submissions/:id/status (Protected Inquiry Triage & Status Update)
 */
export async function updateInquiryStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');
    const { status, notes } = req.body;

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { submissionReference: id.toUpperCase().trim() };

    const submission = await FormSubmission.findOne(query);
    if (!submission) {
      throw ApiError.notFound(`Inquiry submission with identifier '${id}' not found.`);
    }

    // Scope check
    if (user?.role === 'hod' && submission.departmentId && submission.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot update submissions belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && submission.clubId && submission.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot update submissions belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    submission.status = status;
    if (notes !== undefined) {
      submission.notes = notes.trim();
    }
    submission.reviewedBy = user?.name || user?.email || user?.id;
    submission.reviewedAt = new Date();
    await submission.save();

    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Inquiry Management',
      recordId: String(submission._id),
      recordTitle: `Updated inquiry ${submission.submissionReference} status to "${status}"`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry status updated successfully.',
      data: {
        id: String(submission._id),
        submissionReference: submission.submissionReference,
        status: submission.status,
        notes: submission.notes,
        reviewedBy: submission.reviewedBy,
        reviewedAt: submission.reviewedAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/form-submissions/:id (Protected Inquiry Delete - Master Admin Only)
 */
export async function deleteAdminInquiry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const query = mongoose.Types.ObjectId.isValid(id)
      ? { _id: id }
      : { submissionReference: id.toUpperCase().trim() };

    const submission = await FormSubmission.findOne(query);
    if (!submission) {
      throw ApiError.notFound(`Inquiry submission with identifier '${id}' not found.`);
    }

    // Only master_admin or sub_admin can delete inquiry submissions
    const isMasterAdmin = user?.role === 'master_admin' || user?.role === 'ADMIN';
    if (!isMasterAdmin) {
      throw ApiError.forbidden('Only master administrators can permanently delete inquiry submissions.');
    }

    await FormSubmission.findByIdAndDelete(submission._id);

    logAdminAction(req, {
      action: 'DELETE',
      module: 'Inquiry Management',
      recordId: String(submission._id),
      recordTitle: `Deleted inquiry: ${submission.submissionReference} (${submission.formTitle})`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Inquiry submission permanently deleted.',
      deletedId: String(submission._id),
    });
  } catch (err) {
    next(err);
  }
}
