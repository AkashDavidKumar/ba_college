/**
 * placement.validation.ts — Strict Zod validation schemas for Placement
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const placementStatSchema = z
  .object({
    year: z.string().trim().min(1).max(50),
    totalPlaced: z.number().nonnegative(),
    highestPackage: z.string().trim().min(1).max(50),
    averagePackage: z.string().trim().min(1).max(50),
    placementRate: z.string().trim().min(1).max(50),
  })
  .strict();

export const recruiterSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1, 'Recruiter name is required').max(200),
    logo: httpsUrlSchema,
    sector: z.string().trim().min(1).max(100),
    hiringCount: z.number().nonnegative().optional(),
    website: httpsUrlSchema.optional(),
  })
  .strict();

export const successStorySchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    studentName: z.string().trim().min(1, 'Student name is required').max(150),
    program: z.string().trim().min(1).max(150),
    company: z.string().trim().min(1).max(150),
    package: z.string().trim().min(1).max(50),
    batch: z.string().trim().min(1).max(50),
    photo: httpsUrlSchema.optional(),
    quote: z.string().trim().max(1000).optional(),
  })
  .strict();

export const updatePlacementSchema = z
  .object({
    overview: z.string().trim().max(5000).optional(),
    stats: z.array(placementStatSchema).optional(),
    recruiters: z.array(recruiterSchema).optional(),
    successStories: z.array(successStorySchema).optional(),
    placementProcess: z.array(z.string().trim().max(500)).optional(),
    trainingPrograms: z.array(z.string().trim().max(500)).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdatePlacementInput = z.infer<typeof updatePlacementSchema>;
