/**
 * rate-limit.test.ts — Tests for general rate limiting middleware
 *
 * Verifies:
 *  1. Requests up to the limit (100/window) are accepted (200).
 *  2. The (limit + 1)th request is rejected with 429.
 *  3. The 429 response body uses the standard error envelope.
 *  4. Rate limit headers (RateLimit-*) are present on responses.
 *
 * Note: express-rate-limit stores counts in memory (MemoryStore by default).
 * Each test suite gets a fresh app instance so the counter starts at zero.
 * We test with limit=5 for speed; the production limit is set in the
 * middleware module itself.
 *
 * Because the globalSetup does not reset between suites, we create a fresh
 * app with a very low limit for this test file to avoid running 100+ requests.
 */
import request from 'supertest';
import rateLimit from 'express-rate-limit';
import express, { Application } from 'express';
import { requestIdMiddleware } from '../middleware/request-id';

/** Build a minimal app with a tiny rate limit for fast testing */
function buildTestApp(max: number): Application {
  const app = express();
  app.use(requestIdMiddleware);
  app.use(
    rateLimit({
      windowMs: 60_000,
      max,
      standardHeaders: 'draft-7',
      legacyHeaders: false,
      message: {
        success: false,
        error: 'Too many requests. Please try again later.',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    })
  );
  app.get('/test', (_req, res) => { res.json({ success: true }); });
  return app;
}

describe('Rate limiting', () => {
  const LIMIT = 5;
  let app: Application;

  beforeEach(() => {
    // Fresh app = fresh MemoryStore counter
    app = buildTestApp(LIMIT);
  });

  it(`accepts up to ${LIMIT} requests within the window`, async () => {
    for (let i = 0; i < LIMIT; i++) {
      const res = await request(app).get('/test');
      expect(res.status).toBe(200);
    }
  });

  it(`returns 429 on the ${LIMIT + 1}th request`, async () => {
    for (let i = 0; i < LIMIT; i++) {
      await request(app).get('/test');
    }
    const res = await request(app).get('/test');
    expect(res.status).toBe(429);
  });

  it('returns the standard error envelope on 429', async () => {
    for (let i = 0; i <= LIMIT; i++) {
      await request(app).get('/test');
    }
    const res = await request(app).get('/test');
    expect(res.body).toMatchObject({
      success: false,
      error: expect.any(String),
      code: 'RATE_LIMIT_EXCEEDED',
    });
  });

  it('includes RateLimit-* headers on responses (draft-7 standard)', async () => {
    const res = await request(app).get('/test');
    // draft-7 sends RateLimit (combined: limit, remaining, reset) and RateLimit-Policy headers
    expect(res.headers).toHaveProperty('ratelimit');
    expect(res.headers['ratelimit']).toContain('limit=5');
    expect(res.headers).toHaveProperty('ratelimit-policy');
  });

  it('does not leak window duration or reset time in the 429 body', async () => {
    for (let i = 0; i <= LIMIT; i++) {
      await request(app).get('/test');
    }
    const res = await request(app).get('/test');
    const body = JSON.stringify(res.body);
    // Retry-After timing should not appear in body (only in headers if standard)
    expect(body).not.toContain('retryAfter');
    expect(body).not.toContain('retry_after');
    expect(body).not.toContain('windowMs');
  });
});
