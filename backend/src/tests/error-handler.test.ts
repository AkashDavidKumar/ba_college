/**
 * error-handler.test.ts — Tests for centralised error handling
 *
 * Verifies that the errorHandler middleware:
 *  1. Returns correct HTTP status codes for different error types.
 *  2. Uses the standard { success: false, error, code, requestId } envelope.
 *  3. Never exposes stack traces in the response body.
 *  4. Handles ApiError, Mongoose errors, and unknown errors correctly.
 *  5. Always includes the requestId in error responses.
 *
 * No MongoDB connection needed — Mongoose errors are constructed manually.
 */
import request from 'supertest';
import express, { Application, Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { requestIdMiddleware } from '../middleware/request-id';
import { errorHandler } from '../middleware/error-handler';
import { ApiError } from '../utils/api-error';

/** Build a minimal app that throws a given error for testing */
function buildErrorApp(errorFactory: () => unknown): Application {
  const app = express();
  app.use(requestIdMiddleware);

  app.get('/error', (_req: Request, _res: Response, next: NextFunction) => {
    next(errorFactory());
  });

  app.use(errorHandler);
  return app;
}

describe('errorHandler — ApiError', () => {
  it('returns 400 for ApiError.badRequest()', async () => {
    const app = buildErrorApp(() => ApiError.badRequest('Invalid input'));
    const res = await request(app).get('/error');
    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      error: 'Invalid input',
      code: 'BAD_REQUEST',
    });
  });

  it('returns 401 for ApiError.unauthorized()', async () => {
    const app = buildErrorApp(() => ApiError.unauthorized());
    const res = await request(app).get('/error');
    expect(res.status).toBe(401);
    expect(res.body.code).toBe('UNAUTHORIZED');
  });

  it('returns 403 for ApiError.forbidden()', async () => {
    const app = buildErrorApp(() => ApiError.forbidden());
    const res = await request(app).get('/error');
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('returns 404 for ApiError.notFound()', async () => {
    const app = buildErrorApp(() => ApiError.notFound('Department'));
    const res = await request(app).get('/error');
    expect(res.status).toBe(404);
  });

  it('returns 429 for ApiError.tooManyRequests()', async () => {
    const app = buildErrorApp(() => ApiError.tooManyRequests());
    const res = await request(app).get('/error');
    expect(res.status).toBe(429);
  });

  it('returns 409 for ApiError.conflict()', async () => {
    const app = buildErrorApp(() => ApiError.conflict('Conflict occurred'));
    const res = await request(app).get('/error');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('returns 500 for ApiError.internal()', async () => {
    const app = buildErrorApp(() => ApiError.internal('Internal server issue'));
    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });

  it('always includes requestId in error responses', async () => {
    const app = buildErrorApp(() => ApiError.badRequest('test'));
    const res = await request(app).get('/error');
    expect(typeof res.body.requestId).toBe('string');
    expect(res.body.requestId.length).toBeGreaterThan(0);
  });
});

describe('errorHandler — Mongoose errors', () => {
  it('returns 400 for a Mongoose ValidationError', async () => {
    const app = buildErrorApp(() => {
      // Create a real Mongoose ValidationError
      const err = new mongoose.Error.ValidationError();
      err.errors['email'] = new mongoose.Error.ValidatorError({
        message: 'Email is invalid',
        path: 'email',
        value: 'bad',
        type: 'user defined',
      });
      return err;
    });
    const res = await request(app).get('/error');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('email');
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for a Mongoose CastError (invalid ObjectId)', async () => {
    const app = buildErrorApp(() => {
      return new mongoose.Error.CastError('ObjectId', 'not-an-id', '_id');
    });
    const res = await request(app).get('/error');
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_FIELD');
  });

  it('returns 409 for a duplicate key error (code 11000)', async () => {
    const app = buildErrorApp(() => {
      const err = Object.assign(new Error('E11000'), {
        code: 11000,
        keyValue: { email: 'test@example.com' },
      });
      return err;
    });
    const res = await request(app).get('/error');
    expect(res.status).toBe(409);
    expect(res.body.code).toBe('DUPLICATE_KEY');
  });
});

describe('errorHandler — unknown/programming errors', () => {
  const originalNodeEnv = process.env['NODE_ENV'];

  afterEach(() => {
    process.env['NODE_ENV'] = originalNodeEnv;
  });

  it('returns 500 for an unknown error', async () => {
    const app = buildErrorApp(() => new Error('Something terrible'));
    const res = await request(app).get('/error');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });

  it('does not include stack trace in the response body (any environment)', async () => {
    const app = buildErrorApp(() => new Error('Crash'));
    const res = await request(app).get('/error');
    const body = JSON.stringify(res.body);
    expect(body).not.toContain('at Object');
    expect(body).not.toContain('Error: Crash');
    expect(body).not.toContain('/src/');
  });

  it('returns generic message in production for unknown errors', async () => {
    process.env['NODE_ENV'] = 'production';
    const app = buildErrorApp(() => new Error('Internal database query failed'));
    const res = await request(app).get('/error');
    expect(res.body.error).not.toContain('database');
    expect(res.body.error).not.toContain('query');
    expect(res.body.error).toMatch(/unexpected error/i);
  });
});
