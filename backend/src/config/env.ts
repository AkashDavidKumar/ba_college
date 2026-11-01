/**
 * env.ts — Strict environment variable validation
 *
 * Called ONCE at process start (server.ts). Throws immediately with a clear
 * error message if any required variable is missing or malformed, so the
 * process never starts in a misconfigured state.
 *
 * This is the ONLY file that reads process.env directly. All other modules
 * import the returned ValidatedEnv object.
 */
import { ValidatedEnv } from '../types/index';

class EnvValidationError extends Error {
  constructor(message: string) {
    super(`[EnvValidation] ${message}`);
    this.name = 'EnvValidationError';
  }
}

function requireString(key: string): string {
  const value = process.env[key];
  if (value === undefined || value.trim() === '') {
    throw new EnvValidationError(
      `Required environment variable "${key}" is missing or empty. ` +
        'Copy .env.example to .env and provide a value.'
    );
  }
  return value.trim();
}

function requirePort(key: string): number {
  const raw = requireString(key);
  const port = parseInt(raw, 10);
  if (isNaN(port) || port < 1 || port > 65535) {
    throw new EnvValidationError(
      `Environment variable "${key}" must be a valid port number (1–65535). Received: "${raw}"`
    );
  }
  return port;
}

function parseOrigins(raw: string): string[] {
  const origins = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  if (origins.length === 0) {
    throw new EnvValidationError(
      'CORS_ORIGINS must contain at least one origin (e.g. http://localhost:3000).'
    );
  }
  return origins;
}

function parseTrustProxy(raw: string | undefined): boolean {
  if (!raw) return false;
  const lower = raw.trim().toLowerCase();
  if (lower === '1' || lower === 'true') return true;
  if (lower === '0' || lower === 'false') return false;
  throw new EnvValidationError(
    `TRUST_PROXY must be "0", "1", "true", or "false". Received: "${raw}"`
  );
}

function validateJwtSecret(secret: string, isProduction: boolean): string {
  if (secret.length < 32) {
    if (isProduction) {
      throw new EnvValidationError(
        'JWT_SECRET must be at least 32 characters long in production environments.'
      );
    }
  }
  return secret;
}

export function validateEnv(): ValidatedEnv {
  // NODE_ENV
  const rawNodeEnv = process.env['NODE_ENV']?.trim() ?? 'development';
  const validNodeEnvs = ['development', 'production', 'test'] as const;
  if (!validNodeEnvs.includes(rawNodeEnv as (typeof validNodeEnvs)[number])) {
    throw new EnvValidationError(
      `NODE_ENV must be one of: ${validNodeEnvs.join(', ')}. Received: "${rawNodeEnv}"`
    );
  }
  const NODE_ENV = rawNodeEnv as ValidatedEnv['NODE_ENV'];
  const isProd = NODE_ENV === 'production';

  // PORT
  const PORT = requirePort('PORT');

  // MONGODB_URI — must look like a MongoDB connection string
  const MONGODB_URI = requireString('MONGODB_URI');
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new EnvValidationError(
      'MONGODB_URI must start with "mongodb://" (local) or "mongodb+srv://" (Atlas).'
    );
  }

  // CORS_ORIGINS — comma-separated list
  const CORS_ORIGINS = parseOrigins(requireString('CORS_ORIGINS'));

  // TRUST_PROXY — optional, defaults to false
  const TRUST_PROXY = parseTrustProxy(process.env['TRUST_PROXY']);

  // LOG_LEVEL — optional, defaults to "info"
  const LOG_LEVEL = process.env['LOG_LEVEL']?.trim() ?? 'info';

  // REQUEST_ID_HEADER — optional, defaults to "X-Request-Id"
  const REQUEST_ID_HEADER =
    process.env['REQUEST_ID_HEADER']?.trim() ?? 'X-Request-Id';

  // JWT_SECRET — required secret
  const rawJwtSecret = requireString('JWT_SECRET');
  const JWT_SECRET = validateJwtSecret(rawJwtSecret, isProd);

  // JWT_EXPIRES_IN — optional, defaults to "8h"
  const JWT_EXPIRES_IN = process.env['JWT_EXPIRES_IN']?.trim() || '8h';

  // COOKIE_SECRET — optional
  const COOKIE_SECRET = process.env['COOKIE_SECRET']?.trim() || undefined;

  cachedEnv = {
    NODE_ENV,
    PORT,
    MONGODB_URI,
    CORS_ORIGINS,
    TRUST_PROXY,
    LOG_LEVEL,
    REQUEST_ID_HEADER,
    JWT_SECRET,
    JWT_EXPIRES_IN,
    COOKIE_SECRET,
  };

  return cachedEnv;
}

let cachedEnv: ValidatedEnv | null = null;

export function getEnv(): ValidatedEnv {
  if (!cachedEnv) {
    cachedEnv = validateEnv();
  }
  return cachedEnv;
}
