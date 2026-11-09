/**
 * media-asset.validation.ts — Zod Validation Schemas for Media Library
 *
 * Enforces:
 *  1. Strict external URL validation (rejecting dangerous schemes, protocol-relative //, and control characters).
 *  2. Script tag & XSS filtering on all descriptive metadata (title, altText, description, tags).
 *  3. Media categorization and dimension bounds.
 *  4. Scoped departmental and club parameters.
 */
import { z } from 'zod';
import { MEDIA_TYPES, MEDIA_STATUSES } from '../models/media-asset.model';

const DANGEROUS_URI_REGEX = /^(?:\s*javascript:|\s*data:|\s*vbscript:|\s*file:)/i;
const DANGEROUS_TAG_REGEX = /<\s*script[^>]*>|<\s*\/\s*script\s*>|on\w+\s*=/i;

/**
 * Institutional domains permitted to use HTTP for legacy compatibility.
 * All other external media URLs must use secure HTTPS.
 */
export const ALLOWED_HTTP_DOMAINS = [
  'bac.edu.in',
  'b-u.ac.in',
  'localhost',
  '127.0.0.1',
];

function isAllowedHttpDomain(hostname: string): boolean {
  const host = hostname.toLowerCase();
  return ALLOWED_HTTP_DOMAINS.some(
    (allowed) => host === allowed || host.endsWith(`.${allowed}`)
  );
}

/**
 * Validates whether an external media URL is safe:
 *  - Must be a valid URL with explicit 'https://' or institutional 'http://' scheme
 *  - Rejects dangerous schemes (javascript:, data:, vbscript:, file:)
 *  - Rejects protocol-relative URLs (//example.com/asset.jpg)
 *  - Rejects control characters
 *  - Rejects arbitrary non-institutional HTTP URLs
 */
export function isSafeMediaUrl(val?: string | null): boolean {
  if (!val || typeof val !== 'string' || val.trim() === '') return false;
  const trimmed = val.trim();

  // Reject dangerous schemes and scripts
  if (DANGEROUS_URI_REGEX.test(trimmed)) return false;
  if (DANGEROUS_TAG_REGEX.test(trimmed)) return false;

  // Reject protocol-relative URLs
  if (trimmed.startsWith('//')) return false;

  // Reject control characters
  if (/[\r\n\t\0]/.test(trimmed)) return false;

  // Must start with http:// or https://
  if (!trimmed.startsWith('https://') && !trimmed.startsWith('http://')) {
    return false;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'https:') {
      return true;
    }
    if (parsed.protocol === 'http:') {
      return isAllowedHttpDomain(parsed.hostname);
    }
    return false;
  } catch {
    return false;
  }
}

const safeMediaUrlSchema = z
  .string()
  .trim()
  .min(1, 'Media URL is required')
  .max(1000, 'Media URL cannot exceed 1000 characters')
  .refine(isSafeMediaUrl, {
    message:
      'Media URL must be a valid external HTTPS URL (or HTTP for verified institutional domains: bac.edu.in, b-u.ac.in) and cannot use dangerous schemes.',
  });

const safeOptionalUrlSchema = z
  .string()
  .trim()
  .max(1000)
  .optional()
  .refine((val) => !val || isSafeMediaUrl(val), {
    message:
      'Thumbnail URL must be a valid external HTTPS URL (or HTTP for verified institutional domains: bac.edu.in, b-u.ac.in).',
  });

const safeTextSchema = (maxLen: number, fieldName: string) =>
  z
    .string()
    .trim()
    .max(maxLen, `${fieldName} cannot exceed ${maxLen} characters`)
    .refine((val) => !DANGEROUS_TAG_REGEX.test(val), {
      message: `${fieldName} cannot contain script tags or HTML event handlers.`,
    });

export const createMediaAssetSchema = z
  .object({
    title: safeTextSchema(200, 'Title').min(1, 'Title is required'),
    altText: safeTextSchema(250, 'Alt text').min(1, 'Alt text is required for accessibility'),
    description: safeTextSchema(1000, 'Description').optional().default(''),
    mediaType: z.enum(MEDIA_TYPES).default('image'),
    url: safeMediaUrlSchema,
    thumbnailUrl: safeOptionalUrlSchema,
    mimeType: z.string().trim().max(100).optional(),
    fileName: z.string().trim().max(255).optional(),
    fileSize: z.number().int().min(0, 'File size cannot be negative').optional(),
    width: z.number().int().min(0, 'Width cannot be negative').optional(),
    height: z.number().int().min(0, 'Height cannot be negative').optional(),
    folder: safeTextSchema(100, 'Folder').optional().default('General'),
    tags: z
      .array(safeTextSchema(50, 'Tag'))
      .max(30, 'Cannot exceed 30 tags')
      .optional()
      .default([]),
    status: z.enum(MEDIA_STATUSES).optional().default('active'),
    departmentId: z.string().trim().toLowerCase().optional(),
    clubId: z.string().trim().toLowerCase().optional(),
  })
  .strict();

export const updateMediaAssetSchema = z
  .object({
    title: safeTextSchema(200, 'Title').min(1, 'Title cannot be empty').optional(),
    altText: safeTextSchema(250, 'Alt text').optional(),
    description: safeTextSchema(1000, 'Description').optional(),
    mediaType: z.enum(MEDIA_TYPES).optional(),
    url: safeMediaUrlSchema.optional(),
    thumbnailUrl: safeOptionalUrlSchema.nullable().optional(),
    mimeType: z.string().trim().max(100).nullable().optional(),
    fileName: z.string().trim().max(255).nullable().optional(),
    fileSize: z.number().int().min(0).nullable().optional(),
    width: z.number().int().min(0).nullable().optional(),
    height: z.number().int().min(0).nullable().optional(),
    folder: safeTextSchema(100, 'Folder').optional(),
    tags: z.array(safeTextSchema(50, 'Tag')).max(30).optional(),
    status: z.enum(MEDIA_STATUSES).optional(),
    departmentId: z.string().trim().toLowerCase().nullable().optional(),
    clubId: z.string().trim().toLowerCase().nullable().optional(),
  })
  .strict();

export const queryMediaAssetSchema = z.object({
  search: z.string().trim().optional(),
  mediaType: z.enum(MEDIA_TYPES).optional(),
  folder: z.string().trim().optional(),
  status: z.enum(MEDIA_STATUSES).optional(),
  departmentId: z.string().trim().toLowerCase().optional(),
  clubId: z.string().trim().toLowerCase().optional(),
  sort: z.enum(['createdAt:desc', 'createdAt:asc', 'title:asc', 'title:desc']).optional().default('createdAt:desc'),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(200, Math.max(1, parseInt(val, 10) || 50)) : 50)),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
});
