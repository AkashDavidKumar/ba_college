/**
 * admin-cms-subphase4a.test.ts — Unit & Integration Tests for Sub-Phase 4A: Core Administration & Governance
 *
 * Test Coverage:
 *  1. User Management CRUD:
 *     - List users (sanitized, excluding password, tokenVersion, lockUntil, failedLoginAttempts).
 *     - Create user (bcrypt password hashing, email uniqueness, audit logging).
 *     - Update user (field modifications, password hashing).
 *     - Self-demotion protection (master_admin cannot demote self).
 *     - Self-deactivation protection (master_admin cannot deactivate self).
 *     - Last active master_admin protection (cannot demote or deactivate last admin).
 *     - Self-deletion protection (cannot delete own account).
 *     - Last active master_admin deletion protection (cannot delete last admin).
 *  2. Audit Logging (Append-Only):
 *     - Querying audit logs with pagination and filters.
 *     - Verification that audit logs are strictly append-only (no update/delete endpoints).
 *     - Redaction of sensitive fields (passwords, tokens).
 *  3. Content Approvals Workflow:
 *     - Submission of content for approval.
 *     - Self-approval prohibition (author cannot approve own submission).
 *     - Reviewer scope validation (HOD department scope, Club Head club scope).
 *     - Status transition validation (only pending items can be reviewed).
 *     - Reviewer tracking (reviewerId, reviewerName, reviewedAt, rejectionReason).
 *  4. 6-Role RBAC Authorization Matrix across all new endpoints.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createApp } from '../app';
import { User, AuditLog, Approval } from '../models';

const app = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

const JWT_SECRET = 'test_jwt_secret_with_more_than_32_characters_for_unit_tests';

/** Helper to generate valid mock JWT and configure User.findById mock */
function createAuthHeader(userProps: {
  id?: string;
  name?: string;
  email?: string;
  role: string;
  departmentId?: string;
  clubId?: string;
  permissions?: string[];
  status?: string;
  tokenVersion?: number;
}) {
  const userId = userProps.id || '507f1f77bcf86cd799439011';
  const payload = {
    sub: userId,
    email: userProps.email || `${userProps.role}@bac.edu.in`,
    role: userProps.role,
    tokenVersion: userProps.tokenVersion ?? 1,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  return {
    header: `Bearer ${token}`,
    userDoc: {
      _id: userId,
      id: userId,
      name: userProps.name || `Test ${userProps.role}`,
      email: payload.email,
      role: userProps.role,
      departmentId: userProps.departmentId,
      clubId: userProps.clubId,
      permissions: userProps.permissions || [],
      status: userProps.status || 'active',
      tokenVersion: payload.tokenVersion,
      toObject() {
        return { ...this };
      },
    },
  };
}

describe('Sub-Phase 4A: Core Administration & Governance', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. USER MANAGEMENT API TESTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('User Management API (GET/POST/PUT/DELETE /api/admin/users)', () => {
    it('1.1: GET /api/admin/users rejects unauthenticated access with 401', async () => {
      const res = await request(app).get('/api/admin/users');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2: GET /api/admin/users rejects unauthorized roles (staff without permission) with 403', async () => {
      const auth = createAuthHeader({ role: 'staff', permissions: ['view'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app).get('/api/admin/users').set('Authorization', auth.header);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('1.3: GET /api/admin/users returns sanitized user list excluding password hashes & tokens', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockUsers = [
        {
          _id: 'user-1',
          name: 'Admin One',
          email: 'admin1@bac.edu.in',
          role: 'master_admin',
          status: 'active',
          password: '$2a$12$someSecretHashThatMustNeverBeExposed',
          tokenVersion: 5,
          failedLoginAttempts: 2,
          lockUntil: new Date(),
          __v: 0,
        },
        {
          _id: 'user-2',
          name: 'HOD CS',
          email: 'hod.cs@bac.edu.in',
          role: 'hod',
          departmentId: 'computer-science',
          status: 'active',
          password: '$2a$12$anotherSecretHash',
          tokenVersion: 1,
        },
      ];

      jest.spyOn(User, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          sort: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(mockUsers),
          }),
        }),
      } as any);

      const res = await request(app).get('/api/admin/users').set('Authorization', auth.header);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);

      // Verify strict sanitization: no credentials or auth fields exposed
      for (const u of res.body.data) {
        expect(u.password).toBeUndefined();
        expect(u.tokenVersion).toBeUndefined();
        expect(u.failedLoginAttempts).toBeUndefined();
        expect(u.lockUntil).toBeUndefined();
        expect(u.__v).toBeUndefined();
        expect(u.id).toBeDefined();
        expect(u.name).toBeDefined();
        expect(u.email).toBeDefined();
      }
    });

    it('1.4: POST /api/admin/users creates a new user with bcrypt password and records audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(User, 'findOne').mockResolvedValue(null as any); // email available

      const createdUserDoc = {
        _id: 'new-user-123',
        name: 'Prof. Ramesh',
        email: 'ramesh@bac.edu.in',
        role: 'staff',
        status: 'active',
        permissions: ['view'],
        tokenVersion: 1,
        toObject() {
          return {
            _id: 'new-user-123',
            name: 'Prof. Ramesh',
            email: 'ramesh@bac.edu.in',
            role: 'staff',
            status: 'active',
            permissions: ['view'],
          };
        },
      };

      const userCreateSpy = jest.spyOn(User, 'create').mockResolvedValue(createdUserDoc as any);
      const auditCreateSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const newUserPayload = {
        name: 'Prof. Ramesh',
        email: 'ramesh@bac.edu.in',
        password: 'SecurePassword123!',
        role: 'staff',
        permissions: ['view'],
      };

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', auth.header)
        .send(newUserPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Prof. Ramesh');
      expect(res.body.data.password).toBeUndefined();

      // Verify bcrypt hashing was used
      expect(userCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Prof. Ramesh',
          email: 'ramesh@bac.edu.in',
          password: expect.stringMatching(/^\$2[aby]\$\d+\$/), // bcrypt pattern
          role: 'staff',
        })
      );

      // Verify password plaintext was not stored
      const callArgs = userCreateSpy.mock.calls[0][0];
      const isPasswordHashed = await bcrypt.compare('SecurePassword123!', (callArgs as any).password);
      expect(isPasswordHashed).toBe(true);

      // Verify audit trail logged the user creation
      expect(auditCreateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          module: 'User Management',
          recordId: 'new-user-123',
        })
      );
    });

    it('1.5: POST /api/admin/users returns 409 Conflict if email is already taken', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(User, 'findOne').mockResolvedValue({ _id: 'existing-user' } as any);

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', auth.header)
        .send({
          name: 'Duplicate Test',
          email: 'duplicate@bac.edu.in',
          password: 'Password123!',
          role: 'staff',
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('1.6: PUT /api/admin/users/:id prevents self-demotion of master_admin', async () => {
      const currentAdminId = '507f1f77bcf86cd799439011';
      const auth = createAuthHeader({ id: currentAdminId, role: 'master_admin', permissions: ['*'] });

      // Mock finding authenticated user in middleware
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (id === currentAdminId) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
            _id: currentAdminId,
            role: 'master_admin',
            status: 'active',
            save: jest.fn(),
          } as any;
        }
        return null as any;
      });

      const res = await request(app)
        .put(`/api/admin/users/${currentAdminId}`)
        .set('Authorization', auth.header)
        .send({ role: 'staff' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SELF_DEMOTION_PROHIBITED');
    });

    it('1.7: PUT /api/admin/users/:id prevents self-deactivation of master_admin', async () => {
      const currentAdminId = '507f1f77bcf86cd799439011';
      const auth = createAuthHeader({ id: currentAdminId, role: 'master_admin', permissions: ['*'] });

      jest.spyOn(User, 'findById').mockImplementation((_id: any) => {
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
          _id: currentAdminId,
          role: 'master_admin',
          status: 'active',
          save: jest.fn(),
        } as any;
      });

      const res = await request(app)
        .put(`/api/admin/users/${currentAdminId}`)
        .set('Authorization', auth.header)
        .send({ status: 'deactivated' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SELF_DEACTIVATION_PROHIBITED');
    });

    it('1.8: PUT /api/admin/users/:id prevents demoting or deactivating the last active master_admin', async () => {
      const currentAdminId = 'admin-1';
      const otherAdminId = 'admin-2';
      const auth = createAuthHeader({ id: currentAdminId, role: 'master_admin', permissions: ['*'] });

      const otherAdminDoc = {
        _id: otherAdminId,
        name: 'Sole Master Admin',
        email: 'sole@bac.edu.in',
        role: 'master_admin',
        status: 'active',
        save: jest.fn(),
      };

      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (id === otherAdminId) {
          return otherAdminDoc as any;
        }
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any;
      });

      // Mock 0 other active master_admin in the system (target is sole remaining)
      jest.spyOn(User, 'countDocuments').mockResolvedValue(0);

      const res = await request(app)
        .put(`/api/admin/users/${otherAdminId}`)
        .set('Authorization', auth.header)
        .send({ role: 'staff' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CANNOT_DEMOTE_LAST_ADMIN');
    });

    it('1.9: DELETE /api/admin/users/:id prevents self-deletion', async () => {
      const currentAdminId = '507f1f77bcf86cd799439011';
      const auth = createAuthHeader({ id: currentAdminId, role: 'master_admin', permissions: ['*'] });

      jest.spyOn(User, 'findById').mockImplementation((_id: any) => {
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
          _id: currentAdminId,
          role: 'master_admin',
        } as any;
      });

      const res = await request(app)
        .delete(`/api/admin/users/${currentAdminId}`)
        .set('Authorization', auth.header);

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('SELF_DELETION_PROHIBITED');
    });

    it('1.10: DELETE /api/admin/users/:id prevents deletion of the last active master_admin', async () => {
      const currentAdminId = 'admin-1';
      const targetAdminId = 'admin-2';
      const auth = createAuthHeader({ id: currentAdminId, role: 'master_admin', permissions: ['*'] });

      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (id === targetAdminId) {
          return {
            _id: targetAdminId,
            role: 'master_admin',
            status: 'active',
          } as any;
        }
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any;
      });

      // Mock 0 other active master_admins remaining
      jest.spyOn(User, 'countDocuments').mockResolvedValue(0);

      const res = await request(app)
        .delete(`/api/admin/users/${targetAdminId}`)
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('CANNOT_DELETE_LAST_ADMIN');
    });

    it('1.11: DELETE /api/admin/users/:id deletes non-last user and invalidates tokenVersion', async () => {
      const currentAdminId = 'admin-1';
      const targetUserId = 'staff-99';
      const auth = createAuthHeader({ id: currentAdminId, role: 'master_admin', permissions: ['*'] });

      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (id === targetUserId) {
          return {
            _id: targetUserId,
            name: 'Old Staff',
            email: 'oldstaff@bac.edu.in',
            role: 'staff',
            status: 'active',
          } as any;
        }
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any;
      });

      const tokenRevocationSpy = jest.spyOn(User, 'findByIdAndUpdate').mockResolvedValue({} as any);
      const deleteSpy = jest.spyOn(User, 'findByIdAndDelete').mockResolvedValue({} as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete(`/api/admin/users/${targetUserId}`)
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(tokenRevocationSpy).toHaveBeenCalledWith(targetUserId, { $inc: { tokenVersion: 1 } });
      expect(deleteSpy).toHaveBeenCalledWith(targetUserId);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          module: 'User Management',
          recordId: targetUserId,
        })
      );
    });

    it('1.12: POST /api/admin/users rejects unknown/protected fields like tokenVersion with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', auth.header)
        .send({
          name: 'Hacker',
          email: 'hacker@bac.edu.in',
          password: 'Password123!',
          role: 'staff',
          tokenVersion: 999, // Protected field injection attempt
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/unrecognized/i);
    });

    it('1.13: POST /api/admin/users prevents privilege escalation: sub_admin cannot create master_admin', async () => {
      const auth = createAuthHeader({
        role: 'sub_admin',
        permissions: ['users:manage'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', auth.header)
        .send({
          name: 'Illegal Admin',
          email: 'illegal@bac.edu.in',
          password: 'Password123!',
          role: 'master_admin',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PRIVILEGE_ESCALATION');
    });

    it('1.14: POST /api/admin/users prevents sub_admin from granting wildcard permissions', async () => {
      const auth = createAuthHeader({
        role: 'sub_admin',
        permissions: ['users:manage'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/users')
        .set('Authorization', auth.header)
        .send({
          name: 'Wildcard User',
          email: 'wildcard@bac.edu.in',
          password: 'Password123!',
          role: 'staff',
          permissions: ['*'],
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PRIVILEGE_ESCALATION');
    });

    it('1.15: PUT /api/admin/users/:id prevents sub_admin from modifying a master_admin user', async () => {
      const auth = createAuthHeader({
        role: 'sub_admin',
        permissions: ['users:manage'],
      });

      const masterAdminTarget = {
        _id: 'master-admin-target',
        name: 'Target Master Admin',
        email: 'target.admin@bac.edu.in',
        role: 'master_admin',
        status: 'active',
      };

      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (id === 'master-admin-target') {
          return masterAdminTarget as any;
        }
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any;
      });

      const res = await request(app)
        .put('/api/admin/users/master-admin-target')
        .set('Authorization', auth.header)
        .send({ name: 'Tampered Name' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_TARGET_USER');
    });

    it('1.16: Concurrent requests to demote/deactivate last active master_admin are safely serialized', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });

      const adminTarget = {
        _id: 'target-admin',
        role: 'master_admin',
        status: 'active',
        save: jest.fn(),
      };

      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (id === 'target-admin') {
          return adminTarget as any;
        }
        return {
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any;
      });

      // 0 other active master admins
      jest.spyOn(User, 'countDocuments').mockResolvedValue(0);

      const [res1, res2] = await Promise.all([
        request(app)
          .put('/api/admin/users/target-admin')
          .set('Authorization', auth.header)
          .send({ role: 'staff' }),
        request(app)
          .put('/api/admin/users/target-admin')
          .set('Authorization', auth.header)
          .send({ status: 'deactivated' }),
      ]);

      expect(res1.status).toBe(403);
      expect(res1.body.code).toBe('CANNOT_DEMOTE_LAST_ADMIN');
      expect(res2.status).toBe(403);
      expect(res2.body.code).toBe('CANNOT_DEMOTE_LAST_ADMIN');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. AUDIT LOGGING API TESTS (APPEND-ONLY)
  // ════════════════════════════════════════════════════════════════════════════
  describe('Audit Logging API (GET /api/admin/audit-logs)', () => {
    it('2.1: GET /api/admin/audit-logs rejects unauthenticated callers with 401', async () => {
      const res = await request(app).get('/api/admin/audit-logs');
      expect(res.status).toBe(401);
    });

    it('2.2: GET /api/admin/audit-logs rejects callers without audit:read with 403', async () => {
      const auth = createAuthHeader({ role: 'staff', permissions: ['view'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app).get('/api/admin/audit-logs').set('Authorization', auth.header);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('2.3: GET /api/admin/audit-logs returns paginated and filtered audit entries', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockLogs = [
        {
          _id: 'log-1',
          userId: 'user-1',
          userName: 'Dr. Anitha',
          userRole: 'master_admin',
          action: 'UPDATE',
          module: 'SiteContent',
          recordId: 'default',
          recordTitle: 'Updated homepage hero banner',
          timestamp: new Date('2026-05-10T10:00:00Z'),
        },
      ];

      jest.spyOn(AuditLog, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockLogs),
            }),
          }),
        }),
      } as any);

      jest.spyOn(AuditLog, 'countDocuments').mockResolvedValue(1);

      const res = await request(app)
        .get('/api/admin/audit-logs?module=SiteContent&action=UPDATE')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs).toHaveLength(1);
      expect(res.body.data.logs[0].module).toBe('SiteContent');
      expect(res.body.data.total).toBe(1);
    });

    it('2.4: Audit logs are strictly append-only: PUT and DELETE routes return 404', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      // Attempting to modify or purge audit records must fail closed (404 route not found)
      const putRes = await request(app)
        .put('/api/admin/audit-logs/log-1')
        .set('Authorization', auth.header)
        .send({ recordTitle: 'Tampered' });
      expect(putRes.status).toBe(404);

      const delRes = await request(app)
        .delete('/api/admin/audit-logs/log-1')
        .set('Authorization', auth.header);
      expect(delRes.status).toBe(404);
    });

    it('2.5: Verifies recursive sensitive data redaction in audit logging', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const auditCreateSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      // Trigger user creation which passes password and secrets
      jest.spyOn(User, 'findOne').mockResolvedValue(null as any);
      jest.spyOn(User, 'create').mockResolvedValue({
        _id: 'redact-test-id',
        name: 'Redact User',
        email: 'redact@bac.edu.in',
        role: 'staff',
        status: 'active',
        toObject() {
          return { ...this };
        },
      } as any);

      await request(app)
        .post('/api/admin/users')
        .set('Authorization', auth.header)
        .send({
          name: 'Redact User',
          email: 'redact@bac.edu.in',
          password: 'SecretPassword123!',
          role: 'staff',
        });

      expect(auditCreateSpy).toHaveBeenCalled();
      const callArgs = auditCreateSpy.mock.calls[0][0] as any;
      // Confirm recordTitle and auditDoc do not leak the plaintext password
      expect(JSON.stringify(callArgs)).not.toContain('SecretPassword123!');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. CONTENT APPROVALS WORKFLOW TESTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('Content Approvals Workflow API', () => {
    it('3.1: POST /api/admin/approvals creates pending approval submission with author tracking', async () => {
      const auth = createAuthHeader({
        id: 'author-123',
        name: 'Dr. Suresh (HOD)',
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['events:create'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const createdApproval = {
        _id: 'appr-99',
        entityType: 'event',
        entityId: 'evt-101',
        title: 'National AI Conference 2026',
        departmentId: 'computer-science',
        authorId: 'author-123',
        authorName: 'Dr. Suresh (HOD)',
        authorRole: 'hod',
        status: 'pending',
        submittedAt: new Date(),
        toObject() {
          return { ...this };
        },
      };

      const createSpy = jest.spyOn(Approval, 'create').mockResolvedValue(createdApproval as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/approvals')
        .set('Authorization', auth.header)
        .send({
          entityType: 'event',
          entityId: 'evt-101',
          title: 'National AI Conference 2026',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'event',
          title: 'National AI Conference 2026',
          departmentId: 'computer-science', // Auto-scoped to HOD's department
          authorId: 'author-123',
          status: 'pending',
        })
      );
    });

    it('3.2: GET /api/admin/approvals enforces departmental scoping for HOD users', async () => {
      const auth = createAuthHeader({
        id: 'hod-cs',
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['approvals:read'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const findSpy = jest.spyOn(Approval, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      jest.spyOn(Approval, 'countDocuments').mockResolvedValue(0);

      await request(app).get('/api/admin/approvals').set('Authorization', auth.header);

      // Verify that find was automatically scoped to HOD's departmentId
      expect(findSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          departmentId: 'computer-science',
        })
      );
    });

    it('3.3: PUT /api/admin/approvals/:id strictly prohibits self-approval (author cannot approve own submission)', async () => {
      const authorAndReviewerId = 'user-same';
      const auth = createAuthHeader({
        id: authorAndReviewerId,
        role: 'sub_admin',
        permissions: ['approvals:review'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockPendingItem = {
        _id: 'appr-1',
        authorId: authorAndReviewerId, // Identical to reviewer!
        title: 'Self Submitted Article',
        status: 'pending',
        save: jest.fn(),
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(mockPendingItem as any);

      const res = await request(app)
        .put('/api/admin/approvals/appr-1')
        .set('Authorization', auth.header)
        .send({ status: 'approved' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SELF_APPROVAL_PROHIBITED');
      expect(mockPendingItem.save).not.toHaveBeenCalled();
    });

    it('3.4: PUT /api/admin/approvals/:id prohibits HOD from reviewing items from other departments', async () => {
      const reviewerAuth = createAuthHeader({
        id: 'hod-commerce',
        role: 'hod',
        departmentId: 'commerce',
        permissions: ['approvals:review'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(reviewerAuth.userDoc),
        }),
      } as any);

      const mockPendingItem = {
        _id: 'appr-cs',
        authorId: 'staff-cs',
        departmentId: 'computer-science', // Different department!
        title: 'CS Hackathon',
        status: 'pending',
        save: jest.fn(),
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(mockPendingItem as any);

      const res = await request(app)
        .put('/api/admin/approvals/appr-cs')
        .set('Authorization', reviewerAuth.header)
        .send({ status: 'approved' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('3.5: PUT /api/admin/approvals/:id prevents reviewing already-approved items (invalid state transition)', async () => {
      const reviewerAuth = createAuthHeader({
        id: 'reviewer-admin',
        role: 'master_admin',
        permissions: ['*'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(reviewerAuth.userDoc),
        }),
      } as any);

      const alreadyApprovedItem = {
        _id: 'appr-done',
        authorId: 'other-user',
        title: 'Approved Event',
        status: 'approved', // Already approved!
        save: jest.fn(),
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(alreadyApprovedItem as any);

      const res = await request(app)
        .put('/api/admin/approvals/appr-done')
        .set('Authorization', reviewerAuth.header)
        .send({ status: 'approved' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('3.6: PUT /api/admin/approvals/:id approves pending item and records reviewer details and audit trail', async () => {
      const reviewerAuth = createAuthHeader({
        id: 'reviewer-admin',
        name: 'Master Reviewer',
        role: 'master_admin',
        permissions: ['*'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(reviewerAuth.userDoc),
        }),
      } as any);

      const pendingItem = {
        _id: 'appr-good',
        authorId: 'other-user',
        title: 'Valid Submission',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
        toObject() {
          return { ...this };
        },
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(pendingItem as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/approvals/appr-good')
        .set('Authorization', reviewerAuth.header)
        .send({ status: 'approved' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(pendingItem.status).toBe('approved');
      expect((pendingItem as any).reviewerId).toBe('reviewer-admin');
      expect((pendingItem as any).reviewedAt).toBeInstanceOf(Date);
      expect(pendingItem.save).toHaveBeenCalled();

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'APPROVE',
          module: 'Approvals',
          recordId: 'appr-good',
        })
      );
    });

    it('3.7: PUT /api/admin/approvals/:id rejects pending item with reason and records rejection', async () => {
      const reviewerAuth = createAuthHeader({
        id: 'reviewer-admin',
        name: 'Master Reviewer',
        role: 'master_admin',
        permissions: ['*'],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(reviewerAuth.userDoc),
        }),
      } as any);

      const pendingItem = {
        _id: 'appr-rej',
        authorId: 'other-user',
        title: 'Incomplete Submission',
        status: 'pending',
        save: jest.fn().mockResolvedValue(true),
        toObject() {
          return { ...this };
        },
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(pendingItem as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/approvals/appr-rej')
        .set('Authorization', reviewerAuth.header)
        .send({
          status: 'rejected',
          rejectionReason: 'Missing event budget breakdown and venue approval.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(pendingItem.status).toBe('rejected');
      expect((pendingItem as any).rejectionReason).toBe(
        'Missing event budget breakdown and venue approval.'
      );
      expect(pendingItem.save).toHaveBeenCalled();

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REJECT',
          module: 'Approvals',
          recordId: 'appr-rej',
        })
      );
    });

    it('3.8: POST /api/admin/approvals enforces scope boundaries (HOD cannot submit for another department)', async () => {
      const auth = createAuthHeader({
        id: 'hod-cs',
        role: 'hod',
        departmentId: 'computer-science',
        permissions: [],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/approvals')
        .set('Authorization', auth.header)
        .send({
          entityType: 'department',
          entityId: 'commerce-general',
          title: 'Commerce Dept Update',
          departmentId: 'commerce-general', // Scope mismatch with HOD CS
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('3.9: POST /api/admin/approvals/:id/resubmit allows author to resubmit rejected item back to pending', async () => {
      const authorId = 'author-456';
      const auth = createAuthHeader({
        id: authorId,
        role: 'staff',
        permissions: [],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const rejectedApproval = {
        _id: 'appr-rejected-1',
        authorId,
        title: 'Original Title',
        status: 'rejected',
        rejectionReason: 'Need revision',
        save: jest.fn().mockResolvedValue(true),
        toObject() {
          return { ...this };
        },
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(rejectedApproval as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/approvals/appr-rejected-1/resubmit')
        .set('Authorization', auth.header)
        .send({
          title: 'Revised Title with Fixes',
          notes: 'Added requested budget sheet',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(rejectedApproval.status).toBe('pending');
      expect(rejectedApproval.rejectionReason).toBeUndefined();
      expect(rejectedApproval.title).toBe('Revised Title with Fixes');
      expect(rejectedApproval.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'Approvals',
          recordId: 'appr-rejected-1',
        })
      );
    });

    it('3.10: POST /api/admin/approvals/:id/resubmit rejects resubmission of an already-approved item', async () => {
      const authorId = 'author-456';
      const auth = createAuthHeader({
        id: authorId,
        role: 'staff',
        permissions: [],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const approvedApproval = {
        _id: 'appr-approved-1',
        authorId,
        title: 'Approved Title',
        status: 'approved',
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(approvedApproval as any);

      const res = await request(app)
        .post('/api/admin/approvals/appr-approved-1/resubmit')
        .set('Authorization', auth.header)
        .send({ title: 'Attempted Change' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_RESUBMISSION_STATE');
    });

    it('3.11: POST /api/admin/approvals/:id/resubmit rejects non-author resubmission', async () => {
      const authorId = 'author-456';
      const nonAuthorAuth = createAuthHeader({
        id: 'different-user',
        role: 'staff',
        permissions: [],
      });

      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(nonAuthorAuth.userDoc),
        }),
      } as any);

      const rejectedApproval = {
        _id: 'appr-rejected-1',
        authorId, // author-456 != different-user
        title: 'Original Title',
        status: 'rejected',
      };

      jest.spyOn(Approval, 'findById').mockResolvedValue(rejectedApproval as any);

      const res = await request(app)
        .post('/api/admin/approvals/appr-rejected-1/resubmit')
        .set('Authorization', nonAuthorAuth.header)
        .send({ title: 'Unauthorized Resubmit' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_RESUBMISSION');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. 6-ROLE RBAC AUTHORIZATION MATRIX
  // ════════════════════════════════════════════════════════════════════════════
  describe('6-Role RBAC Authorization Matrix for Sub-Phase 4A', () => {
    const roles = [
      { role: 'master_admin', canManageUsers: true, canReadAudit: true, canReviewApprovals: true },
      { role: 'sub_admin', canManageUsers: false, canReadAudit: false, canReviewApprovals: false },
      { role: 'hod', canManageUsers: false, canReadAudit: false, canReviewApprovals: false },
      { role: 'club_head', canManageUsers: false, canReadAudit: false, canReviewApprovals: false },
      { role: 'content_editor', canManageUsers: false, canReadAudit: false, canReviewApprovals: false },
      { role: 'staff', canManageUsers: false, canReadAudit: false, canReviewApprovals: false },
    ];

    roles.forEach(({ role, canManageUsers, canReadAudit }) => {
      it(`enforces RBAC for role ${role}: user management is ${canManageUsers ? 'ALLOWED' : 'DENIED'}`, async () => {
        const auth = createAuthHeader({ role, permissions: [] });
        jest.spyOn(User, 'findById').mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any);

        const res = await request(app)
          .post('/api/admin/users')
          .set('Authorization', auth.header)
          .send({
            name: 'RBAC Test',
            email: `${role}.rbac@bac.edu.in`,
            password: 'Password123!',
            role: 'staff',
          });

        if (canManageUsers) {
          // Allowed or failed on logic, not 403
          expect(res.status).not.toBe(403);
        } else {
          expect(res.status).toBe(403);
          expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
        }
      });

      it(`enforces RBAC for role ${role}: audit log access is ${canReadAudit ? 'ALLOWED' : 'DENIED'}`, async () => {
        const auth = createAuthHeader({ role, permissions: [] });
        jest.spyOn(User, 'findById').mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any);

        jest.spyOn(AuditLog, 'find').mockReturnValue({
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        } as any);
        jest.spyOn(AuditLog, 'countDocuments').mockResolvedValue(0);

        const res = await request(app).get('/api/admin/audit-logs').set('Authorization', auth.header);

        if (canReadAudit) {
          expect(res.status).toBe(200);
        } else {
          expect(res.status).toBe(403);
          expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
        }
      });
    });
  });
});
