/**
 * course.validation.ts — Strict Zod validation schemas for Course
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const courseLevelEnum = z.enum(['UG', 'PG', 'Doctoral', 'Certificate']);

export const createCourseSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, 'Slug must be at least 2 characters')
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
      .optional(), // Can be auto-derived from name if missing
    name: z.string().trim().min(2, 'Course name is required').max(200),
    code: z.string().trim().max(30).optional(),
    level: courseLevelEnum,
    department: z.string().trim().min(2, 'Department name is required').max(150),
    departmentSlug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, 'Department slug is required')
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Department slug must be valid lowercase slug'),
    duration: z.string().trim().min(1, 'Duration is required').max(100),
    durationYears: z.number().positive().optional(),
    eligibility: z.string().trim().min(1, 'Eligibility criteria is required').max(2000),
    fees: z.string().trim().max(100).optional(),
    intake: z.number().positive().optional().default(60),
    description: z.string().trim().min(1, 'Description is required').max(5000),
    curriculum: z.string().trim().max(10000).optional(),
    admissionInfo: z.string().trim().max(3000).optional(),
    syllabusPdfUrl: httpsUrlSchema.optional(),
    published: z.boolean().optional().default(true),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const updateCourseSchema = createCourseSchema.partial().strict();

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
