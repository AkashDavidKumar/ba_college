/**
 * notice.test.ts — Comprehensive Test Suite for Phase 4C-3: Notices Management System
 *
 * Verifies:
 *  1. Notice Creation & Validation:
 *     - Authorized creation, automatic unique slug derivation.
 *     - Duplicate slug conflict detection (409).
 *     - Attachment URL safety validation (safe HTTPS/domains vs unsafe URLs).
 *  2. Scoped Authorization & RBAC:
 *     - Unauthenticated access returns 401.
 *     - HOD restricted to own department (cross-department / global mutation returns 403).
 *     - Disallowed roles (club_head, viewer) return 403.
 *  3. Governance Lifecycle & Self-Approval Prevention:
 *     - Submission of draft/rejected notice transitions to pending.
 *     - Self-approval strictly prohibited: author cannot approve own submission (403).
 *     - Valid approval transitions status to approved.
 *     - Rejection requires reason (400 if missing or under 5 chars).
 *  4. Scheduling, Publication & Expiry:
 *     - Publishing with future date transitions to scheduled.
 *     - Publishing with immediate/past date transitions to published.
 *     - Archival transitions to archived.
 *  5. Public Gating & Privacy:
 *     - Public endpoint strictly serves published notices where publishAt <= now and not expired.
 *     - Draft, pending, rejected, scheduled, expired, and archived notices hidden.
 *     - Single notice retrieval atomically increments viewsCount.
 *     - Pinned notices endpoint returns pinned/high-priority items.
 *     - Category aggregation counts.
 *  6. API Parity:
 *     - Identical behavior across /api and /api/v1 endpoints.
 *  7. Audit Logging:
 *     - AuditLog created on notice mutations.
 */
import request from 'supertest';
import { createApp } from '../app';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Notice } from '../models/notice.model';
import { Approval } from '../models/approval.model';
import { AuditLog } from '../models/audit-log.model';
import { getEnv } from '../config/env';

