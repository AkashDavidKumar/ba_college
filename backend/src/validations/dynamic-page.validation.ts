/**
 * dynamic-page.validation.ts — Zod Validation Schemas for Dynamic Page Builder
 *
 * Implements:
 *  1. Strict input validation for Dynamic Page creation, updates, and querying.
 *  2. URL safety validation (HTTPS/HTTP/relative, strictly rejecting javascript:, data:, etc.).
 *  3. Block structure integrity and content sanitization against XSS.
 *  4. Scoped departmental and club parameters.
 */
import { z } from 'zod';
import { PAGE_TYPES, BLOCK_TYPES, PAGE_STATUSES } from '../models/dynamic-page.model';

const DANGEROUS_URI_REGEX = /^(?:\s*javascript:|\s*data:|\s*vbscript:)/i;
const DANGEROUS_TAG_REGEX = /<\s*script[^>]*>|<\s*\/\s*script\s*>|on\w+\s*=/i;

/**
 * Validates that a URL is safe (starts with https://, http://, or relative /, or is empty).
 * Explicitly rejects javascript:, data:, and other dangerous URI schemes.
 */
export function isSafeUrl(val?: string | null): boolean {
  if (!val || val.trim() === '') return true;
  const trimmed = val.trim();
  if (DANGEROUS_URI_REGEX.test(trimmed)) return false;
  return (
    trimmed.startsWith('https://') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('#')
  );
}

const safeUrlSchema = z
  .string()
  .trim()
  .refine(isSafeUrl, {
    message: 'URL must use https://, http://, or relative path / and cannot contain dangerous schemes.',
  });

const safeTextSchema = (maxLength: number) =>
  z
    .string()
    .trim()
    .max(maxLength)
    .refine((val) => !DANGEROUS_TAG_REGEX.test(val), {
      message: 'Input contains disallowed script tags or HTML event handlers.',
    });

export const pageBlockSchema = z
  .object({
    id: z.string().trim().min(1, 'Block ID is required'),
    type: z.enum(BLOCK_TYPES),
    content: z.record(z.string(), z.unknown()).default({}),
    order: z.number().int().min(0).default(0),
    visible: z.boolean().default(true),
  })
  .strict()
  .refine(
    (block) => {
      // Deep validate block content for dangerous script patterns or javascript: URLs
      const contentStr = JSON.stringify(block.content);
      if (DANGEROUS_URI_REGEX.test(contentStr) || DANGEROUS_TAG_REGEX.test(contentStr)) {
        return false;
      }
      return true;
    },
    {
      message: 'Block content contains potentially dangerous scripts, event handlers, or URI schemes.',
    }
  );

export const pageSeoSchema = z
  .object({
    metaTitle: safeTextSchema(100).optional().default(''),
    metaDescription: safeTextSchema(300).optional().default(''),
    keywords: z.array(z.string().trim().max(50)).optional().default([]),
    canonicalUrl: safeUrlSchema.optional(),
    ogTitle: safeTextSchema(100).optional(),
    ogDescription: safeTextSchema(300).optional(),
    ogImage: safeUrlSchema.optional(),
    robots: z.string().trim().max(50).optional(),
  })
  .strict();

export const createDynamicPageSchema = z
  .object({
    title: safeTextSchema(200).refine((val) => val.length > 0, { message: 'Page title is required' }),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, 'Page slug is required')
      .max(100, 'Slug cannot exceed 100 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase alphanumeric with hyphens)'),
    parentMenuId: z.string().trim().optional(),
    pageType: z.enum(PAGE_TYPES).optional().default('standard'),
    description: safeTextSchema(1000).optional().default(''),
    bannerImage: safeUrlSchema.optional().default(''),
    blocks: z.array(pageBlockSchema).optional().default([]),
    seo: pageSeoSchema.optional().default({ metaTitle: '', metaDescription: '', keywords: [] }),
    status: z.enum(PAGE_STATUSES).optional().default('draft'),
    departmentId: z.string().trim().toLowerCase().optional(),
    clubId: z.string().trim().toLowerCase().optional(),
  })
  .strict();

export const updateDynamicPageSchema = z
  .object({
    title: safeTextSchema(200).optional(),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase alphanumeric with hyphens)')
      .optional(),
    parentMenuId: z.string().trim().nullable().optional(),
    pageType: z.enum(PAGE_TYPES).optional(),
    description: safeTextSchema(1000).optional(),
    bannerImage: safeUrlSchema.nullable().optional(),
    blocks: z.array(pageBlockSchema).optional(),
    seo: pageSeoSchema.optional(),
    status: z.enum(PAGE_STATUSES).optional(),
    departmentId: z.string().trim().toLowerCase().nullable().optional(),
    clubId: z.string().trim().toLowerCase().nullable().optional(),
  })
  .strict();

export const queryDynamicPagesSchema = z.object({
  status: z.enum(PAGE_STATUSES).optional(),
  departmentId: z.string().trim().toLowerCase().optional(),
  clubId: z.string().trim().toLowerCase().optional(),
  pageType: z.enum(PAGE_TYPES).optional(),
  search: z.string().trim().optional(),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 20)) : 20)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
});
