/**
 * app.ts — Express application factory
 *
 * This file creates and configures the Express app WITHOUT starting the HTTP
 * server. Separating app from server.ts makes the app fully testable via
 * supertest without occupying a real port.
 *
 * Middleware order (order matters in Express):
 *   1. helmet()          — security headers before any other response
 *   2. trustProxy        — must be set before CORS/rate-limit read req.ip
 *   3. cors()            — CORS before body parsing (prevents preflight leak)
 *   4. express.json()    — body parser with size limit
 *   5. cookieParser()    — parses HttpOnly authentication cookies
 *   6. requestId         — assign ID before logging
 *   7. access logger     — log after ID is available
 *   8. generalRateLimit  — applied after logging so rate events are recorded
 *   9. apiRouter         — business and authentication routes
 *  10. notFoundHandler   — 404 for unmatched routes
 *  11. errorHandler      — last: catches all errors from above
 *
 * Security notes:
 *   - CORS origin list comes from validated env — never wildcard.
 *   - Body size is capped at 2 MB for JSON.
 *   - Helmet's default CSP and other headers are enabled.
 *   - X-Powered-By is removed by helmet automatically.
 */
import express, { Application, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { requestIdMiddleware } from './middleware/request-id';
import { generalRateLimit } from './middleware/rate-limit';
import { notFoundHandler } from './middleware/not-found';
import { errorHandler } from './middleware/error-handler';
import apiRouter from './routes/index';
import logger from './utils/logger';

export interface AppConfig {
  corsOrigins: string[];
  trustProxy: boolean;
  cookieSecret?: string;
  isProduction?: boolean;
}

export function createApp(config: AppConfig): Application {
  const app = express();

  // ── 1. Helmet — security headers & production CSP ───────────────────────
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          baseUri: ["'self'"],
          fontSrc: ["'self'", 'https:', 'data:'],
          formAction: ["'self'"],
          frameAncestors: ["'none'"],
          imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
          objectSrc: ["'none'"],
          scriptSrc: ["'self'"],
          scriptSrcAttr: ["'none'"],
          styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
          connectSrc: ["'self'", ...config.corsOrigins],
          upgradeInsecureRequests: config.isProduction ? [] : null,
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  // ── 2. Trust proxy — must be BEFORE CORS and rate limiting ───────────────
  // Only enable when a real trusted proxy (Nginx, ALB, etc.) is confirmed.
  if (config.trustProxy) {
    app.set('trust proxy', 1);
  }

  // ── 3. CORS ───────────────────────────────────────────────────────────────
  app.use(
    cors({
      origin: (origin, callback) => {
        // Disallow wildcard origin with credentials
        if (config.corsOrigins.includes('*')) {
          callback(new Error('CORS: Wildcard origin "*" is strictly prohibited with credentials.'));
          return;
        }
        // Allow requests with no origin (e.g. server-to-server, curl in dev/testing)
        if (!origin) {
          callback(null, true);
          return;
        }
        if (config.corsOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS: Origin "${origin}" is not allowed.`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
      exposedHeaders: ['X-Request-Id'],
      maxAge: 600, // Preflight cache: 10 minutes
    })
  );

  // ── 4. Body parsers — size-limited ────────────────────────────────────────
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: false, limit: '2mb' }));

  // ── 5. Cookie parser — for HttpOnly auth cookies ─────────────────────────
  app.use(cookieParser(config.cookieSecret));

  // ── 6. Request ID ─────────────────────────────────────────────────────────
  app.use(requestIdMiddleware);

  // ── 7. Access logger ──────────────────────────────────────────────────────
  // Log method, URL, and requestId. Never log req.body (may contain passwords).
  app.use((req: Request, _res: Response, next: NextFunction) => {
    logger.info('Incoming request', {
      requestId: req.id,
      method: req.method,
      url: req.url,
      // Log IP last — may be proxy IP if trustProxy is false
      ip: req.ip,
    });
    next();
  });

  // ── 8. General rate limiting ──────────────────────────────────────────────
  app.use('/api', generalRateLimit);

  // ── 9. API routes ─────────────────────────────────────────────────────────
  app.use('/api', apiRouter);

  // ── 10. 404 handler ───────────────────────────────────────────────────────
  app.use(notFoundHandler);

  // ── 11. Centralised error handler ─────────────────────────────────────────
  app.use(errorHandler);

  return app;
}
