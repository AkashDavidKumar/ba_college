/**
 * server.ts — HTTP server entry point
 *
 * Responsibilities:
 *   1. Load .env (must be first — before any config import)
 *   2. Validate environment variables — fail fast on misconfiguration
 *   3. Connect to MongoDB
 *   4. Create the Express app
 *   5. Start the HTTP server
 *   6. Register SIGTERM/SIGINT handlers for graceful shutdown
 *
 * This file is NOT imported in tests — tests import createApp() directly.
 */
import 'dotenv/config';

import { validateEnv } from './config/env';
import { connectDatabase, disconnectDatabase } from './config/database';
import { createApp } from './app';
import logger from './utils/logger';
import http from 'http';

// ── 1. Validate environment (throws immediately on misconfiguration) ─────────
let env: ReturnType<typeof validateEnv>;
try {
  env = validateEnv();
} catch (err) {
  // Use console here because the logger may not be configured yet
  // eslint-disable-next-line no-console
  console.error('[FATAL] Environment validation failed:', err instanceof Error ? err.message : err);
  process.exit(1);
}

// ── 2. Create Express app ────────────────────────────────────────────────────
const app = createApp({
  corsOrigins: env.CORS_ORIGINS,
  trustProxy: env.TRUST_PROXY,
  cookieSecret: env.COOKIE_SECRET,
  isProduction: env.NODE_ENV === 'production',
});

// ── 3. Create HTTP server (not started yet) ──────────────────────────────────
const server = http.createServer(app);

// ── 4. Graceful shutdown ──────────────────────────────────────────────────────
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);

  // Stop accepting new connections
  server.close(async () => {
    logger.info('HTTP server closed.');

    try {
      await disconnectDatabase();
    } catch (err) {
      logger.error('Error during database disconnect', {
        error: err instanceof Error ? err.name : 'unknown',
      });
    }

    logger.info('Shutdown complete.');
    process.exit(0);
  });

  // Force exit if graceful shutdown takes too long (15 s)
  setTimeout(() => {
    logger.error('Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 15_000).unref();
}

process.on('SIGTERM', () => { void shutdown('SIGTERM'); });
process.on('SIGINT',  () => { void shutdown('SIGINT'); });

// ── 5. Unhandled rejections — log and exit rather than continue in bad state ──
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    reason: reason instanceof Error ? reason.name : String(reason),
  });
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception', { error: err.name });
  process.exit(1);
});

// ── 6. Start the server ───────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await connectDatabase(env.MONGODB_URI);
    server.listen(env.PORT, () => {
      logger.info(`BAC backend started`, {
        port: env.PORT,
        env: env.NODE_ENV,
      });
    });
  } catch (err) {
    logger.error('Failed to start server', {
      error: err instanceof Error ? err.name : 'unknown',
    });
    process.exit(1);
  }
}

void start();
