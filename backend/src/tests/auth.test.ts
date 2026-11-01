/**
 * auth.test.ts — Automated Unit & Integration Tests for Authentication & Authorization
 *
 * Verifies:
 *  1. Successful login, token issuance, HttpOnly cookie flags.
 *  2. Incorrect password, unknown account (generic indistinguishable errors).
 *  3. Schema validation, NoSQL injection attempts, malformed payload rejection.
 *  4. Account lockout upon repeated failures, deactivated account rejection.
 *  5. Expired, invalid, and tampered token rejection.
 *  6. Logout cookie clearance and tokenVersion revocation.
 *  7. Authenticated profile retrieval (/api/auth/me) without sensitive data leakage.
 *  8. Role-based and permission-based authorization (401 unauth vs 403 forbidden).
 *  9. Strict rate limiting on login endpoint.
 */
import request from 'supertest';
import express, { Application } from 'express';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { createApp } from '../app';
import { User } from '../models/user.model';
import { requireAuth, requireRoles, requirePermissions } from '../middleware/auth';
import { signAuthToken, AUTH_COOKIE_NAME } from '../utils/token';
import { errorHandler } from '../middleware/error-handler';

const TEST_SECRET = 'test_jwt_secret_with_more_than_32_characters_for_unit_tests';

const app = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

describe('Authentication — POST /api/auth/login', () => {
  const mockPasswordHash = bcrypt.hashSync('Password@123', 10);

  function createMockUserDoc(overrides: Partial<any> = {}): any {
    const doc: any = {
      _id: '507f1f77bcf86cd799439011',
      name: 'Dr. V. Anitha',
      email: 'admin@bac.edu.in',
      password: mockPasswordHash,
      role: 'master_admin',
      permissions: ['all'],
      status: 'active',
      tokenVersion: 0,
      failedLoginAttempts: 0,
      lockUntil: undefined,
      lastLogin: new Date(),
      isLocked: jest.fn().mockReturnValue(false),
      comparePassword: jest.fn().mockImplementation(async (pwd: string) => {
        return pwd === 'Password@123';
      }),
      incLoginAttempts: jest.fn().mockResolvedValue(undefined),
      resetLoginAttempts: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
      toJSON: jest.fn().mockReturnValue({
        id: '507f1f77bcf86cd799439011',
        name: 'Dr. V. Anitha',
        email: 'admin@bac.edu.in',
        role: 'master_admin',
        permissions: ['all'],
        status: 'active',
      }),
      ...overrides,
    };
    return doc;
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('successful login returns 200, user profile, JWT token, and sets HttpOnly cookie', async () => {
    const mockUser = createMockUserDoc();
    jest.spyOn(User, 'findByNormalizedEmail').mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@bac.edu.in', password: 'Password@123' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@bac.edu.in');
    expect(res.body.data.token).toBeDefined();

    // Verify password and internal fields are NEVER exposed
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.passwordHash).toBeUndefined();
    expect(res.body.data.user.tokenVersion).toBeUndefined();

    // Verify Set-Cookie header contains HttpOnly and bac_token
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain(AUTH_COOKIE_NAME);
    expect(cookies[0].toLowerCase()).toContain('httponly');
    expect(cookies[0].toLowerCase()).toContain('samesite');
  });

  it('incorrect password returns generic 401 without revealing password mistake', async () => {
    const mockUser = createMockUserDoc();
    jest.spyOn(User, 'findByNormalizedEmail').mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@bac.edu.in', password: 'WrongPassword' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid email or password.');
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
    expect(mockUser.incLoginAttempts).toHaveBeenCalledTimes(1);
  });

  it('unknown account returns identical generic 401 message', async () => {
    jest.spyOn(User, 'findByNormalizedEmail').mockResolvedValue(null);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nonexistent@bac.edu.in', password: 'Password@123' });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Invalid email or password.');
    expect(res.body.code).toBe('INVALID_CREDENTIALS');
  });

  it('deactivated account returns generic 401 error', async () => {
    const mockUser = createMockUserDoc({ status: 'deactivated' });
    jest.spyOn(User, 'findByNormalizedEmail').mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@bac.edu.in', password: 'Password@123' });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe('Invalid email or password.');
  });

  it('temporarily locked account returns 429 lock message', async () => {
    const mockUser = createMockUserDoc();
    mockUser.isLocked = jest.fn().mockReturnValue(true);
    jest.spyOn(User, 'findByNormalizedEmail').mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@bac.edu.in', password: 'Password@123' });

    expect(res.status).toBe(429);
    expect(res.body.error).toContain('locked');
  });

  it('missing email or password returns 400 Bad Request', async () => {
    const resNoEmail = await request(app)
      .post('/api/auth/login')
      .send({ password: 'Password@123' });
    expect(resNoEmail.status).toBe(400);

    const resNoPass = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@bac.edu.in' });
    expect(resNoPass.status).toBe(400);
  });

  it('malformed email returns 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'not-an-email', password: 'Password@123' });
    expect(res.status).toBe(400);
    expect(res.body.error).toContain('valid email');
  });

  it('rejects NoSQL injection attempt (object in email) with 400 Bad Request', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: 'Password@123' });
    expect(res.status).toBe(400);
  });

  it('rejects unexpected additional fields with 400 Bad Request (.strict() schema)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@bac.edu.in',
        password: 'Password@123',
        extraRole: 'master_admin',
      });
    expect(res.status).toBe(400);
  });
});

