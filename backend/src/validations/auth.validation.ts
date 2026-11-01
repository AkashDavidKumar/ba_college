/**
 * auth.validation.ts — Strict schema validation for authentication requests
 *
 * Rejects unexpected fields, normalizes input, and enforces strong password rules.
 */
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';

/**
 * Strict login request validation schema.
 * Rejects unexpected keys with .strict() to prevent prototype poisoning.
 */
export const loginSchema = z
  .object({
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .max(255, 'Email cannot exceed 255 characters'),
    password: z
      .string()
      .min(1, 'Password is required')
      .max(128, 'Password cannot exceed 128 characters'),
  })
  .strict();

export type LoginInput = z.infer<typeof loginSchema>;

/**
 * Strong password policy for administrative accounts:
 * - Minimum 12 characters
 * - At least one lowercase letter
 * - At least one uppercase letter
 * - At least one numeric digit
 * - At least one special symbol
 */
export const strongPasswordSchema = z
  .string()
  .min(12, 'Password must be at least 12 characters long')
  .max(128, 'Password cannot exceed 128 characters')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[^a-zA-Z0-9]/, 'Password must contain at least one special symbol');

export const provisionAdminSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters'),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .max(255, 'Email cannot exceed 255 characters'),
    password: strongPasswordSchema,
    role: z.string().optional().default('master_admin'),
  })
  .strict();

export type ProvisionAdminInput = z.infer<typeof provisionAdminSchema>;

/**
 * Express middleware factory to validate and sanitize request bodies with a Zod schema.
 */
export function validateBody<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const message = firstIssue
        ? `${firstIssue.path.join('.') || 'field'}: ${firstIssue.message}`
        : 'Invalid request body';
      next(ApiError.badRequest(message, 'VALIDATION_ERROR'));
      return;
    }
    // Replace req.body with the sanitized/stripped output
    req.body = result.data;
    next();
  };
}
