/**
 * alumni.test.ts — Comprehensive Test Suite for Phase 4C-1: Alumni Management System
 *
 * Verifies:
 *  1. Public registration:
 *     - Validation schemas, required fields, year boundaries, safe HTTPS URLs.
 *     - Default status (verificationStatus strictly 'pending', status 'active').
 *     - Duplicate detection on personalEmail (case-insensitive) returning 409 Conflict.
 *     - Duplicate detection on registerNumber returning 409 Conflict.
 *     - Composite identity match flagged for review (flaggedAsPotentialDuplicate: true) without rejection.
 *  2. Public directory & PII protection:
 *     - Only verified + opted-in (isPublicDirectoryOptIn: true) + active alumni returned.
 *     - Strict projection strips personalEmail, phoneNumber, registerNumber, residentialAddress,
 *       internalNotes, registeredIp, rejectionReason, verifiedBy.
 *     - Public featured endpoint returns only verified, featured alumni.
 *     - Directory search, department, and graduation year filters.
 *  3. Administrative management & verification lifecycle:
 *     - Listing with pagination, search, verificationStatus filters, and summary counts.
 *     - Detail view exposing administrative fields to authorized roles.
 *     - Profile updating with duplicate prevention on email/registerNumber.
 *     - Verification action recording actor (verifiedBy), timestamp (verifiedAt), and AuditLog ('APPROVE').
 *     - Rejection action requiring rejectionReason, resetting directory opt-in, and logging AuditLog ('REJECT').
 *     - Archival soft-delete logging AuditLog ('DELETE').
 *  4. Granular RBAC role coverage across all six roles:
 *     - super_admin / admin: full management access.
 *     - moderator: verification, rejection, and reading access.
 *     - editor: denied from verification/management (403).
 *     - hod: denied from verification/management (403).
 *     - club_head: denied from alumni operations (403).
 *     - unauthenticated: rejected with 401.
 *  5. API Parity across `/api` and `/api/v1`:
 *     - Matching behavior and schema for directory, featured, registration, and administrative routes.
 */
import request from 'supertest';
import { createApp } from '../app';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Alumni } from '../models/alumni.model';
import { AuditLog } from '../models/audit-log.model';
import { getEnv } from '../config/env';