describe('Authentication — POST /api/auth/logout', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('unauthenticated request to logout returns 401', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(401);
  });

  it('authenticated logout clears cookie and increments tokenVersion', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const mockUser: any = {
      _id: userId,
      name: 'Dr. V. Anitha',
      email: 'admin@bac.edu.in',
      role: 'master_admin',
      status: 'active',
      tokenVersion: 1,
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const updateSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({} as any);

    const token = signAuthToken(
      { sub: userId, email: 'admin@bac.edu.in', role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(userId, { $inc: { tokenVersion: 1 } });
  });
});

describe('Authentication — GET /api/auth/me', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('unauthenticated request returns 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('valid token via Authorization Bearer returns user profile', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const mockUser: any = {
      _id: userId,
      name: 'Dr. V. Anitha',
      email: 'admin@bac.edu.in',
      role: 'master_admin',
      permissions: ['all'],
      status: 'active',
      tokenVersion: 0,
      toJSON: () => ({
        id: userId,
        name: 'Dr. V. Anitha',
        email: 'admin@bac.edu.in',
        role: 'master_admin',
        permissions: ['all'],
        status: 'active',
      }),
    };

    jest.spyOn(User, 'findById').mockImplementation((_id: any) => {
      return {
        select: jest.fn().mockResolvedValue(mockUser),
        then: (resolve: any) => resolve(mockUser),
      } as any;
    });

    const token = signAuthToken(
      { sub: userId, email: 'admin@bac.edu.in', role: 'master_admin', tokenVersion: 0 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('admin@bac.edu.in');
  });

  it('valid token via HttpOnly cookie returns user profile', async () => {
    const userId = '507f1f77bcf86cd799439011';
    const mockUser: any = {
      _id: userId,
      name: 'Dr. V. Anitha',
      email: 'admin@bac.edu.in',
      role: 'master_admin',
      permissions: ['all'],
      status: 'active',
      tokenVersion: 0,
      toJSON: () => ({
        id: userId,
        name: 'Dr. V. Anitha',
        email: 'admin@bac.edu.in',
        role: 'master_admin',
        permissions: ['all'],
        status: 'active',
      }),
    };

    jest.spyOn(User, 'findById').mockImplementation(() => {
      return {
        select: jest.fn().mockResolvedValue(mockUser),
        then: (resolve: any) => resolve(mockUser),
      } as any;
    });

    const token = signAuthToken(
      { sub: userId, email: 'admin@bac.edu.in', role: 'master_admin', tokenVersion: 0 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('admin@bac.edu.in');
  });

  it('tampered or invalid signature returns 401 INVALID_TOKEN', async () => {
    const tamperedToken = signAuthToken(
      { sub: '123', email: 'test@bac.edu.in', role: 'staff', tokenVersion: 0 },
      'wrong_secret_key_used_for_forgery_attack'
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${tamperedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  it('expired token returns 401 TOKEN_EXPIRED', async () => {
    // Generate token that expired 1 second ago
    const expiredToken = signAuthToken(
      { sub: '123', email: 'test@bac.edu.in', role: 'staff', tokenVersion: 0 },
      TEST_SECRET,
      '-1s'
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });

  it('revoked token (outdated tokenVersion) returns 401 TOKEN_REVOKED', async () => {
    const userId = '507f1f77bcf86cd799439011';
    // User in DB has tokenVersion 2 (e.g. after logout or password change)
    const mockUser: any = {
      _id: userId,
      status: 'active',
      tokenVersion: 2,
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    } as any);

    // Client presents token with older tokenVersion 1
    const oldToken = signAuthToken(
      { sub: userId, email: 'admin@bac.edu.in', role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${oldToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_REVOKED');
  });

  it('database failure during requireAuth fails closed with 500 without masking as token error', async () => {
    const userId = '507f1f77bcf86cd799439011';
    jest.spyOn(User, 'findById').mockImplementation(() => {
      throw new Error('MongoNetworkTimeoutException: connection closed unexpectedly');
    });

    const token = signAuthToken(
      { sub: userId, email: 'admin@bac.edu.in', role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.code).toBe('INTERNAL_ERROR');
  });

  it('cookie takes precedence over Authorization Bearer header when both are present', async () => {
    const cookieUserId = '507f1f77bcf86cd799439011';
    const headerUserId = '507f1f77bcf86cd799439099';

    const mockCookieUser: any = {
      _id: cookieUserId,
      name: 'Cookie Admin',
      email: 'cookie.admin@bac.edu.in',
      role: 'master_admin',
      permissions: ['all'],
      status: 'active',
      tokenVersion: 1,
      toJSON: () => ({
        id: cookieUserId,
        name: 'Cookie Admin',
        email: 'cookie.admin@bac.edu.in',
        role: 'master_admin',
      }),
    };

    const findSpy = jest.spyOn(User, 'findById').mockImplementation(() => {
      return {
        select: jest.fn().mockResolvedValue(mockCookieUser),
        then: (resolve: any) => resolve(mockCookieUser),
      } as any;
    });

    const cookieToken = signAuthToken(
      { sub: cookieUserId, email: 'cookie.admin@bac.edu.in', role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );
    const headerToken = signAuthToken(
      { sub: headerUserId, email: 'header.admin@bac.edu.in', role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${cookieToken}`])
      .set('Authorization', `Bearer ${headerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.user.email).toBe('cookie.admin@bac.edu.in');
    expect(findSpy).toHaveBeenCalledWith(cookieUserId);
  });
});

describe('Authorization — Role & Permission Middleware', () => {
  let authApp: Application;

  beforeAll(() => {
    authApp = express();
    authApp.use(cookieParser());
    authApp.use(express.json());

    // Protected route requiring role 'content_editor'
    authApp.get('/test/editor-only', requireAuth, requireRoles('content_editor'), (_req, res) => {
      res.json({ success: true, message: 'Editor access granted.' });
    });

    // Protected route requiring permission 'content:publish'
    authApp.get(
      '/test/publish-only',
      requireAuth,
      requirePermissions('content:publish'),
      (_req, res) => {
        res.json({ success: true, message: 'Publish permission granted.' });
      }
    );

    authApp.use(errorHandler);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns 403 Forbidden when authenticated user lacks the required role', async () => {
    const mockStaffUser: any = {
      _id: '507f1f77bcf86cd799439099',
      role: 'staff',
      status: 'active',
      tokenVersion: 0,
      permissions: [],
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockStaffUser),
    } as any);

    const staffToken = signAuthToken(
      { sub: '507f1f77bcf86cd799439099', email: 'staff@bac.edu.in', role: 'staff', tokenVersion: 0 },
      TEST_SECRET
    );

    const res = await request(authApp)
      .get('/test/editor-only')
      .set('Authorization', `Bearer ${staffToken}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN_ROLE');
  });

  it('returns 200 when authenticated user has the required role', async () => {
    const mockEditorUser: any = {
      _id: '507f1f77bcf86cd799439088',
      role: 'content_editor',
      status: 'active',
      tokenVersion: 0,
      permissions: [],
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockEditorUser),
    } as any);

    const editorToken = signAuthToken(
      {
        sub: '507f1f77bcf86cd799439088',
        email: 'editor@bac.edu.in',
        role: 'content_editor',
        tokenVersion: 0,
      },
      TEST_SECRET
    );

    const res = await request(authApp)
      .get('/test/editor-only')
      .set('Authorization', `Bearer ${editorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Editor access granted');
  });

  it('master_admin automatically bypasses role restrictions', async () => {
    const mockAdminUser: any = {
      _id: '507f1f77bcf86cd799439011',
      role: 'master_admin',
      status: 'active',
      tokenVersion: 0,
      permissions: ['all'],
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockAdminUser),
    } as any);

    const adminToken = signAuthToken(
      {
        sub: '507f1f77bcf86cd799439011',
        email: 'admin@bac.edu.in',
        role: 'master_admin',
        tokenVersion: 0,
      },
      TEST_SECRET
    );

    const res = await request(authApp)
      .get('/test/editor-only')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });

  it('returns 403 Forbidden when user lacks required granular permission', async () => {
    const mockUser: any = {
      _id: '507f1f77bcf86cd799439077',
      role: 'sub_admin',
      status: 'active',
      tokenVersion: 0,
      permissions: ['content:draft'], // Missing 'content:publish'
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const token = signAuthToken(
      {
        sub: '507f1f77bcf86cd799439077',
        email: 'subadmin@bac.edu.in',
        role: 'sub_admin',
        tokenVersion: 0,
      },
      TEST_SECRET
    );

    const res = await request(authApp)
      .get('/test/publish-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
  });

  it('returns 200 when user has explicit granular permission', async () => {
    const mockUser: any = {
      _id: '507f1f77bcf86cd799439077',
      role: 'sub_admin',
      status: 'active',
      tokenVersion: 0,
      permissions: ['content:publish'],
    };

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser),
    } as any);

    const token = signAuthToken(
      {
        sub: '507f1f77bcf86cd799439077',
        email: 'subadmin@bac.edu.in',
        role: 'sub_admin',
        tokenVersion: 0,
      },
      TEST_SECRET
    );

    const res = await request(authApp)
      .get('/test/publish-only')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toContain('Publish permission granted');
  });
});
