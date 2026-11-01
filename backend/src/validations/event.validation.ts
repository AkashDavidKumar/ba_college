/**
 * event.validation.ts — Strict Zod validation schemas for Campus Event
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const sessionSpeakerSchema = z
  .object({
    name: z.string().trim().min(1, 'Speaker name is required').max(150),
    designation: z.string().trim().max(150).optional(),
    organization: z.string().trim().max(150).optional(),
    photo: httpsUrlSchema.optional(),
    bio: z.string().trim().max(2000).optional(),
  })
  .strict();

export const eventScheduleItemSchema = z
  .object({
    time: z.string().trim().min(1).max(50),
    activity: z.string().trim().min(1).max(200),
    speaker: z.string().trim().max(150).optional(),
  })
  .strict();

export const createEventSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, 'Slug must be at least 2 characters')
      .max(100)
      .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
      .optional(),
    title: z.string().trim().min(2, 'Event title is required').max(250),
    category: z.string().trim().min(1, 'Category is required').max(100),
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()).optional(),
    date: z.string().trim().max(100).optional(),
    time: z.string().trim().max(100).optional(),
    venue: z.string().trim().min(1, 'Venue is required').max(200),
    description: z.string().trim().min(1, 'Description is required').max(5000),
    coverImage: httpsUrlSchema.optional(),
    registrationUrl: httpsUrlSchema.optional(),
    registrationDeadline: z.string().or(z.date()).optional(),
    isFeatured: z.boolean().optional().default(false),
    speakers: z.array(sessionSpeakerSchema).optional().default([]),
    schedule: z.array(eventScheduleItemSchema).optional().default([]),
    clubId: z.string().trim().max(100).optional(),
    departmentSlug: z.string().trim().toLowerCase().max(100).optional(),
    isActive: z.boolean().optional().default(true),
    isArchived: z.boolean().optional().default(false),
  })
  .strict();

export const updateEventSchema = createEventSchema.partial().strict();

export type CreateEventInput = z.infer<typeof createEventSchema>;
export type UpdateEventInput = z.infer<typeof updateEventSchema>;
