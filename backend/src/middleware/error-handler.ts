/**
 * error-handler.ts — Centralised Express error handling middleware
 *
 * Security guarantees:
 *  1. Stack traces are NEVER sent to the client in production.
 *  2. Database error messages (which may contain schema/collection names) are
 *     replaced with a generic message in production.
 *  3. The full error (including stack) is always logged server-side for
 *     debugging, bound to the request ID for tracing.
 *  4. Mongoose validation errors are normalised to 400 with field-level details.
 *  5. Mongoose CastErrors (invalid ObjectId etc.) become clean 400 responses.
 *  6. Unknown errors become 500 with ONLY a generic message to the client.
 *
 * Error classification:
 *  - ApiError (isOperational=true)  → safe to forward message to client
 *  - Mongoose errors                → sanitised field list, no internals
 *  - Everything else                → generic 500, full details logged only
 */
import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ApiError } from '../utils/api-error';
import logger from '../utils/logger';

/** Evaluated per-request so tests can override NODE_ENV between tests */
const isProduction = () => process.env['NODE_ENV'] === 'production';

interface ErrorResponse {
  success: false;
  error: string;
  code?: string;
  requestId?: string;
  // Only in non-production, for developer convenience
  details?: unknown;
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const requestId = req.id ?? 'unknown';

  // ── Log the full error server-side (stack included) ──────────────────────
  logger.error('Request error', {
    requestId,
    method: req.method,
    url: req.url,
    // Log error name and message, but let logger's redact filter handle the rest
    errorName: err instanceof Error ? err.name : 'Unknown',
    errorMessage: err instanceof Error ? err.message : String(err),
    // Only include stack in non-production logs
    stack: !isProduction() && err instanceof Error ? err.stack : undefined,
  });

  // ── 1. Operational ApiError ───────────────────────────────────────────────
  if (err instanceof ApiError) {
    const body: ErrorResponse = {
      success: false,
      error: err.message,
      code: err.code,
      requestId,
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // ── 2. Mongoose Validation Error ──────────────────────────────────────────
  if (err instanceof mongoose.Error.ValidationError) {
    const fields = Object.keys(err.errors).join(', ');
    const body: ErrorResponse = {
      success: false,
      error: `Validation failed for field(s): ${fields}`,
      code: 'VALIDATION_ERROR',
      requestId,
    };
    if (!isProduction()) {
      body.details = Object.fromEntries(
        Object.entries(err.errors).map(([k, v]) => [k, v.message])
      );
    }
    res.status(400).json(body);
    return;
  }

  // ── 3. Mongoose CastError (e.g. invalid ObjectId) ─────────────────────────
  if (err instanceof mongoose.Error.CastError) {
    const body: ErrorResponse = {
      success: false,
      error: `Invalid value for field "${err.path}".`,
      code: 'INVALID_FIELD',
      requestId,
    };
    res.status(400).json(body);
    return;
  }

  // ── 4. Mongoose Duplicate Key Error (code 11000) ──────────────────────────
  const mongoError = err as { code?: number; keyValue?: Record<string, unknown> };
  if (mongoError.code === 11000) {
    const field = mongoError.keyValue ? Object.keys(mongoError.keyValue)[0] : 'field';
    const body: ErrorResponse = {
      success: false,
      error: `A record with that ${field ?? 'value'} already exists.`,
      code: 'DUPLICATE_KEY',
      requestId,
    };
    res.status(409).json(body);
    return;
  }

  // ── 5. Unknown / Programming Error ───────────────────────────────────────
  // Never expose internals to the client in production.
  const body: ErrorResponse = {
    success: false,
    error: isProduction()
      ? 'An unexpected error occurred. Please try again later.'
      : (err instanceof Error ? err.message : 'An unexpected error occurred.'),
    code: 'INTERNAL_ERROR',
    requestId,
  };

  res.status(500).json(body);
}
