/**
 * facility.validation.ts — Strict Zod validation schemas for Facility
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const createFacilitySchema = z
  .object({
    name: z.string().trim().min(2, 'Facility name is required').max(200),
    category: z.string().trim().min(1, 'Category is required').max(100),
    description: z.string().trim().min(1, 'Description is required').max(5000),
    amenities: z.array(z.string().trim().max(200)).optional().default([]),
    images: z.array(httpsUrlSchema).optional().default([]),
    details: z.string().trim().max(10000).optional().default(''),
    published: z.boolean().optional().default(true),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const updateFacilitySchema = createFacilitySchema.partial().strict();

export type CreateFacilityInput = z.infer<typeof createFacilitySchema>;
export type UpdateFacilityInput = z.infer<typeof updateFacilitySchema>;
