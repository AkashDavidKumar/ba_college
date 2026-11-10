/**
 * alumni.controller.ts — Controller for Alumni Directory, Registration & Verification
 *
 * Implements:
 *  1. Public registration with duplicate detection (email, registerNumber, composite match).
 *  2. Public directory with strict PII stripping, verified & opt-in gating.
 *  3. Public featured alumni testimonials.
 *  4. Administrative listing, detail view, editing, verification, rejection, and deletion.
 *  5. Complete AuditLog tracking on mutations.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Alumni } from '../models/alumni.model';
import { AuditLog } from '../models/audit-log.model';
import { ApiError } from '../utils/api-error';
import logger from '../utils/logger';

// ── Public Projection: Strictly strips all private & administrative fields ──
const PUBLIC_ALUMNI_PROJECTION = {
  _id: 1,
  firstName: 1,
  lastName: 1,
  fullName: 1,
  degree: 1,
  departmentId: 1,
  departmentSlug: 1,
  graduationYear: 1,
  currentCompany: 1,
  designation: 1,
  industry: 1,
  employmentType: 1,
  city: 1,
  country: 1,
  linkedInUrl: 1,
  avatarUrl: 1,
  avatarMediaId: 1,
  isFeatured: 1,
  testimonial: 1,
  isWillingToMentor: 1,
  createdAt: 1,
};

// ── Helper: Audit Log Dispatcher & PII Redaction ─────────────────────────────
const ALUMNI_AUDIT_EXCLUDED_KEYS = new Set([
  'personalEmail',
  'phoneNumber',
  'registerNumber',
  'residentialAddress',
  'internalNotes',
  'registeredIp',
]);

function sanitizeAlumniAuditState(state: Record<string, unknown> | null): Record<string, unknown> | null {
  if (!state) return null;
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(state)) {
    if (ALUMNI_AUDIT_EXCLUDED_KEYS.has(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

async function recordAudit(
  req: Request,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'APPROVE' | 'REJECT',
  entityId: string,
  beforeState: Record<string, unknown> | null,
  afterState: Record<string, unknown> | null
): Promise<void> {
  try {
    if (!req.user?.id) return;
    const sanitizedBefore = sanitizeAlumniAuditState(beforeState);
    const sanitizedAfter = sanitizeAlumniAuditState(afterState);

    await AuditLog.create({
      userId: req.user.id,
      userName: req.user.name || req.user.email || 'Administrator',
      userRole: req.user.role || 'admin',
      action,
      module: 'Alumni',
      entityType: 'alumni',
      recordId: entityId,
      entityId,
      recordTitle: `${action} alumni profile: ${entityId}`,
      oldValue: sanitizedBefore ? JSON.stringify(sanitizedBefore) : undefined,
      newValue: sanitizedAfter ? JSON.stringify(sanitizedAfter) : undefined,
      beforeState: sanitizedBefore,
      afterState: sanitizedAfter,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] as string | undefined,
    });
  } catch (err) {
    logger.error('Failed to create audit log for alumni action', {
      error: err instanceof Error ? err.message : 'Unknown',
      entityId,
      action,
    });
  }
}

// ── 1. Public Alumni Registration ───────────────────────────────────────────
export async function registerAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      firstName,
      lastName,
      personalEmail,
      phoneNumber,
      degree,
      departmentId,
      graduationYear,
      registerNumber,
      residentialAddress,
      currentCompany,
      designation,
      industry,
      employmentType,
      city,
      country,
      linkedInUrl,
      avatarUrl,
      avatarMediaId,
      testimonial,
      isPublicDirectoryOptIn,
      isWillingToMentor,
    } = req.body;

    const normalizedEmail = String(personalEmail).toLowerCase().trim();
    const normalizedRegNo = registerNumber ? String(registerNumber).toUpperCase().trim() : undefined;

    // 1. Check duplicate by personalEmail
    const existingByEmail = await Alumni.findOne({ personalEmail: normalizedEmail });
    if (existingByEmail) {
      throw ApiError.conflict('An alumni profile with this email address already exists.');
    }

    // 2. Check duplicate by registerNumber (if provided)
    if (normalizedRegNo) {
      const existingByRegNo = await Alumni.findOne({ registerNumber: normalizedRegNo });
      if (existingByRegNo) {
        throw ApiError.conflict('An alumni profile with this register number already exists.');
      }
    }

    // 3. Composite identity check (same name + degree + graduationYear + department)
    // Non-blocking: Flag for administrative review rather than rejecting
    let flaggedAsPotentialDuplicate = false;
    let duplicateMatchDetails: string | undefined;

    const compositeMatch = await Alumni.findOne({
      firstName: { $regex: new RegExp(`^${firstName.trim()}$`, 'i') },
      lastName: { $regex: new RegExp(`^${lastName.trim()}$`, 'i') },
      degree: degree.trim(),
      graduationYear: Number(graduationYear),
      departmentId: departmentId.trim().toLowerCase(),
    });

    if (compositeMatch) {
      flaggedAsPotentialDuplicate = true;
      duplicateMatchDetails = `Potential duplicate of existing alumni record ID: ${compositeMatch._id} (${compositeMatch.fullName}, ${compositeMatch.graduationYear})`;
    }

    // 4. Create new alumni document
    const newAlumni = new Alumni({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      personalEmail: normalizedEmail,
      phoneNumber: phoneNumber ? phoneNumber.trim() : undefined,
      degree: degree.trim(),
      departmentId: departmentId.trim().toLowerCase(),
      graduationYear: Number(graduationYear),
      registerNumber: normalizedRegNo,
      residentialAddress: residentialAddress ? residentialAddress.trim() : undefined,
      currentCompany: currentCompany ? currentCompany.trim() : undefined,
      designation: designation ? designation.trim() : undefined,
      industry: industry ? industry.trim() : undefined,
      employmentType: employmentType || 'Salaried',
      city: city ? city.trim() : undefined,
      country: country ? country.trim() : 'India',
      linkedInUrl: linkedInUrl || undefined,
      avatarUrl: avatarUrl || undefined,
      avatarMediaId: avatarMediaId && mongoose.isValidObjectId(avatarMediaId)
        ? new mongoose.Types.ObjectId(avatarMediaId)
        : undefined,
      testimonial: testimonial ? testimonial.trim() : undefined,
      // Mandatory safeguard: registrations ALWAYS start as pending
      verificationStatus: 'pending',
      status: 'active',
      isPublicDirectoryOptIn: Boolean(isPublicDirectoryOptIn),
      isWillingToMentor: Boolean(isWillingToMentor),
      registeredIp: req.ip,
      flaggedAsPotentialDuplicate,
      duplicateMatchDetails,
    });

    await newAlumni.save();

    res.status(201).json({
      success: true,
      message:
        'Alumni registration submitted successfully. Your profile is pending institutional verification.',
      data: {
        id: String(newAlumni._id),
        fullName: newAlumni.fullName,
        verificationStatus: newAlumni.verificationStatus,
      },
    });
  } catch (err: unknown) {
    // Handle MongoDB duplicate key collision gracefully
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
      const mongoErr = err as { keyPattern?: Record<string, number> };
      if (mongoErr.keyPattern?.personalEmail) {
        next(ApiError.conflict('An alumni profile with this email address already exists.'));
        return;
      }
      if (mongoErr.keyPattern?.registerNumber) {
        next(ApiError.conflict('An alumni profile with this register number already exists.'));
        return;
      }
      next(ApiError.conflict('An alumni profile with identical unique fields already exists.'));
      return;
    }
    next(err);
  }
}

// ── 2. Public Alumni Directory ──────────────────────────────────────────────
export async function getPublicDirectory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Privacy safeguard: only verified, opted-in, active alumni can ever be returned
    const query: Record<string, unknown> = {
      verificationStatus: 'verified',
      isPublicDirectoryOptIn: true,
      status: 'active',
    };

    if (req.query.departmentId) {
      query.departmentId = String(req.query.departmentId).toLowerCase().trim();
    }
    if (req.query.graduationYear) {
      const year = Number(req.query.graduationYear);
      if (!isNaN(year)) query.graduationYear = year;
    }
    if (req.query.city) {
      query.city = { $regex: new RegExp(String(req.query.city).trim(), 'i') };
    }
    if (req.query.search) {
      const search = String(req.query.search).trim();
      query.$or = [
        { firstName: { $regex: new RegExp(search, 'i') } },
        { lastName: { $regex: new RegExp(search, 'i') } },
        { fullName: { $regex: new RegExp(search, 'i') } },
        { currentCompany: { $regex: new RegExp(search, 'i') } },
        { designation: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Alumni.find(query, PUBLIC_ALUMNI_PROJECTION)
        .sort({ graduationYear: -1, lastName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Alumni.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── 3. Public Featured Alumni ───────────────────────────────────────────────
export async function getPublicFeatured(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const limit = Math.min(20, Math.max(1, Number(req.query.limit) || 10));

    const items = await Alumni.find(
      {
        verificationStatus: 'verified',
        isPublicDirectoryOptIn: true,
        status: 'active',
        isFeatured: true,
      },
      PUBLIC_ALUMNI_PROJECTION
    )
      .sort({ updatedAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      data: items,
    });
  } catch (err) {
    next(err);
  }
}

// ── 4. Protected: List Admin Alumni ─────────────────────────────────────────
export async function listAdminAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query: Record<string, unknown> = {};

    // Verification status filter
    if (req.query.verificationStatus && req.query.verificationStatus !== 'all') {
      query.verificationStatus = String(req.query.verificationStatus).trim();
    }

    // Account status filter
    if (req.query.status && req.query.status !== 'all') {
      query.status = String(req.query.status).trim();
    } else {
      // Exclude archived by default unless requested
      query.status = { $ne: 'archived' };
    }

    // Department filter
    if (req.query.departmentId && req.query.departmentId !== 'all') {
      query.departmentId = String(req.query.departmentId).toLowerCase().trim();
    }

    // Graduation year filter
    if (req.query.graduationYear && req.query.graduationYear !== 'all') {
      const year = Number(req.query.graduationYear);
      if (!isNaN(year)) query.graduationYear = year;
    }

    // Potential duplicate flag filter
    if (req.query.potentialDuplicate === 'true') {
      query.flaggedAsPotentialDuplicate = true;
    }

    // Search filter across name, email, register number, and company
    if (req.query.search) {
      const search = String(req.query.search).trim();
      query.$or = [
        { fullName: { $regex: new RegExp(search, 'i') } },
        { personalEmail: { $regex: new RegExp(search, 'i') } },
        { registerNumber: { $regex: new RegExp(search, 'i') } },
        { currentCompany: { $regex: new RegExp(search, 'i') } },
      ];
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Alumni.find(query)
        .populate('verifiedBy', 'name email role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Alumni.countDocuments(query),
    ]);

    // Summary counts for quick admin tab statistics
    const [pendingCount, verifiedCount, rejectedCount, duplicateCount] = await Promise.all([
      Alumni.countDocuments({ verificationStatus: 'pending', status: { $ne: 'archived' } }),
      Alumni.countDocuments({ verificationStatus: 'verified', status: { $ne: 'archived' } }),
      Alumni.countDocuments({ verificationStatus: 'rejected', status: { $ne: 'archived' } }),
      Alumni.countDocuments({ flaggedAsPotentialDuplicate: true, status: { $ne: 'archived' } }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit) || 1,
        },
        counts: {
          pending: pendingCount,
          verified: verifiedCount,
          rejected: rejectedCount,
          duplicates: duplicateCount,
        },
      },
    });
  } catch (err) {
    next(err);
  }
}

// ── 5. Protected: Get Admin Alumni Detail ────────────────────────────────────
export async function getAdminAlumniById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid alumni ID format');
    }

    const alumni = await Alumni.findById(id)
      .populate('verifiedBy', 'name email role')
      .lean();

    if (!alumni) {
      throw ApiError.notFound('Alumni profile not found');
    }

    res.json({
      success: true,
      data: alumni,
    });
  } catch (err) {
    next(err);
  }
}

// ── 6. Protected: Update Admin Alumni Profile ────────────────────────────────
export async function updateAdminAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid alumni ID format');
    }

    const existing = await Alumni.findById(id);
    if (!existing) {
      throw ApiError.notFound('Alumni profile not found');
    }

    // Duplicate check on updated email
    if (req.body.personalEmail) {
      const email = String(req.body.personalEmail).toLowerCase().trim();
      const duplicate = await Alumni.findOne({ personalEmail: email, _id: { $ne: id } });
      if (duplicate) {
        throw ApiError.conflict('Another alumni profile with this email address already exists.');
      }
      existing.personalEmail = email;
    }

    // Duplicate check on updated registerNumber
    if (req.body.registerNumber) {
      const regNo = String(req.body.registerNumber).toUpperCase().trim();
      const duplicate = await Alumni.findOne({ registerNumber: regNo, _id: { $ne: id } });
      if (duplicate) {
        throw ApiError.conflict('Another alumni profile with this register number already exists.');
      }
      existing.registerNumber = regNo;
    }

    const beforeState = existing.toObject();

    // Assign allowable update fields
    const updatableFields = [
      'firstName',
      'lastName',
      'degree',
      'departmentId',
      'graduationYear',
      'phoneNumber',
      'residentialAddress',
      'currentCompany',
      'designation',
      'industry',
      'employmentType',
      'city',
      'country',
      'linkedInUrl',
      'avatarUrl',
      'avatarMediaId',
      'testimonial',
      'isFeatured',
      'isPublicDirectoryOptIn',
      'isWillingToMentor',
      'status',
      'internalNotes',
    ] as const;

    for (const field of updatableFields) {
      if (req.body[field] !== undefined) {
        (existing as unknown as Record<string, unknown>)[field] = req.body[field];
      }
    }

    await existing.save();

    await recordAudit(
      req,
      'UPDATE',
      String(existing._id),
      beforeState as unknown as Record<string, unknown>,
      existing.toObject() as unknown as Record<string, unknown>
    );

    res.json({
      success: true,
      message: 'Alumni profile updated successfully',
      data: existing,
    });
  } catch (err: unknown) {
    if (typeof err === 'object' && err !== null && 'code' in err && (err as { code: number }).code === 11000) {
      next(ApiError.conflict('Another alumni record with these unique details already exists.'));
      return;
    }
    next(err);
  }
}

// ── 7. Protected: Verify Alumni Profile ──────────────────────────────────────
export async function verifyAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid alumni ID format');
    }

    const existing = await Alumni.findById(id);
    if (!existing) {
      throw ApiError.notFound('Alumni profile not found');
    }

    const beforeState = existing.toObject();

    existing.verificationStatus = 'verified';
    existing.verifiedBy = new mongoose.Types.ObjectId(req.user?.id);
    existing.verifiedAt = new Date();
    existing.rejectionReason = undefined;

    if (req.body.remarks) {
      existing.internalNotes = existing.internalNotes
        ? `${existing.internalNotes}\n[Verification Note]: ${req.body.remarks}`
        : `[Verification Note]: ${req.body.remarks}`;
    }

    await existing.save();

    await recordAudit(
      req,
      'APPROVE',
      String(existing._id),
      beforeState as unknown as Record<string, unknown>,
      existing.toObject() as unknown as Record<string, unknown>
    );

    res.json({
      success: true,
      message: 'Alumni profile verified successfully',
      data: existing,
    });
  } catch (err) {
    next(err);
  }
}

// ── 8. Protected: Reject Alumni Profile ──────────────────────────────────────
export async function rejectAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid alumni ID format');
    }

    const { rejectionReason } = req.body;
    if (!rejectionReason || String(rejectionReason).trim().length < 3) {
      throw ApiError.badRequest('A valid rejection reason is required');
    }

    const existing = await Alumni.findById(id);
    if (!existing) {
      throw ApiError.notFound('Alumni profile not found');
    }

    const beforeState = existing.toObject();

    existing.verificationStatus = 'rejected';
    existing.rejectionReason = String(rejectionReason).trim();
    existing.verifiedBy = new mongoose.Types.ObjectId(req.user?.id);
    existing.verifiedAt = new Date();
    // Safety requirement: A rejected profile must never remain public
    existing.isPublicDirectoryOptIn = false;

    await existing.save();

    await recordAudit(
      req,
      'REJECT',
      String(existing._id),
      beforeState as unknown as Record<string, unknown>,
      existing.toObject() as unknown as Record<string, unknown>
    );

    res.json({
      success: true,
      message: 'Alumni profile has been rejected',
      data: existing,
    });
  } catch (err) {
    next(err);
  }
}

// ── 9. Protected: Delete / Archive Alumni Profile ───────────────────────────
export async function deleteAdminAlumni(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      throw ApiError.badRequest('Invalid alumni ID format');
    }

    const existing = await Alumni.findById(id);
    if (!existing) {
      throw ApiError.notFound('Alumni profile not found');
    }

    const beforeState = existing.toObject();

    // Soft delete: transition to archived and remove from public directory
    existing.status = 'archived';
    existing.isPublicDirectoryOptIn = false;
    await existing.save();

    await recordAudit(
      req,
      'DELETE',
      String(existing._id),
      beforeState as unknown as Record<string, unknown>,
      existing.toObject() as unknown as Record<string, unknown>
    );

    res.json({
      success: true,
      message: 'Alumni profile archived successfully',
    });
  } catch (err) {
    next(err);
  }
}
