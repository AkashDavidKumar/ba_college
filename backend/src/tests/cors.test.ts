/**
 * cors.test.ts — Tests for CORS configuration
 *
 * Verifies that:
 *  1. Requests from allowed origins receive the correct CORS headers.
 *  2. Requests from disallowed origins do NOT receive Access-Control-Allow-Origin.
 *  3. OPTIONS preflight requests from allowed origins are accepted.
 *  4. Credentials mode is enabled (Access-Control-Allow-Credentials: true).
 *  5. A wildcard (*) origin is never returned.
 *
 * No MongoDB connection needed for these tests.
 */
import request from 'supertest';
import { createApp } from '../app';

const ALLOWED_ORIGIN = 'http://localhost:3000';
const ANOTHER_ALLOWED = 'https://bac.edu.in';
const BLOCKED_ORIGIN = 'https://evil.attacker.com';
const ANOTHER_BLOCKED = 'http://localhost:9999';

const appSingle = createApp({
  corsOrigins: [ALLOWED_ORIGIN],
  trustProxy: false,
});

const appMulti = createApp({
  corsOrigins: [ALLOWED_ORIGIN, ANOTHER_ALLOWED],
  trustProxy: false,
});

describe('CORS — allowed origins', () => {
  it('returns Access-Control-Allow-Origin for a configured origin', async () => {
    const res = await request(appSingle)
      .get('/api/health')
      .set('Origin', ALLOWED_ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('returns Access-Control-Allow-Credentials: true for allowed origin', async () => {
    const res = await request(appSingle)
      .get('/api/health')
      .set('Origin', ALLOWED_ORIGIN);
    expect(res.headers['access-control-allow-credentials']).toBe('true');
  });

  it('echos the correct origin when multiple origins are configured', async () => {
    const res = await request(appMulti)
      .get('/api/health')
      .set('Origin', ANOTHER_ALLOWED);
    expect(res.headers['access-control-allow-origin']).toBe(ANOTHER_ALLOWED);
  });

  it('handles OPTIONS preflight from an allowed origin', async () => {
    const res = await request(appSingle)
      .options('/api/health')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'GET');
    // Preflight should be 204 No Content or 200 OK
    expect([200, 204]).toContain(res.status);
    expect(res.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
  });

  it('exposes X-Request-Id in Access-Control-Expose-Headers', async () => {
    const res = await request(appSingle)
      .get('/api/health')
      .set('Origin', ALLOWED_ORIGIN);
    expect(res.headers['access-control-expose-headers']).toMatch(/X-Request-Id/i);
  });
});

describe('CORS — blocked origins', () => {
  it('does not set Access-Control-Allow-Origin for a blocked origin', async () => {
    const res = await request(appSingle)
      .get('/api/health')
      .set('Origin', BLOCKED_ORIGIN);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('does not set Access-Control-Allow-Origin for another blocked origin', async () => {
    const res = await request(appSingle)
      .get('/api/health')
      .set('Origin', ANOTHER_BLOCKED);
    expect(res.headers['access-control-allow-origin']).toBeUndefined();
  });

  it('never returns wildcard * as the Allow-Origin value', async () => {
    // Test both blocked and allowed origins — neither should yield *
    const blockedRes = await request(appSingle)
      .get('/api/health')
      .set('Origin', BLOCKED_ORIGIN);
    expect(blockedRes.headers['access-control-allow-origin']).not.toBe('*');

    const allowedRes = await request(appSingle)
      .get('/api/health')
      .set('Origin', ALLOWED_ORIGIN);
    expect(allowedRes.headers['access-control-allow-origin']).not.toBe('*');
  });

  it('requests without an Origin header still receive a response (server-to-server)', async () => {
    // No Origin header = server-to-server; should succeed (200)
    const res = await request(appSingle).get('/api/health');
    expect(res.status).toBe(200);
  });
});
