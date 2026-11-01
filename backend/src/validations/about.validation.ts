/**
 * about.validation.ts — Strict Zod validation schemas for AboutPage
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const principalMessageSchema = z
  .object({
    name: z.string().trim().min(1).max(100),
    designation: z.string().trim().min(1).max(150),
    qualification: z.string().trim().max(200).optional(),
    image: httpsUrlSchema.optional(),
    message: z.string().trim().min(1).max(5000),
    quote: z.string().trim().max(500).optional(),
  })
  .strict();

export const milestoneItemSchema = z
  .object({
    year: z.string().trim().min(1).max(20),
    event: z.string().trim().min(1).max(200),
    description: z.string().trim().max(1000).optional(),
  })
  .strict();

export const awardItemSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    year: z.string().trim().max(20).optional(),
    issuer: z.string().trim().max(200).optional(),
    description: z.string().trim().max(1000).optional(),
    image: httpsUrlSchema.optional(),
  })
  .strict();

export const aboutStatSchema = z
  .object({
    label: z.string().trim().min(1).max(100),
    value: z.string().trim().min(1).max(50),
  })
  .strict();

export const updateAboutPageSchema = z
  .object({
    title: z.string().trim().min(1).max(200).optional(),
    text1: z.string().trim().min(1).max(5000).optional(),
    text2: z.string().trim().max(5000).optional(),
    history: z.string().trim().max(10000).optional(),
    vision: z.string().trim().max(2000).optional(),
    mission: z.array(z.string().trim().max(500)).optional(),
    coreValues: z.array(z.string().trim().max(200)).optional(),
    principalMessage: principalMessageSchema.optional(),
    milestones: z.array(milestoneItemSchema).optional(),
    awards: z.array(awardItemSchema).optional(),
    stats: z.array(aboutStatSchema).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateAboutPageInput = z.infer<typeof updateAboutPageSchema>;
