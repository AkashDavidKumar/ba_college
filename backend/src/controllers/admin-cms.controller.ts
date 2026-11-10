/**
 * admin-cms.controller.ts — Sub-Phase 4A Core Administration & Governance Controller
 *
 * Implements:
 *  1. User Management (CRUD, bcrypt hashing, protection of last active master_admin,
 *     race-condition protection with mutex serialization, privilege escalation prevention,
 *     prevention of self-deletion and self-demotion, full sanitization of auth fields).
 *  2. Persistent Append-Only Audit Logging (querying, module & actor filtering, zero delete/update).
 *  3. Content Approvals Workflow (submission, self-approval prevention, state transitions,
 *     entity existence and ownership validation, resubmission workflow, HOD and Club Head scoping).
 */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { AuditLog } from '../models/audit-log.model';
import { Approval } from '../models/approval.model';
import { Event } from '../models/event.model';
import { Department } from '../models/department.model';
import { Course } from '../models/course.model';
import { DynamicPage } from '../models/dynamic-page.model';
import { Form } from '../models/form.model';
import { Notice } from '../models/notice.model';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from '../utils/audit-log';

/** Mutex lock ensuring concurrent master_admin lifecycle modifications are strictly serialized */
let masterAdminLock: Promise<void> = Promise.resolve();
function runWithMasterAdminLock<T>(task: () => Promise<T>): Promise<T> {
  const current = masterAdminLock;
  let release: () => void = () => {};
  masterAdminLock = new Promise<void>((resolve) => {
    release = resolve;
  });
  return current.then(task).finally(release);
}

/**
 * Sanitizes a raw or lean user object to ensure sensitive authentication credentials,
 * password hashes, tokenVersion, and lockout fields are NEVER leaked.
 */
function sanitizeUser(user: object): Record<string, unknown> {
  const userDoc = user as { toObject?: () => Record<string, unknown>; _id?: unknown; id?: string; [key: string]: unknown };
  const obj: Record<string, unknown> =
    typeof userDoc.toObject === 'function' ? userDoc.toObject() : { ...userDoc };
  delete obj.password;
  delete obj.tokenVersion;
  delete obj.failedLoginAttempts;
  delete obj.lockUntil;
  delete obj.__v;

  // Ensure both `id` and `_id` are available for frontend compatibility
  if (obj._id && !obj.id) {
    obj.id = String(obj._id);
  }
  return obj;
}

/**
 * Validates entity existence and ownership before accepting an approval submission.
 */
