/**
 * auth.routes.ts — Authentication and Session Endpoints
 *
 * Mounts:
 *   POST /api/auth/login   — strict rate limiting, schema validation, generic response
 *   POST /api/auth/logout  — authenticated, invalidates session and clears cookie
 *   GET  /api/auth/me      — authenticated, retrieves profile of the current user
 */
import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler';
import { strictRateLimit } from '../middleware/rate-limit';
import { requireAuth } from '../middleware/auth';
import { validateBody, loginSchema } from '../validations/auth.validation';
import * as authController from '../controllers/auth.controller';

const authRouter = Router();

/**
 * POST /api/auth/login
 * Public endpoint protected by strict rate limiter.
 */
authRouter.post(
  '/login',
  strictRateLimit,
  validateBody(loginSchema),
  asyncHandler(authController.login)
);

/**
 * POST /api/auth/logout
 * Protected endpoint. Clears cookie and increments tokenVersion to revoke active sessions.
 */
authRouter.post('/logout', requireAuth, asyncHandler(authController.logout));

/**
 * GET /api/auth/me
 * Protected endpoint. Returns the authenticated user's profile.
 */
authRouter.get('/me', requireAuth, asyncHandler(authController.getMe));

export default authRouter;
