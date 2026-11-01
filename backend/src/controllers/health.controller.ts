/**
 * health.controller.ts — Liveness and Readiness endpoints
 *
 * GET /api/health  — Liveness probe
 *   Always returns 200 { status: "ok" }.
 *   Does NOT query MongoDB. Designed to be called by load balancers frequently.
 *   Failing this probe means "restart this instance".
 *
 * GET /api/ready   — Readiness probe
 *   Queries MongoDB (admin ping). Returns:
 *     200 { status: "ready",      checks: { database: "ok"    } }  — all good
 *     503 { status: "unavailable", checks: { database: "error" } } — DB down
 *   Failing this probe means "stop sending traffic to this instance".
 *
 * Security constraints (critical):
 *   - NEVER include: MONGODB_URI, env var values, hostnames, version strings,
 *     uptime, memory usage, OS info, or any infrastructure detail in responses.
 *   - The 503 body reveals only that "database" has an error — not which DB,
 *     not the error message, not the host.
 */
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import logger from '../utils/logger';

export const liveness = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
};

export const readiness = async (req: Request, res: Response): Promise<void> => {
  const checks: Record<string, 'ok' | 'error'> = {};

  // ── MongoDB ping ────────────────────────────────────────────────────────
  try {
    if (mongoose.connection.readyState !== 1) {
      throw new Error('Not connected');
    }
    // admin().ping() is the lightest possible DB operation
    await mongoose.connection.db?.admin().ping();
    checks['database'] = 'ok';
  } catch (err) {
    // Log the actual error server-side only — never surface to client
    logger.warn('Readiness check: database ping failed', {
      requestId: req.id,
      error: err instanceof Error ? err.name : 'unknown',
    });
    checks['database'] = 'error';
  }

  const allReady = Object.values(checks).every((v) => v === 'ok');

  if (allReady) {
    res.status(200).json({
      status: 'ready',
      checks,
      timestamp: new Date().toISOString(),
    });
  } else {
    res.status(503).json({
      status: 'unavailable',
      checks,
      timestamp: new Date().toISOString(),
    });
  }
};
