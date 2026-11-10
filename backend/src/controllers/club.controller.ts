/**
 * club.controller.ts — Controller for Clubs & Membership Management
 *
 * Implements:
 *  1. Public club directory & detail views with strict projection allowlists.
 *  2. Public club member directory strictly filtered to active members with verified affirmative consent.
 *  3. Public membership registration with server-enforced defaults, duplicate detection, and reopening.
 *  4. Public directory consent withdrawal with anti-enumeration protection.
 *  5. Scoped administrative club management with `assertClubScope` and protected-field safeguards.
 *  6. Club Head assignment with scope conflict detection.
 *  7. Membership administration (review, approval, rejection, lifecycle updates, promotion safeguards).
 *  8. Transaction-safe memberCount updates with two-phase standalone fallback and reconciliation.
 *  9. Immutable audit logging with comprehensive PII redaction.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Club, resolveClubDocument } from '../models/club.model';
import { ClubMembership } from '../models/club-membership.model';
import { User, UserRole } from '../models/user.model';
import { AuditLog } from '../models/audit-log.model';
import { assertClubScope } from '../middleware/scope-guard';
import {
  createClubSchema,
  updateClubSchema,
  assignClubHeadSchema,
  registerMembershipSchema,
  reviewMembershipSchema,
  updateMembershipLifecycleSchema,
  withdrawDirectoryConsentSchema,
  PROTECTED_CLUB_FIELDS_FOR_HEADS,
} from '../validations/club.validation';
import { ApiError } from '../utils/api-error';
import logger from '../utils/logger';

// ── Parameter Extractor Helper ────────────────────────────────────────────────
function getParam(param: string | string[] | undefined): string {
  if (Array.isArray(param)) return param[0] || '';
  return param ? String(param).trim() : '';
}

// ── Approved Institutional Email Domains ──────────────────────────────────────
const INSTITUTIONAL_EMAIL_DOMAINS = ['bac.edu.in', 'bishopambrose.edu.in', 'b-u.ac.in'];

export function isInstitutionalEmail(email?: string): boolean {
  if (!email) return false;
  const parts = email.toLowerCase().split('@');
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return INSTITUTIONAL_EMAIL_DOMAINS.some(
    (instDomain) => domain === instDomain || domain.endsWith('.' + instDomain)
  );
}

// ── Public Projection Allowlists ──────────────────────────────────────────────
export const PUBLIC_CLUB_PROJECTION = {
  _id: 1,
  name: 1,
  slug: 1,
  code: 1,
  category: 1,
  description: 1,
  facultyCoordinator: 1,
  contactEmail: 1,
  logoUrl: 1,
  bannerImage: 1,
  meetingSchedule: 1,
  roomOrVenue: 1,
  isRecruiting: 1,
  memberCount: 1,
  achievements: 1,
  featuredOrder: 1,
  createdAt: 1,
};

export const PUBLIC_MEMBER_PROJECTION = {
  _id: 0,
  studentName: 1,
  degree: 1,
  yearOfStudy: 1,
  role: 1,
  joinedAt: 1,
};

// ── Audit Log Redaction & Helper ──────────────────────────────────────────────
export const CLUB_AUDIT_EXCLUDED_KEYS = new Set([
  'personalEmail',
  'phoneNumber',
  'registerNumber',
  'internalNotes',
  'registeredIp',
  'rejectionReason',
]);

export function sanitizeClubAuditState(
  state: Record<string, unknown> | null
): Record<string, unknown> | null {
  if (!state) return null;
  const sanitized: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(state)) {
    if (CLUB_AUDIT_EXCLUDED_KEYS.has(key)) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export async function recordClubAudit(
  req: Request,
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'APPROVE' | 'REJECT' | 'ARCHIVE',
  recordId: string,
  entityType: 'Club' | 'ClubMembership',
  beforeState: Record<string, unknown> | null,
  afterState: Record<string, unknown> | null,
  customTitle?: string
): Promise<void> {
  try {
    const actorId = req.user?.id || 'system_anonymous';
    const actorName = req.user?.name || req.user?.email || 'Anonymous/System';
    const actorRole = req.user?.role || 'public_user';

    const sanitizedBefore = sanitizeClubAuditState(beforeState);
    const sanitizedAfter = sanitizeClubAuditState(afterState);

    await AuditLog.create({
      userId: actorId,
      userName: actorName,
      userRole: actorRole,
      action,
      module: 'Clubs',
      recordId,
      recordTitle: customTitle || `${action} ${entityType}: ${recordId}`,
      oldValue: sanitizedBefore ? JSON.stringify(sanitizedBefore) : undefined,
      newValue: sanitizedAfter ? JSON.stringify(sanitizedAfter) : undefined,
      ipAddress: req.ip,
      requestId: req.id,
      timestamp: new Date(),
    });
  } catch (err) {
    logger.error('Failed to create audit log for club action', {
      error: err instanceof Error ? err.message : 'Unknown error',
      recordId,
      action,
    });
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. PUBLIC CLUB DIRECTORY & DETAIL
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /clubs/directory
 * Public directory listing active, published clubs with safe projections.
 */