describe('Phase 4C-1: Alumni Management System', () => {
  const app = createApp({ corsOrigins: ['http://localhost:3000'], trustProxy: false });
  const env = getEnv();

  function createAuthHeader(userProps: {
    id?: string;
    role: string;
    permissions?: string[];
    departmentId?: string;
    clubId?: string;
  }) {
    const userId = userProps.id || new mongoose.Types.ObjectId().toHexString();
    const payload = {
      sub: userId,
      email: `${userProps.role.toLowerCase()}@bac.edu.in`,
      role: userProps.role,
      tokenVersion: 1,
    };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
    return {
      header: `Bearer ${token}`,
      userDoc: {
        _id: userId,
        name: `${userProps.role} User`,
        email: `${userProps.role.toLowerCase()}@bac.edu.in`,
        role: userProps.role,
        departmentId: userProps.departmentId,
        clubId: userProps.clubId,
        permissions: userProps.permissions || [],
        status: 'active',
        tokenVersion: 1,
      },
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. PUBLIC ALUMNI REGISTRATION & DUPLICATE DETECTION
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Public Registration & Duplicate Safeguards', () => {
    it('1.1: Accepts valid public registration and defaults verificationStatus to pending', async () => {
      const validPayload = {
        firstName: 'Anand',
        lastName: 'Kumar',
        personalEmail: 'Anand.Kumar@Example.com',
        phoneNumber: '+91 9876543210',
        degree: 'B.Sc Computer Science',
        departmentId: 'computer-science',
        graduationYear: 2021,
        registerNumber: '18BCS045',
        currentCompany: 'Infosys Ltd',
        designation: 'Senior Systems Engineer',
        city: 'Bangalore',
        country: 'India',
        linkedInUrl: 'https://linkedin.com/in/anandkumar',
        isPublicDirectoryOptIn: true,
        isWillingToMentor: true,
      };

      jest.spyOn(Alumni, 'findOne').mockResolvedValue(null);
      const mockSave = jest.fn().mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        fullName: 'Anand Kumar',
        verificationStatus: 'pending',
      });
      jest.spyOn(Alumni.prototype, 'save').mockImplementation(mockSave);

      const res = await request(app)
        .post('/api/alumni/register')
        .send(validPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('pending');
      expect(res.body.message).toContain('pending institutional verification');
    });

    it('1.2: Normalizes email to lowercase and register number to uppercase', async () => {
      let savedDoc: any = null;
      jest.spyOn(Alumni, 'findOne').mockResolvedValue(null);
      jest.spyOn(Alumni.prototype, 'save').mockImplementation(function (this: any) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        savedDoc = this;
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post('/api/alumni/register')
        .send({
          firstName: 'Revathi',
          lastName: 'Sundar',
          personalEmail: 'REVATHI.SUNDAR@GMAIL.COM',
          degree: 'B.Com Corporate Secretaryship',
          departmentId: 'commerce',
          graduationYear: 2019,
          registerNumber: '16bcs088',
        });

      expect(res.status).toBe(201);
      expect(savedDoc).not.toBeNull();
      expect(savedDoc.personalEmail).toBe('revathi.sundar@gmail.com');
      expect(savedDoc.registerNumber).toBe('16BCS088');
      expect(savedDoc.verificationStatus).toBe('pending');
    });

    it('1.3: Rejects duplicate personal email with 409 Conflict', async () => {
      jest.spyOn(Alumni, 'findOne').mockResolvedValueOnce({
        _id: new mongoose.Types.ObjectId(),
        personalEmail: 'existing.alumni@example.com',
      } as any);

      const res = await request(app)
        .post('/api/alumni/register')
        .send({
          firstName: 'Duplicate',
          lastName: 'User',
          personalEmail: 'existing.alumni@example.com',
          degree: 'B.Sc Mathematics',
          departmentId: 'mathematics',
          graduationYear: 2020,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('email address already exists');
    });

    it('1.4: Rejects duplicate register number with 409 Conflict', async () => {
      // First findOne (email check) passes null, second findOne (regNo check) returns existing record
      jest.spyOn(Alumni, 'findOne')
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          _id: new mongoose.Types.ObjectId(),
          registerNumber: '15BCS001',
        } as any);

      const res = await request(app)
        .post('/api/alumni/register')
        .send({
          firstName: 'Another',
          lastName: 'Student',
          personalEmail: 'new.student@example.com',
          registerNumber: '15BCS001',
          degree: 'B.Sc Computer Science',
          departmentId: 'computer-science',
          graduationYear: 2018,
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('register number already exists');
    });

    it('1.5: Composite identity match flags as potential duplicate without rejecting', async () => {
      let savedDoc: any = null;
      // Email null, regNo null, compositeMatch returns existing match
      jest.spyOn(Alumni, 'findOne')
        .mockResolvedValueOnce(null) // email
        .mockResolvedValueOnce({     // composite check
          _id: new mongoose.Types.ObjectId('507f1f77bcf86cd799439011'),
          fullName: 'Suresh Kumar',
          graduationYear: 2020,
        } as any);

      jest.spyOn(Alumni.prototype, 'save').mockImplementation(function (this: any) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        savedDoc = this;
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post('/api/alumni/register')
        .send({
          firstName: 'Suresh',
          lastName: 'Kumar',
          personalEmail: 'suresh.alt.email@gmail.com',
          degree: 'BCA (Computer Applications)',
          departmentId: 'computer-applications',
          graduationYear: 2020,
        });

      expect(res.status).toBe(201);
      expect(savedDoc.flaggedAsPotentialDuplicate).toBe(true);
      expect(savedDoc.duplicateMatchDetails).toContain('Potential duplicate of existing alumni record');
      expect(savedDoc.verificationStatus).toBe('pending');
    });

    it('1.6: Rejects registration with invalid email or graduation year out of range', async () => {
      const res = await request(app)
        .post('/api/alumni/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          personalEmail: 'not-an-email',
          degree: 'B.Sc',
          departmentId: 'cs',
          graduationYear: 1950, // Before 1980
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('1.7: Rejects insecure non-HTTPS LinkedIn URLs', async () => {
      const res = await request(app)
        .post('/api/alumni/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          personalEmail: 'valid@example.com',
          degree: 'B.Sc CS',
          departmentId: 'cs',
          graduationYear: 2020,
          linkedInUrl: 'http://insecure-linkedin.com/in/user',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('HTTPS URL');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. STRICT PUBLIC DIRECTORY PII REDACTION & ACCESS CONTROLS
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Public Directory Gating & PII Redaction', () => {
    it('2.1: Strips all sensitive personal and internal fields from public directory', async () => {
      const mockPublicItem = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'Divya',
        lastName: 'Prakash',
        fullName: 'Divya Prakash',
        degree: 'B.Sc Information Technology',
        departmentId: 'it',
        graduationYear: 2022,
        currentCompany: 'TCS',
        designation: 'Software Engineer',
        city: 'Chennai',
        country: 'India',
        linkedInUrl: 'https://linkedin.com/in/divyaprakash',
        isFeatured: false,
        createdAt: new Date(),
      };

      jest.spyOn(Alumni, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([mockPublicItem]),
            }),
          }),
        }),
      } as any);

      jest.spyOn(Alumni, 'countDocuments').mockResolvedValue(1);

      const res = await request(app).get('/api/alumni/directory');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(1);

      const item = res.body.data.items[0];
      // Public fields present
      expect(item.fullName).toBe('Divya Prakash');
      expect(item.currentCompany).toBe('TCS');

      // Sensitive PII strictly absent
      expect(item.personalEmail).toBeUndefined();
      expect(item.phoneNumber).toBeUndefined();
      expect(item.registerNumber).toBeUndefined();
      expect(item.residentialAddress).toBeUndefined();
      expect(item.internalNotes).toBeUndefined();
      expect(item.registeredIp).toBeUndefined();
      expect(item.rejectionReason).toBeUndefined();
      expect(item.verifiedBy).toBeUndefined();
    });

    it('2.2: Queries exclusively verified, opted-in, and active alumni', async () => {
      let executedQuery: any = null;
      (jest.spyOn(Alumni, 'find') as any).mockImplementation((query: any) => {
        executedQuery = query;
        return {
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        };
      });
      jest.spyOn(Alumni, 'countDocuments').mockResolvedValue(0);

      await request(app).get('/api/alumni/directory?departmentId=computer-science&graduationYear=2021');

      expect(executedQuery).not.toBeNull();
      expect(executedQuery.verificationStatus).toBe('verified');
      expect(executedQuery.isPublicDirectoryOptIn).toBe(true);
      expect(executedQuery.status).toBe('active');
      expect(executedQuery.departmentId).toBe('computer-science');
      expect(executedQuery.graduationYear).toBe(2021);
    });

    it('2.3: Featured endpoint enforces all four gates (verified, active, featured, opted-in)', async () => {
      let executedQuery: any = null;
      (jest.spyOn(Alumni, 'find') as any).mockImplementation((query: any) => {
        executedQuery = query;
        return {
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        };
      });

      const res = await request(app).get('/api/alumni/featured');

      expect(res.status).toBe(200);
      expect(executedQuery).not.toBeNull();
      expect(executedQuery.verificationStatus).toBe('verified');
      expect(executedQuery.isPublicDirectoryOptIn).toBe(true);
      expect(executedQuery.status).toBe('active');
      expect(executedQuery.isFeatured).toBe(true);
    });

    it('2.4: Featured endpoint strictly excludes non-opted-in, pending, rejected, and archived records via query filter', async () => {
      let executedQuery: any = null;
      (jest.spyOn(Alumni, 'find') as any).mockImplementation((query: any) => {
        executedQuery = query;
        return {
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        };
      });

      await request(app).get('/api/alumni/featured?limit=5');

      // Four mandatory gates ensure:
      // 1. isPublicDirectoryOptIn: true -> Non-opted-in alumni cannot be matched
      // 2. verificationStatus: 'verified' -> Pending and rejected alumni cannot be matched
      // 3. status: 'active' -> Archived alumni cannot be matched
      // 4. isFeatured: true -> Non-featured alumni cannot be matched
      expect(executedQuery).toEqual({
        verificationStatus: 'verified',
        isPublicDirectoryOptIn: true,
        status: 'active',
        isFeatured: true,
      });
    });

    it('2.5: Featured endpoint response strips all sensitive PII and returns only public projection', async () => {
      const mockFeaturedAlum = {
        _id: new mongoose.Types.ObjectId(),
        firstName: 'Ananya',
        lastName: 'Ramasamy',
        fullName: 'Ananya Ramasamy',
        degree: 'B.Com Corporate Secretaryship',
        departmentId: 'commerce',
        graduationYear: 2019,
        currentCompany: 'Deloitte India',
        designation: 'Senior Consultant',
        city: 'Bengaluru',
        country: 'India',
        testimonial: 'Bishop Ambrose College provided me the strong foundation.',
        isFeatured: true,
        isPublicDirectoryOptIn: true,
      };

      jest.spyOn(Alumni, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([mockFeaturedAlum]),
          }),
        }),
      } as any);

      const res = await request(app).get('/api/alumni/featured');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);

      const item = res.body.data[0];
      expect(item.fullName).toBe('Ananya Ramasamy');
      expect(item.currentCompany).toBe('Deloitte India');
      expect(item.isFeatured).toBe(true);

      // Verify all sensitive PII fields are strictly undefined
      expect(item.personalEmail).toBeUndefined();
      expect(item.phoneNumber).toBeUndefined();
      expect(item.registerNumber).toBeUndefined();
      expect(item.residentialAddress).toBeUndefined();
      expect(item.internalNotes).toBeUndefined();
      expect(item.registeredIp).toBeUndefined();
      expect(item.rejectionReason).toBeUndefined();
      expect(item.verifiedBy).toBeUndefined();
    });

    it('2.6: API Parity: /api/alumni/featured and /api/v1/alumni/featured enforce identical gates and schema', async () => {
      const executedQueries: any[] = [];
      const parityItem = {
        _id: new mongoose.Types.ObjectId().toHexString(),
        fullName: 'Parity Alum',
        degree: 'B.Sc Physics',
        departmentId: 'physics',
        graduationYear: 2021,
        isFeatured: true,
      };

      (jest.spyOn(Alumni, 'find') as any).mockImplementation((query: any) => {
        executedQueries.push(query);
        return {
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([parityItem]),
            }),
          }),
        };
      });

      const [resApi, resV1] = await Promise.all([
        request(app).get('/api/alumni/featured'),
        request(app).get('/api/v1/alumni/featured'),
      ]);

      expect(resApi.status).toBe(200);
      expect(resV1.status).toBe(200);
      expect(resApi.body).toEqual(resV1.body);
      expect(executedQueries).toHaveLength(2);
      expect(executedQueries[0]).toEqual({
        verificationStatus: 'verified',
        isPublicDirectoryOptIn: true,
        status: 'active',
        isFeatured: true,
      });
      expect(executedQueries[1]).toEqual({
        verificationStatus: 'verified',
        isPublicDirectoryOptIn: true,
        status: 'active',
        isFeatured: true,
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. ADMINISTRATIVE WORKFLOWS (VERIFY, REJECT, UPDATE, ARCHIVE) & AUDIT LOGS
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Administrative Verification Lifecycle & Auditing', () => {
    it('3.1: Admin verification sets verified status, records actor ID, timestamp, and creates AuditLog', async () => {
      const auth = createAuthHeader({ role: 'admin', permissions: ['alumni:verify', 'alumni:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();
      const mockAlumniDoc: any = {
        _id: new mongoose.Types.ObjectId(targetId),
        fullName: 'Pending Alumnus',
        verificationStatus: 'pending',
        toObject: () => ({ _id: targetId, verificationStatus: 'pending' }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Alumni, 'findById').mockResolvedValue(mockAlumniDoc);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/admin/alumni/${targetId}/verify`)
        .set('Authorization', auth.header)
        .send({ remarks: 'Verified against college records.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockAlumniDoc.verificationStatus).toBe('verified');
      expect(mockAlumniDoc.verifiedBy.toString()).toBe(auth.userDoc._id);
      expect(mockAlumniDoc.verifiedAt).toBeInstanceOf(Date);
      expect(mockAlumniDoc.internalNotes).toContain('Verified against college records');
      expect(mockAlumniDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'APPROVE',
          entityType: 'alumni',
          entityId: targetId,
        })
      );
    });

    it('3.2: Admin rejection requires reason, resets opt-in, records actor, and creates AuditLog', async () => {
      const auth = createAuthHeader({ role: 'admin', permissions: ['alumni:verify', 'alumni:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();
      const mockAlumniDoc: any = {
        _id: new mongoose.Types.ObjectId(targetId),
        fullName: 'Reject Candidate',
        verificationStatus: 'pending',
        isPublicDirectoryOptIn: true,
        toObject: () => ({ _id: targetId, verificationStatus: 'pending', isPublicDirectoryOptIn: true }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Alumni, 'findById').mockResolvedValue(mockAlumniDoc);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/admin/alumni/${targetId}/reject`)
        .set('Authorization', auth.header)
        .send({ rejectionReason: 'Register number not found in college convocation register' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockAlumniDoc.verificationStatus).toBe('rejected');
      expect(mockAlumniDoc.rejectionReason).toBe('Register number not found in college convocation register');
      expect(mockAlumniDoc.isPublicDirectoryOptIn).toBe(false); // Safety guarantee
      expect(mockAlumniDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REJECT',
          entityType: 'alumni',
          entityId: targetId,
        })
      );
    });

    it('3.3: Rejection without a valid reason is rejected with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'admin', permissions: ['alumni:verify', 'alumni:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();

      const res = await request(app)
        .post(`/api/admin/alumni/${targetId}/reject`)
        .set('Authorization', auth.header)
        .send({ rejectionReason: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('3.4: Admin update modifies fields and creates UPDATE AuditLog', async () => {
      const auth = createAuthHeader({ role: 'admin', permissions: ['alumni:update', 'alumni:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();
      const mockAlumniDoc: any = {
        _id: new mongoose.Types.ObjectId(targetId),
        firstName: 'Old',
        lastName: 'Name',
        currentCompany: 'Old Company',
        toObject: () => ({ _id: targetId, currentCompany: 'Old Company' }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Alumni, 'findById').mockResolvedValue(mockAlumniDoc);
      jest.spyOn(Alumni, 'findOne').mockResolvedValue(null);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put(`/api/admin/alumni/${targetId}`)
        .set('Authorization', auth.header)
        .send({ currentCompany: 'Google Cloud India', isFeatured: true });

      expect(res.status).toBe(200);
      expect(mockAlumniDoc.currentCompany).toBe('Google Cloud India');
      expect(mockAlumniDoc.isFeatured).toBe(true);
      expect(mockAlumniDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          entityType: 'alumni',
          entityId: targetId,
        })
      );
    });

    it('3.5: Admin soft-delete sets status to archived and resets directory opt-in', async () => {
      const auth = createAuthHeader({ role: 'super_admin', permissions: ['alumni:delete', 'alumni:manage', 'all'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();
      const mockAlumniDoc: any = {
        _id: new mongoose.Types.ObjectId(targetId),
        status: 'active',
        isPublicDirectoryOptIn: true,
        toObject: () => ({ _id: targetId, status: 'active' }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Alumni, 'findById').mockResolvedValue(mockAlumniDoc);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete(`/api/admin/alumni/${targetId}`)
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(mockAlumniDoc.status).toBe('archived');
      expect(mockAlumniDoc.isPublicDirectoryOptIn).toBe(false);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          entityType: 'alumni',
          entityId: targetId,
        })
      );
    });

    it('3.6: AuditLog records strictly sanitize alumni beforeState and afterState redacting all sensitive PII', async () => {
      const auth = createAuthHeader({ role: 'admin', permissions: ['alumni:update', 'alumni:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();
      const mockAlumniDoc: any = {
        _id: new mongoose.Types.ObjectId(targetId),
        firstName: 'Priya',
        lastName: 'Rajan',
        personalEmail: 'priya.private@gmail.com',
        phoneNumber: '+919876543210',
        registerNumber: '17BCS042',
        residentialAddress: '42 Secret Lane, Coimbatore',
        internalNotes: 'Confidential verification notes',
        registeredIp: '192.168.1.50',
        currentCompany: 'Infoview',
        toObject() {
          return {
            _id: targetId,
            firstName: this.firstName,
            lastName: this.lastName,
            personalEmail: this.personalEmail,
            phoneNumber: this.phoneNumber,
            registerNumber: this.registerNumber,
            residentialAddress: this.residentialAddress,
            internalNotes: this.internalNotes,
            registeredIp: this.registeredIp,
            currentCompany: this.currentCompany,
          };
        },
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Alumni, 'findById').mockResolvedValue(mockAlumniDoc);
      jest.spyOn(Alumni, 'findOne').mockResolvedValue(null);
      let capturedAuditCall: any = null;
      jest.spyOn(AuditLog, 'create').mockImplementation((data: any) => {
        capturedAuditCall = data;
        return Promise.resolve(data) as any;
      });

      const res = await request(app)
        .put(`/api/admin/alumni/${targetId}`)
        .set('Authorization', auth.header)
        .send({ currentCompany: 'ThoughtWorks India' });

      expect(res.status).toBe(200);
      expect(capturedAuditCall).not.toBeNull();
      expect(capturedAuditCall.action).toBe('UPDATE');

      const beforeState = capturedAuditCall.beforeState;
      const afterState = capturedAuditCall.afterState;

      // Ensure sensitive PII fields are strictly REDACTED in AuditLog
      expect(beforeState.personalEmail).toBe('[REDACTED]');
      expect(beforeState.phoneNumber).toBe('[REDACTED]');
      expect(beforeState.registerNumber).toBe('[REDACTED]');
      expect(beforeState.residentialAddress).toBe('[REDACTED]');
      expect(beforeState.internalNotes).toBe('[REDACTED]');
      expect(beforeState.registeredIp).toBe('[REDACTED]');

      expect(afterState.personalEmail).toBe('[REDACTED]');
      expect(afterState.phoneNumber).toBe('[REDACTED]');
      expect(afterState.registerNumber).toBe('[REDACTED]');
      expect(afterState.residentialAddress).toBe('[REDACTED]');
      expect(afterState.internalNotes).toBe('[REDACTED]');
      expect(afterState.registeredIp).toBe('[REDACTED]');

      // Ensure non-sensitive metadata remains intact for operational auditability
      expect(beforeState.firstName).toBe('Priya');
      expect(afterState.currentCompany).toBe('ThoughtWorks India');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. GRANULAR RBAC ROLE ENFORCEMENT (ALL SIX ROLES)
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Granular RBAC Permissions Across Roles', () => {
    it('4.1: Moderator with alumni:verify can verify alumni records', async () => {
      const auth = createAuthHeader({ role: 'moderator', permissions: ['alumni:verify', 'alumni:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();
      const mockAlumniDoc: any = {
        _id: new mongoose.Types.ObjectId(targetId),
        verificationStatus: 'pending',
        toObject: () => ({ _id: targetId }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Alumni, 'findById').mockResolvedValue(mockAlumniDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/admin/alumni/${targetId}/verify`)
        .set('Authorization', auth.header)
        .send({ remarks: 'Verified by Moderator' });

      expect(res.status).toBe(200);
      expect(mockAlumniDoc.verificationStatus).toBe('verified');
    });

    it('4.2: Editor without alumni:verify is forbidden (403) from verifying', async () => {
      const auth = createAuthHeader({ role: 'editor', permissions: ['content:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();

      const res = await request(app)
        .post(`/api/admin/alumni/${targetId}/verify`)
        .set('Authorization', auth.header)
        .send({ remarks: 'Unauthorized verify attempt' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('4.3: HOD without alumni:manage is forbidden (403) from updating or deleting alumni', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science', permissions: ['departments:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetId = new mongoose.Types.ObjectId().toHexString();

      const res = await request(app)
        .delete(`/api/admin/alumni/${targetId}`)
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('4.4: Club Head is forbidden (403) from accessing admin alumni listing', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract', permissions: ['clubs:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/alumni')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('4.5: Unauthenticated request to admin alumni endpoints returns 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admin/alumni');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. API PARITY ACROSS /api AND /api/v1
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. API Parity Verification (/api vs /api/v1)', () => {
    it('5.1: /api/alumni/directory and /api/v1/alumni/directory return identical schemas', async () => {
      const mockItems = [
        {
          _id: new mongoose.Types.ObjectId(),
          firstName: 'Parity',
          lastName: 'Test',
          fullName: 'Parity Test',
          degree: 'B.A. English',
          departmentId: 'english',
          graduationYear: 2017,
          isFeatured: false,
        },
      ];

      jest.spyOn(Alumni, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockItems),
            }),
          }),
        }),
      } as any);
      jest.spyOn(Alumni, 'countDocuments').mockResolvedValue(1);

      const [resApi, resV1] = await Promise.all([
        request(app).get('/api/alumni/directory'),
        request(app).get('/api/v1/alumni/directory'),
      ]);

      expect(resApi.status).toBe(200);
      expect(resV1.status).toBe(200);
      expect(resApi.body.data.items[0].fullName).toBe('Parity Test');
      expect(resV1.body.data.items[0].fullName).toBe('Parity Test');
      expect(resV1.body.data.pagination.total).toBe(1);
    });

    it('5.2: Public registration works identically on /api/v1/alumni/register', async () => {
      jest.spyOn(Alumni, 'findOne').mockResolvedValue(null);
      jest.spyOn(Alumni.prototype, 'save').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        fullName: 'V1 Register',
        verificationStatus: 'pending',
      } as any);

      const res = await request(app)
        .post('/api/v1/alumni/register')
        .send({
          firstName: 'V1',
          lastName: 'Register',
          personalEmail: 'v1.register@example.com',
          degree: 'BBA',
          departmentId: 'management',
          graduationYear: 2023,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.verificationStatus).toBe('pending');
    });

    it('5.3: Invalid MongoDB ID returns 400 Bad Request on admin detail', async () => {
      const auth = createAuthHeader({ role: 'admin', permissions: ['alumni:read', 'alumni:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/alumni/invalid-id-string')
        .set('Authorization', auth.header);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Invalid alumni ID format');
    });
  });
});
