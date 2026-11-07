/**
 * seed-isolated-benchmark.ts
 *
 * Prepares the dedicated test database (mongodb://127.0.0.1:27017/bac_test_integration_phase3f)
 * for the isolated-process performance validation.
 *
 * Invariants:
 *  - NEVER connects to production.
 *  - Synchronizes all model compound indexes.
 *  - Outputs the generated JWT token to a secure local file for the benchmark runner.
 */
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/bac_test_integration_phase3f';
process.env.NODE_ENV = 'test';

import { connectDatabase, disconnectDatabase } from '../config/database';
import { getEnv } from '../config/env';
import { signAuthToken } from '../utils/token';
import {
  User,
  Department,
  Course,
  Event,
  GuestSpeaker,
  GalleryData,
  NewsArticle,
  IQACDossier,
} from '../models';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/bac_test_integration_phase3f';

async function seed() {
  console.log(`Connecting to test database: ${TEST_DB_URI}`);
  await connectDatabase(TEST_DB_URI);

  // 1. Benchmark User
  await User.deleteMany({ email: 'bench.admin@bac.edu.in' });
  const benchUser = await User.create({
    name: 'Benchmark Admin',
    email: 'bench.admin@bac.edu.in',
    password: crypto.randomBytes(24).toString('base64'),
    role: 'master_admin',
    status: 'active',
  });

  // 2. Department
  await Department.deleteMany({ slug: 'cs-bench' });
  await Department.create({
    slug: 'cs-bench',
    name: 'Department of Computer Science (Bench)',
    shortName: 'CS-B',
    code: 'CS-B',
    category: 'School of Computing',
    description: 'Benchmarking department',
    faculty: [],
    labs: [],
    alumni: [],
    researchStats: {},
    order: 1,
    published: true,
  });

  // 3. Course
  await Course.deleteMany({ slug: 'bsc-cs-bench' });
  await Course.create({
    slug: 'bsc-cs-bench',
    name: 'B.Sc Computer Science (Bench)',
    code: 'BSC-CS-B',
    level: 'UG',
    department: 'Department of Computer Science (Bench)',
    departmentSlug: 'cs-bench',
    duration: '3 Years',
    eligibility: 'Higher Secondary',
    description: 'Undergraduate programme',
    published: true,
    isActive: true,
  });

  // 4. Event
  await Event.deleteMany({ slug: 'annual-tech-symposium-bench' });
  await Event.create({
    slug: 'annual-tech-symposium-bench',
    title: 'Annual Tech Symposium',
    category: 'academic',
    startDate: new Date('2026-12-15'),
    venue: 'Main College Auditorium',
    description: 'College tech conference and symposium.',
    isFeatured: true,
    isActive: true,
    speakers: [],
    schedule: [],
  });

  // 5. Guest Speaker
  await GuestSpeaker.deleteMany({ name: 'Dr. Speaker' });
  await GuestSpeaker.create({
    name: 'Dr. Speaker',
    role: 'Distinguished Keynote Lecturer',
    topic: 'Artificial Intelligence & Cloud Computing',
    order: 1,
    isActive: true,
  });

  // 6. Gallery Data
  await GalleryData.deleteMany({ singletonKey: 'default' });
  await GalleryData.create({
    singletonKey: 'default',
    title: 'Campus Gallery',
    albums: [
      {
        id: 'album-1',
        title: 'Tech Fest 2026',
        category: 'Campus',
        coverImage: '/album-1.jpg',
        count: 12,
      },
    ],
    isActive: true,
  });

  // 7. News Article
  await NewsArticle.deleteMany({ slug: 'campus-placement-drive-2026-bench' });
  await NewsArticle.create({
    slug: 'campus-placement-drive-2026-bench',
    title: 'Campus Placement Drive 2026',
    excerpt: 'Over 50 multinational companies visiting BAC campus.',
    content: 'Full details of campus placement recruitment drive and corporate partners.',
    category: 'Campus',
    author: { name: 'Placement Cell' },
    publishDate: new Date(),
    status: 'published',
    isActive: true,
  });

  // 8. IQAC Dossier
  await IQACDossier.deleteMany({ singletonKey: 'default' });
  await IQACDossier.create({
    singletonKey: 'default',
    stats: {
      naacGrade: 'A+',
      cycle: 'Cycle 2',
      cgpa: '3.42',
      establishedYear: '1986',
    },
    criteria: [],
    aqarReports: [],
    ssrDossier: [],
    sssDossier: [],
    committee: [],
    initiatives: [],
    downloads: [],
    isActive: true,
  });

  // Synchronize all model indexes in MongoDB
  await Promise.all([
    User.syncIndexes(),
    Department.syncIndexes(),
    Course.syncIndexes(),
    Event.syncIndexes(),
    GuestSpeaker.syncIndexes(),
    GalleryData.syncIndexes(),
    NewsArticle.syncIndexes(),
    IQACDossier.syncIndexes(),
  ]);

  const env = getEnv();
  const token = signAuthToken(
    {
      sub: String(benchUser._id),
      email: benchUser.email,
      role: benchUser.role,
      tokenVersion: benchUser.tokenVersion,
    },
    env.JWT_SECRET
  );

  const authInfoPath = path.resolve(__dirname, '../../.benchmark-auth.json');
  fs.writeFileSync(
    authInfoPath,
    JSON.stringify(
      {
        userId: String(benchUser._id),
        email: benchUser.email,
        token,
        seededAt: new Date().toISOString(),
      },
      null,
      2
    )
  );

  console.log('Seeding and index synchronization complete.');
  console.log(`Auth session token written to: ${authInfoPath}`);

  await disconnectDatabase();
}

seed().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
