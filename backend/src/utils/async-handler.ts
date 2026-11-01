/**
 * async-handler.ts — Promise-aware Express wrapper
 *
 * Wraps async route handlers so any rejected promise is forwarded to next(err)
 * and caught by the centralised errorHandler. Without this, unhandled promise
 * rejections in route handlers would crash the process in Node 24.
 *
 * Usage:
 *   router.get('/health', asyncHandler(healthController.liveness));
 */
import { Request, Response, NextFunction } from 'express';
import { AsyncRequestHandler } from '../types/index';

export function asyncHandler(fn: AsyncRequestHandler) {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