export async function getPublicClubDirectory(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      status: 'active',
      isPublished: true,
    };

    if (req.query.category && typeof req.query.category === 'string') {
      query.category = req.query.category;
    }

    if (req.query.isRecruiting !== undefined) {
      query.isRecruiting = req.query.isRecruiting === 'true';
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { description: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [total, rawClubs] = await Promise.all([
      Club.countDocuments(query),
      Club.find(query, PUBLIC_CLUB_PROJECTION)
        .sort({ featuredOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    // Privacy safeguard: Strip non-institutional contactEmail
    const clubs = rawClubs.map((c) => {
      const sanitized: Record<string, unknown> = { ...c };
      if (sanitized.contactEmail && !isInstitutionalEmail(String(sanitized.contactEmail))) {
        delete sanitized.contactEmail;
      }
      return sanitized;
    });

    res.json({
      success: true,
      data: clubs,
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
 * GET /clubs/:slug
 * Public view for a single active, published club.
 */
export async function getPublicClubBySlug(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = getParam(req.params.slug).toLowerCase();
    if (!slug) {
      throw ApiError.badRequest('Club slug is required.');
    }

    const club = await Club.findOne(
      { slug, status: 'active', isPublished: true },
      PUBLIC_CLUB_PROJECTION
    ).lean();

    if (!club) {
      throw ApiError.notFound(`Club '${slug}'`);
    }

    const sanitized: Record<string, unknown> = { ...club };
    if (sanitized.contactEmail && !isInstitutionalEmail(String(sanitized.contactEmail))) {
      delete sanitized.contactEmail;
    }

    res.json({
      success: true,
      data: sanitized,
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. PUBLIC MEMBER DIRECTORY
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /clubs/:slug/members
 * Public member roster: strictly returns active members who gave explicit directory consent.
 */
export async function getPublicClubMembers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = getParam(req.params.slug).toLowerCase();
    if (!slug) {
      throw ApiError.badRequest('Club slug is required.');
    }

    // Verify club exists, is active, and is published
    const club = await Club.findOne({ slug, status: 'active', isPublished: true }).lean();
    if (!club) {
      throw ApiError.notFound(`Club '${slug}'`);
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '50'), 10)));
    const skip = (page - 1) * limit;

    const query = {
      clubSlug: club.slug,
      status: 'active',
      isPublicDirectoryOptIn: true,
    };

    const [total, members] = await Promise.all([
      ClubMembership.countDocuments(query),
      ClubMembership.find(query, PUBLIC_MEMBER_PROJECTION)
        .sort({ role: -1, studentName: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    res.json({
      success: true,
      data: members,
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

// ══════════════════════════════════════════════════════════════════════════════
// 3. PUBLIC MEMBERSHIP REGISTRATION
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /clubs/:slug/memberships
 * Public student membership registration with server-side defaults and reapplication support.
 */
export async function registerClubMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = getParam(req.params.slug).toLowerCase();
    if (!slug) {
      throw ApiError.badRequest('Club slug is required.');
    }

    // Resolve club: must be active, published, and recruiting
    const club = await Club.findOne({ slug, status: 'active', isPublished: true });
    if (!club) {
      throw ApiError.notFound(`Club '${slug}'`);
    }

    if (!club.isRecruiting) {
      throw ApiError.badRequest('Recruitment for this club is currently closed.');
    }

    // Validate payload with Zod
    const validated = registerMembershipSchema.parse(req.body);

    const normalizedRegisterNumber = validated.registerNumber.trim().toUpperCase();
    const normalizedEmail = validated.personalEmail.trim().toLowerCase();
    const isOptIn = Boolean(validated.confirmPublicDirectoryConsent);

    // Check for existing membership record for this club + registerNumber
    const existing = await ClubMembership.findOne({
      clubSlug: club.slug,
      registerNumber: normalizedRegisterNumber,
    });

    if (existing) {
      // If currently pending or active, reject as duplicate (HTTP 409)
      if (existing.status === 'pending' || existing.status === 'active') {
        throw ApiError.conflict(
          `A membership application or active membership already exists for register number ${normalizedRegisterNumber} in this club.`
        );
      }

      // Reopening past membership (rejected, inactive, or alumni):
      // Update contact details, clear review metadata, reset status to pending and role to member
      existing.studentName = validated.studentName;
      existing.departmentId = validated.departmentId;
      existing.degree = validated.degree;
      existing.yearOfStudy = validated.yearOfStudy;
      existing.personalEmail = normalizedEmail;
      existing.phoneNumber = validated.phoneNumber;
      existing.reasonForJoining = validated.reasonForJoining;
      existing.role = 'member';
      existing.status = 'pending';
      existing.rejectionReason = undefined;
      existing.reviewedBy = undefined;
      existing.reviewedAt = undefined;
      existing.registeredIp = req.ip;

      // Consent must be explicitly renewed on reapplication
      existing.isPublicDirectoryOptIn = isOptIn;
      existing.directoryConsentAt = isOptIn ? new Date() : undefined;

      await existing.save();

      res.status(200).json({
        success: true,
        message: 'Membership application resubmitted successfully and is pending review.',
        data: {
          clubSlug: club.slug,
          studentName: existing.studentName,
          degree: existing.degree,
          yearOfStudy: existing.yearOfStudy,
          status: existing.status,
          submittedAt: existing.updatedAt,
        },
      });
      return;
    }

    // New membership document
    const newMembership = new ClubMembership({
      clubSlug: club.slug,
      clubId: club._id,
      studentName: validated.studentName,
      registerNumber: normalizedRegisterNumber,
      departmentId: validated.departmentId,
      degree: validated.degree,
      yearOfStudy: validated.yearOfStudy,
      personalEmail: normalizedEmail,
      phoneNumber: validated.phoneNumber,
      reasonForJoining: validated.reasonForJoining,
      role: 'member',
      status: 'pending',
      isPublicDirectoryOptIn: isOptIn,
      directoryConsentAt: isOptIn ? new Date() : undefined,
      registeredIp: req.ip,
    });

    try {
      await newMembership.save();
    } catch (saveErr: unknown) {
      const errObj = saveErr as { code?: number; name?: string };
      if (errObj && (errObj.code === 11000 || errObj.name === 'MongoServerError')) {
        throw ApiError.conflict(
          `A membership application already exists for register number ${normalizedRegisterNumber} in this club.`
        );
      }
      throw saveErr;
    }

    res.status(201).json({
      success: true,
      message: 'Membership application submitted successfully and is pending review.',
      data: {
        clubSlug: club.slug,
        studentName: newMembership.studentName,
        degree: newMembership.degree,
        yearOfStudy: newMembership.yearOfStudy,
        status: newMembership.status,
        submittedAt: newMembership.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 4. PUBLIC DIRECTORY CONSENT WITHDRAWAL
// ══════════════════════════════════════════════════════════════════════════════

/**
 * POST /clubs/:slug/memberships/withdraw-consent
 * Securely withdraws consent without leaking existence or member PII.
 */
export async function withdrawPublicDirectoryConsent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const slug = getParam(req.params.slug).toLowerCase();
    if (!slug) {
      throw ApiError.badRequest('Club slug is required.');
    }

    const { registerNumber, personalEmail } = withdrawDirectoryConsentSchema.parse(req.body);

    const membership = await ClubMembership.findOne({
      clubSlug: slug,
      registerNumber: registerNumber.toUpperCase(),
      personalEmail: personalEmail.toLowerCase(),
    });

    if (membership && membership.isPublicDirectoryOptIn) {
      const beforeState = membership.toObject() as unknown as Record<string, unknown>;
      membership.isPublicDirectoryOptIn = false;
      membership.directoryConsentAt = undefined;
      await membership.save();

      await recordClubAudit(
        req,
        'UPDATE',
        String(membership._id),
        'ClubMembership',
        beforeState,
        membership.toObject() as unknown as Record<string, unknown>,
        `Public directory consent withdrawn for membership ${membership._id}`
      );
    }

    // Generic anti-enumeration response
    res.json({
      success: true,
      message:
        'If a matching membership with active directory consent was found, consent has been successfully withdrawn.',
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 5. ADMINISTRATIVE CLUB MANAGEMENT
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /admin/clubs
 * Admin listing of clubs with scoped filtering.
 */
export async function listAdminClubs(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      throw ApiError.unauthorized('Authentication required.');
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {};

    // Role-based scope filtering
    if (req.user.role === 'master_admin' || req.user.role === 'ADMIN' || req.user.role === 'sub_admin') {
      // Global administrators can view all clubs with optional filters
      if (req.query.status && typeof req.query.status === 'string') {
        query.status = req.query.status;
      }
      if (req.query.category && typeof req.query.category === 'string') {
        query.category = req.query.category;
      }
    } else if (req.user.role === 'club_head') {
      if (!req.user.clubId || req.user.clubId.trim() === '') {
        throw ApiError.forbidden(
          'Account lacks an assigned club scope. Please contact the administrator.',
          'UNASSIGNED_SCOPE'
        );
      }
      query.slug = req.user.clubId.trim().toLowerCase();
    } else {
      throw ApiError.forbidden(
        'Forbidden: You lack the required role to manage club resources.',
        'FORBIDDEN_ROLE'
      );
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { slug: { $regex: escaped, $options: 'i' } },
        { code: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [total, clubs] = await Promise.all([
      Club.countDocuments(query),
      Club.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    res.json({
      success: true,
      data: clubs,
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
 * GET /admin/clubs/:id
 * Retrieve single club by MongoDB ObjectId or canonical slug.
 */
export async function getAdminClubById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const club = await resolveClubDocument(getParam(req.params.id));
    assertClubScope(req.user, club.slug);

    res.json({
      success: true,
      data: club,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/clubs
 * Create new institutional club. Super Admin / Sub Admin only.
 */
export async function createAdminClub(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (
      !req.user ||
      (req.user.role !== 'master_admin' && req.user.role !== 'ADMIN' && req.user.role !== 'sub_admin')
    ) {
      throw ApiError.forbidden('Only institutional administrators may create clubs.', 'FORBIDDEN_ROLE');
    }

    const validated = createClubSchema.parse(req.body);

    const normalizedSlug = validated.slug.trim().toLowerCase();
    const normalizedCode = validated.code.trim().toUpperCase();

    // Check uniqueness
    const [existingSlug, existingCode] = await Promise.all([
      Club.findOne({ slug: normalizedSlug }),
      Club.findOne({ code: normalizedCode }),
    ]);

    if (existingSlug) {
      throw ApiError.conflict(`Club with slug '${normalizedSlug}' already exists.`);
    }
    if (existingCode) {
      throw ApiError.conflict(`Club with code '${normalizedCode}' already exists.`);
    }

    const club = new Club({
      ...validated,
      slug: normalizedSlug,
      code: normalizedCode,
      status: 'active',
      memberCount: 0,
    });

    await club.save();

    await recordClubAudit(
      req,
      'CREATE',
      String(club._id),
      'Club',
      null,
      club.toObject() as unknown as Record<string, unknown>,
      `Created club '${club.name}' (${club.slug})`
    );

    res.status(201).json({
      success: true,
      message: 'Club created successfully.',
      data: club,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT / PATCH /admin/clubs/:id
 * Update club details. Enforces protected fields against Club Head mutation.
 */
export async function updateAdminClub(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const club = await resolveClubDocument(getParam(req.params.id));
    assertClubScope(req.user, club.slug);

    // Safeguard: Club Heads are forbidden from mutating organizational/administrative fields
    if (req.user?.role === 'club_head') {
      for (const field of PROTECTED_CLUB_FIELDS_FOR_HEADS) {
        if (req.body[field] !== undefined) {
          throw ApiError.forbidden(
            `Club Heads are not permitted to modify protected field '${field}'.`,
            'FORBIDDEN_FIELD_MUTATION'
          );
        }
      }
    }

    const validated = updateClubSchema.parse(req.body);
    const beforeState = club.toObject() as unknown as Record<string, unknown>;

    // Check slug/code conflict if modified by global admin
    if (validated.slug && validated.slug.toLowerCase() !== club.slug) {
      const slugConflict = await Club.findOne({ slug: validated.slug.toLowerCase() });
      if (slugConflict) {
        throw ApiError.conflict(`Club slug '${validated.slug}' is already taken.`);
      }
      club.slug = validated.slug.toLowerCase();
    }

    if (validated.code && validated.code.toUpperCase() !== club.code) {
      const codeConflict = await Club.findOne({ code: validated.code.toUpperCase() });
      if (codeConflict) {
        throw ApiError.conflict(`Club code '${validated.code}' is already taken.`);
      }
      club.code = validated.code.toUpperCase();
    }

    // Apply allowed updates
    if (validated.name !== undefined) club.name = validated.name;
    if (validated.category !== undefined) club.category = validated.category;
    if (validated.description !== undefined) club.description = validated.description;
    if (validated.facultyCoordinator !== undefined) club.facultyCoordinator = validated.facultyCoordinator;
    if (validated.facultyCoordinatorEmail !== undefined)
      club.facultyCoordinatorEmail = validated.facultyCoordinatorEmail || undefined;
    if (validated.contactEmail !== undefined) club.contactEmail = validated.contactEmail;
    if (validated.departmentId !== undefined) club.departmentId = validated.departmentId || undefined;
    if (validated.logoUrl !== undefined) club.logoUrl = validated.logoUrl || undefined;
    if (validated.bannerImage !== undefined) club.bannerImage = validated.bannerImage || undefined;
    if (validated.meetingSchedule !== undefined) club.meetingSchedule = validated.meetingSchedule || undefined;
    if (validated.roomOrVenue !== undefined) club.roomOrVenue = validated.roomOrVenue || undefined;
    if (validated.isRecruiting !== undefined) club.isRecruiting = validated.isRecruiting;
    if (validated.isPublished !== undefined) club.isPublished = validated.isPublished;
    if (validated.featuredOrder !== undefined) club.featuredOrder = validated.featuredOrder;
    if (validated.status !== undefined) club.status = validated.status;
    if (validated.achievements !== undefined) club.achievements = validated.achievements;

    await club.save();

    await recordClubAudit(
      req,
      'UPDATE',
      String(club._id),
      'Club',
      beforeState,
      club.toObject() as unknown as Record<string, unknown>,
      `Updated club '${club.name}' (${club.slug})`
    );

    res.json({
      success: true,
      message: 'Club updated successfully.',
      data: club,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /admin/clubs/:id
 * Soft-archives a club. Fails if active memberships exist unless force=true is specified.
 * When force=true, transitions active memberships to 'inactive' and resets memberCount to 0.
 */
export async function deleteAdminClub(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (
      !req.user ||
      (req.user.role !== 'master_admin' && req.user.role !== 'ADMIN' && req.user.role !== 'sub_admin')
    ) {
      throw ApiError.forbidden('Only institutional administrators may archive clubs.', 'FORBIDDEN_ROLE');
    }

    const club = await resolveClubDocument(getParam(req.params.id));

    // Safeguard: Check active memberships
    const activeCount = await ClubMembership.countDocuments({
      clubSlug: club.slug,
      status: 'active',
    });

    if (activeCount > 0 && req.query.force !== 'true') {
      throw ApiError.badRequest(
        `Cannot archive club '${club.name}' because it has ${activeCount} active member(s). Deactivate or transition members before archiving.`,
        'ACTIVE_MEMBERS_EXIST'
      );
    }

    // DEF-02: When forced archival is performed with active members,
    // transition active memberships to 'inactive' and reset memberCount to 0
    let deactivatedMembers = 0;
    let affectedActiveMemberIds: mongoose.Types.ObjectId[] = [];
    if (req.query.force === 'true' && activeCount > 0) {
      const activeMembers = await ClubMembership.find({
        clubSlug: club.slug,
        status: 'active',
      }).select('_id');
      affectedActiveMemberIds = activeMembers.map((m) => m._id as mongoose.Types.ObjectId);

      const updateResult = await ClubMembership.updateMany(
        { _id: { $in: affectedActiveMemberIds } },
        { $set: { status: 'inactive' } }
      );
      deactivatedMembers = updateResult.modifiedCount;
    }

    const beforeState = club.toObject() as unknown as Record<string, unknown>;
    club.status = 'archived';
    club.isPublished = false;
    club.isRecruiting = false;
    club.memberCount = 0;

    try {
      await club.save();
    } catch (saveErr) {
      if (affectedActiveMemberIds.length > 0) {
        try {
          await ClubMembership.updateMany(
            { _id: { $in: affectedActiveMemberIds } },
            { $set: { status: 'active' } }
          );
          logger.info(
            `Compensated forced archival failure for club '${club.slug}': restored ${affectedActiveMemberIds.length} memberships to active.`
          );
        } catch (compensationErr) {
          logger.error(
            `CRITICAL: Compensation failed during forced archival rollback for club '${club.slug}'. Active memberships could not be reverted. Run /reconcile to restore member consistency.`,
            {
              affectedActiveMemberIds,
              originalError: saveErr instanceof Error ? saveErr.message : saveErr,
              compensationError: compensationErr instanceof Error ? compensationErr.message : compensationErr,
            }
          );
          throw ApiError.internal(
            'Forced archival failed during club document update, and automated rollback encountered an error. Run /reconcile to restore member consistency.'
          );
        }
      }
      throw saveErr;
    }

    await recordClubAudit(
      req,
      'ARCHIVE',
      String(club._id),
      'Club',
      beforeState,
      club.toObject() as unknown as Record<string, unknown>,
      `Archived club '${club.name}' (${club.slug}) with ${deactivatedMembers} active member(s) transitioned to inactive`
    );

    res.json({
      success: true,
      message: 'Club archived successfully.',
      data: {
        id: club._id,
        slug: club.slug,
        status: club.status,
        memberCount: club.memberCount,
        deactivatedMembers,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/clubs/:id/head
 * Assigns or replaces student head for a club.
 * DEF-01: Automatically demotes the previous Club Head user to 'staff' and unsets their clubId.
 */
export async function assignAdminClubHead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (
      !req.user ||
      (req.user.role !== 'master_admin' && req.user.role !== 'ADMIN' && req.user.role !== 'sub_admin')
    ) {
      throw ApiError.forbidden('Only institutional administrators may assign club leadership.', 'FORBIDDEN_ROLE');
    }

    const club = await resolveClubDocument(getParam(req.params.id));
    const { userId, studentHeadName } = assignClubHeadSchema.parse(req.body);

    const targetUser = await User.findById(userId);
    if (!targetUser) {
      throw ApiError.notFound(`User '${userId}'`);
    }

    // Prevent conflict: If target user is already assigned to a different club as club_head
    if (
      targetUser.clubId &&
      targetUser.clubId.trim().toLowerCase() !== club.slug &&
      targetUser.role === 'club_head'
    ) {
      throw ApiError.conflict(
        `User ${targetUser.email} is already assigned as Club Head for club '${targetUser.clubId}'.`
      );
    }

    const beforeClubState = club.toObject() as unknown as Record<string, unknown>;
    const previousHeadUserId = club.studentHeadUserId;

    // Snapshot target user state before any changes
    const newUserSnapshot = {
      role: targetUser.role as UserRole,
      clubId: targetUser.clubId,
      permissions: [...(targetUser.permissions || [])],
    };

    let previousUser: (typeof targetUser) | null = null;
    let previousUserSnapshot: {
      role: UserRole;
      clubId?: string;
      permissions: string[];
    } | null = null;
    let previousDemoted = false;
    let beforePrevState: Record<string, unknown> | null = null;

    // DEF-01: If an existing head is present and differs from the new user, demote them to 'staff'
    if (previousHeadUserId && String(previousHeadUserId) !== String(targetUser._id)) {
      try {
        previousUser = await User.findById(previousHeadUserId);
        if (previousUser && previousUser.role === 'club_head') {
          beforePrevState = previousUser.toObject() as unknown as Record<string, unknown>;
          previousUserSnapshot = {
            role: previousUser.role as UserRole,
            clubId: previousUser.clubId,
            permissions: [...(previousUser.permissions || [])],
          };

          previousUser.role = 'staff';
          previousUser.clubId = undefined;
          previousUser.permissions = previousUser.permissions.filter((p) => !p.startsWith('clubs:'));
          await previousUser.save();
          previousDemoted = true;
        }
      } catch (prevErr) {
        // Safe handling: If previous user record is missing, corrupted, or lookup fails
        logger.warn('Previous club head user record could not be demoted or inspected', {
          previousHeadUserId,
          error: prevErr instanceof Error ? prevErr.message : 'Unknown error',
        });
      }
    }

    // Update target user role and scope
    targetUser.role = 'club_head';
    targetUser.clubId = club.slug;
    if (!targetUser.permissions.includes('clubs:update')) {
      targetUser.permissions.push('clubs:update', 'clubs:read', 'clubs:members:read', 'clubs:members:approve');
    }

    try {
      await targetUser.save();
    } catch (targetSaveErr) {
      // If saving target user fails, restore previous user if demoted
      if (previousDemoted && previousUser && previousUserSnapshot) {
        try {
          previousUser.role = previousUserSnapshot.role;
          previousUser.clubId = previousUserSnapshot.clubId;
          previousUser.permissions = [...previousUserSnapshot.permissions];
          await previousUser.save();
          logger.info(
            `Compensated previous club head demotion for user ${previousUser._id} after target user save failure.`
          );
        } catch (compensationErr) {
          logger.error(
            `CRITICAL: Compensation failed during leadership assignment rollback. Previous head ${previousUser._id} could not be restored.`,
            {
              previousUserId: previousUser._id,
              targetUserId: targetUser._id,
              originalError: targetSaveErr instanceof Error ? targetSaveErr.message : targetSaveErr,
              compensationError: compensationErr instanceof Error ? compensationErr.message : compensationErr,
            }
          );
          throw ApiError.internal(
            'Leadership assignment failed and automated rollback encountered an error. Please inspect user assignments.'
          );
        }
      }
      throw targetSaveErr;
    }

    // Update club
    club.studentHeadUserId = targetUser._id as mongoose.Types.ObjectId;
    club.studentHeadName = studentHeadName || targetUser.name;

    try {
      await club.save();
    } catch (clubSaveErr) {
      // If saving club fails, restore both target user and previous user
      let compensationFailed = false;
      let firstCompensationError: unknown = null;

      try {
        targetUser.role = newUserSnapshot.role;
        targetUser.clubId = newUserSnapshot.clubId;
        targetUser.permissions = [...newUserSnapshot.permissions];
        await targetUser.save();
        logger.info(
          `Compensated target user promotion for user ${targetUser._id} after club save failure.`
        );
      } catch (c1Err) {
        compensationFailed = true;
        firstCompensationError = c1Err;
      }

      if (previousDemoted && previousUser && previousUserSnapshot) {
        try {
          previousUser.role = previousUserSnapshot.role;
          previousUser.clubId = previousUserSnapshot.clubId;
          previousUser.permissions = [...previousUserSnapshot.permissions];
          await previousUser.save();
          logger.info(
            `Compensated previous club head demotion for user ${previousUser._id} after club save failure.`
          );
        } catch (c2Err) {
          compensationFailed = true;
          if (!firstCompensationError) firstCompensationError = c2Err;
        }
      }

      if (compensationFailed) {
        logger.error(
          'CRITICAL: Compensation failed during leadership assignment rollback. User states could not be fully restored.',
          {
            targetUserId: targetUser._id,
            previousUserId: previousUser?._id,
            originalError: clubSaveErr instanceof Error ? clubSaveErr.message : clubSaveErr,
            compensationError:
              firstCompensationError instanceof Error ? firstCompensationError.message : firstCompensationError,
          }
        );
        throw ApiError.internal(
          'Leadership assignment failed and automated rollback encountered an error. Please inspect user assignments.'
        );
      }

      throw clubSaveErr;
    }

    // Defer audit logging until all database writes have succeeded
    if (previousDemoted && previousUser && beforePrevState) {
      await recordClubAudit(
        req,
        'UPDATE',
        String(previousUser._id),
        'Club',
        beforePrevState,
        previousUser.toObject() as unknown as Record<string, unknown>,
        `Demoted previous Club Head ${previousUser.name} (${previousUser.email}) from club '${club.slug}' to staff`
      );
    }

    await recordClubAudit(
      req,
      'UPDATE',
      String(club._id),
      'Club',
      beforeClubState,
      club.toObject() as unknown as Record<string, unknown>,
      `Assigned Club Head ${targetUser.name} (${targetUser.email}) to club '${club.slug}'`
    );

    res.json({
      success: true,
      message: `Assigned ${targetUser.name} as Club Head for ${club.name}.`,
      data: {
        clubId: club._id,
        clubSlug: club.slug,
        studentHeadUserId: targetUser._id,
        studentHeadName: club.studentHeadName,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 6. MEMBERSHIP ADMINISTRATION & REVIEW
// ══════════════════════════════════════════════════════════════════════════════

/**
 * GET /admin/clubs/:id/memberships
 * List all membership applications and roster entries for a club.
 */
export async function listAdminClubMemberships(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const club = await resolveClubDocument(getParam(req.params.id));
    assertClubScope(req.user, club.slug);

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10));
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || '20'), 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, unknown> = {
      clubSlug: club.slug,
    };

    if (req.query.status && typeof req.query.status === 'string') {
      query.status = req.query.status;
    }
    if (req.query.role && typeof req.query.role === 'string') {
      query.role = req.query.role;
    }

    if (req.query.search && typeof req.query.search === 'string') {
      const escaped = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { studentName: { $regex: escaped, $options: 'i' } },
        { registerNumber: { $regex: escaped, $options: 'i' } },
        { personalEmail: { $regex: escaped, $options: 'i' } },
      ];
    }

    const [total, memberships] = await Promise.all([
      ClubMembership.countDocuments(query),
      ClubMembership.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ]);

    res.json({
      success: true,
      data: memberships,
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
 * POST /admin/clubs/:id/memberships/:memberId/approve
 * Approves a pending membership and increments memberCount atomically.
 */
export async function approveAdminClubMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const club = await resolveClubDocument(getParam(req.params.id));
    assertClubScope(req.user, club.slug);

    const memberId = getParam(req.params.memberId);
    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      throw ApiError.badRequest('Invalid membership ID.');
    }

    // Step 1: Precondition check — atomically find & transition status: pending -> active
    // This atomic conditional update eliminates concurrent duplicate approvals
    const updatedMembership = await ClubMembership.findOneAndUpdate(
      {
        _id: memberId,
        clubSlug: club.slug,
        status: 'pending',
      },
      {
        $set: {
          status: 'active',
          role: req.body.role || 'member',
          joinedAt: new Date(),
          reviewedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedMembership) {
      // Check if membership exists in another state or does not belong to this club
      const existing = await ClubMembership.findOne({ _id: memberId, clubSlug: club.slug });
      if (!existing) {
        throw ApiError.notFound('Club membership');
      }
      throw ApiError.badRequest(
        `Cannot approve membership: Current status is '${existing.status}'. Only pending applications can be approved.`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // Step 2: Atomically increment club memberCount
    try {
      await Club.updateOne({ _id: club._id }, { $inc: { memberCount: 1 } });
    } catch (countErr) {
      // Compensating recovery: revert membership back to pending
      logger.error('Failed to increment club memberCount during approval. Rolling back.', {
        clubId: club._id,
        memberId,
        error: countErr instanceof Error ? countErr.message : 'Unknown error',
      });
      await ClubMembership.updateOne(
        { _id: memberId },
        {
          $set: {
            status: 'pending',
            joinedAt: undefined,
            reviewedBy: undefined,
            reviewedAt: undefined,
          },
        }
      );
      throw countErr;
    }

    await recordClubAudit(
      req,
      'APPROVE',
      String(updatedMembership._id),
      'ClubMembership',
      { status: 'pending' },
      updatedMembership.toObject() as unknown as Record<string, unknown>,
      `Approved membership for ${updatedMembership.studentName} in '${club.slug}'`
    );

    res.json({
      success: true,
      message: 'Membership approved successfully.',
      data: updatedMembership,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/clubs/:id/memberships/:memberId/reject
 * Rejects a pending membership with required rejection reason.
 */
export async function rejectAdminClubMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const club = await resolveClubDocument(getParam(req.params.id));
    assertClubScope(req.user, club.slug);

    const memberId = getParam(req.params.memberId);
    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      throw ApiError.badRequest('Invalid membership ID.');
    }

    const { rejectionReason } = reviewMembershipSchema.parse(req.body);

    const updatedMembership = await ClubMembership.findOneAndUpdate(
      {
        _id: memberId,
        clubSlug: club.slug,
        status: 'pending',
      },
      {
        $set: {
          status: 'rejected',
          rejectionReason,
          reviewedBy: req.user?.id ? new mongoose.Types.ObjectId(req.user.id) : undefined,
          reviewedAt: new Date(),
        },
      },
      { new: true }
    );

    if (!updatedMembership) {
      const existing = await ClubMembership.findOne({ _id: memberId, clubSlug: club.slug });
      if (!existing) {
        throw ApiError.notFound('Club membership');
      }
      throw ApiError.badRequest(
        `Cannot reject membership: Current status is '${existing.status}'. Only pending applications can be rejected.`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    await recordClubAudit(
      req,
      'REJECT',
      String(updatedMembership._id),
      'ClubMembership',
      { status: 'pending' },
      updatedMembership.toObject() as unknown as Record<string, unknown>,
      `Rejected membership for ${updatedMembership.studentName} in '${club.slug}'`
    );

    res.json({
      success: true,
      message: 'Membership rejected successfully.',
      data: updatedMembership,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /admin/clubs/:id/memberships/:memberId
 * Update membership lifecycle (role promotion, deactivation, archival).
 */
export async function updateAdminClubMembership(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const club = await resolveClubDocument(getParam(req.params.id));
    assertClubScope(req.user, club.slug);

    const memberId = getParam(req.params.memberId);
    if (!memberId || !mongoose.Types.ObjectId.isValid(memberId)) {
      throw ApiError.badRequest('Invalid membership ID.');
    }

    const validated = updateMembershipLifecycleSchema.parse(req.body);

    const member = await ClubMembership.findOne({ _id: memberId, clubSlug: club.slug });
    if (!member) {
      throw ApiError.notFound('Club membership');
    }

    const beforeState = member.toObject() as unknown as Record<string, unknown>;

    // Executive role promotion safeguard
    if (validated.role && validated.role !== member.role) {
      const executiveRoles = ['executive', 'treasurer', 'secretary', 'vice_president', 'president'];
      if (executiveRoles.includes(validated.role)) {
        if (
          !req.user ||
          (req.user.role !== 'master_admin' &&
            req.user.role !== 'ADMIN' &&
            req.user.role !== 'sub_admin' &&
            req.user.role !== 'club_head')
        ) {
          throw ApiError.forbidden(
            'Unauthorized to promote members to executive leadership positions.',
            'FORBIDDEN_ROLE'
          );
        }
      }
      member.role = validated.role;
    }

    // Status transition & member count integrity
    if (validated.status && validated.status !== member.status) {
      // Disallow skipping pending/rejected review workflows via PATCH
      if (member.status === 'pending') {
        throw ApiError.badRequest(
          'Pending memberships must be reviewed via dedicated /approve or /reject endpoints.',
          'INVALID_STATUS_TRANSITION'
        );
      }

      const oldStatus = member.status;
      const newStatus = validated.status;

      // Active -> Inactive / Alumni (Deactivation: decrement count)
      if (oldStatus === 'active' && (newStatus === 'inactive' || newStatus === 'alumni')) {
        member.status = newStatus;
        await member.save();

        await Club.updateOne({ _id: club._id, memberCount: { $gt: 0 } }, { $inc: { memberCount: -1 } });
      }
      // Inactive / Alumni -> Active (Reactivation: increment count)
      else if ((oldStatus === 'inactive' || oldStatus === 'alumni') && newStatus === 'active') {
        member.status = newStatus;
        await member.save();

        await Club.updateOne({ _id: club._id }, { $inc: { memberCount: 1 } });
      }
      // Inactive <-> Alumni
      else if (
        (oldStatus === 'inactive' && newStatus === 'alumni') ||
        (oldStatus === 'alumni' && newStatus === 'inactive')
      ) {
        member.status = newStatus;
        await member.save();
      } else {
        throw ApiError.badRequest(
          `Invalid status transition from '${oldStatus}' to '${newStatus}'.`,
          'INVALID_STATUS_TRANSITION'
        );
      }
    } else {
      if (validated.internalNotes !== undefined) member.internalNotes = validated.internalNotes;
      await member.save();
    }

    await recordClubAudit(
      req,
      'UPDATE',
      String(member._id),
      'ClubMembership',
      beforeState,
      member.toObject() as unknown as Record<string, unknown>,
      `Updated membership lifecycle for ${member.studentName} in '${club.slug}'`
    );

    res.json({
      success: true,
      message: 'Membership updated successfully.',
      data: member,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /admin/clubs/:id/reconcile
 * Recalculates actual active member count and fixes counter drift.
 */
export async function reconcileAdminClubMemberCount(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const club = await resolveClubDocument(getParam(req.params.id));
    assertClubScope(req.user, club.slug);

    const actualActiveCount = await ClubMembership.countDocuments({
      clubSlug: club.slug,
      status: 'active',
    });

    const previousCount = club.memberCount;
    club.memberCount = actualActiveCount;
    await club.save();

    await recordClubAudit(
      req,
      'UPDATE',
      String(club._id),
      'Club',
      { memberCount: previousCount },
      { memberCount: actualActiveCount },
      `Reconciled memberCount for '${club.slug}' from ${previousCount} to ${actualActiveCount}`
    );

    res.json({
      success: true,
      message: `Member count reconciled successfully.`,
      data: {
        clubSlug: club.slug,
        previousCount,
        reconciledCount: actualActiveCount,
      },
    });
  } catch (err) {
    next(err);
  }
}
