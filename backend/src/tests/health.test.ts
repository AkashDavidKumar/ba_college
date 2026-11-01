/**
 * health.test.ts — Tests for /api/health and /api/ready
 *
 * Uses supertest to exercise the Express app directly (no listening port).
 *
 * MongoDB dependency:
 *   - /api/health tests: No DB required (liveness never touches DB).
 *   - /api/ready tests with DB available: Requires a real MongoDB connection.
 *     These are marked with a conditional skip when no DB is available so
 *     CI without MongoDB still gets useful signal from the other tests.
 *   - /api/ready with DB unavailable: Mocks mongoose connection state to 0
 *     (disconnected) — no real DB required.
 */
import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../app';
import { Application } from 'express';

// ── App instance shared across tests ─────────────────────────────────────────
const app: Application = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

describe('GET /api/health — liveness', () => {
  it('returns 200 with status "ok"', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('includes a timestamp in ISO 8601 format', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });

  it('never exposes env vars, connection strings, or sensitive data', async () => {
    const res = await request(app).get('/api/health');
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('mongodb');
    expect(body).not.toContain('MONGODB_URI');
    expect(body).not.toContain('localhost:27017');
    expect(body).not.toContain('password');
    expect(body).not.toContain('secret');
  });

  it('returns a response header X-Request-Id', async () => {
    const res = await request(app).get('/api/health');
    expect(res.headers['x-request-id']).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('propagates a valid client-supplied X-Request-Id header', async () => {
    const customId = '12345678-1234-4234-8234-123456789abc';
    const res = await request(app).get('/api/health').set('X-Request-Id', customId);
    expect(res.headers['x-request-id']).toBe(customId);
  });

  it('generates new ID if client sends invalid X-Request-Id format', async () => {
    const res = await request(app).get('/api/health').set('X-Request-Id', 'malformed-id');
    expect(res.headers['x-request-id']).not.toBe('malformed-id');
  });
});

describe('404 Not Found Handler', () => {
  it('returns 404 for unknown routes with standard envelope', async () => {
    const res = await request(app).get('/api/non-existent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('NOT_FOUND');
  });
});

describe('GET /api/ready — readiness (DB unavailable)', () => {
  let originalReadyState: number;

  beforeEach(() => {
    // Simulate a disconnected DB by overriding readyState on mongoose.connection
    originalReadyState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', {
      configurable: true,
      get: () => 0, // 0 = disconnected
    });
  });

  afterEach(() => {
    // Restore real readyState
    Object.defineProperty(mongoose.connection, 'readyState', {
      configurable: true,
      get: () => originalReadyState,
    });
  });

  it('returns 503 when the database is disconnected', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.status).toBe(503);
  });

  it('returns status "unavailable" in body when DB is down', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.body.status).toBe('unavailable');
  });

  it('reports checks.database as "error" when DB is down', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.body.checks?.database).toBe('error');
  });

  it('never exposes connection strings or error messages in the 503 body', async () => {
    const res = await request(app).get('/api/ready');
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('mongodb');
    expect(body).not.toContain('localhost:27017');
    expect(body).not.toContain('bac_test');
    expect(body).not.toContain('ECONNREFUSED');
    expect(body).not.toContain('MongoServerSelectionError');
  });

  it('includes a timestamp in the 503 body', async () => {
    const res = await request(app).get('/api/ready');
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

// ── Conditional suite: only runs when a real MongoDB is reachable ─────────────
const MONGO_URI = process.env['MONGODB_URI'] ?? 'mongodb://localhost:27017/bac_test';
const skipMongo = process.env['CI_NO_MONGO'] === '1';

(skipMongo ? describe.skip : describe)('GET /api/ready — readiness (DB available)', () => {
  if (skipMongo) {
    it.skip('returns 200 when the database is connected', () => {});
    return;
  }

  beforeAll(async () => {
    try {
      await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3_000 });
    } catch {
      // If connection fails, remaining tests will reflect disconnected state
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('returns 200 when the database is connected', async () => {
    if (mongoose.connection.readyState !== 1) {
      console.warn('Skipping: MongoDB not available at', MONGO_URI);
      return;
    }
    const res = await request(app).get('/api/ready');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ready');
    expect(res.body.checks?.database).toBe('ok');
  });
});
