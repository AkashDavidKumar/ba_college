/**
 * admin-cms.validation.ts — Zod Validation Schemas for Sub-Phase 4A Admin CMS
 *
 * Enforces strict validation for:
 *  1. User creation and updates (RBAC, password complexity, role integrity, .strict() rejecting unknown fields).
 *  2. Content approval requests, reviews, and resubmissions.
 *  3. Audit log query parameters.
 */
import { z } from 'zod';
import { USER_ROLES } from '../models/user.model';
import { APPROVAL_ENTITY_TYPES } from '../models/approval.model';

export const createUserSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required').max(100, 'Name cannot exceed 100 characters'),
    email: z.string().trim().email('Valid email address is required').max(255),
    password: z.string().min(8, 'Password must be at least 8 characters long'),
    role: z.enum(USER_ROLES),
    departmentId: z.string().trim().optional(),
    clubId: z.string().trim().optional(),
    permissions: z.array(z.string().trim()).optional().default([]),
    status: z.enum(['active', 'deactivated']).optional().default('active'),
    phone: z.string().trim().max(30).optional(),
  })
  .strict();

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email('Valid email address is required').max(255).optional(),
    password: z.string().min(8, 'Password must be at least 8 characters long').optional(),
    role: z.enum(USER_ROLES).optional(),
    departmentId: z.string().trim().nullable().optional(),
    clubId: z.string().trim().nullable().optional(),
    permissions: z.array(z.string().trim()).optional(),
    status: z.enum(['active', 'deactivated', 'locked']).optional(),
    phone: z.string().trim().max(30).nullable().optional(),
  })
  .strict();

export const createApprovalSchema = z
  .object({
    entityType: z.enum(APPROVAL_ENTITY_TYPES),
    entityId: z.string().trim().min(1, 'Entity ID is required'),
    title: z.string().trim().min(1, 'Title is required').max(300, 'Title cannot exceed 300 characters'),
    departmentId: z.string().trim().optional(),
    clubId: z.string().trim().optional(),
    previewData: z.record(z.string(), z.unknown()).optional(),
  })
  .strict();

export const resubmitApprovalSchema = z
  .object({
    title: z.string().trim().min(1).max(300).optional(),
    previewData: z.record(z.string(), z.unknown()).optional(),
    notes: z.string().trim().max(1000).optional(),
  })
  .strict();

export const reviewApprovalSchema = z
  .object({
    status: z.enum(['approved', 'rejected']),
    rejectionReason: z.string().trim().max(1000).optional(),
  })
  .strict()
  .refine(
    (data) => {
      if (data.status === 'rejected') {
        return !!data.rejectionReason && data.rejectionReason.length > 0;
      }
      return true;
    },
    {
      message: 'A rejection reason is required when rejecting a submission.',
      path: ['rejectionReason'],
    }
  );

export const queryAuditLogsSchema = z.object({
  module: z.string().trim().optional(),
  action: z.string().trim().optional(),
  userId: z.string().trim().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(200, Math.max(1, parseInt(val, 10) || 50)) : 50)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
});

export const queryApprovalsSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  departmentId: z.string().trim().optional(),
  clubId: z.string().trim().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 50)) : 50)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
});
