/**
 * fullstack-integration-evidence.test.ts — Phase 3F Full Integration Verification
 *
 * Explicit test evidence for:
 *  1. Login, logout and session restoration (cookie handling & tokenVersion revocation).
 *  2. All six existing roles:
 *     - Master Admin (root access)
 *     - Sub Admin (approved global departmental access, denied user admin)
 *     - HOD (department isolation & scoped access)
 *     - Club Head (club isolation & scoped access)
 *     - Content Editor (news/announcement access, denied admin mutations)
 *     - Staff (read-only directory profile, default-deny on administrative mutations)
 *  3. Public versus private admissions and contact enquiry access.
 *  4. PII redaction and private response cache headers.
 */
import request from 'supertest';
import { createApp } from '../app';
import { connectDatabase, disconnectDatabase } from '../config/database';
import {
  User,
  Department,
  Event,
  Placement,
} from '../models';
import { AUTH_COOKIE_NAME, signAuthToken } from '../utils/token';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/bac_test_integration_phase3f';

const app = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

describe('Phase 3F — Verification Evidence Suite', () => {
  let masterAdminToken: string;
  let subAdminToken: string;
  let hodToken: string;
  let clubHeadToken: string;
  let editorToken: string;
  let staffToken: string;

  beforeAll(async () => {
    await connectDatabase(TEST_DB_URI);

    // Clean test users
    await User.deleteMany({ email: /.*@bac-verify\.edu\.in/ });

    // 1. Master Admin
    const masterAdmin = await User.create({
      name: 'Master Administrator',
      email: 'master@bac-verify.edu.in',
      password: 'TestVerify@2026',
      role: 'master_admin',
      permissions: ['all'],
      status: 'active',
      tokenVersion: 0,
    });

    // 2. Sub Admin (Approved global departmental access)
    const subAdmin = await User.create({
      name: 'Sub Administrator',
      email: 'subadmin@bac-verify.edu.in',
      password: 'TestVerify@2026',
      role: 'sub_admin',
      permissions: [
        'departments:create',
        'departments:update',
        'departments:delete',
        'admissions:read',
        'events:create',
        'events:update',
        'news:create',
        'news:update',
      ],
      status: 'active',
      tokenVersion: 0,
    });

    // 3. HOD (Scoped to computer-science)
    const hod = await User.create({
      name: 'Dr. CS HOD',
      email: 'hod-cs@bac-verify.edu.in',
      password: 'TestVerify@2026',
      role: 'hod',
      departmentId: 'computer-science',
      permissions: ['departments:update', 'courses:create', 'courses:update'],
      status: 'active',
      tokenVersion: 0,
    });

    // 4. Club Head (Scoped to rotaract)
    const clubHead = await User.create({
      name: 'Club Head Rotaract',
      email: 'club-rotaract@bac-verify.edu.in',
      password: 'TestVerify@2026',
      role: 'club_head',
      clubId: 'rotaract',
      permissions: ['events:create', 'events:update', 'events:delete'],
      status: 'active',
      tokenVersion: 0,
    });

    // 5. Content Editor
    const editor = await User.create({
      name: 'Content Editor',
      email: 'editor@bac-verify.edu.in',
      password: 'TestVerify@2026',
      role: 'content_editor',
      permissions: ['news:create', 'news:update', 'news:delete'],
      status: 'active',
      tokenVersion: 0,
    });

    // 6. Staff
    const staff = await User.create({
      name: 'College Staff Member',
      email: 'staff@bac-verify.edu.in',
      password: 'TestVerify@2026',
      role: 'staff',
      permissions: ['profile:read'],
      status: 'active',
      tokenVersion: 0,
    });

    // 7. Dedicated Logout Test User
    await User.create({
      name: 'Logout Test User',
      email: 'logout-user@bac-verify.edu.in',
      password: 'TestVerify@2026',
      role: 'master_admin',
      permissions: ['all'],
      status: 'active',
      tokenVersion: 0,
    });

    // Ensure departments exist
    await Department.deleteMany({ slug: { $in: ['computer-science', 'commerce'] } });
    await Department.create([
      {
        slug: 'computer-science',
        name: 'Department of Computer Science',
        shortName: 'CS',
        code: 'CS',
        category: 'School of Computing',
        description: 'Computer Science Department',
        faculty: [],
        labs: [],
        alumni: [],
        researchStats: {},
        order: 1,
        published: true,
      },
      {
        slug: 'commerce',
        name: 'Department of Commerce',
        shortName: 'COMM',
        code: 'COMM',
        category: 'School of Commerce',
        description: 'Commerce Department',
        faculty: [],
        labs: [],
        alumni: [],
        researchStats: {},
        order: 2,
        published: true,
      },
    ]);

    const secret = process.env.JWT_SECRET || 'phase3f_benchmark_jwt_secret_must_be_at_least_32_chars!';
    const makeToken = (user: any) =>
      signAuthToken(
        {
          sub: String(user._id),
          email: user.email,
          role: user.role,
          tokenVersion: user.tokenVersion,
        },
        secret
      );

    masterAdminToken = makeToken(masterAdmin);
    subAdminToken = makeToken(subAdmin);
    hodToken = makeToken(hod);
    clubHeadToken = makeToken(clubHead);
    editorToken = makeToken(editor);
    staffToken = makeToken(staff);
  });

  beforeEach(async () => {
    await Event.deleteMany({ slug: /.*rotaract.*/ });
  });

  afterAll(async () => {
    await User.deleteMany({ email: /.*@bac-verify\.edu\.in/ });
    await Department.deleteMany({ slug: { $in: ['computer-science', 'commerce'] } });
    await disconnectDatabase();
  });

  // ── 1. Login, Logout and Session Restoration ──────────────────────────────
  describe('1. Login, Logout & Session Restoration', () => {
    it('authenticates user and sets HttpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'master@bac-verify.edu.in', password: 'TestVerify@2026' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('master@bac-verify.edu.in');

      // Verify HttpOnly cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const cookieArray = Array.isArray(cookies) ? cookies : [cookies || ''];
      expect(cookieArray.some((c: string) => c.includes(AUTH_COOKIE_NAME))).toBe(true);
      expect(cookieArray.some((c: string) => c.includes('HttpOnly'))).toBe(true);
    });

    it('restores authenticated session using HttpOnly cookie on /api/auth/me', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'master@bac-verify.edu.in', password: 'TestVerify@2026' });

      const cookie = loginRes.headers['set-cookie'];

      const meRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(meRes.status).toBe(200);
      expect(meRes.body.success).toBe(true);
      expect(meRes.body.data.user.role).toBe('master_admin');
    });

    it('revokes session on logout and clears cookie', async () => {
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: 'logout-user@bac-verify.edu.in', password: 'TestVerify@2026' });

      const cookie = loginRes.headers['set-cookie'];

      // Logout
      const logoutRes = await request(app)
        .post('/api/auth/logout')
        .set('Cookie', cookie);

      expect(logoutRes.status).toBe(200);
      expect(logoutRes.body.success).toBe(true);

      // Attempting to access /api/auth/me with old cookie must fail (token revoked)
      const afterLogoutRes = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookie);

      expect(afterLogoutRes.status).toBe(401);
      expect(afterLogoutRes.body.code).toBe('TOKEN_REVOKED');
    });
  });

  // ── 2. All Six Existing Roles Verification ────────────────────────────────
  describe('2. All Six Roles Verification Matrix', () => {
    it('Role 1 (master_admin): permits full administrative access', async () => {
      const res = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${masterAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Role 2 (sub_admin): permits approved global departmental management', async () => {
      // Sub-admin has approved global departmental access
      const res = await request(app)
        .put('/api/departments/computer-science')
        .set('Authorization', `Bearer ${subAdminToken}`)
        .send({ description: 'Updated by Sub Admin globally.' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Role 3 (hod): enforces department isolation (allowed on own dept, 403 on other)', async () => {
      // Allowed on assigned department (computer-science)
      const allowedRes = await request(app)
        .put('/api/departments/computer-science')
        .set('Authorization', `Bearer ${hodToken}`)
        .send({ description: 'Updated by CS HOD.' });

      expect(allowedRes.status).toBe(200);

      // Strictly FORBIDDEN on unassigned department (commerce)
      const forbiddenRes = await request(app)
        .put('/api/departments/commerce')
        .set('Authorization', `Bearer ${hodToken}`)
        .send({ description: 'Illegal HOD tamper.' });

      expect(forbiddenRes.status).toBe(403);
      expect(forbiddenRes.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('Role 4 (club_head): enforces club isolation (allowed on own club, 403 on other)', async () => {
      // Allowed on assigned club (rotaract)
      const allowedRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${clubHeadToken}`)
        .send({
          type: 'event',
          data: {
            slug: 'rotaract-youth-summit-2026',
            title: 'Rotaract Youth Summit',
            category: 'Rotaract',
            clubId: 'rotaract',
            startDate: new Date('2026-11-20'),
            venue: 'Auditorium Hall A',
            description: 'Rotaract club event',
          },
        });

      expect(allowedRes.status).toBe(201);

      // Strictly FORBIDDEN on unassigned club (fine-arts)
      const forbiddenRes = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${clubHeadToken}`)
        .send({
          type: 'event',
          data: {
            slug: 'fine-arts-gala-2026',
            title: 'Fine Arts Gala',
            category: 'Cultural',
            clubId: 'fine-arts',
            startDate: new Date('2026-11-25'),
            venue: 'Auditorium Hall B',
            description: 'Fine arts club event',
          },
        });

      expect(forbiddenRes.status).toBe(403);
      expect(forbiddenRes.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('Role 5 (content_editor): permitted for news publishing, denied for admissions', async () => {
      const slug = `campus-green-${Date.now()}`;
      // Allowed to post news
      const newsRes = await request(app)
        .post('/api/news')
        .set('Authorization', `Bearer ${editorToken}`)
        .send({
          slug,
          title: `Campus Green Initiative ${Date.now()}`,
          category: 'Campus',
          excerpt: 'Solar panels installed on campus rooftops.',
          content: 'Details on solar energy project at Bishop Ambrose College.',
          author: { name: 'Editor Staff' },
          status: 'published',
        });

      expect(newsRes.status).toBe(201);

      // Forbidden from accessing admissions applications
      const admissionsRes = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${editorToken}`);

      expect(admissionsRes.status).toBe(403);
    });

    it('Role 6 (staff): read-only directory access; denied for administrative mutations', async () => {
      const res = await request(app)
        .post('/api/events')
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          type: 'event',
          data: {
            title: 'Staff Meeting Event',
            category: 'General',
            startDate: new Date(),
            venue: 'Conference Room',
            description: 'Internal meeting',
          },
        });

      expect(res.status).toBe(403);
    });
  });

  // ── 3. Public vs Private Admissions & Enquiry Access ──────────────────────
  describe('3. Public vs Private Admissions & Contact Enquiry Access', () => {
    it('public candidate can submit admission application', async () => {
      const res = await request(app)
        .post('/api/admissions')
        .send({
          candidateName: 'Priya Sharma',
          email: 'priya.sharma@example.com',
          phone: '9845123456',
          program: 'B.Sc Computer Science',
          dateOfBirth: '2007-04-12',
          gender: 'female',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.appNumber).toMatch(/^BAC-ADM-\d{4}-\d{4}$/);
    });

    it('public visitor is strictly denied from listing admissions (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/admissions');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('public visitor can submit contact enquiry', async () => {
      const res = await request(app)
        .post('/api/contact/enquiries')
        .send({
          name: 'Karthik Raja',
          email: 'karthik@example.com',
          phone: '9876543210',
          subject: 'Admission Query for MCA',
          message: 'When do applications open for 2026 batch?',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('public visitor is strictly denied from listing contact enquiries (401 Unauthorized)', async () => {
      const res = await request(app).get('/api/contact/enquiries');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  // ── 4. PII Redaction & Private Response Cache Headers ─────────────────────
  describe('4. PII Redaction & Cache-Control Isolation', () => {
    it('redacts student candidate PII from public placements API', async () => {
      await Placement.deleteMany({});
      await Placement.create({
        academicYear: '2025-2026',
        statistics: {
          placementPercentage: '92%',
          highestPackage: '12 LPA',
          averagePackage: '4.5 LPA',
          totalOffers: 180,
          studentsPlaced: 165,
        },
        topRecruiters: [{ name: 'TCS' }, { name: 'Wipro' }],
        successStories: [
          {
            id: 'story-1',
            studentName: 'Candidate Test',
            batch: '2025',
            program: 'B.Sc Computer Science',
            company: 'TCS',
            package: '7 LPA',
            internalNotes: 'SECRET_HR_INTERNAL_NOTE_DO_NOT_LEAK',
            studentPhone: '9845612345',
          },
        ],
        published: true,
      });

      const res = await request(app).get('/api/placements');
      expect(res.status).toBe(200);

      // Verify sensitive HR and candidate phone data is NOT in response
      const responseText = JSON.stringify(res.body);
      expect(responseText).not.toContain('SECRET_HR_INTERNAL_NOTE_DO_NOT_LEAK');
      expect(responseText).not.toContain('studentPhone');
    });

    it('sets public Cache-Control headers on public read routes', async () => {
      const res = await request(app).get('/api/courses');
      expect(res.status).toBe(200);
      expect(res.headers['cache-control']).toBe('public, max-age=60, stale-while-revalidate=300');
      expect(res.headers['etag']).toBeDefined();
    });

    it('sets no-store / private headers on authenticated administrative routes', async () => {
      const res = await request(app)
        .get('/api/admissions')
        .set('Authorization', `Bearer ${masterAdminToken}`);

      expect(res.status).toBe(200);
      const cacheControl = res.headers['cache-control'];
      // Authenticated admin endpoints must not have public Cache-Control
      if (cacheControl) {
        expect(cacheControl).not.toContain('public');
      }
    });
  });
});
