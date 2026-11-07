/**
 * database.ts — MongoDB connection management via Mongoose
 *
 * Security notes:
 *  - Credentials are NEVER logged; the URI is redacted before any log call.
 *  - Connection pool is capped at 10 to prevent connection exhaustion.
 *  - serverSelectionTimeoutMS prevents indefinite startup hangs.
 */
import mongoose from 'mongoose';
import logger from '../utils/logger';

/** Replace user:password in a MongoDB URI with *** for safe logging */
function redactUri(uri: string): string {
  return uri.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
}

export async function connectDatabase(uri: string): Promise<void> {
  const safeUri = redactUri(uri);
  logger.info(`Connecting to MongoDB: ${safeUri}`);

  await mongoose.connect(uri, {
    maxPoolSize: 30,
    minPoolSize: 5,
    serverSelectionTimeoutMS: 5_000,
    socketTimeoutMS: 45_000,
    connectTimeoutMS: 10_000,
    // Heartbeat every 10 s to detect silent connection failures
    heartbeatFrequencyMS: 10_000,
  });

  logger.info('MongoDB connected successfully.');

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected.');
  });

  mongoose.connection.on('reconnected', () => {
    logger.info('MongoDB reconnected.');
  });

  mongoose.connection.on('error', (err: Error) => {
    // Log the error type but NOT the full message which may contain credentials
    logger.error(`MongoDB connection error: ${err.name}`);
  });
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected gracefully.');
  }
}

/**
 * Returns the current mongoose connection state as a human-readable string.
 * Safe to call at any time (no async, no DB queries).
 */
export function connectionState(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
    99: 'uninitialized',
  };
  return states[mongoose.connection.readyState] ?? 'unknown';
}
