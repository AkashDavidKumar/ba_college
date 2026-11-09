/**
 * navigation-menu.validation.ts — Zod Validation Schemas for Navigation Menu Builder
 *
 * Implements:
 *  1. Strict input validation for menu creation, updates, and hierarchy reordering.
 *  2. Safe URL and route path validation (rejecting javascript:, data:, and dangerous schemes).
 *  3. Script tag & XSS filtering on labels and icons.
 *  4. Scoped departmental and club parameters.
 */
import { z } from 'zod';
import { MENU_TARGETS } from '../models/navigation-menu.model';

const DANGEROUS_URI_REGEX = /^(?:\s*javascript:|\s*data:|\s*vbscript:|\s*file:)/i;
const DANGEROUS_TAG_REGEX = /<\s*script[^>]*>|<\s*\/\s*script\s*>|on\w+\s*=/i;

/**
 * Validates that a menu path or URL is safe:
 *  - Internal routes must start with a single '/' (not '//') or '#'
 *  - External URLs must use explicit 'https://' or 'http://' schemes
 *  - Protocol-relative URLs ('//') and dangerous schemes are strictly rejected
 */
export function isSafeMenuPath(val?: string | null): boolean {
  if (!val || val.trim() === '') return false;
  const trimmed = val.trim();
  if (DANGEROUS_URI_REGEX.test(trimmed)) return false;
  if (DANGEROUS_TAG_REGEX.test(trimmed)) return false;

  // Protocol-relative URLs (//example.com) are strictly rejected to prevent open redirects
  if (trimmed.startsWith('//')) return false;

  // Internal routes
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) {
    // Prevent internal routes with embedded control characters
    return !/[\r\n\t\0]/.test(trimmed);
  }

  // External URLs: parse and enforce strict HTTP/HTTPS scheme
  if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
    try {
      const parsed = new URL(trimmed);
      return parsed.protocol === 'https:' || parsed.protocol === 'http:';
    } catch {
      return false;
    }
  }

  return false;
}

const safeMenuPathSchema = z
  .string()
  .trim()
  .min(1, 'Path or URL is required')
  .max(500, 'Path cannot exceed 500 characters')
  .refine(isSafeMenuPath, {
    message: 'Destination path must start with /, #, https://, or http:// and cannot use dangerous schemes.',
  });

const safeMenuLabelSchema = z
  .string()
  .trim()
  .min(1, 'Menu label is required')
  .max(100, 'Menu label cannot exceed 100 characters')
  .refine((val) => !DANGEROUS_TAG_REGEX.test(val), {
    message: 'Menu label cannot contain script tags or HTML event handlers.',
  });

export const createNavigationMenuSchema = z
  .object({
    label: safeMenuLabelSchema,
    path: safeMenuPathSchema,
    icon: z.string().trim().max(50).optional().default(''),
    order: z.number().int().min(0).optional().default(0),
    parentId: z.string().trim().nullable().optional(),
    target: z.enum(MENU_TARGETS).optional().default('_self'),
    isCustom: z.boolean().optional().default(true),
    visible: z.boolean().optional().default(true),
    pageId: z.string().trim().optional(),
    departmentId: z.string().trim().toLowerCase().optional(),
    clubId: z.string().trim().toLowerCase().optional(),
  })
  .strict();

export const updateNavigationMenuSchema = z
  .object({
    label: safeMenuLabelSchema.optional(),
    path: safeMenuPathSchema.optional(),
    icon: z.string().trim().max(50).optional(),
    order: z.number().int().min(0).optional(),
    parentId: z.string().trim().nullable().optional(),
    target: z.enum(MENU_TARGETS).optional(),
    isCustom: z.boolean().optional(),
    visible: z.boolean().optional(),
    pageId: z.string().trim().nullable().optional(),
    departmentId: z.string().trim().toLowerCase().nullable().optional(),
    clubId: z.string().trim().toLowerCase().nullable().optional(),
  })
  .strict();

export const reorderMenuItemSchema = z
  .object({
    id: z.string().trim().min(1, 'Item ID is required'),
    order: z.number().int().min(0),
    parentId: z.string().trim().nullable().optional(),
    visible: z.boolean().optional(),
  })
  .strict();

export const reorderNavigationMenusSchema = z
  .object({
    items: z.array(reorderMenuItemSchema).min(1, 'At least one menu item is required for reordering'),
  })
  .strict();

export const queryNavigationMenusSchema = z.object({
  visible: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  parentId: z.string().trim().optional(),
  departmentId: z.string().trim().toLowerCase().optional(),
  clubId: z.string().trim().toLowerCase().optional(),
});
