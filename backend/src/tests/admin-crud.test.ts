/**
 * admin-crud.test.ts — Automated Unit & Integration Tests for Sub-Phase 3D
 *
 * Test Coverage:
 *  1. Unauthenticated mutation rejection (401 Unauthorized).
 *  2. Default-deny permission checks for non-permitted roles (403 Forbidden).
 *  3. Full 6-role permission matrix:
 *     - Master Admin (root wildcard access)
 *     - Sub Admin (permitted global operations)
 *     - HOD (department-scoped validation and isolation)
 *     - Club Head (club-scoped validation and event soft-archiving)
 *     - Content Editor (institutional communication publishing)
 *     - Staff (default deny on all mutations)
 *  4. Polymorphic /api/events authorization & entity type validation (event, speaker, gallery).
 *  5. Scope enforcement & spoofing protection: HOD cannot modify another department, Club Head cannot touch another club.
 *  6. Soft-deletion & referential dependency checks (active course blocks department deactivation).
 *  7. Atomic admissions application tracking number generation & concurrency safety (BAC-ADM-YYYY-XXXX).
 *  8. Admissions application review & applicant identity protection against modification.
 *  9. Contact enquiry administration & public privacy guard.
 *  10. Strict Zod schema validation & unexpected field rejection.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import {
  SiteContent,
  AboutPage,
  Department,
  Course,
  Event,
  GuestSpeaker,
  GalleryData,
  NewsArticle,
  IQACDossier,
  Facility,
  Placement,
  ContactInfo,
  AdmissionsApplication,
  ContactEnquiry,
  AppCounter,
  getNextApplicationNumber,
  User,
} from '../models';

const app = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

const JWT_SECRET = 'test_jwt_secret_with_more_than_32_characters_for_unit_tests';

/** Helper to generate valid mock JWT for any role and scope */
function createAuthHeader(userProps: {
  id?: string;
  role: string;
  departmentId?: string;
  clubId?: string;
  permissions?: string[];
}) {
  const payload = {
    sub: userProps.id || '507f1f77bcf86cd799439011',
    role: userProps.role,
    tokenVersion: 0,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  // Mock User.findById to return matching database record
  jest.spyOn(User, 'findById').mockReturnValue({
    select: jest.fn().mockResolvedValue({
      _id: payload.sub,
      name: `Test ${userProps.role}`,
      email: `${userProps.role}@bac.edu.in`,
      role: userProps.role,
      departmentId: userProps.departmentId,
      clubId: userProps.clubId,
      permissions: userProps.permissions || [],
      status: 'active',
      tokenVersion: 0,
    }),
  } as any);

  return `Bearer ${token}`;
}

/** Helper to mock Mongoose chained queries */
function mockMongooseQuery<T>(data: T) {
  const query: any = {
    sort: jest.fn().mockReturnThis(),
    populate: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    lean: jest.fn().mockResolvedValue(data),
    exec: jest.fn().mockResolvedValue(data),
    then: (resolve: (val: T) => void) => Promise.resolve(data).then(resolve),
  };
  return query;
}

describe('Sub-Phase 3D — Protected Administrative CRUD Controllers & RBAC Guards', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ── 1. Authentication & Role Boundary Enforcements ─────────────────────────
  describe('1. Global Authentication & Default-Deny Boundaries', () => {
    it('unauthenticated mutations return 401 Unauthorized', async () => {
      const res = await request(app)
        .put('/api/content')
        .send({ hero: { title: 'New Hero' } });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('UNAUTHORIZED');
    });

    it('authenticated staff role (no permissions) receives 403 Forbidden on mutations', async () => {
      const authHeader = createAuthHeader({ role: 'staff', permissions: [] });

      const res = await request(app)
        .put('/api/content')
        .set('Authorization', authHeader)
        .send({ hero: { title: 'Hacked Title' } });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('master_admin bypasses permission restrictions and updates content', async () => {
      const authHeader = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      const updatedMock = { hero: { title: 'Master Admin Updated Title' } };
      jest.spyOn(SiteContent, 'findOneAndUpdate').mockReturnValue(mockMongooseQuery(updatedMock) as any);

      const res = await request(app)
        .put('/api/content')
        .set('Authorization', authHeader)
        .send({ hero: { title: 'Master Admin Updated Title' } });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.hero.title).toBe('Master Admin Updated Title');
    });

    it('sub_admin with content:update updates content', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['content:update'] });
      const updatedMock = { hero: { title: 'Sub Admin Title' } };
      jest.spyOn(SiteContent, 'findOneAndUpdate').mockReturnValue(mockMongooseQuery(updatedMock) as any);

      const res = await request(app)
        .put('/api/content')
        .set('Authorization', authHeader)
        .send({ hero: { title: 'Sub Admin Title' } });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── 2. Department CRUD & HOD Scoping ───────────────────────────────────────
  describe('2. Department Management & HOD Ownership Scoping', () => {
    it('departments:create allows sub_admin to create new academic department', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['departments:create'] });
      jest.spyOn(Department, 'findOne').mockResolvedValue(null);
      jest.spyOn(Department, 'create').mockResolvedValue({
        slug: 'biotechnology',
        code: 'BT',
        name: 'Department of Biotechnology',
        shortName: 'Biotech',
        category: 'Science',
        description: 'Advanced biotechnology education.',
        isActive: true,
      } as any);

      const res = await request(app)
        .post('/api/departments')
        .set('Authorization', authHeader)
        .send({
          slug: 'biotechnology',
          code: 'BT',
          name: 'Department of Biotechnology',
          shortName: 'Biotech',
          category: 'Science',
          description: 'Advanced biotechnology education.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('biotechnology');
    });

    it('HOD can update their own assigned department', async () => {
      const authHeader = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['departments:update'],
      });

      jest.spyOn(Department, 'findOne').mockResolvedValue({
        slug: 'computer-science',
        name: 'Computer Science',
      } as any);
      jest.spyOn(Department, 'findOneAndUpdate').mockReturnValue(
        mockMongooseQuery({ slug: 'computer-science', name: 'Computer Science & AI' }) as any
      );

      const res = await request(app)
        .put('/api/departments/computer-science')
        .set('Authorization', authHeader)
        .send({ name: 'Computer Science & AI' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('HOD is rejected with 403 when attempting to update another department', async () => {
      const authHeader = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['departments:update'],
      });

      const res = await request(app)
        .put('/api/departments/commerce')
        .set('Authorization', authHeader)
        .send({ name: 'Hacked Commerce Dept' });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('HOD without an assigned departmentId is unconditionally blocked (fail closed)', async () => {
      const authHeader = createAuthHeader({
        role: 'hod',
        departmentId: undefined, // Unassigned scope!
        permissions: ['departments:update'],
      });

      const res = await request(app)
        .put('/api/departments/computer-science')
        .set('Authorization', authHeader)
        .send({ name: 'Updated Dept' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('UNASSIGNED_SCOPE');
    });

    it('deleting department with active published courses is rejected with 409 Conflict', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['departments:delete'] });

      jest.spyOn(Department, 'findOne').mockResolvedValue({
        slug: 'computer-science',
        isActive: true,
        save: jest.fn(),
      } as any);
      // Simulate 3 active courses in this department
      jest.spyOn(Course, 'countDocuments').mockResolvedValue(3);

      const res = await request(app)
        .delete('/api/departments/computer-science')
        .set('Authorization', authHeader);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain('Cannot deactivate department with active degree programmes');
    });

    it('deleting department with 0 active courses performs soft deactivation', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['departments:delete'] });
      const mockDept = {
        slug: 'history',
        isActive: true,
        deletedAt: null as Date | null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Department, 'findOne').mockResolvedValue(mockDept as any);
      jest.spyOn(Course, 'countDocuments').mockResolvedValue(0);

      const res = await request(app)
        .delete('/api/departments/history')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockDept.isActive).toBe(false);
      expect(mockDept.deletedAt).not.toBeNull();
      expect(mockDept.save).toHaveBeenCalledTimes(1);
    });
  });

  // ── 3. Course CRUD & Department Scoping ────────────────────────────────────
  describe('3. Course Management & Referential Integrity', () => {
    it('HOD can create a course under their assigned department', async () => {
      const authHeader = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['courses:create'],
      });

      jest.spyOn(Department, 'findOne').mockResolvedValue({ slug: 'computer-science', isActive: true } as any);
      jest.spyOn(Course, 'findOne').mockResolvedValue(null);
      jest.spyOn(Course, 'create').mockResolvedValue({
        slug: 'msc-cyber-security',
        name: 'M.Sc Cyber Security',
        level: 'PG',
        department: 'Computer Science',
        departmentSlug: 'computer-science',
        duration: '2 Years',
        eligibility: 'B.Sc CS / BCA',
        description: 'Advanced postgraduate cyber defense programme.',
      } as any);

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', authHeader)
        .send({
          name: 'M.Sc Cyber Security',
          level: 'PG',
          department: 'Computer Science',
          departmentSlug: 'computer-science',
          duration: '2 Years',
          eligibility: 'B.Sc CS / BCA',
          description: 'Advanced postgraduate cyber defense programme.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('HOD is rejected with 403 when creating a course for a different department', async () => {
      const authHeader = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['courses:create'],
      });

      const res = await request(app)
        .post('/api/courses')
        .set('Authorization', authHeader)
        .send({
          name: 'B.Com Banking',
          level: 'UG',
          department: 'Commerce',
          departmentSlug: 'commerce', // Attempting to create course in Commerce!
          duration: '3 Years',
          eligibility: '10+2 with Commerce',
          description: 'Commerce degree',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('course deletion preserves record and soft unpublishes when referenced by applications', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['courses:delete'] });
      const mockCourse = {
        slug: 'bsc-cs',
        departmentSlug: 'computer-science',
        published: true,
        isActive: true,
        deletedAt: null as Date | null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Course, 'findOne').mockResolvedValue(mockCourse as any);
      // Simulate 12 student applications referencing this course
      jest.spyOn(AdmissionsApplication, 'countDocuments').mockResolvedValue(12);

      const res = await request(app)
        .delete('/api/courses/bsc-cs')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockCourse.published).toBe(false);
      expect(mockCourse.isActive).toBe(false);
      expect(mockCourse.deletedAt).not.toBeNull();
      expect(mockCourse.save).toHaveBeenCalledTimes(1);
    });
  });

  // ── 4. Polymorphic Events (/api/events) ────────────────────────────────────
  describe('4. Polymorphic Events Multiplexing & Role Isolation', () => {
    it('missing or invalid entity type returns 400 Bad Request', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['events:create'] });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', authHeader)
        .send({ type: 'invalid_type', data: { title: 'Test' } });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('INVALID_ENTITY_TYPE');
    });

    it('club_head can create campus event for their assigned club', async () => {
      const authHeader = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['events:create'],
      });

      jest.spyOn(Event, 'create').mockResolvedValue({
        title: 'Blood Donation Camp',
        slug: 'blood-donation-camp-2026',
        category: 'community',
        clubId: 'rotaract-club',
        startDate: new Date('2026-05-10'),
        venue: 'Auditorium',
        description: 'Annual blood donation drive.',
      } as any);

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', authHeader)
        .send({
          type: 'event',
          data: {
            title: 'Blood Donation Camp',
            category: 'community',
            clubId: 'rotaract-club',
            startDate: '2026-05-10T09:00:00.000Z',
            venue: 'Auditorium',
            description: 'Annual blood donation drive.',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('club_head is rejected with 403 when creating event for another club', async () => {
      const authHeader = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['events:create'],
      });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', authHeader)
        .send({
          type: 'event',
          data: {
            title: 'Cultural Night',
            category: 'arts',
            clubId: 'fine-arts-club', // Another club!
            startDate: '2026-06-15T18:00:00.000Z',
            venue: 'Open Air Theatre',
            description: 'Music & dance festival',
          },
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('club_head event deletion soft-archives event for assigned club', async () => {
      const authHeader = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['events:delete'],
      });
      const mockEvent = {
        slug: 'blood-donation-camp',
        clubId: 'rotaract-club',
        isActive: true,
        isArchived: false,
        deletedAt: null as Date | null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Event, 'findOne').mockResolvedValue(mockEvent as any);

      const res = await request(app)
        .delete('/api/events?type=event&id=blood-donation-camp')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(mockEvent.isActive).toBe(false);
      expect(mockEvent.isArchived).toBe(true);
      expect(mockEvent.save).toHaveBeenCalledTimes(1);
    });

    it('club_head is rejected with 403 when attempting to delete another clubs event', async () => {
      const authHeader = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['events:delete'],
      });
      const mockEvent = {
        slug: 'fine-arts-show',
        clubId: 'fine-arts-club', // Belongs to different club!
      };

      jest.spyOn(Event, 'findOne').mockResolvedValue(mockEvent as any);

      const res = await request(app)
        .delete('/api/events?type=event&id=fine-arts-show')
        .set('Authorization', authHeader);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('club_head is strictly prohibited from managing global guest speakers', async () => {
      const authHeader = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['events:create'],
      });

      const res = await request(app)
        .post('/api/events')
        .set('Authorization', authHeader)
        .send({
          type: 'speaker',
          data: { name: 'Nobel Laureate Guest', designation: 'Scientist' },
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_ROLE');
    });

    it('updating gallery via /api/events requires gallery:update (events permissions do NOT grant gallery)', async () => {
      // User with events:update but lacking gallery:update
      const authHeader = createAuthHeader({
        role: 'sub_admin',
        permissions: ['events:update'], // Lacks gallery:update!
      });

      const res = await request(app)
        .put('/api/events')
        .set('Authorization', authHeader)
        .send({
          type: 'gallery',
          data: { title: 'Sports Album', photos: [] },
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
      expect(res.body.error).toContain('gallery:update');
    });

    it('user with gallery:update successfully updates gallery via /api/events', async () => {
      const authHeader = createAuthHeader({
        role: 'content_editor',
        permissions: ['gallery:update'],
      });
      jest.spyOn(GalleryData, 'findOneAndUpdate').mockReturnValue(
        mockMongooseQuery({ albums: [{ title: 'Graduation Day' }] }) as any
      );

      const res = await request(app)
        .put('/api/events')
        .set('Authorization', authHeader)
        .send({
          type: 'gallery',
          data: { title: 'Graduation Day', photos: [] },
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── 5. Admissions Application Administration & Atomic Sequences ───────────
  describe('5. Admissions Applications & Atomic Sequence Concurrency', () => {
    it('public POST /api/admissions generates tracking number and submits application', async () => {
      // Mock atomic counter sequence increment
      jest.spyOn(AppCounter, 'findByIdAndUpdate').mockResolvedValue({
        _id: 'admissions_2026',
        seq: 42,
      } as any);

      jest.spyOn(AdmissionsApplication, 'create').mockResolvedValue({
        appNumber: 'BAC-ADM-2026-0042',
        candidateName: 'R. Sneha',
        program: 'B.Sc Computer Science',
        status: 'submitted',
        submittedAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/admissions')
        .send({
          name: 'R. Sneha',
          email: 'sneha@example.com',
          phone: '+91 9876543210',
          program: 'B.Sc Computer Science',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.appNumber).toBe('BAC-ADM-2026-0042');
    });

    it('concurrent calls to getNextApplicationNumber produce strictly unique consecutive sequences', async () => {
      let currentSeq = 100;
      jest.spyOn(AppCounter, 'findByIdAndUpdate').mockImplementation((() => {
        currentSeq++;
        return mockMongooseQuery({ _id: 'admissions_2026', seq: currentSeq });
      }) as any);

      // Fire 20 parallel number requests
      const promises = Array.from({ length: 20 }).map(() => getNextApplicationNumber(2026));
      const results = await Promise.all(promises);

      // Verify all 20 tracking numbers are unique
      const uniqueSet = new Set(results);
      expect(uniqueSet.size).toBe(20);
      results.forEach((num) => {
        expect(num).toMatch(/^BAC-ADM-2026-\d{4}$/);
      });
    });

    it('public GET /api/admissions is strictly rejected with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admissions');
      expect(res.status).toBe(401);
    });

    it('admissions:read allows authorized administrator to list submitted applications', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['admissions:read'] });

      const mockApplications = [
        { appNumber: 'BAC-ADM-2026-0001', candidateName: 'Candidate A', status: 'submitted' },
        { appNumber: 'BAC-ADM-2026-0002', candidateName: 'Candidate B', status: 'under_review' },
      ];
      jest.spyOn(AdmissionsApplication, 'find').mockReturnValue(mockMongooseQuery(mockApplications) as any);
      jest.spyOn(AdmissionsApplication, 'countDocuments').mockResolvedValue(2);

      const res = await request(app)
        .get('/api/admissions?page=1&limit=20&status=submitted')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });

    it('admissions:update updates review status and preserves candidate identity fields', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['admissions:update'] });
      const mockApp = {
        appNumber: 'BAC-ADM-2026-0001',
        candidateName: 'Original Candidate Name',
        email: 'original@test.com',
        phone: '9876543210',
        status: 'submitted',
        notes: '',
        remarks: [] as any[],
        reviewedBy: null,
        reviewedAt: null,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(AdmissionsApplication, 'findOne').mockResolvedValue(mockApp as any);

      // Attempting to send identity tampering fields is rejected by validation schema
      const tamperingRes = await request(app)
        .put('/api/admissions')
        .set('Authorization', authHeader)
        .send({
          id: 'BAC-ADM-2026-0001',
          status: 'shortlisted',
          notes: 'Candidate verified for sports quota.',
          candidateName: 'Changed Name',
          email: 'tampered@email.com',
        });
      expect(tamperingRes.status).toBe(400);

      const res = await request(app)
        .put('/api/admissions')
        .set('Authorization', authHeader)
        .send({
          id: 'BAC-ADM-2026-0001',
          status: 'shortlisted',
          notes: 'Candidate verified for sports quota.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockApp.status).toBe('shortlisted');
      expect(mockApp.notes).toBe('Candidate verified for sports quota.');
      expect(mockApp.remarks).toHaveLength(1);
      // Verify identity fields remained unchanged!
      expect(mockApp.candidateName).toBe('Original Candidate Name');
      expect(mockApp.email).toBe('original@test.com');
      expect(mockApp.save).toHaveBeenCalledTimes(1);
    });
  });

  // ── 6. Contact Enquiries Administration ────────────────────────────────────
  describe('6. Contact Enquiries Administration & Privacy Guard', () => {
    it('public POST /api/contact/enquiries submits enquiry with status new', async () => {
      jest.spyOn(ContactEnquiry, 'create').mockResolvedValue({
        _id: '672000000000000000000055',
        name: 'Prospective Parent',
        email: 'parent@gmail.com',
        subject: 'Hostel Fees Enquiry',
        status: 'new',
      } as any);

      const res = await request(app)
        .post('/api/contact/enquiries')
        .send({
          name: 'Prospective Parent',
          email: 'parent@gmail.com',
          subject: 'Hostel Fees Enquiry',
          message: 'Kindly provide the annual hostel accommodation charges.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Enquiry submitted successfully');
    });

    it('public GET /api/contact/enquiries is strictly rejected with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/contact/enquiries');
      expect(res.status).toBe(401);
    });

    it('enquiries:read lists submitted enquiries with pagination', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['enquiries:read'] });

      const mockEnquiries = [
        { _id: '672000000000000000000055', name: 'Parent', subject: 'Hostel Fees', status: 'new' },
      ];
      jest.spyOn(ContactEnquiry, 'find').mockReturnValue(mockMongooseQuery(mockEnquiries) as any);
      jest.spyOn(ContactEnquiry, 'countDocuments').mockResolvedValue(1);

      const res = await request(app)
        .get('/api/contact/enquiries?page=1&limit=10')
        .set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.headers['cache-control']).toBe('no-store, no-cache, must-revalidate, private');
    });

    it('enquiries:read updates enquiry status and response notes', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['enquiries:read'] });

      jest.spyOn(ContactEnquiry, 'findByIdAndUpdate').mockReturnValue(
        mockMongooseQuery({
          _id: '672000000000000000000055',
          status: 'resolved',
          responseNotes: 'Hostel fee structure sent via email.',
        }) as any
      );

      const res = await request(app)
        .patch('/api/contact/enquiries/672000000000000000000055/status')
        .set('Authorization', authHeader)
        .send({
          status: 'resolved',
          responseNotes: 'Hostel fee structure sent via email.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ── 7. Placements & Privacy Sanitization on Admin Mutation ─────────────────
  describe('7. Placements Mutation & PII Sanitization', () => {
    it('updatePlacements strips unauthorized student applicant lists and internal notes', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['placements:update'] });

      // Unauthorized fields are rejected by strict Zod validation schema
      const tamperingRes = await request(app)
        .put('/api/placements')
        .set('Authorization', authHeader)
        .send({
          overview: 'Over 90% campus recruitment.',
          internalNotes: 'Top secret candidate ratings',
          studentApplicants: [{ name: 'Aarav', aadhar: '1234-5678-9012' }],
        });
      expect(tamperingRes.status).toBe(400);

      let capturedUpdate: any = null;
      jest.spyOn(Placement, 'findOneAndUpdate').mockImplementation((_query, update) => {
        capturedUpdate = update;
        return mockMongooseQuery({ overview: 'Placements updated' }) as any;
      });

      const res = await request(app)
        .put('/api/placements')
        .set('Authorization', authHeader)
        .send({
          overview: 'Over 90% campus recruitment.',
          trainingPrograms: ['Aptitude Training', 'Soft Skills'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      // Verify Mongoose update contains permitted fields only
      expect(capturedUpdate.$set.overview).toBe('Over 90% campus recruitment.');
      expect(capturedUpdate.$set.internalNotes).toBeUndefined();
      expect(capturedUpdate.$set.studentApplicants).toBeUndefined();
    });
  });

  // ── 8. Migration / Seeding HTTP Route Isolation ───────────────────────────
  describe('8. Migration / Seeding HTTP Route Isolation', () => {
    it('POST /api/seed is strictly not exposed over HTTP (returns 404 even for master_admin)', async () => {
      const authHeader = createAuthHeader({
        role: 'master_admin',
        permissions: ['*'],
      });

      const res = await request(app)
        .post('/api/seed')
        .set('Authorization', authHeader);

      expect(res.status).toBe(404);
    });

    it('POST /api/v1/seed is also strictly not exposed over HTTP (returns 404)', async () => {
      const authHeader = createAuthHeader({
        role: 'master_admin',
        permissions: ['*'],
      });

      const res = await request(app)
        .post('/api/v1/seed')
        .set('Authorization', authHeader);

      expect(res.status).toBe(404);
    });
  });

  // ── 9. Domain Administrative Mutations Coverage ────────────────────────────
  describe('9. Complete Domain Administrative Mutations Coverage', () => {
    it('about:update allows sub_admin to update about page', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['about:update'] });
      jest.spyOn(AboutPage, 'findOneAndUpdate').mockReturnValue(
        mockMongooseQuery({ history: 'Updated History 2026' }) as any
      );

      const res = await request(app)
        .put('/api/about')
        .set('Authorization', authHeader)
        .send({ history: 'Updated History 2026' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('news:create allows content_editor to publish news article', async () => {
      const authHeader = createAuthHeader({ role: 'content_editor', permissions: ['news:create'] });
      jest.spyOn(NewsArticle, 'findOne').mockResolvedValue(null);
      jest.spyOn(NewsArticle, 'create').mockResolvedValue({
        slug: 'annual-day-2026',
        title: 'Annual Day 2026',
        excerpt: 'Annual day celebrations at campus.',
        category: 'Campus Life',
        content: 'Celebrations at main auditorium.',
      } as any);

      const res = await request(app)
        .post('/api/news')
        .set('Authorization', authHeader)
        .send({
          title: 'Annual Day 2026',
          excerpt: 'Annual day celebrations at campus.',
          category: 'Campus Life',
          content: 'Celebrations at main auditorium.',
          author: { name: 'Editorial Board' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('iqac:update allows sub_admin to update accreditation dossier', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['iqac:update'] });
      jest.spyOn(IQACDossier, 'findOneAndUpdate').mockReturnValue(
        mockMongooseQuery({ stats: { naacGrade: 'A+' } }) as any
      );

      const res = await request(app)
        .put('/api/iqac')
        .set('Authorization', authHeader)
        .send({ stats: { naacGrade: 'A+', cycle: 'Cycle 2' } });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('facilities:create allows sub_admin to create campus facility', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['facilities:create'] });
      jest.spyOn(Facility, 'create').mockResolvedValue({
        name: 'Smart Seminar Hall',
        category: 'academic',
        description: 'Interactive smart seminar hall with 200 seating capacity.',
      } as any);

      const res = await request(app)
        .post('/api/facilities')
        .set('Authorization', authHeader)
        .send({
          name: 'Smart Seminar Hall',
          category: 'academic',
          description: 'Interactive smart seminar hall with 200 seating capacity.',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('contact:update allows sub_admin to update institutional contact info', async () => {
      const authHeader = createAuthHeader({ role: 'sub_admin', permissions: ['contact:update'] });
      jest.spyOn(ContactInfo, 'findOneAndUpdate').mockReturnValue(
        mockMongooseQuery({ email: 'contact@bac.edu.in' }) as any
      );

      const res = await request(app)
        .put('/api/contact')
        .set('Authorization', authHeader)
        .send({ emails: [{ label: 'General Desk', address: 'contact@bac.edu.in' }] });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('events:update allows content_editor to update guest speaker via dedicated endpoint', async () => {
      const authHeader = createAuthHeader({ role: 'content_editor', permissions: ['events:update'] });
      jest.spyOn(GuestSpeaker, 'findOneAndUpdate').mockReturnValue(
        mockMongooseQuery({ name: 'Dr. Abdul Kalam', designation: 'Scientist' }) as any
      );

      const res = await request(app)
        .put('/api/guest-speakers/672000000000000000000099')
        .set('Authorization', authHeader)
        .send({ designation: 'Scientist' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
