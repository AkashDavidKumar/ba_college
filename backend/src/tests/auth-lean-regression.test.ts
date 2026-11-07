/**
 * auth-lean-regression.test.ts
 *
 * Targeted Phase 3F regression test suite for the lean authentication optimization:
 * 1. Valid JWT via Authorization Bearer header.
 * 2. Valid JWT via HttpOnly cookie.
 * 3. Invalid JWT signature.
 * 4. Expired JWT.
 * 5. Revoked tokenVersion (outdated token).
 * 6. Disabled/deactivated or suspended account.
 * 7. Deleted/non-existent user.
 * 8. Profile payload verification: verifies all public fields exist and all sensitive fields are excluded.
 * 9. Logout and token revocation workflow.
 * 10. Role and permission enforcement across roles.
 */
import request from 'supertest';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { createApp } from '../app';
import { User } from '../models/user.model';
import { signAuthToken, AUTH_COOKIE_NAME } from '../utils/token';

const TEST_SECRET = 'test_jwt_secret_with_more_than_32_characters_for_unit_tests';

const app = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

describe('Phase 3F — Authentication Lean Optimization & Security Contract Tests', () => {
  const userId = new mongoose.Types.ObjectId().toString();

  const mockLeanUser = {
    _id: userId,
    name: 'Rev. Fr. Principal',
    email: 'principal@bac.edu.in',
    role: 'master_admin',
    departmentId: 'cs-dept',
    clubId: 'rotaract',
    permissions: ['all'],
    status: 'active',
    tokenVersion: 1,
    failedLoginAttempts: 0,
    lockUntil: undefined,
    password: bcrypt.hashSync('SecurePassword@123', 10),
    lastLogin: new Date('2026-11-01T10:00:00Z'),
    phone: '+91 9876543210',
    avatar: 'https://bac.edu.in/avatars/principal.jpg',
    createdAt: new Date('2026-01-01T00:00:00Z'),
    updatedAt: new Date('2026-11-01T10:00:00Z'),
    __v: 0,
  };

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // 1. Valid JWT via Bearer
  it('1. returns 200 and sanitized user profile via Authorization Bearer', async () => {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...mockLeanUser }),
      }),
    } as any);

    const token = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: mockLeanUser.role, tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBe(userId);
    expect(res.body.data.user.email).toBe('principal@bac.edu.in');
    expect(res.body.data.user.name).toBe('Rev. Fr. Principal');
    expect(res.body.data.user.role).toBe('master_admin');
    expect(res.body.data.user.departmentId).toBe('cs-dept');
    expect(res.body.data.user.clubId).toBe('rotaract');
    expect(res.body.data.user.permissions).toEqual(['all']);
    expect(res.body.data.user.status).toBe('active');
    expect(res.body.data.user.phone).toBe('+91 9876543210');
    expect(res.body.data.user.avatar).toBe('https://bac.edu.in/avatars/principal.jpg');

    // Sensitive field exclusion guarantees
    expect(res.body.data.user._id).toBeUndefined();
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.tokenVersion).toBeUndefined();
    expect(res.body.data.user.failedLoginAttempts).toBeUndefined();
    expect(res.body.data.user.lockUntil).toBeUndefined();
    expect(res.body.data.user.__v).toBeUndefined();
  });

  // 2. Valid JWT via HttpOnly Cookie
  it('2. returns 200 and sanitized user profile via HttpOnly cookie', async () => {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...mockLeanUser }),
      }),
    } as any);

    const token = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: mockLeanUser.role, tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`${AUTH_COOKIE_NAME}=${token}`]);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.id).toBe(userId);
    expect(res.body.data.user.email).toBe('principal@bac.edu.in');
  });

  // 3. Invalid signature
  it('3. rejects forged or invalid signature with 401 INVALID_TOKEN', async () => {
    const forgedToken = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: 'master_admin', tokenVersion: 1 },
      'forged_secret_key_used_by_attacker_cannot_validate'
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${forgedToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('INVALID_TOKEN');
  });

  // 4. Expired token
  it('4. rejects expired token with 401 TOKEN_EXPIRED', async () => {
    const expiredToken = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET,
      '-10s'
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_EXPIRED');
  });

  // 5. Revoked tokenVersion
  it('5. rejects revoked token (mismatched tokenVersion) with 401 TOKEN_REVOKED', async () => {
    // Database has tokenVersion = 2 (e.g. user logged out or session invalidated)
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...mockLeanUser, tokenVersion: 2 }),
      }),
    } as any);

    // Client sends old token with tokenVersion = 1
    const oldToken = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${oldToken}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('TOKEN_REVOKED');
  });

  // 6. Disabled / suspended account
  it('6. rejects inactive or suspended account with 401 ACCOUNT_DISABLED', async () => {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...mockLeanUser, status: 'deactivated' }),
      }),
    } as any);

    const token = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('ACCOUNT_DISABLED');
  });

  // 7. Deleted user (not found in database)
  it('7. rejects deleted user with 401 USER_NOT_FOUND', async () => {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      }),
    } as any);

    const token = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.code).toBe('USER_NOT_FOUND');
  });

  // 8. Logout and token revocation
  it('8. logout clears authentication cookie and increments tokenVersion in database', async () => {
    const updateSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({} as any);

    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue({ ...mockLeanUser }),
      }),
    } as any);

    const token = signAuthToken(
      { sub: userId, email: mockLeanUser.email, role: 'master_admin', tokenVersion: 1 },
      TEST_SECRET
    );

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(userId, { $inc: { tokenVersion: 1 } });
  });

  // 9. Existing role-based authorization behavior
  it('9. enforces RBAC role boundaries (sub_admin cannot access master_admin only routes)', async () => {
    const staffUser = { ...mockLeanUser, role: 'staff', permissions: [] };
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(staffUser),
      }),
    } as any);

    const staffToken = signAuthToken(
      { sub: userId, email: staffUser.email, role: 'staff', tokenVersion: 1 },
      TEST_SECRET
    );

    // Try accessing protected admin endpoint without permission
    const res = await request(app)
      .put('/api/content')
      .set('Authorization', `Bearer ${staffToken}`)
      .send({ hero: { title: 'Unauthorized update' } });

    // Must be rejected with 403 Forbidden
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
  });
});