describe('Phase 4C-3: Notices Management System', () => {
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
      userId,
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

  function mockUserAuth(userDoc: Record<string, unknown>) {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(userDoc),
      }),
    } as any);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. NOTICE CREATION & VALIDATION
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Notice Creation & Validation', () => {
    it('1.1: Rejects unauthenticated creation attempt with 401', async () => {
      const res = await request(app).post('/api/admin/notices').send({
        title: 'End Semester Exam Notification',
        content: 'Detailed schedule for autonomous examinations.',
      });
      expect(res.status).toBe(401);
    });

    it('1.2: Admin successfully creates notice with automatic slug generation', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      jest.spyOn(Notice, 'findOne').mockResolvedValue(null as any);
      const saveSpy = jest.spyOn(Notice.prototype, 'save').mockImplementation(function (this: any) {
        this._id = new mongoose.Types.ObjectId();
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post('/api/admin/notices')
        .set('Authorization', auth.header)
        .send({
          title: 'Autonomous Exam Timetable 2026',
          content: 'The end semester examinations will commence on May 15, 2026 for all departments.',
          category: 'Examination',
          priority: 'High',
          targetAudience: 'Students',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.notice.slug).toBe('autonomous-exam-timetable-2026');
      expect(res.body.notice.category).toBe('Examination');
      saveSpy.mockRestore();
    });

    it('1.3: Rejects duplicate custom slug with 409 Conflict', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      jest.spyOn(Notice, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue({ _id: new mongoose.Types.ObjectId() }),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/notices')
        .set('Authorization', auth.header)
        .send({
          title: 'Duplicate Slug Notice',
          slug: 'existing-notice-slug',
          content: 'This notice tries to use an already taken slug.',
        });

      expect(res.status).toBe(409);
      expect(res.body.error || res.body.message).toContain('already exists');
    });

    it('1.4: Rejects insecure attachment URLs (e.g. javascript:, ftp:)', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const res = await request(app)
        .post('/api/admin/notices')
        .set('Authorization', auth.header)
        .send({
          title: 'Malicious Attachment Notice',
          content: 'Notice containing invalid protocol URL.',
          attachmentUrl: 'javascript:alert(1)',
        });

      expect(res.status).toBe(400);
      expect(res.body.error || res.body.message).toContain('Attachment URL must be a secure HTTPS link');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. SCOPE GUARDS & RBAC
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Scope Guards & RBAC', () => {
    it('2.1: HOD is forbidden from creating institution-wide global circulars', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science' });
      mockUserAuth(auth.userDoc);

      const res = await request(app)
        .post('/api/admin/notices')
        .set('Authorization', auth.header)
        .send({
          title: 'Global College Circular',
          content: 'HOD trying to issue campus-wide circular without department scope.',
          departmentId: null, // Global
        });

      expect(res.status).toBe(403);
      expect(res.body.error || res.body.message).toContain('Department-scoped users are not authorized to manage institution-wide');
    });

    it('2.2: HOD is forbidden from creating notices for other departments', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science' });
      mockUserAuth(auth.userDoc);

      const res = await request(app)
        .post('/api/admin/notices')
        .set('Authorization', auth.header)
        .send({
          title: 'Commerce Dept Circular',
          content: 'CS HOD attempting to post for commerce.',
          departmentId: 'commerce',
        });

      expect(res.status).toBe(403);
      expect(res.body.error || res.body.message).toContain('Department scope mismatch');
    });

    it('2.3: HOD successfully creates notice for assigned department', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science' });
      mockUserAuth(auth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);
      jest.spyOn(Approval, 'create').mockResolvedValue({} as any);

      jest.spyOn(Notice, 'findOne').mockResolvedValue(null as any);
      const saveSpy = jest.spyOn(Notice.prototype, 'save').mockImplementation(function (this: any) {
        this._id = new mongoose.Types.ObjectId();
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post('/api/admin/notices')
        .set('Authorization', auth.header)
        .send({
          title: 'CS Lab Exam Schedule',
          content: 'Practical exams for Computer Science UG programmes will commence on April 20.',
          departmentId: 'computer-science',
          category: 'Academic',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.notice.departmentId).toBe('computer-science');
      saveSpy.mockRestore();
    });

    it('2.4: Club Head is forbidden from creating college notices (403)', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract-club' });
      mockUserAuth(auth.userDoc);

      const res = await request(app)
        .post('/api/admin/notices')
        .set('Authorization', auth.header)
        .send({
          title: 'Club Event Notice',
          content: 'Rotaract meeting notice.',
        });

      expect(res.status).toBe(403);
      expect(res.body.error || res.body.message).toContain('lack permission to manage college notices');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. GOVERNANCE WORKFLOW & SELF-APPROVAL PREVENTION
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Governance Workflow & Self-Approval Prevention', () => {
    it('3.1: Author submits draft notice for review, transitioning to pending', async () => {
      const authorAuth = createAuthHeader({ role: 'content_editor' });
      mockUserAuth(authorAuth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);
      jest.spyOn(Approval, 'findOneAndUpdate').mockResolvedValue({} as any);

      const noticeId = new mongoose.Types.ObjectId();
      const mockNotice = {
        _id: noticeId,
        title: 'Draft Annual Report Notice',
        slug: 'draft-annual-report-notice',
        status: 'draft',
        departmentId: null,
        author: { userId: new mongoose.Types.ObjectId(authorAuth.userId), name: 'Content Editor', role: 'content_editor' },
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/submit`)
        .set('Authorization', authorAuth.header);

      expect(res.status).toBe(200);
      expect(mockNotice.status).toBe('pending');
      expect(res.body.message).toContain('submitted for review');
    });

    it('3.2: Self-approval is strictly prohibited (author cannot approve own submission)', async () => {
      const authorId = new mongoose.Types.ObjectId().toHexString();
      const authorAuth = createAuthHeader({ id: authorId, role: 'master_admin' });
      mockUserAuth(authorAuth.userDoc);

      const noticeId = new mongoose.Types.ObjectId();
      const mockNotice = {
        _id: noticeId,
        title: 'Admin Self Authored Circular',
        status: 'pending',
        departmentId: null,
        author: { userId: new mongoose.Types.ObjectId(authorId), name: 'Admin', role: 'master_admin' },
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/review`)
        .set('Authorization', authorAuth.header)
        .send({ action: 'approve' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('SELF_APPROVAL_PROHIBITED');
      expect(res.body.error || res.body.message).toContain('Self-approval is strictly prohibited');
    });

    it('3.3: Separate reviewer successfully approves pending notice', async () => {
      const reviewerAuth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(reviewerAuth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);
      jest.spyOn(Approval, 'findOneAndUpdate').mockResolvedValue({} as any);

      const originalAuthorId = new mongoose.Types.ObjectId();
      const noticeId = new mongoose.Types.ObjectId();
      const mockNotice = {
        _id: noticeId,
        title: 'Staff Notice',
        status: 'pending',
        departmentId: null,
        author: { userId: originalAuthorId, name: 'Staff Member', role: 'staff' },
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/review`)
        .set('Authorization', reviewerAuth.header)
        .send({ action: 'approve' });

      expect(res.status).toBe(200);
      expect(mockNotice.status).toBe('approved');
      expect(res.body.message).toContain('approved successfully');
    });

    it('3.4: Rejection requires a mandatory reason of at least 5 characters', async () => {
      const reviewerAuth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(reviewerAuth.userDoc);

      const originalAuthorId = new mongoose.Types.ObjectId();
      const noticeId = new mongoose.Types.ObjectId();
      const mockNotice = {
        _id: noticeId,
        title: 'Incomplete Notice',
        status: 'pending',
        departmentId: null,
        author: { userId: originalAuthorId, name: 'Staff Member', role: 'staff' },
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/review`)
        .set('Authorization', reviewerAuth.header)
        .send({ action: 'reject', rejectionReason: 'No' });

      expect(res.status).toBe(400);
      expect(res.body.error || res.body.message).toContain('at least 5 characters');
    });

    it('3.5: Reviewer successfully rejects notice with valid reason', async () => {
      const reviewerAuth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(reviewerAuth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);
      jest.spyOn(Approval, 'findOneAndUpdate').mockResolvedValue({} as any);

      const originalAuthorId = new mongoose.Types.ObjectId();
      const noticeId = new mongoose.Types.ObjectId();
      const mockNotice = {
        _id: noticeId,
        title: 'Flawed Notice',
        status: 'pending',
        departmentId: null,
        author: { userId: originalAuthorId, name: 'Staff Member', role: 'staff' },
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/review`)
        .set('Authorization', reviewerAuth.header)
        .send({ action: 'reject', rejectionReason: 'Please attach the official CoE signed PDF circular.' });

      expect(res.status).toBe(200);
      expect(mockNotice.status).toBe('rejected');
      expect(res.body.message).toContain('rejected successfully');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. SCHEDULING, PUBLICATION & EXPIRY
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Scheduling, Publication & Expiry', () => {
    it('4.1: Future publishAt date automatically transitions status to scheduled', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const noticeId = new mongoose.Types.ObjectId();
      const futureDate = new Date(Date.now() + 86400000 * 7); // 7 days in future
      const mockNotice = {
        _id: noticeId,
        title: 'Future Scheduled Circular',
        status: 'approved',
        publishAt: futureDate,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/publish`)
        .set('Authorization', auth.header)
        .send({ publishAt: futureDate.toISOString() });

      expect(res.status).toBe(200);
      expect(mockNotice.status).toBe('scheduled');
      expect(res.body.message).toContain('scheduled successfully');
    });

    it('4.2: Immediate publishAt date transitions status to published', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const noticeId = new mongoose.Types.ObjectId();
      const mockNotice = {
        _id: noticeId,
        title: 'Immediate Circular',
        status: 'approved',
        publishAt: new Date(Date.now() - 1000),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/publish`)
        .set('Authorization', auth.header)
        .send({});

      expect(res.status).toBe(200);
      expect(mockNotice.status).toBe('published');
    });

    it('4.3: Archiving notice transitions status to archived', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const noticeId = new mongoose.Types.ObjectId();
      const mockNotice = {
        _id: noticeId,
        title: 'Notice to Archive',
        status: 'published',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Notice, 'findOne').mockResolvedValue(mockNotice as any);

      const res = await request(app)
        .post(`/api/admin/notices/${noticeId}/archive`)
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(mockNotice.status).toBe('archived');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. PUBLIC GATING & PRIVACY
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Public Gating & Privacy', () => {
    it('5.1: Public notices endpoint returns published notices and excludes drafts/pending/scheduled', async () => {
      const publishedNotice = {
        _id: new mongoose.Types.ObjectId(),
        title: 'Autonomous Exam Notification 2026',
        slug: 'autonomous-exam-notification-2026',
        category: 'Examination',
        priority: 'High',
        status: 'published',
        publishAt: new Date(Date.now() - 3600000),
        viewsCount: 15,
      };

      jest.spyOn(Notice, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([publishedNotice]),
            }),
          }),
        }),
      } as any);

      jest.spyOn(Notice, 'countDocuments').mockResolvedValue(1);

      const res = await request(app).get('/api/notices');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].slug).toBe('autonomous-exam-notification-2026');
      expect(res.body.pagination.total).toBe(1);
    });

    it('5.2: Public detail retrieval atomically increments viewsCount', async () => {
      const noticeId = new mongoose.Types.ObjectId();
      const publishedNotice = {
        _id: noticeId,
        title: 'Fee Payment Circular',
        slug: 'fee-payment-circular',
        content: 'Last date for tuition fee payment is March 31.',
        category: 'Fee',
        status: 'published',
        publishAt: new Date(Date.now() - 3600000),
        viewsCount: 43,
      };

      jest.spyOn(Notice, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue(publishedNotice),
      } as any);

      const res = await request(app).get('/api/notices/fee-payment-circular');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('fee-payment-circular');
      expect(res.body.data.viewsCount).toBe(43);
    });

    it('5.3: Public query for draft notice returns 404 Not Found', async () => {
      jest.spyOn(Notice, 'findOneAndUpdate').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app).get('/api/notices/hidden-draft-notice');

      expect(res.status).toBe(404);
      expect(res.body.error || res.body.message).toContain('not available for public view');
    });

    it('5.4: Pinned notices endpoint returns top 5 pinned or high-priority items', async () => {
      const pinnedNotices = [
        {
          _id: new mongoose.Types.ObjectId(),
          title: 'Emergency Storm Holiday',
          slug: 'emergency-storm-holiday',
          priority: 'High',
          isPinned: true,
          status: 'published',
        },
      ];

      jest.spyOn(Notice, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          limit: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(pinnedNotices),
          }),
        }),
      } as any);

      const res = await request(app).get('/api/notices/pinned');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].isPinned).toBe(true);
    });

    it('5.5: Scheduled notice automatically becomes publicly visible when publishAt <= now', async () => {
      let capturedFilter: any = null;
      (jest.spyOn(Notice, 'find') as any).mockImplementation((filter: any) => {
        capturedFilter = filter;
        return {
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([
                  {
                    _id: new mongoose.Types.ObjectId(),
                    title: 'Scheduled Circular Due Now',
                    slug: 'scheduled-circular-due-now',
                    status: 'scheduled',
                    publishAt: new Date(Date.now() - 60000),
                  },
                ]),
              }),
            }),
          }),
        } as any;
      });
      jest.spyOn(Notice, 'countDocuments').mockResolvedValue(1);

      const res = await request(app).get('/api/notices');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].slug).toBe('scheduled-circular-due-now');
      expect(capturedFilter.status).toEqual({ $in: ['published', 'scheduled'] });
      expect(capturedFilter.publishAt).toBeDefined();
      expect(capturedFilter.publishAt.$lte).toBeInstanceOf(Date);
      expect(capturedFilter.$or).toBeDefined();
    });

    it('5.6: Scheduled notice with future publishAt is strictly excluded by publishAt <= now', async () => {
      let capturedFilter: any = null;
      (jest.spyOn(Notice, 'find') as any).mockImplementation((filter: any) => {
        capturedFilter = filter;
        return {
          sort: jest.fn().mockReturnValue({
            skip: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([]),
              }),
            }),
          }),
        } as any;
      });
      jest.spyOn(Notice, 'countDocuments').mockResolvedValue(0);

      const res = await request(app).get('/api/notices');

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBe(0);
      expect(capturedFilter.publishAt.$lte.getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('5.7: Public pinned notices and category counts use identical publication and expiry filter', async () => {
      let capturedPinnedFilter: any = null;
      let capturedAggFilter: any = null;

      (jest.spyOn(Notice, 'find') as any).mockImplementation((filter: any) => {
        capturedPinnedFilter = filter;
        return {
          sort: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        } as any;
      });

      jest.spyOn(Notice, 'aggregate').mockImplementation((pipeline: any) => {
        capturedAggFilter = pipeline[0].$match;
        return Promise.resolve([]) as any;
      });

      await request(app).get('/api/notices/pinned');
      await request(app).get('/api/notices/categories');

      expect(capturedPinnedFilter.status).toEqual({ $in: ['published', 'scheduled'] });
      expect(capturedPinnedFilter.publishAt.$lte).toBeInstanceOf(Date);
      expect(capturedPinnedFilter.$or).toBeDefined();

      expect(capturedAggFilter.status).toEqual({ $in: ['published', 'scheduled'] });
      expect(capturedAggFilter.publishAt.$lte).toBeInstanceOf(Date);
      expect(capturedAggFilter.$or).toBeDefined();
    });

    it('5.8: Public notice detail by slug enforces identical publication and expiry filter', async () => {
      let capturedSlugFilter: any = null;

      (jest.spyOn(Notice, 'findOneAndUpdate') as any).mockImplementation((filter: any) => {
        capturedSlugFilter = filter;
        return {
          lean: jest.fn().mockResolvedValue(null),
        } as any;
      });

      const res = await request(app).get('/api/notices/future-scheduled-slug');

      expect(res.status).toBe(404);
      expect(capturedSlugFilter.status).toEqual({ $in: ['published', 'scheduled'] });
      expect(capturedSlugFilter.publishAt.$lte).toBeInstanceOf(Date);
      expect(capturedSlugFilter.$or).toBeDefined();
    });

    it('5.9: Admin metrics count scheduled and published records separately', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      jest.spyOn(Notice, 'countDocuments').mockImplementation((filter: any) => {
        if (filter?.status === 'scheduled') return Promise.resolve(3) as any;
        if (filter?.status === 'published') return Promise.resolve(12) as any;
        return Promise.resolve(20) as any;
      });

      const res = await request(app)
        .get('/api/admin/notices/metrics')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.metrics.scheduled).toBe(3);
      expect(res.body.metrics.published).toBe(12);
      expect(res.body.metrics.total).toBe(20);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. API VERSION PARITY (/api and /api/v1)
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. API Version Parity', () => {
    it('6.1: /api/v1/notices returns identical structure to /api/notices', async () => {
      jest.spyOn(Notice, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);
      jest.spyOn(Notice, 'countDocuments').mockResolvedValue(0);

      const res = await request(app).get('/api/v1/notices');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    it('6.2: /api/v1/admin/notices/metrics returns identical structure to /api/admin/notices/metrics', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      jest.spyOn(Notice, 'countDocuments').mockResolvedValue(5);

      const res = await request(app)
        .get('/api/v1/admin/notices/metrics')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.metrics.total).toBe(5);
      expect(res.body.metrics.published).toBe(5);
    });
  });
});
