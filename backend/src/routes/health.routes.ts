/**
 * health.routes.ts — /api/health and /api/ready
 *
 * Routes are registered as separate paths in routes/index.ts:
 *   /api/health → GET /  (liveness)
 *   /api/ready  → GET /  (readiness)
 *
 * Both use the same router file because they share the health controller.
 * They are mounted at different base paths in index.ts.
 */
import { Router } from 'express';
import { asyncHandler } from '../utils/async-handler';
import * as healthController from '../controllers/health.controller';

const healthRouter = Router();
const readyRouter = Router();

/** GET /api/health — liveness, no DB */
healthRouter.get('/', healthController.liveness);

/** GET /api/ready — readiness, pings MongoDB */
readyRouter.get('/', asyncHandler(healthController.readiness));

export { healthRouter, readyRouter };
