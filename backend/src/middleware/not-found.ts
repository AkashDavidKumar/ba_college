/**
 * not-found.ts — 404 handler for unmatched routes
 *
 * Must be registered AFTER all other routes but BEFORE the error handler.
 * Returns a consistent error envelope — never exposes the list of real routes.
 */
import { Request, Response } from 'express';

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: 'The requested resource was not found.',
    code: 'NOT_FOUND',
    requestId: req.id,
  });
}
