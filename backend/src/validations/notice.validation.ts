/**
 * notice.validation.ts — Zod Validation Schemas for Notices & Circulars
 *
 * Implements:
 *  1. Strict input validation for Notice creation and updates.
 *  2. Media URL sanitization via isSafeMediaUrl.
 *  3. Governance workflow schemas: submit, review (approve/reject), publish/schedule.
 *  4. Administrative and public query filtering validation.
 */
import { z } from 'zod';
import {
  NOTICE_CATEGORIES,
  NOTICE_PRIORITIES,
  NOTICE_TYPES,
  NOTICE_TARGET_AUDIENCES,
  NOTICE_STATUSES,
} from '../models/notice.model';
import { isSafeMediaUrl } from './media-asset.validation';

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates safe external media URL or permits empty/null/undefined
 */
const safeMediaUrlValidator = z
  .string()
  .trim()
  .refine((url) => !url || isSafeMediaUrl(url), {
    message: 'Attachment URL must be a secure HTTPS link or an institutional HTTP domain (bac.edu.in / b-u.ac.in)',
  })
  .optional()
  .nullable()
  .or(z.literal(''));

// ── 1. Create Notice Schema ─────────────────────────────────────────────────
export const createNoticeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Notice title must be at least 3 characters')
    .max(300, 'Notice title cannot exceed 300 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(SLUG_REGEX, 'Slug must be lowercase alphanumeric with hyphens (e.g. semester-exam-notice)')
    .optional(),
  content: z
    .string()
    .trim()
    .min(10, 'Notice content must be at least 10 characters')
    .max(20000, 'Notice content cannot exceed 20000 characters'),
  summary: z
    .string()
    .trim()
    .max(600, 'Summary cannot exceed 600 characters')
    .optional()
    .nullable(),
  category: z.enum(NOTICE_CATEGORIES).default('General'),
  noticeType: z.enum(NOTICE_TYPES).default('Circular'),
  priority: z.enum(NOTICE_PRIORITIES).default('Medium'),
  targetAudience: z.enum(NOTICE_TARGET_AUDIENCES).default('All'),
  departmentId: z
    .string()
    .trim()
    .toLowerCase()
    .max(50, 'Department ID cannot exceed 50 characters')
    .optional()
    .nullable(),
  status: z
    .enum(['draft', 'pending', 'approved', 'scheduled', 'published'])
    .default('draft'),
  publishAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/))
    .or(z.date())
    .optional(),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/))
    .or(z.date())
    .optional()
    .nullable(),
  isPinned: z.boolean().default(false),
  attachmentUrl: safeMediaUrlValidator,
  attachmentName: z
    .string()
    .trim()
    .max(150, 'Attachment name cannot exceed 150 characters')
    .optional()
    .nullable(),
});

// ── 2. Update Notice Schema ─────────────────────────────────────────────────
export const updateNoticeSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Notice title must be at least 3 characters')
    .max(300, 'Notice title cannot exceed 300 characters')
    .optional(),
  content: z
    .string()
    .trim()
    .min(10, 'Notice content must be at least 10 characters')
    .max(20000, 'Notice content cannot exceed 20000 characters')
    .optional(),
  summary: z
    .string()
    .trim()
    .max(600, 'Summary cannot exceed 600 characters')
    .optional()
    .nullable(),
  category: z.enum(NOTICE_CATEGORIES).optional(),
  noticeType: z.enum(NOTICE_TYPES).optional(),
  priority: z.enum(NOTICE_PRIORITIES).optional(),
  targetAudience: z.enum(NOTICE_TARGET_AUDIENCES).optional(),
  departmentId: z
    .string()
    .trim()
    .toLowerCase()
    .max(50, 'Department ID cannot exceed 50 characters')
    .optional()
    .nullable(),
  status: z.enum(NOTICE_STATUSES).optional(),
  publishAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/))
    .or(z.date())
    .optional(),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/))
    .or(z.date())
    .optional()
    .nullable(),
  isPinned: z.boolean().optional(),
  attachmentUrl: safeMediaUrlValidator,
  attachmentName: z
    .string()
    .trim()
    .max(150, 'Attachment name cannot exceed 150 characters')
    .optional()
    .nullable(),
});

// ── 3. Review Notice Schema ─────────────────────────────────────────────────
export const reviewNoticeSchema = z
  .object({
    action: z.enum(['approve', 'reject']),
    rejectionReason: z
      .string()
      .trim()
      .min(5, 'Rejection reason must be at least 5 characters')
      .max(1000, 'Rejection reason cannot exceed 1000 characters')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.action === 'reject') {
        return !!data.rejectionReason && data.rejectionReason.length >= 5;
      }
      return true;
    },
    {
      message: 'A rejection reason of at least 5 characters is required when rejecting a notice',
      path: ['rejectionReason'],
    }
  );

// ── 4. Publish / Schedule Notice Schema ─────────────────────────────────────
export const publishNoticeSchema = z.object({
  publishAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/))
    .or(z.date())
    .optional(),
  expiresAt: z
    .string()
    .datetime({ offset: true })
    .or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/))
    .or(z.date())
    .optional()
    .nullable(),
});

// ── 5. Administrative Query Filter Schema ───────────────────────────────────
export const adminNoticeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  status: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  targetAudience: z.string().trim().optional(),
});

// ── 6. Public Query Filter Schema ───────────────────────────────────────────
export const publicNoticeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  departmentId: z.string().trim().optional(),
  targetAudience: z.string().trim().optional(),
});
