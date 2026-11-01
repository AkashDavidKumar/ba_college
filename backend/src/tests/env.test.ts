/**
 * env.test.ts — Unit tests for the environment validator
 *
 * Tests the validateEnv() function in isolation without starting a server.
 * All tests manipulate process.env directly and restore it after each test.
 */
import { validateEnv } from '../config/env';

// Snapshot of valid env used as a baseline
const VALID_ENV = {
  NODE_ENV: 'test',
  PORT: '5002',
  MONGODB_URI: 'mongodb://localhost:27017/bac_test',
  CORS_ORIGINS: 'http://localhost:3000',
  TRUST_PROXY: '0',
  LOG_LEVEL: 'silent',
  REQUEST_ID_HEADER: 'X-Request-Id',
  JWT_SECRET: 'test_jwt_secret_with_more_than_32_characters_for_unit_tests',
  JWT_EXPIRES_IN: '8h',
};

let saved: Record<string, string | undefined> = {};

beforeEach(() => {
  // Save current env values
  saved = Object.fromEntries(
    Object.keys(VALID_ENV).map((k) => [k, process.env[k]])
  );
  // Apply valid baseline
  Object.entries(VALID_ENV).forEach(([k, v]) => { process.env[k] = v; });
});

afterEach(() => {
  // Restore
  Object.entries(saved).forEach(([k, v]) => {
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  });
});

describe('validateEnv()', () => {
  // ── Happy path ────────────────────────────────────────────────────────────
  it('returns a typed object when all required vars are present and valid', () => {
    const env = validateEnv();
    expect(env.NODE_ENV).toBe('test');
    expect(env.PORT).toBe(5002);
    expect(env.MONGODB_URI).toBe('mongodb://localhost:27017/bac_test');
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:3000']);
    expect(env.TRUST_PROXY).toBe(false);
    expect(env.JWT_SECRET).toBe('test_jwt_secret_with_more_than_32_characters_for_unit_tests');
    expect(env.JWT_EXPIRES_IN).toBe('8h');
  });

  it('parses multiple CORS origins from a comma-separated string', () => {
    process.env['CORS_ORIGINS'] = 'http://localhost:3000,https://bac.edu.in';
    const env = validateEnv();
    expect(env.CORS_ORIGINS).toEqual(['http://localhost:3000', 'https://bac.edu.in']);
  });

  it('accepts mongodb+srv:// Atlas connection strings', () => {
    process.env['MONGODB_URI'] = 'mongodb+srv://user:pass@cluster.mongodb.net/bac';
    expect(() => validateEnv()).not.toThrow();
  });

  it('parses TRUST_PROXY=1 as true', () => {
    process.env['TRUST_PROXY'] = '1';
    const env = validateEnv();
    expect(env.TRUST_PROXY).toBe(true);
  });

  it('defaults LOG_LEVEL to "info" when omitted', () => {
    delete process.env['LOG_LEVEL'];
    const env = validateEnv();
    expect(env.LOG_LEVEL).toBe('info');
  });

  it('defaults JWT_EXPIRES_IN to "8h" when omitted', () => {
    delete process.env['JWT_EXPIRES_IN'];
    const env = validateEnv();
    expect(env.JWT_EXPIRES_IN).toBe('8h');
  });

  // ── Missing required vars ─────────────────────────────────────────────────
  it('throws when PORT is missing', () => {
    delete process.env['PORT'];
    expect(() => validateEnv()).toThrow('PORT');
  });

  it('throws when MONGODB_URI is missing', () => {
    delete process.env['MONGODB_URI'];
    expect(() => validateEnv()).toThrow('MONGODB_URI');
  });

  it('throws when CORS_ORIGINS is missing', () => {
    delete process.env['CORS_ORIGINS'];
    expect(() => validateEnv()).toThrow('CORS_ORIGINS');
  });

  it('throws when JWT_SECRET is missing', () => {
    delete process.env['JWT_SECRET'];
    expect(() => validateEnv()).toThrow('JWT_SECRET');
  });

  it('throws when JWT_SECRET is under 32 characters in production', () => {
    process.env['NODE_ENV'] = 'production';
    process.env['JWT_SECRET'] = 'short_secret';
    expect(() => validateEnv()).toThrow('32 characters');
  });

  // ── Invalid values ────────────────────────────────────────────────────────
  it('throws when PORT is not a number', () => {
    process.env['PORT'] = 'abc';
    expect(() => validateEnv()).toThrow('PORT');
  });

  it('throws when PORT is 0', () => {
    process.env['PORT'] = '0';
    expect(() => validateEnv()).toThrow('PORT');
  });

  it('throws when PORT is 99999 (> 65535)', () => {
    process.env['PORT'] = '99999';
    expect(() => validateEnv()).toThrow('PORT');
  });

  it('throws when MONGODB_URI has an invalid scheme', () => {
    process.env['MONGODB_URI'] = 'http://localhost/bac';
    expect(() => validateEnv()).toThrow('MONGODB_URI');
  });

  it('throws when NODE_ENV is an invalid value', () => {
    process.env['NODE_ENV'] = 'staging';
    expect(() => validateEnv()).toThrow('NODE_ENV');
  });

  it('throws when TRUST_PROXY has an invalid value', () => {
    process.env['TRUST_PROXY'] = 'yes';
    expect(() => validateEnv()).toThrow('TRUST_PROXY');
  });

  it('throws when CORS_ORIGINS is an empty string', () => {
    process.env['CORS_ORIGINS'] = '';
    expect(() => validateEnv()).toThrow('CORS_ORIGINS');
  });
});
