/**
 * admissions-application.validation.ts — Strict Zod validation schemas for AdmissionsApplication
 */
import { z } from 'zod';
import { ADMISSION_STATUSES } from '../models/admissions-application.model';

export const submitAdmissionsApplicationSchema = z
  .object({
    candidateName: z
      .string()
      .trim()
      .min(2, 'Full name is required (min 2 characters)')
      .max(150, 'Name cannot exceed 150 characters')
      .optional(),
    name: z
      .string()
      .trim()
      .min(2, 'Full name is required (min 2 characters)')
      .max(150, 'Name cannot exceed 150 characters')
      .optional(),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .max(255),
    phone: z
      .string()
      .trim()
      .min(7, 'Phone number must be at least 7 characters')
      .max(25, 'Phone number cannot exceed 25 characters')
      .regex(/^[0-9+\s()-]+$/, 'Phone number must contain only numbers and standard dialing symbols'),
    program: z.string().trim().min(2, 'Programme of study is required').max(200),
    courseSlug: z.string().trim().toLowerCase().max(100).optional(),
    dateOfBirth: z.string().or(z.date()).optional(),
    gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']).optional(),
    parentOrGuardianName: z.string().trim().max(150).optional(),
    qualifyingExam: z.string().trim().max(150).optional(),
    gpa: z.string().trim().max(20).optional(),
    marksPercentage: z.number().min(0).max(100).optional(),
    schoolName: z.string().trim().max(200).optional(),
    address: z.string().trim().max(500).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(20).optional(),
  })
  .strict()
  .refine((data) => !!(data.candidateName || data.name), {
    message: 'Candidate name is required (provide candidateName or name)',
    path: ['candidateName'],
  });

export const updateAdmissionsApplicationStatusSchema = z
  .object({
    id: z.string().trim().optional(),
    status: z.enum(ADMISSION_STATUSES as [string, ...string[]]),
    notes: z.string().trim().max(5000).optional().default(''),
  })
  .strict();

export type SubmitAdmissionsApplicationInput = z.infer<typeof submitAdmissionsApplicationSchema>;
export type UpdateAdmissionsApplicationStatusInput = z.infer<typeof updateAdmissionsApplicationStatusSchema>;
