/**
 * department.validation.ts — Strict Zod validation schemas for Department
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const facultyMemberSchema = z
  .object({
    id: z.string().trim().optional(),
    name: z.string().trim().min(1, 'Faculty name is required').max(150),
    designation: z.string().trim().min(1, 'Designation is required').max(150),
    qualification: z.string().trim().min(1, 'Qualification is required').max(200),
    experience: z.string().trim().max(100).optional(),
    specialization: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
    email: z.string().trim().email().optional(),
    image: httpsUrlSchema.optional(),
    publications: z.union([z.number(), z.string().trim()]).optional(),
    order: z.number().optional().default(0),
  })
  .strict();

export const laboratorySchema = z
  .object({
    name: z.string().trim().min(1, 'Lab name is required').max(200),
    description: z.string().trim().max(2000).optional(),
    equipment: z.array(z.string().trim().max(200)).optional(),
    capacity: z.number().positive().optional(),
    image: httpsUrlSchema.optional(),
  })
  .strict();

export const alumniMemberSchema = z
  .object({
    name: z.string().trim().min(1, 'Alumni name is required').max(150),
    batch: z.union([z.string().trim(), z.number()]).optional(),
    designation: z.string().trim().max(150).optional(),
    company: z.string().trim().max(150).optional(),
    testimonial: z.string().trim().max(2000).optional(),
    image: httpsUrlSchema.optional(),
  })
  .strict();

export const headOfDepartmentSchema = z
  .object({
    name: z.string().trim().max(150).optional().default(''),
    qualification: z.string().trim().max(200).optional(),
    designation: z.string().trim().max(150).optional(),
    email: z.string().trim().email().optional(),
    image: httpsUrlSchema.optional(),
    message: z.string().trim().max(3000).optional(),
  })
  .strict();

export const departmentContactSchema = z
  .object({
    email: z.string().trim().email().optional(),
    phone: z.string().trim().max(100).optional(),
    location: z.string().trim().max(200).optional(),
  })
  .strict();

export const createDepartmentSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, 'Slug must be at least 2 characters')
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
    name: z.string().trim().min(2, 'Department name is required').max(200),
    shortName: z.string().trim().min(1, 'Short name is required').max(100),
    code: z
      .string()
      .trim()
      .toUpperCase()
      .min(1, 'Code is required')
      .max(20)
      .regex(/^[A-Z0-9_-]+$/, 'Code must be uppercase letters/numbers'),
    category: z.string().trim().min(1, 'Category is required').max(100),
    icon: z.string().trim().max(100).optional().default('Building2'),
    description: z.string().trim().min(1, 'Description is required').max(5000),
    longDescription: z.string().trim().max(10000).optional(),
    cover: httpsUrlSchema.optional(),
    coverImage: httpsUrlSchema.optional(),
    color: z.string().trim().max(100).optional(),
    vision: z.string().trim().max(2000).optional(),
    mission: z.array(z.string().trim().max(500)).optional(),
    highlights: z.array(z.string().trim().max(500)).optional(),
    headOfDepartment: headOfDepartmentSchema.optional(),
    faculty: z.array(facultyMemberSchema).optional().default([]),
    labs: z.array(laboratorySchema).optional().default([]),
    researchStats: z
      .object({
        publications: z.number().optional().default(0),
        patents: z.number().optional().default(0),
        fundedProjects: z.union([z.string().trim(), z.number()]).optional().default('₹ 0'),
      })
      .strict()
      .optional(),
    alumni: z.array(alumniMemberSchema).optional().default([]),
    achievements: z.array(z.string().trim().max(500)).optional(),
    flagshipEvents: z.array(z.string().trim().max(500)).optional(),
    contact: departmentContactSchema.optional(),
    order: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const updateDepartmentSchema = createDepartmentSchema.partial().strict();

export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
