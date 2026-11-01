/**
 * logger.ts — Centralised Winston logger
 *
 * Security rules:
 *  1. Redacts sensitive fields before any log line is written.
 *  2. Uses JSON format in production (machine-parseable by log aggregators).
 *  3. Uses colourised simple format in development/test for human readability.
 *  4. Never logs full request bodies that may contain credentials.
 */
import winston from 'winston';

// ── Fields that must NEVER appear in log output ────────────────────────────
const REDACTED_FIELDS = new Set([
  'password',
  'passwordhash',
  'passwordhash',
  'token',
  'accesstoken',
  'accesstoken',
  'refreshtoken',
  'refreshtoken',
  'authorization',
  'cookie',
  'secret',
  'apikey',
  'apikey',
  'creditcard',
  'ssn',
]);

/**
 * Mutates an object in-place and replaces sensitive field values with "[REDACTED]".
 * Preserves Winston internal Symbol properties (level, message, splat).
 */
function redact(obj: unknown, depth = 0): unknown {
  if (depth > 6 || obj === null || typeof obj !== 'object') return obj;

  const record = obj as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (REDACTED_FIELDS.has(key.toLowerCase()) || REDACTED_FIELDS.has(key)) {
      record[key] = '[REDACTED]';
    } else if (typeof record[key] === 'object' && record[key] !== null) {
      redact(record[key], depth + 1);
    }
  }
  return obj;
}

const redactFormat = winston.format((info) => {
  redact(info);
  return info;
});

// ── Determine environment ──────────────────────────────────────────────────
const isProduction = process.env['NODE_ENV'] === 'production';
const isTest = process.env['NODE_ENV'] === 'test';
const logLevel = process.env['LOG_LEVEL'] ?? (isProduction ? 'info' : 'debug');

const productionFormat = winston.format.combine(
  redactFormat(),
  winston.format.timestamp(),
  winston.format.errors({ stack: false }), // never log stack traces
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  redactFormat(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.errors({ stack: false }),
  winston.format.colorize(),
  winston.format.printf(({ level, message, timestamp, requestId, ...meta }) => {
    const rid = requestId ? ` [${requestId as string}]` : '';
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp as string} ${level}${rid}: ${message as string}${metaStr}`;
  })
);

const logger = winston.createLogger({
  level: isTest ? 'silent' : logLevel,
  format: isProduction ? productionFormat : developmentFormat,
  transports: [
    new winston.transports.Console({
      silent: isTest || process.env['LOG_LEVEL'] === 'silent',
    }),
  ],
  // Suppress unhandled-exception dumps that could leak stack traces in prod
  handleExceptions: false,
  exitOnError: false,
});

export default logger;
