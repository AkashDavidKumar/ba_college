/**
 * contact-info.validation.ts — Strict Zod validation schemas for ContactInfo
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const contactPhoneSchema = z
  .object({
    label: z.string().trim().min(1).max(100),
    number: z
      .string()
      .trim()
      .min(5)
      .max(50)
      .regex(/^[0-9+\s()-]+$/, 'Phone number must contain only numbers and standard dialing symbols'),
  })
  .strict();

export const contactEmailSchema = z
  .object({
    label: z.string().trim().min(1).max(100),
    address: z.string().trim().email(),
  })
  .strict();

export const socialLinkSchema = z
  .object({
    platform: z.string().trim().min(1).max(50),
    url: httpsUrlSchema,
    icon: z.string().trim().max(50).optional(),
  })
  .strict();

export const departmentContactDeskSchema = z
  .object({
    dept: z.string().trim().min(1).max(100),
    person: z.string().trim().min(1).max(150),
    phone: z.string().trim().min(5).max(50),
    email: z.string().trim().email(),
  })
  .strict();

export const updateContactInfoSchema = z
  .object({
    address: z.string().trim().min(1).max(500).optional(),
    addressLine2: z.string().trim().max(500).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(20).optional(),
    phones: z.array(contactPhoneSchema).optional(),
    emails: z.array(contactEmailSchema).optional(),
    admissionHelpline: z.string().trim().max(50).optional(),
    officeHours: z.string().trim().max(200).optional(),
    mapsEmbedUrl: httpsUrlSchema.optional(),
    socialLinks: z.array(socialLinkSchema).optional(),
    departmentContacts: z.array(departmentContactDeskSchema).optional(),
    formRecipientEmail: z.string().trim().email().optional(),
    formAutoReply: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateContactInfoInput = z.infer<typeof updateContactInfoSchema>;
