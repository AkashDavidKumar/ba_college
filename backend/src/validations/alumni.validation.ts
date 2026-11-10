/**
 * alumni.validation.ts — Zod Validation Schemas for Alumni Directory & Verification
 *
 * Implements:
 *  1. Public registration validation (strict sanitization, valid email, year boundaries)
 *  2. Administrative update validation
 *  3. Verification and rejection schemas
 */
import { z } from 'zod';

const safeHttpsUrl = z
  .string()
  .trim()
  .max(500)
  .refine(
    (val) => {
      if (!val || val === '') return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === 'https:';
      } catch {
        return false;
      }
    },
    { message: 'Must be a valid HTTPS URL' }
  )
  .optional()
  .or(z.literal(''));

export const registerAlumniSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, 'First name is required')
    .max(60, 'First name cannot exceed 60 characters'),
  lastName: z
    .string()
    .trim()
    .min(1, 'Last name is required')
    .max(60, 'Last name cannot exceed 60 characters'),
  personalEmail: z
    .string()
    .trim()
    .email('Invalid email address')
    .max(120, 'Email cannot exceed 120 characters')
    .transform((val) => val.toLowerCase()),
  phoneNumber: z
    .string()
    .trim()
    .max(25, 'Phone number cannot exceed 25 characters')
    .optional()
    .or(z.literal('')),
  degree: z
    .string()
    .trim()
    .min(2, 'Degree is required')
    .max(100, 'Degree cannot exceed 100 characters'),
  departmentId: z
    .string()
    .trim()
    .min(2, 'Department ID is required')
    .max(60, 'Department ID cannot exceed 60 characters'),
  graduationYear: z.coerce
    .number()
    .int('Graduation year must be an integer')
    .min(1980, 'Graduation year must be 1980 or later')
    .max(new Date().getFullYear() + 1, 'Graduation year cannot be in the distant future'),
  registerNumber: z
    .string()
    .trim()
    .max(30, 'Register number cannot exceed 30 characters')
    .transform((val) => (val ? val.toUpperCase() : val))
    .optional()
    .or(z.literal('')),
  residentialAddress: z
    .string()
    .trim()
    .max(300, 'Address cannot exceed 300 characters')
    .optional()
    .or(z.literal('')),
  currentCompany: z
    .string()
    .trim()
    .max(120, 'Company cannot exceed 120 characters')
    .optional()
    .or(z.literal('')),
  designation: z
    .string()
    .trim()
    .max(120, 'Designation cannot exceed 120 characters')
    .optional()
    .or(z.literal('')),
  industry: z
    .string()
    .trim()
    .max(100, 'Industry cannot exceed 100 characters')
    .optional()
    .or(z.literal('')),
  employmentType: z
    .enum(['Salaried', 'Entrepreneur', 'Homemaker', 'Higher Studies', 'Other'])
    .optional()
    .default('Salaried'),
  city: z
    .string()
    .trim()
    .max(80, 'City cannot exceed 80 characters')
    .optional()
    .or(z.literal('')),
  country: z
    .string()
    .trim()
    .max(80, 'Country cannot exceed 80 characters')
    .optional()
    .default('India'),
  linkedInUrl: safeHttpsUrl,
  avatarUrl: safeHttpsUrl,
  avatarMediaId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Media Asset ID')
    .optional()
    .or(z.literal('')),
  testimonial: z
    .string()
    .trim()
    .max(1000, 'Testimonial cannot exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  isPublicDirectoryOptIn: z.boolean().optional().default(false),
  isWillingToMentor: z.boolean().optional().default(false),
});

export const updateAlumniSchema = z.object({
  firstName: z.string().trim().min(1).max(60).optional(),
  lastName: z.string().trim().min(1).max(60).optional(),
  degree: z.string().trim().min(2).max(100).optional(),
  departmentId: z.string().trim().min(2).max(60).optional(),
  graduationYear: z.coerce.number().int().min(1980).max(2100).optional(),
  registerNumber: z
    .string()
    .trim()
    .max(30)
    .transform((val) => (val ? val.toUpperCase() : val))
    .optional()
    .or(z.literal('')),
  personalEmail: z
    .string()
    .trim()
    .email()
    .max(120)
    .transform((val) => val.toLowerCase())
    .optional(),
  phoneNumber: z.string().trim().max(25).optional().or(z.literal('')),
  residentialAddress: z.string().trim().max(300).optional().or(z.literal('')),
  currentCompany: z.string().trim().max(120).optional().or(z.literal('')),
  designation: z.string().trim().max(120).optional().or(z.literal('')),
  industry: z.string().trim().max(100).optional().or(z.literal('')),
  employmentType: z
    .enum(['Salaried', 'Entrepreneur', 'Homemaker', 'Higher Studies', 'Other'])
    .optional(),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  country: z.string().trim().max(80).optional(),
  linkedInUrl: safeHttpsUrl,
  avatarUrl: safeHttpsUrl,
  avatarMediaId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid Media Asset ID')
    .optional()
    .or(z.literal('')),
  testimonial: z.string().trim().max(1000).optional().or(z.literal('')),
  isFeatured: z.boolean().optional(),
  isPublicDirectoryOptIn: z.boolean().optional(),
  isWillingToMentor: z.boolean().optional(),
  status: z.enum(['active', 'suspended', 'archived']).optional(),
  internalNotes: z.string().trim().max(2000).optional().or(z.literal('')),
});

export const rejectAlumniSchema = z.object({
  rejectionReason: z
    .string()
    .trim()
    .min(3, 'Rejection reason must be at least 3 characters')
    .max(500, 'Rejection reason cannot exceed 500 characters'),
});

export const verifyAlumniSchema = z.object({
  remarks: z.string().trim().max(500).optional(),
});
