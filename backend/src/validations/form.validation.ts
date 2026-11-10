/**
 * form.validation.ts — Zod Validation Schemas for Forms & Inquiries Engine
 *
 * Enforces:
 *  1. Strict XSS sanitization (prohibiting <script> tags and event handlers on all text).
 *  2. Slug format compliance (lowercase alphanumeric with hyphens).
 *  3. Configurable field type safety and options requirements for choice types.
 *  4. Scoped departmental and club parameters.
 *  5. Strict validation of form submissions and inquiry status triage.
 */
import { z } from 'zod';
import {
  FORM_FIELD_TYPES,
  FORM_STATUSES,
  FORM_CATEGORIES,
} from '../models/form.model';
import { INQUIRY_STATUSES } from '../models/form-submission.model';

const DANGEROUS_TAG_REGEX = /<\s*script[^>]*>|<\s*\/\s*script\s*>|on\w+\s*=/i;

const safeText = (maxLen: number, fieldName: string) =>
  z
    .string()
    .trim()
    .max(maxLen, `${fieldName} cannot exceed ${maxLen} characters`)
    .refine((val) => !DANGEROUS_TAG_REGEX.test(val), {
      message: `${fieldName} cannot contain script tags or HTML event handlers.`,
    });

export const formFieldValidationSchema = z
  .object({
    minLength: z.number().int().min(0).optional(),
    maxLength: z.number().int().min(1).optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().trim().max(200).optional(),
  })
  .strict();

export const formFieldSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, 'Field ID is required')
      .max(50, 'Field ID cannot exceed 50 characters')
      .regex(
        /^[a-zA-Z0-9_-]+$/,
        'Field ID must contain only alphanumeric characters, underscores, or hyphens.'
      ),
    label: safeText(200, 'Field label').min(1, 'Field label is required'),
    type: z.enum(FORM_FIELD_TYPES),
    placeholder: safeText(200, 'Placeholder').optional(),
    helpText: safeText(300, 'Help text').optional(),
    required: z.boolean().default(false),
    order: z.number().int().min(0).default(0),
    options: z
      .array(safeText(150, 'Option'))
      .max(50, 'Cannot exceed 50 options')
      .optional(),
    validation: formFieldValidationSchema.optional(),
  })
  .strict()
  .refine(
    (field) => {
      // If select, radio, or checkbox, options must be non-empty array
      if (['select', 'radio', 'checkbox'].includes(field.type)) {
        return Array.isArray(field.options) && field.options.length > 0;
      }
      return true;
    },
    {
      message: 'Select, radio, and checkbox fields must define at least one option.',
      path: ['options'],
    }
  );

export const createFormSchema = z
  .object({
    title: safeText(200, 'Title').min(1, 'Title is required'),
    slug: z
      .string()
      .trim()
      .min(2, 'Slug must be at least 2 characters')
      .max(100, 'Slug cannot exceed 100 characters')
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        'Slug must be lowercase alphanumeric with hyphens (e.g., "admissions-inquiry-2026").'
      ),
    description: safeText(1000, 'Description').optional().default(''),
    category: z.enum(FORM_CATEGORIES).default('general'),
    fields: z
      .array(formFieldSchema)
      .min(1, 'A form must contain at least one field.')
      .max(60, 'Cannot exceed 60 fields per form.')
      .refine(
        (fields) => {
          const ids = fields.map((f) => f.id.toLowerCase());
          return new Set(ids).size === ids.length;
        },
        { message: 'Field IDs within a form must be unique.' }
      ),
    status: z.enum(FORM_STATUSES).optional().default('draft'),
    isActive: z.boolean().optional().default(true),
    submitButtonText: safeText(50, 'Submit button text').optional().default('Submit'),
    successMessage: safeText(500, 'Success message').optional().default('Thank you for your submission.'),
    departmentId: z.string().trim().toLowerCase().optional(),
    clubId: z.string().trim().toLowerCase().optional(),
  })
  .strict();

export const updateFormSchema = z
  .object({
    title: safeText(200, 'Title').min(1, 'Title cannot be empty').optional(),
    slug: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .optional(),
    description: safeText(1000, 'Description').optional(),
    category: z.enum(FORM_CATEGORIES).optional(),
    fields: z
      .array(formFieldSchema)
      .min(1, 'A form must contain at least one field.')
      .max(60)
      .refine(
        (fields) => {
          const ids = fields.map((f) => f.id.toLowerCase());
          return new Set(ids).size === ids.length;
        },
        { message: 'Field IDs within a form must be unique.' }
      )
      .optional(),
    status: z.enum(FORM_STATUSES).optional(),
    isActive: z.boolean().optional(),
    submitButtonText: safeText(50, 'Submit button text').optional(),
    successMessage: safeText(500, 'Success message').optional(),
    departmentId: z.string().trim().toLowerCase().nullable().optional(),
    clubId: z.string().trim().toLowerCase().nullable().optional(),
  })
  .strict();

export const queryFormSchema = z.object({
  search: z.string().trim().optional(),
  category: z.enum(FORM_CATEGORIES).optional(),
  status: z.enum(FORM_STATUSES).optional(),
  departmentId: z.string().trim().toLowerCase().optional(),
  clubId: z.string().trim().toLowerCase().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 50)) : 50)),
  sort: z.enum(['createdAt:desc', 'createdAt:asc', 'title:asc', 'title:desc']).optional().default('createdAt:desc'),
});

export const submitAnswersSchema = z
  .object({
    answers: z.record(z.string(), z.unknown()).refine(
      (obj) => obj && typeof obj === 'object' && Object.keys(obj).length > 0,
      { message: 'Submission must contain answers object with at least one field.' }
    ),
  })
  .strict();

export const updateInquiryStatusSchema = z
  .object({
    status: z.enum(INQUIRY_STATUSES),
    notes: safeText(2000, 'Internal notes').optional(),
  })
  .strict();

export const queryInquiriesSchema = z.object({
  formId: z.string().trim().optional(),
  formSlug: z.string().trim().toLowerCase().optional(),
  status: z.enum(INQUIRY_STATUSES).optional(),
  search: z.string().trim().optional(),
  departmentId: z.string().trim().toLowerCase().optional(),
  clubId: z.string().trim().toLowerCase().optional(),
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, parseInt(val, 10) || 1) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? Math.min(100, Math.max(1, parseInt(val, 10) || 50)) : 50)),
});