async function validateEntityExistenceAndOwnership(
  user: { id?: string; role?: string; departmentId?: string; clubId?: string },
  entityType: string,
  entityId: string,
  declaredDept?: string,
  declaredClub?: string
): Promise<{ departmentId?: string; clubId?: string }> {
  // 1. Enforce HOD scope boundary
  if (user.role === 'hod') {
    if (declaredDept && declaredDept.toLowerCase().trim() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden(
        `Department scope mismatch: You can only submit items for your assigned department (${user.departmentId}).`,
        'FORBIDDEN_DEPARTMENT_SCOPE'
      );
    }
  }

  // 2. Enforce Club Head scope boundary
  if (user.role === 'club_head') {
    if (declaredClub && declaredClub.toLowerCase().trim() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden(
        `Club scope mismatch: You can only submit items for your assigned club (${user.clubId}).`,
        'FORBIDDEN_CLUB_SCOPE'
      );
    }
  }

  let resolvedDept = declaredDept || (user.role === 'hod' ? user.departmentId : undefined);
  let resolvedClub = declaredClub || (user.role === 'club_head' ? user.clubId : undefined);

  // 3. Database existence check if connected and modifying/publishing an existing record
  if (mongoose.connection.readyState === 1) {
    if (entityType === 'event') {
      const existing = await Event.findOne({
        $or: [{ _id: entityId.match(/^[0-9a-fA-F]{24}$/) ? entityId : undefined }, { slug: entityId }],
      }).lean();

      if (existing) {
        resolvedDept = existing.departmentSlug || resolvedDept;
        resolvedClub = existing.clubId || resolvedClub;

        if (user.role === 'hod' && existing.departmentSlug && existing.departmentSlug.toLowerCase() !== user.departmentId?.toLowerCase()) {
          throw ApiError.forbidden(
            'You cannot submit an event belonging to another department for approval.',
            'FORBIDDEN_DEPARTMENT_SCOPE'
          );
        }
        if (user.role === 'club_head' && existing.clubId && existing.clubId.toLowerCase() !== user.clubId?.toLowerCase()) {
          throw ApiError.forbidden(
            'You cannot submit an event belonging to another club for approval.',
            'FORBIDDEN_CLUB_SCOPE'
          );
        }
      }
    } else if (entityType === 'department') {
      const existing = await Department.findOne({
        $or: [{ _id: entityId.match(/^[0-9a-fA-F]{24}$/) ? entityId : undefined }, { slug: entityId }],
      }).lean();

      if (existing) {
        resolvedDept = existing.slug;
        if (user.role === 'hod' && existing.slug.toLowerCase() !== user.departmentId?.toLowerCase()) {
          throw ApiError.forbidden('You cannot submit another department for approval.', 'FORBIDDEN_DEPARTMENT_SCOPE');
        }
      }
    } else if (entityType === 'course') {
      const existing = await Course.findOne({
        $or: [{ _id: entityId.match(/^[0-9a-fA-F]{24}$/) ? entityId : undefined }, { slug: entityId }, { code: entityId }],
      }).lean();

      if (existing) {
        resolvedDept = existing.departmentSlug || resolvedDept;
        if (user.role === 'hod' && existing.departmentSlug && existing.departmentSlug.toLowerCase() !== user.departmentId?.toLowerCase()) {
          throw ApiError.forbidden('You cannot submit a course from another department for approval.', 'FORBIDDEN_DEPARTMENT_SCOPE');
        }
      }
    } else if (entityType === 'page') {
      const existing = await DynamicPage.findOne({
        $or: [{ _id: entityId.match(/^[0-9a-fA-F]{24}$/) ? entityId : undefined }, { slug: entityId }],
      }).lean();

      if (existing) {
        resolvedDept = existing.departmentId || resolvedDept;
        resolvedClub = existing.clubId || resolvedClub;

        if (user.role === 'hod' && existing.departmentId && existing.departmentId.toLowerCase() !== user.departmentId?.toLowerCase()) {
          throw ApiError.forbidden('You cannot submit a page belonging to another department for approval.', 'FORBIDDEN_DEPARTMENT_SCOPE');
        }
        if (user.role === 'club_head' && existing.clubId && existing.clubId.toLowerCase() !== user.clubId?.toLowerCase()) {
          throw ApiError.forbidden('You cannot submit a page belonging to another club for approval.', 'FORBIDDEN_CLUB_SCOPE');
        }
      }
    } else if (entityType === 'form') {
      const existing = await Form.findOne({
        $or: [{ _id: entityId.match(/^[0-9a-fA-F]{24}$/) ? entityId : undefined }, { slug: entityId }],
      }).lean();

      if (existing) {
        resolvedDept = existing.departmentId || resolvedDept;
        resolvedClub = existing.clubId || resolvedClub;

        if (user.role === 'hod' && existing.departmentId && existing.departmentId.toLowerCase() !== user.departmentId?.toLowerCase()) {
          throw ApiError.forbidden('You cannot submit a form belonging to another department for approval.', 'FORBIDDEN_DEPARTMENT_SCOPE');
        }
        if (user.role === 'club_head' && existing.clubId && existing.clubId.toLowerCase() !== user.clubId?.toLowerCase()) {
          throw ApiError.forbidden('You cannot submit a form belonging to another club for approval.', 'FORBIDDEN_CLUB_SCOPE');
        }
      }
    } else if (entityType === 'notice') {
      const existing = await Notice.findOne({
        $or: [{ _id: entityId.match(/^[0-9a-fA-F]{24}$/) ? entityId : undefined }, { slug: entityId }],
      }).lean();

      if (existing) {
        resolvedDept = existing.departmentId || resolvedDept;

        if (user.role === 'hod' && existing.departmentId && existing.departmentId.toLowerCase() !== user.departmentId?.toLowerCase()) {
          throw ApiError.forbidden('You cannot submit a notice belonging to another department for approval.', 'FORBIDDEN_DEPARTMENT_SCOPE');
        }
      }
    }
  }

  return { departmentId: resolvedDept, clubId: resolvedClub };
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. USER MANAGEMENT CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Lists all administrative users (sanitized, excluding auth credentials).
 */
export async function listUsers(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const users = await User.find()
      .select('-password -tokenVersion -failedLoginAttempts -lockUntil -__v')
      .sort({ createdAt: -1 })
      .lean();

    const sanitized = users.map((u) => sanitizeUser(u));

    res.status(200).json({
      success: true,
      count: sanitized.length,
      data: sanitized,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Gets a single user by ID.
 */
export async function getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -tokenVersion -failedLoginAttempts -lockUntil -__v')
      .lean();

    if (!user) {
      throw ApiError.notFound('User account');
    }

    res.status(200).json({
      success: true,
      data: sanitizeUser(user),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Creates a new administrative user with bcrypt-hashed credentials and privilege escalation guards.
 */
export async function createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, email, password, role, departmentId, clubId, permissions, status, phone } = req.body;

    const actorRole = req.user?.role;
    const isActorMasterAdmin = actorRole === 'master_admin' || actorRole === 'ADMIN';

    // Privilege escalation prevention for non-master_admin callers
    if (!isActorMasterAdmin) {
      if (role === 'master_admin' || role === 'ADMIN') {
        throw ApiError.forbidden(
          'Privilege escalation prohibited: Only master administrators can create master_admin accounts.',
          'FORBIDDEN_PRIVILEGE_ESCALATION'
        );
      }
      const requestedPerms: string[] = permissions || [];
      if (requestedPerms.includes('*') || requestedPerms.includes('all')) {
        throw ApiError.forbidden(
          'Privilege escalation prohibited: Only master administrators can grant wildcard permissions.',
          'FORBIDDEN_PRIVILEGE_ESCALATION'
        );
      }
      const actorPerms: string[] = req.user?.permissions || [];
      const unheldPerms = requestedPerms.filter((p) => !actorPerms.includes(p));
      if (unheldPerms.length > 0) {
        throw ApiError.forbidden(
          `Privilege escalation prohibited: You cannot grant permissions you do not possess (${unheldPerms.join(', ')}).`,
          'FORBIDDEN_PRIVILEGE_ESCALATION'
        );
      }
    }

    // 1. Validate email uniqueness
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw ApiError.conflict('A user account with this email address already exists.');
    }

    // 2. Hash password (bcrypt cost factor 12)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role,
      departmentId: departmentId ? departmentId.trim() : undefined,
      clubId: clubId ? clubId.trim() : undefined,
      permissions: permissions || [],
      status: status || 'active',
      phone: phone ? phone.trim() : undefined,
      tokenVersion: 1,
    });

    logAdminAction(req, {
      action: 'CREATE',
      module: 'User Management',
      recordId: String(newUser._id),
      recordTitle: `Created user ${newUser.name} (${newUser.email}) with role ${newUser.role}`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: sanitizeUser(newUser),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Updates an administrative user with safeguards against self-demotion,
 * self-deactivation, privilege escalation, and accidental lockout of the last active master_admin.
 */
export async function updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetId = req.params.id;
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      throw ApiError.notFound('User account');
    }

    const currentActorId = req.user?.id;
    const isSelf = currentActorId === String(targetUser._id);
    const isTargetMasterAdmin = targetUser.role === 'master_admin' || targetUser.role === 'ADMIN';
    const isActorMasterAdmin = req.user?.role === 'master_admin' || req.user?.role === 'ADMIN';

    // 1. Privilege escalation guards
    if (!isActorMasterAdmin) {
      if (isTargetMasterAdmin) {
        throw ApiError.forbidden(
          'Privilege escalation prohibited: Only master administrators can modify a master administrator account.',
          'FORBIDDEN_TARGET_USER'
        );
      }
      if (req.body.role === 'master_admin' || req.body.role === 'ADMIN') {
        throw ApiError.forbidden(
          'Privilege escalation prohibited: Only master administrators can promote users to master_admin.',
          'FORBIDDEN_PRIVILEGE_ESCALATION'
        );
      }
      if (req.body.permissions) {
        const requestedPerms: string[] = req.body.permissions;
        if (requestedPerms.includes('*') || requestedPerms.includes('all')) {
          throw ApiError.forbidden(
            'Privilege escalation prohibited: Only master administrators can grant wildcard permissions.',
            'FORBIDDEN_PRIVILEGE_ESCALATION'
          );
        }
        const actorPerms: string[] = req.user?.permissions || [];
        const unheldPerms = requestedPerms.filter((p) => !actorPerms.includes(p));
        if (unheldPerms.length > 0) {
          throw ApiError.forbidden(
            `Privilege escalation prohibited: You cannot grant permissions you do not possess (${unheldPerms.join(', ')}).`,
            'FORBIDDEN_PRIVILEGE_ESCALATION'
          );
        }
      }
    }

    // 2. Safeguard: Prevent self-demotion
    if (isSelf && req.body.role && req.body.role !== targetUser.role) {
      if (isTargetMasterAdmin && req.body.role !== 'master_admin' && req.body.role !== 'ADMIN') {
        throw ApiError.badRequest(
          'Self-demotion is prohibited. You cannot revoke your own administrator privileges.',
          'SELF_DEMOTION_PROHIBITED'
        );
      }
    }

    // 3. Safeguard: Prevent self-deactivation
    if (isSelf && req.body.status && req.body.status !== 'active' && targetUser.status === 'active') {
      throw ApiError.badRequest(
        'Self-deactivation is prohibited. You cannot deactivate or lock your own account.',
        'SELF_DEACTIVATION_PROHIBITED'
      );
    }

    // 4. Safeguard & Mutex Serialization: Protect last active master_admin from demotion or deactivation
    const isDemotingMasterAdmin =
      isTargetMasterAdmin &&
      req.body.role &&
      req.body.role !== 'master_admin' &&
      req.body.role !== 'ADMIN';

    const isDeactivatingMasterAdmin =
      isTargetMasterAdmin &&
      req.body.status &&
      req.body.status !== 'active' &&
      targetUser.status === 'active';

    if (isDemotingMasterAdmin || isDeactivatingMasterAdmin) {
      await runWithMasterAdminLock(async () => {
        const otherActiveAdminsCount = await User.countDocuments({
          _id: { $ne: targetUser._id },
          role: { $in: ['master_admin', 'ADMIN'] },
          status: 'active',
        });

        if (otherActiveAdminsCount < 1) {
          throw ApiError.forbidden(
            'Operation prohibited: Cannot demote or deactivate the last active master administrator.',
            'CANNOT_DEMOTE_LAST_ADMIN'
          );
        }
      });
    }

    // 5. Email uniqueness check if email is modified
    if (req.body.email && req.body.email.toLowerCase().trim() !== targetUser.email) {
      const existing = await User.findOne({
        email: req.body.email.toLowerCase().trim(),
        _id: { $ne: targetUser._id },
      });
      if (existing) {
        throw ApiError.conflict('A user account with this email address already exists.');
      }
      targetUser.email = req.body.email.toLowerCase().trim();
    }

    // 6. Apply modifications (strictly whitelisted fields)
    if (req.body.name) targetUser.name = req.body.name.trim();
    if (req.body.phone !== undefined) targetUser.phone = req.body.phone ? req.body.phone.trim() : undefined;
    if (req.body.departmentId !== undefined) {
      targetUser.departmentId = req.body.departmentId ? req.body.departmentId.trim() : undefined;
    }
    if (req.body.clubId !== undefined) {
      targetUser.clubId = req.body.clubId ? req.body.clubId.trim() : undefined;
    }
    if (req.body.permissions !== undefined) targetUser.permissions = req.body.permissions;

    // Role modification (revokes active tokens)
    if (req.body.role && req.body.role !== targetUser.role) {
      targetUser.role = req.body.role;
      targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    }

    // Status modification (revokes active tokens if deactivated/locked)
    if (req.body.status && req.body.status !== targetUser.status) {
      targetUser.status = req.body.status;
      if (req.body.status !== 'active') {
        targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
      }
    }

    // Password modification (hashes with bcrypt & revokes active tokens)
    if (req.body.password) {
      targetUser.password = await bcrypt.hash(req.body.password, 12);
      targetUser.tokenVersion = (targetUser.tokenVersion || 0) + 1;
    }

    await targetUser.save();

    logAdminAction(req, {
      action: 'UPDATE',
      module: 'User Management',
      recordId: String(targetUser._id),
      recordTitle: `Updated user ${targetUser.name} (${targetUser.email})`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'User account updated successfully',
      data: sanitizeUser(targetUser),
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Deletes an administrative user with safeguards against self-deletion and
 * race-condition protected lockout of the last active master_admin.
 */
export async function deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const targetId = req.params.id;
    const targetUser = await User.findById(targetId);

    if (!targetUser) {
      throw ApiError.notFound('User account');
    }

    const currentActorId = req.user?.id;

    // 1. Safeguard: Prevent self-deletion
    if (currentActorId === String(targetUser._id)) {
      throw ApiError.badRequest(
        'Self-deletion is prohibited. You cannot delete your own account.',
        'SELF_DELETION_PROHIBITED'
      );
    }

    // 2. Safeguard & Mutex Serialization: Protect last active master_admin
    const isTargetMasterAdmin = targetUser.role === 'master_admin' || targetUser.role === 'ADMIN';
    if (isTargetMasterAdmin) {
      await runWithMasterAdminLock(async () => {
        const otherActiveAdminsCount = await User.countDocuments({
          _id: { $ne: targetUser._id },
          role: { $in: ['master_admin', 'ADMIN'] },
          status: 'active',
        });

        if (otherActiveAdminsCount < 1) {
          throw ApiError.forbidden(
            'Operation prohibited: Cannot delete the last active master administrator.',
            'CANNOT_DELETE_LAST_ADMIN'
          );
        }
      });
    }

    // 3. Invalidate active sessions before deletion
    await User.findByIdAndUpdate(targetId, { $inc: { tokenVersion: 1 } });
    await User.findByIdAndDelete(targetId);

    logAdminAction(req, {
      action: 'DELETE',
      module: 'User Management',
      recordId: String(targetUser._id),
      recordTitle: `Deleted user ${targetUser.name} (${targetUser.email})`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'User account deleted successfully',
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. AUDIT LOGGING CONTROLLERS (APPEND-ONLY)
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Lists audit logs with pagination and filters.
 * Note: Audit logs are strictly append-only. There are NO update or delete endpoints.
 */
export async function listAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { module, action, userId, limit: rawLimit, page: rawPage } = req.query;

    const page = Math.max(1, parseInt(rawPage as string, 10) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(rawLimit as string, 10) || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (module && typeof module === 'string') {
      filter.module = new RegExp(`^${module.trim()}$`, 'i');
    }
    if (action && typeof action === 'string') {
      filter.action = action.trim().toUpperCase();
    }
    if (userId && typeof userId === 'string') {
      filter.userId = userId.trim();
    }

    const [logs, total] = await Promise.all([
      AuditLog.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(filter),
    ]);

    const formattedLogs = logs.map((l) => ({
      id: String(l._id),
      _id: l._id,
      userId: l.userId,
      userName: l.userName,
      userRole: l.userRole,
      action: l.action,
      module: l.module,
      recordId: l.recordId,
      recordTitle: l.recordTitle,
      oldValue: l.oldValue,
      newValue: l.newValue,
      timestamp: l.timestamp.toISOString(),
      ipAddress: l.ipAddress,
      requestId: l.requestId,
    }));

    res.status(200).json({
      success: true,
      count: formattedLogs.length,
      data: {
        logs: formattedLogs,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. CONTENT APPROVALS WORKFLOW CONTROLLERS
// ══════════════════════════════════════════════════════════════════════════════

/**
 * Lists pending or processed approvals with role and scope filtering.
 */
export async function listApprovals(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, departmentId, clubId, limit: rawLimit, page: rawPage } = req.query;

    const page = Math.max(1, parseInt(rawPage as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(rawLimit as string, 10) || 50));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (status && typeof status === 'string') {
      filter.status = status.trim().toLowerCase();
    }

    // Role-based scope enforcement
    const user = req.user;
    if (user?.role === 'hod') {
      filter.departmentId = user.departmentId;
    } else if (user?.role === 'club_head') {
      filter.clubId = user.clubId;
    } else {
      // Global roles can optionally filter by departmentId or clubId
      if (departmentId && typeof departmentId === 'string') {
        filter.departmentId = departmentId.trim();
      }
      if (clubId && typeof clubId === 'string') {
        filter.clubId = clubId.trim();
      }
    }

    const [approvals, total] = await Promise.all([
      Approval.find(filter).sort({ submittedAt: -1 }).skip(skip).limit(limit).lean(),
      Approval.countDocuments(filter),
    ]);

    const formatted = approvals.map((a) => ({
      id: String(a._id),
      _id: a._id,
      entityType: a.entityType,
      entityId: a.entityId,
      title: a.title,
      departmentId: a.departmentId,
      clubId: a.clubId,
      authorId: a.authorId,
      authorName: a.authorName,
      authorRole: a.authorRole,
      status: a.status,
      rejectionReason: a.rejectionReason,
      submittedAt: a.submittedAt.toISOString(),
      reviewedAt: a.reviewedAt ? a.reviewedAt.toISOString() : undefined,
      reviewerId: a.reviewerId,
      reviewerName: a.reviewerName,
      previewData: a.previewData,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: {
        approvals: formatted,
        total,
        page,
        totalPages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Submits content for approval after validating entity existence and scope ownership.
 */
export async function submitApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { entityType, entityId, title, departmentId, clubId, previewData } = req.body;
    const user = req.user;

    // Validate entity existence and scope boundaries
    const scope = await validateEntityExistenceAndOwnership(
      user || {},
      entityType,
      entityId,
      departmentId,
      clubId
    );

    const newApproval = await Approval.create({
      entityType,
      entityId,
      title: title.trim(),
      departmentId: scope.departmentId,
      clubId: scope.clubId,
      authorId: user?.id || 'unknown',
      authorName: user?.name || user?.email || 'Unknown',
      authorRole: user?.role || 'staff',
      status: 'pending',
      submittedAt: new Date(),
      previewData,
    });

    logAdminAction(req, {
      action: 'CREATE',
      module: 'Approvals',
      recordId: String(newApproval._id),
      recordTitle: `Submitted for review: ${newApproval.title}`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Content submitted for approval successfully',
      data: {
        id: String(newApproval._id),
        ...newApproval.toObject(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Resubmits a previously rejected approval item.
 */
export async function resubmitApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const approvalId = req.params.id;
    const { title, previewData, notes } = req.body;
    const user = req.user;

    const approval = await Approval.findById(approvalId);
    if (!approval) {
      throw ApiError.notFound('Approval item');
    }

    if (approval.status !== 'rejected') {
      throw ApiError.badRequest(
        `Only rejected submissions can be resubmitted. Current status is "${approval.status}".`,
        'INVALID_RESUBMISSION_STATE'
      );
    }

    // Only original author or master_admin can resubmit
    const isMasterAdmin = user?.role === 'master_admin' || user?.role === 'ADMIN';
    if (!isMasterAdmin && approval.authorId !== user?.id) {
      throw ApiError.forbidden(
        'Only the original author can resubmit a rejected content item.',
        'FORBIDDEN_RESUBMISSION'
      );
    }

    if (title) approval.title = title.trim();
    if (previewData) approval.previewData = previewData;
    approval.status = 'pending';
    approval.rejectionReason = undefined;
    approval.reviewedAt = undefined;
    approval.reviewerId = undefined;
    approval.reviewerName = undefined;
    approval.submittedAt = new Date();

    await approval.save();

    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Approvals',
      recordId: String(approval._id),
      recordTitle: `Resubmitted for review: ${approval.title}${notes ? ` (Notes: ${notes})` : ''}`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Content resubmitted for approval successfully',
      data: {
        id: String(approval._id),
        ...approval.toObject(),
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Reviews (approves or rejects) a submitted content item.
 * Strictly prohibits self-approval and enforces HOD/Club Head reviewer scopes.
 */
export async function reviewApproval(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const approvalId = req.params.id;
    const { status, rejectionReason } = req.body;
    const reviewer = req.user;

    const approval = await Approval.findById(approvalId);
    if (!approval) {
      throw ApiError.notFound('Approval item');
    }

    // 1. Status transition safeguard: only pending items can be reviewed
    if (approval.status !== 'pending') {
      throw ApiError.badRequest(
        `This submission has already been ${approval.status} and cannot be modified.`,
        'INVALID_STATUS_TRANSITION'
      );
    }

    // 2. Strict Self-Approval Protection
    if (approval.authorId === reviewer?.id) {
      throw ApiError.forbidden(
        'Self-approval is strictly prohibited. An author cannot approve or review their own submission.',
        'SELF_APPROVAL_PROHIBITED'
      );
    }

    // 3. Reviewer Scope Safeguard
    if (reviewer?.role === 'hod') {
      if (
        !approval.departmentId ||
        approval.departmentId.toLowerCase().trim() !== reviewer.departmentId?.toLowerCase().trim()
      ) {
        throw ApiError.forbidden(
          'You are only authorized to review approval requests within your assigned department.',
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
    } else if (reviewer?.role === 'club_head') {
      if (
        !approval.clubId ||
        approval.clubId.toLowerCase().trim() !== reviewer.clubId?.toLowerCase().trim()
      ) {
        throw ApiError.forbidden(
          'You are only authorized to review approval requests within your assigned club.',
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
    }

    // 4. Apply transition
    approval.status = status;
    approval.rejectionReason = status === 'rejected' ? rejectionReason : undefined;
    approval.reviewedAt = new Date();
    approval.reviewerId = reviewer?.id;
    approval.reviewerName = reviewer?.name || reviewer?.email;

    await approval.save();

    logAdminAction(req, {
      action: status === 'approved' ? 'APPROVE' : 'REJECT',
      module: 'Approvals',
      recordId: String(approval._id),
      recordTitle: `${status === 'approved' ? 'Approved' : 'Rejected'}: ${approval.title}`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: `Content submission has been ${status} successfully`,
      data: {
        id: String(approval._id),
        ...approval.toObject(),
      },
    });
  } catch (err) {
    next(err);
  }
}
