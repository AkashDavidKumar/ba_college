/**
 * news.validation.ts — Strict Zod validation schemas for NewsArticle
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const newsAuthorSchema = z
  .object({
    name: z.string().trim().min(1, 'Author name is required').max(150),
    role: z.string().trim().max(100).optional(),
    avatar: httpsUrlSchema.optional(),
  })
  .strict();

export const createNewsArticleSchema = z
  .object({
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(2, 'Slug must be at least 2 characters')
      .max(150)
      .regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens')
      .optional(),
    title: z.string().trim().min(2, 'Title is required').max(300),
    excerpt: z.string().trim().min(1, 'Excerpt is required').max(1000),
    content: z.string().trim().min(1, 'Content is required').max(20000),
    category: z.string().trim().min(1, 'Category is required').max(100),
    author: newsAuthorSchema,
    publishDate: z.string().or(z.date()).optional(),
    readTime: z.string().trim().max(50).optional().default('3 min read'),
    coverImage: httpsUrlSchema.optional(),
    isFeatured: z.boolean().optional().default(false),
    status: z.enum(['draft', 'published', 'archived']).optional().default('published'),
    isActive: z.boolean().optional().default(true),
  })
  .strict();

export const updateNewsArticleSchema = createNewsArticleSchema.partial().strict();

export const updateNewsConfigSchema = z
  .object({
    heroTitle: z.string().trim().max(200).optional(),
    heroSubtitle: z.string().trim().max(500).optional(),
    showFeaturedOnly: z.boolean().optional(),
    articlesPerPage: z.number().positive().max(100).optional(),
    categoriesEnabled: z.array(z.string().trim()).optional(),
  })
  .strict();

export type CreateNewsArticleInput = z.infer<typeof createNewsArticleSchema>;
export type UpdateNewsArticleInput = z.infer<typeof updateNewsArticleSchema>;
export type UpdateNewsConfigInput = z.infer<typeof updateNewsConfigSchema>;
