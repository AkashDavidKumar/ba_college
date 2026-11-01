/**
 * guest-speaker.validation.ts — Strict Zod validation schemas for GuestSpeaker
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const createGuestSpeakerSchema = z
  .object({
    name: z.string().trim().min(1, 'Speaker name is required').max(150),
    role: z.string().trim().min(1, 'Role / title is required').max(200),
    topic: z.string().trim().max(300).optional(),
    image: httpsUrlSchema.optional(),
    date: z.string().trim().max(100).optional(),
    order: z.number().optional().default(0),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const updateGuestSpeakerSchema = createGuestSpeakerSchema.partial().strict();

export type CreateGuestSpeakerInput = z.infer<typeof createGuestSpeakerSchema>;
export type UpdateGuestSpeakerInput = z.infer<typeof updateGuestSpeakerSchema>;
