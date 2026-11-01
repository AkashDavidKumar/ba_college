/**
 * gallery.validation.ts — Strict Zod validation schemas for GalleryData
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const galleryPhotoSchema = z
  .object({
    id: z.string().trim().optional(),
    url: httpsUrlSchema,
    caption: z.string().trim().max(300).optional(),
  })
  .strict();

export const galleryAlbumSchema = z
  .object({
    id: z.string().trim().min(1, 'Album id is required').max(100),
    title: z.string().trim().min(1, 'Album title is required').max(200),
    category: z.string().trim().min(1, 'Category is required').max(100),
    coverImage: httpsUrlSchema.optional(),
    image: httpsUrlSchema.optional(),
    count: z.number().nonnegative().optional().default(0),
    date: z.string().trim().max(100).optional(),
    photos: z.array(galleryPhotoSchema).optional().default([]),
  })
  .strict();

export const galleryVideoSchema = z
  .object({
    id: z.string().trim().min(1, 'Video id is required').max(100),
    title: z.string().trim().min(1, 'Video title is required').max(200),
    url: httpsUrlSchema,
    thumbnail: httpsUrlSchema.optional(),
    description: z.string().trim().max(1000).optional(),
    duration: z.string().trim().max(50).optional(),
  })
  .strict();

export const updateGallerySchema = z
  .object({
    albums: z.array(galleryAlbumSchema).optional(),
    videos: z.array(galleryVideoSchema).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateGalleryInput = z.infer<typeof updateGallerySchema>;
export type GalleryAlbumInput = z.infer<typeof galleryAlbumSchema>;
export type GalleryVideoInput = z.infer<typeof galleryVideoSchema>;
