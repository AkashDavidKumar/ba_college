/**
 * club.validation.ts — Zod Validation Schemas for Clubs & Memberships
 *
 * Implements:
 *  1. Club creation & administrative update schemas with category, code, and safe media URL checks.
 *  2. Public membership registration with normalized register numbers and server-side defaults.
 *  3. Membership approval/rejection validation with mandatory rejection reasons.
 *  4. Consent update and withdrawal schemas.
 *  5. Rejection of protected system-field injections.
 */
import { z } from 'zod';
import { CLUB_CATEGORIES, CLUB_STATUSES } from '../models/club.model';
import { MEMBERSHIP_ROLES, MEMBERSHIP_STATUSES } from '../models/club-membership.model';
import { isSafeMediaUrl } from './media-asset.validation';

const OBJECT_ID_REGEX = /^[0-9a-fA-F]{24}$/;
const CLUB_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;

/**
 * Validates safe external media URL or permits empty/undefined
 */
const safeMediaUrlValidator = z
  .string()
  .trim()
  .refine((url) => !url || isSafeMediaUrl(url), {
    message: 'URL must be a secure HTTPS link or an institutional HTTP domain (bac.edu.in / b-u.ac.in)',
  })
  .optional()
  .or(z.literal(''));

// ── 1. Create Club Schema ───────────────────────────────────────────────────
export const createClubSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Club name must be at least 2 characters')
    .max(150, 'Club name cannot exceed 150 characters'),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(CLUB_SLUG_REGEX, 'Slug must be lowercase alphanumeric with hyphens (e.g. fine-arts-club)'),
  code: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, 'Club code must be at least 2 characters')
    .max(20, 'Club code cannot exceed 20 characters'),
  category: z.enum(CLUB_CATEGORIES),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description cannot exceed 5000 characters'),
  departmentId: z
    .string()
    .trim()
    .toLowerCase()
    .max(50, 'Department ID cannot exceed 50 characters')
    .optional(),
  facultyCoordinator: z
    .string()
    .trim()
    .min(2, 'Faculty coordinator must be at least 2 characters')
    .max(100, 'Faculty coordinator cannot exceed 100 characters'),
  facultyCoordinatorEmail: z
    .string()
    .trim()
    .email('Invalid faculty coordinator email format')
    .optional()
    .or(z.literal('')),
  contactEmail: z
    .string()
    .trim()
    .email('Invalid contact email format'),
  logoUrl: safeMediaUrlValidator,
  bannerImage: safeMediaUrlValidator,
  meetingSchedule: z
    .string()
    .trim()
    .max(200, 'Meeting schedule cannot exceed 200 characters')
    .optional(),
  roomOrVenue: z
    .string()
    .trim()
    .max(100, 'Room or venue cannot exceed 100 characters')
    .optional(),
  isRecruiting: z.boolean().optional(),
  featuredOrder: z.number().int().min(0).optional(),
  isPublished: z.boolean().optional(),
});

// ── 2. Update Club Schema ───────────────────────────────────────────────────
export const updateClubSchema = createClubSchema
  .partial()
  .extend({
    status: z.enum(CLUB_STATUSES).optional(),
    achievements: z.array(z.string().trim().max(300)).optional(),
  });

// Protected fields that Club Heads are forbidden from mutating in updateClub
export const PROTECTED_CLUB_FIELDS_FOR_HEADS = [
  'slug',
  'code',
  'category',
  'status',
  'isPublished',
  'studentHeadUserId',
  'studentHeadName',
  'memberCount',
] as const;

// ── 3. Assign Club Head Schema ──────────────────────────────────────────────
export const assignClubHeadSchema = z.object({
  userId: z
    .string()
    .trim()
    .regex(OBJECT_ID_REGEX, 'User ID must be a valid 24-character hexadecimal ObjectId'),
  studentHeadName: z
    .string()
    .trim()
    .min(2, 'Student head name must be at least 2 characters')
    .max(100, 'Student head name cannot exceed 100 characters')
    .optional(),
});

// ── 4. Public Student Membership Registration Schema ────────────────────────
export const registerMembershipSchema = z.object({
  studentName: z
    .string()
    .trim()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name cannot exceed 100 characters'),
  registerNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Register number must be at least 3 characters')
    .max(30, 'Register number cannot exceed 30 characters'),
  departmentId: z
    .string()
    .trim()
    .toLowerCase()
    .min(1, 'Department ID is required')
    .max(50, 'Department ID cannot exceed 50 characters'),
  degree: z
    .string()
    .trim()
    .min(2, 'Degree is required')
    .max(100, 'Degree cannot exceed 100 characters'),
  yearOfStudy: z
    .number()
    .int('Year of study must be an integer')
    .min(1, 'Year of study must be between 1 and 4')
    .max(4, 'Year of study must be between 1 and 4'),
  personalEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
  phoneNumber: z
    .string()
    .trim()
    .regex(PHONE_REGEX, 'Please provide a valid contact phone number'),
  reasonForJoining: z
    .string()
    .trim()
    .max(1000, 'Reason for joining cannot exceed 1000 characters')
    .optional(),
  confirmPublicDirectoryConsent: z.boolean().optional().default(false),
});

// ── 5. Review Membership Schema (Approve / Reject) ──────────────────────────
export const reviewMembershipSchema = z
  .object({
    status: z.enum(['active', 'rejected']).optional().default('rejected'),
    role: z.enum(MEMBERSHIP_ROLES).optional(),
    rejectionReason: z
      .string()
      .trim()
      .max(1000, 'Rejection reason cannot exceed 1000 characters')
      .optional(),
    internalNotes: z
      .string()
      .trim()
      .max(2000, 'Internal notes cannot exceed 2000 characters')
      .optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'rejected') {
        return !!data.rejectionReason && data.rejectionReason.trim().length > 0;
      }
      return true;
    },
    {
      message: 'Rejection reason is required when rejecting a membership application',
      path: ['rejectionReason'],
    }
  );

// ── 6. Update Membership Lifecycle Schema ───────────────────────────────────
export const updateMembershipLifecycleSchema = z.object({
  status: z.enum(MEMBERSHIP_STATUSES).optional(),
  role: z.enum(MEMBERSHIP_ROLES).optional(),
  internalNotes: z
    .string()
    .trim()
    .max(2000, 'Internal notes cannot exceed 2000 characters')
    .optional(),
});

// ── 7. Update / Withdraw Directory Consent Schemas ──────────────────────────
export const updateDirectoryConsentSchema = z.object({
  isPublicDirectoryOptIn: z.boolean(),
});

export const withdrawDirectoryConsentSchema = z.object({
  registerNumber: z
    .string()
    .trim()
    .toUpperCase()
    .min(3, 'Register number must be at least 3 characters'),
  personalEmail: z
    .string()
    .trim()
    .toLowerCase()
    .email('Invalid email address format'),
});
