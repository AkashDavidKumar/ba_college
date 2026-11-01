/**
 * routes/index.ts — API router registry
 *
 * All route groups are mounted here.
 */
import { Router } from 'express';
import { healthRouter, readyRouter } from './health.routes';
import authRouter from './auth.routes';
import publicRouter from './public.routes';
import publicV1Router from './v1/public-v1.routes';
import adminRouter from './admin.routes';

const apiRouter = Router();

// ── Phase 1: Foundation ────────────────────────────────────────────────────
apiRouter.use('/health', healthRouter);
apiRouter.use('/ready', readyRouter);

// ── Phase 2: Secure Authentication & Authorization ────────────────────────
apiRouter.use('/auth', authRouter);

// ── Phase 3D: Protected Administrative Mutations & Submissions (/api/v1/...) ──
apiRouter.use('/v1', adminRouter);

// ── Phase 3C: Versioned REST API (/api/v1/...) ─────────────────────────────
apiRouter.use('/v1', publicV1Router);

// ── Phase 3D: Protected Administrative Mutations & Submissions (/api/...) ──
apiRouter.use('/', adminRouter);

// ── Phase 3C: Legacy Compatibility Layer (/api/...) ────────────────────────
apiRouter.use('/', publicRouter);

export default apiRouter;
