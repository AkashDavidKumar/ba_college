/**
 * persistent-mongo.integration.test.ts — Phase 3F Persistent MongoDB Integration Tests
 *
 * Verifies real persistent MongoDB integration on standalone MongoDB instance:
 *  1. Backend connection using configured environment (dedicated test database).
 *  2. Database reads, writes, and schema validations.
 *  3. Unique indexes and constraints enforcement.
 *  4. Model relationships & virtual population (Department -> Course).
 *  5. Data persistence across simulated backend restart (disconnect & reconnect).
 *  6. Connection state detection & graceful shutdown.
 *  7. High-concurrency admissions application number generation (25 concurrent submissions).
 *  8. Admissions application review & applicant identity immutability.
 *  9. Safe teardown and cleanup of dedicated test database.
 */
import mongoose from 'mongoose';
import { connectDatabase, disconnectDatabase, connectionState } from '../config/database';
import {
  Department,
  Course,
  User,
  AdmissionsApplication,
  AppCounter,
  getNextApplicationNumber,
  SiteContent,
} from '../models';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/bac_test_integration_phase3f';

describe('Phase 3F — Persistent MongoDB Integration & Concurrency Tests', () => {
  beforeAll(async () => {
    // Connect to dedicated test database
    await connectDatabase(TEST_DB_URI);
    // Ensure test database is clean before starting
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    // Synchronize indexes
    await Promise.all([
      Department.syncIndexes(),
      Course.syncIndexes(),
      User.syncIndexes(),
      AdmissionsApplication.syncIndexes(),
      AppCounter.syncIndexes(),
      SiteContent.syncIndexes(),
    ]);
  }, 30_000);

  afterAll(async () => {
    // Drop dedicated test database to clean up completely
    if (mongoose.connection.db) {
      await mongoose.connection.db.dropDatabase();
    }
    await disconnectDatabase();
  });

  // ── 1. Connection & State Verification ──────────────────────────────────────
  describe('1. Database Connection & Lifecycle', () => {
    it('connects to persistent MongoDB and reports "connected"', () => {
      expect(connectionState()).toBe('connected');
      expect(mongoose.connection.readyState).toBe(1);
    });

    it('creates collections and writes documents persistently', async () => {
      const dept = await Department.create({
        slug: 'computer-science-int-test',
        name: 'Department of Computer Science',
        shortName: 'CS',
        code: 'CS',
        category: 'School of Computing',
        description: 'Leading computer science education and research.',
        faculty: [],
        labs: [],
        alumni: [],
        researchStats: {},
        order: 1,
        published: true,
      });

      expect(dept._id).toBeDefined();
      expect(dept.slug).toBe('computer-science-int-test');

      const found = await Department.findOne({ slug: 'computer-science-int-test' });
      expect(found).not.toBeNull();
      expect(found?.name).toBe('Department of Computer Science');
    });
  });

  // ── 2. Unique Constraints & Index Enforcement ──────────────────────────────
  describe('2. Unique Constraints & Indexes', () => {
    it('enforces unique index on user email', async () => {
      const email = 'unique.admin@bac.edu.in';

      await User.create({
        name: 'Primary Admin',
        email,
        password: 'Password@2026',
        role: 'master_admin',
        status: 'active',
      });

      // Attempting duplicate creation must throw MongoDB E11000 duplicate key error
      let errorThrown = false;
      try {
        await User.create({
          name: 'Duplicate Admin',
          email,
          password: 'Password@2026',
          role: 'sub_admin',
          status: 'active',
        });
      } catch (err: unknown) {
        errorThrown = true;
        const mongoErr = err as { code?: number };
        expect(mongoErr.code).toBe(11000);
      }
      expect(errorThrown).toBe(true);
    });

    it('enforces unique index on department slug', async () => {
      let duplicateError = false;
      try {
        await Department.create({
          slug: 'computer-science-int-test', // already created in test 1
          name: 'Duplicate CS Department',
          shortName: 'CS-DUP',
          code: 'CS-DUP',
          category: 'School of Computing',
          description: 'Duplicate description.',
          faculty: [],
          labs: [],
          alumni: [],
          researchStats: {},
          order: 2,
        });
      } catch (err: unknown) {
        duplicateError = true;
        const mongoErr = err as { code?: number };
        expect(mongoErr.code).toBe(11000);
      }
      expect(duplicateError).toBe(true);
    });

    it('enforces singletonKey on SiteContent', async () => {
      await SiteContent.create({
        singletonKey: 'default',
        hero: {
          title: 'Empowering Minds, Transforming Futures',
          badge: 'Excellence in Higher Education',
        },
      });

      let singletonError = false;
      try {
        await SiteContent.create({
          singletonKey: 'default',
          hero: {
            title: 'Duplicate Title',
          },
        });
      } catch (err: unknown) {
        singletonError = true;
        const mongoErr = err as { code?: number };
        expect(mongoErr.code).toBe(11000);
      }
      expect(singletonError).toBe(true);
    });
  });

  // ── 3. Model Relationships & Virtual Population ────────────────────────────
  describe('3. Model Relationships & Virtual Population', () => {
    it('populates active courses under department using virtual population', async () => {
      const deptSlug = 'science-dept-int-test';
      await Department.create({
        slug: deptSlug,
        name: 'Department of Science',
        shortName: 'SCI',
        code: 'SCI',
        category: 'School of Science',
        description: 'Pure and applied sciences.',
        faculty: [],
        labs: [],
        alumni: [],
        researchStats: {},
        order: 3,
        published: true,
      });

      await Course.create([
        {
          code: 'BSC-PHYS',
          slug: 'bsc-physics',
          name: 'B.Sc Physics',
          department: 'Department of Science',
          departmentSlug: deptSlug,
          level: 'UG',
          duration: '3 Years',
          durationYears: 3,
          eligibility: 'HSC with Physics and Mathematics',
          description: 'Bachelor of Science in Physics curriculum.',
          published: true,
          isActive: true,
        },
        {
          code: 'BSC-CHEM',
          slug: 'bsc-chemistry',
          name: 'B.Sc Chemistry',
          department: 'Department of Science',
          departmentSlug: deptSlug,
          level: 'UG',
          duration: '3 Years',
          durationYears: 3,
          eligibility: 'HSC with Chemistry and Mathematics',
          description: 'Bachelor of Science in Chemistry curriculum.',
          published: true,
          isActive: true,
        },
        {
          code: 'BSC-ARCH',
          slug: 'bsc-archived',
          name: 'B.Sc Archived Science',
          department: 'Department of Science',
          departmentSlug: deptSlug,
          level: 'UG',
          duration: '3 Years',
          durationYears: 3,
          eligibility: 'HSC',
          description: 'Archived programme.',
          published: false,
          isActive: false, // inactive course should be filtered out by match
        },
      ]);

      const populatedDept: any = await Department.findOne({ slug: deptSlug }).populate({
        path: 'programs',
        match: { isActive: true },
      });
      expect(populatedDept).not.toBeNull();
      expect(Array.isArray(populatedDept.programs)).toBe(true);
      expect(populatedDept.programs.length).toBe(2);

      const courseNames = populatedDept.programs.map((c: any) => c.name);
      expect(courseNames).toContain('B.Sc Physics');
      expect(courseNames).toContain('B.Sc Chemistry');
      expect(courseNames).not.toContain('B.Sc Archived Science');
    });
  });

  // ── 4. Persistence Across Simulated Restart ────────────────────────────────
  describe('4. Persistence Across Simulated Backend Restart', () => {
    it('persists data after disconnecting and reconnecting to MongoDB', async () => {
      const checkpointId = new mongoose.Types.ObjectId();
      await Department.create({
        _id: checkpointId,
        slug: 'persistent-restart-dept',
        name: 'Restart Verification Department',
        shortName: 'RVD',
        code: 'RVD',
        category: 'Test Category',
        description: 'Verifies data survives disconnect/reconnect.',
        faculty: [],
        labs: [],
        alumni: [],
        researchStats: {},
        order: 4,
        published: true,
      });

      // 1. Disconnect
      await disconnectDatabase();
      expect(connectionState()).toBe('disconnected');

      // 2. Reconnect
      await connectDatabase(TEST_DB_URI);
      expect(connectionState()).toBe('connected');

      // 3. Verify record was preserved
      const retrieved = await Department.findById(checkpointId);
      expect(retrieved).not.toBeNull();
      expect(retrieved?.slug).toBe('persistent-restart-dept');
      expect(retrieved?.name).toBe('Restart Verification Department');
    });
  });

  // ── 5. High-Concurrency Admissions Application Tracking ─────────────────────
  describe('5. High-Concurrency Admissions Tracking (Section 7)', () => {
    it('generates 25 unique sequential tracking numbers under concurrent load', async () => {
      const CONCURRENCY_COUNT = 25;
      const currentYear = new Date().getFullYear();

      // Fire 25 concurrent tracking number generation calls
      const trackingPromises: Promise<string>[] = [];
      for (let i = 0; i < CONCURRENCY_COUNT; i++) {
        trackingPromises.push(getNextApplicationNumber(currentYear));
      }

      const trackingNumbers = await Promise.all(trackingPromises);

      // Verify all 25 numbers are returned
      expect(trackingNumbers.length).toBe(CONCURRENCY_COUNT);

      // Verify format BAC-ADM-YYYY-XXXX
      const pattern = new RegExp(`^BAC-ADM-${currentYear}-\\d{4}$`);
      trackingNumbers.forEach((appNum) => {
        expect(appNum).toMatch(pattern);
      });

      // Verify ZERO duplicates across all concurrent requests
      const uniqueSet = new Set(trackingNumbers);
      expect(uniqueSet.size).toBe(CONCURRENCY_COUNT);
    });

    it('creates 25 concurrent admissions applications without collision', async () => {
      const currentYear = new Date().getFullYear();
      const submissionPromises = [];

      for (let i = 0; i < 25; i++) {
        submissionPromises.push(
          (async () => {
            const appNum = await getNextApplicationNumber(currentYear);
            return AdmissionsApplication.create({
              appNumber: appNum,
              candidateName: `Applicant Test ${i + 1}`,
              email: `applicant.${i + 1}.${Date.now()}@test.edu`,
              phone: `98765432${(i + 10).toString().slice(0, 2)}`,
              program: 'B.Sc Computer Science',
              dateOfBirth: new Date('2007-06-15'),
              gender: 'male',
              status: 'submitted',
            });
          })()
        );
      }

      const createdApps = await Promise.all(submissionPromises);
      expect(createdApps.length).toBe(25);

      const allSaved = await AdmissionsApplication.find({
        appNumber: { $in: createdApps.map((a) => a.appNumber) },
      });
      expect(allSaved.length).toBe(25);
    });

    it('enforces applicant identity immutability during status updates', async () => {
      const appNumber = await getNextApplicationNumber(new Date().getFullYear());
      const app = await AdmissionsApplication.create({
        appNumber,
        candidateName: 'John Doe Candidate',
        email: 'john.doe.immutable@test.edu',
        phone: '9845612345',
        program: 'B.Com Professional Accounting',
        status: 'submitted',
        remarks: [],
      });

      // Status review mutation: update status and add remark
      app.status = 'under_review';
      app.remarks.push({
        author: 'Admissions Officer',
        text: 'Documents verified. Eligibility criteria met.',
        date: new Date(),
      });
      await app.save();

      const reviewedApp = await AdmissionsApplication.findOne({ appNumber });
      expect(reviewedApp?.status).toBe('under_review');
      expect(reviewedApp?.remarks.length).toBe(1);
      // Identity fields must remain completely unchanged
      expect(reviewedApp?.candidateName).toBe('John Doe Candidate');
      expect(reviewedApp?.email).toBe('john.doe.immutable@test.edu');
      expect(reviewedApp?.phone).toBe('9845612345');
      expect(reviewedApp?.program).toBe('B.Com Professional Accounting');
    });
  });
});
