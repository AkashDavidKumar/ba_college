/**
 * benchmark-performance.ts — Phase 3F Latency & Concurrency Benchmarking
 *
 * Measures read latency and throughput under moderate concurrent load (20 concurrent users)
 * for:
 *   - GET /api/health
 *   - GET /api/auth/me (authenticated)
 *   - GET /api/departments
 *   - GET /api/courses
 *   - GET /api/events
 *   - GET /api/news
 *   - GET /api/iqac
 *
 * Metrics calculated:
 *   - Average latency (ms)
 *   - p50, p95, p99 latency (ms)
 *   - Throughput (req/s)
 *   - Error rate (%)
 */
import { performance } from 'perf_hooks';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

// Load environment variables before any application imports
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
process.env.PORT = process.env.PORT || '5000';
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.LOG_LEVEL = 'warn';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'phase3f_benchmark_jwt_secret_must_be_at_least_32_chars!';
process.env.CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:3000';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bac_test_integration_phase3f';

import supertest from 'supertest';
import { createApp } from '../app';
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
const CONCURRENT_USERS = 20;
const REQUESTS_PER_ENDPOINT = 100; // 5 batches of 20 concurrent requests

interface BenchmarkResult {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  avgLatencyMs: number;
  p50Ms: number;
  p95Ms: number;
  p99Ms: number;
  coldStartAvgMs: number;
  coldStartP95Ms: number;
  steadyStateAvgMs: number;
  steadyStateP95Ms: number;
  throughputReqPerSec: number;
  totalTimeMs: number;
}

function calculatePercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
}

async function seedBenchmarkData() {
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

  // 5. NewsArticle
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

  // 6. IQAC
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

  // Ensure all model indexes are synchronized in MongoDB
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

  return benchUser;
}

async function runBenchmark() {
  console.log('=================================================================');
  console.log(' Phase 3F — Latency & Concurrency Performance Benchmark');
  console.log(` Target Database: ${TEST_DB_URI}`);
  console.log(` Concurrent Users: ${CONCURRENT_USERS}`);
  console.log(` Total Requests per Endpoint: ${REQUESTS_PER_ENDPOINT}`);
  console.log('=================================================================\n');

  await connectDatabase(TEST_DB_URI);
  const benchUser = await seedBenchmarkData();
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

  const app = createApp({
    corsOrigins: ['http://localhost:3000'],
    trustProxy: true,
  });

  const server = app.listen(0);
  const request = supertest(server);

  const endpoints = [
    { name: 'GET /api/health', url: '/api/health', auth: false },
    { name: 'GET /api/auth/me (authenticated)', url: '/api/auth/me', auth: true },
    { name: 'GET /api/departments', url: '/api/departments', auth: false },
    { name: 'GET /api/courses', url: '/api/courses', auth: false },
    { name: 'GET /api/events', url: '/api/events', auth: false },
    { name: 'GET /api/news', url: '/api/news', auth: false },
    { name: 'GET /api/iqac', url: '/api/iqac', auth: false },
  ];

  // Warm up V8 JIT, connection pool, and 20 worker sockets
  process.stdout.write('Warming up 20 concurrent worker sockets ... ');
  await Promise.all(
    Array.from({ length: CONCURRENT_USERS }, (_, idx) =>
      request.get('/api/health').set('X-Forwarded-For', `192.168.10.${idx + 1}`)
    )
  );
  console.log('[DONE]\n');

  const results: BenchmarkResult[] = [];

  for (const ep of endpoints) {
    process.stdout.write(`Testing ${ep.name.padEnd(35)} ... `);
    const latencies: number[] = [];
    const coldLatencies: number[] = [];
    const steadyLatencies: number[] = [];
    let failures = 0;

    const startTime = performance.now();
    const requestsPerUser = Math.ceil(REQUESTS_PER_ENDPOINT / CONCURRENT_USERS);

    const userWorkers = Array.from({ length: CONCURRENT_USERS }, async (_, idx) => {
      const clientIp = `192.168.10.${idx + 1}`;

      for (let r = 0; r < requestsPerUser; r++) {
        const reqStartTime = performance.now();

        try {
          let req = request.get(ep.url).set('X-Forwarded-For', clientIp);
          if (ep.auth) {
            req = req.set('Authorization', `Bearer ${token}`);
          }
          const res = await req;
          const reqDuration = performance.now() - reqStartTime;

          if (res.status >= 200 && res.status < 400) {
            latencies.push(reqDuration);
            if (r === 0) {
              coldLatencies.push(reqDuration);
            } else {
              steadyLatencies.push(reqDuration);
            }
          } else {
            failures++;
          }
        } catch {
          failures++;
        }
      }
    });

    await Promise.all(userWorkers);

    const totalTimeMs = performance.now() - startTime;
    latencies.sort((a, b) => a - b);
    coldLatencies.sort((a, b) => a - b);
    steadyLatencies.sort((a, b) => a - b);

    const successfulRequests = latencies.length;
    const avgLatencyMs =
      latencies.reduce((sum, val) => sum + val, 0) / (latencies.length || 1);
    const p50Ms = calculatePercentile(latencies, 50);
    const p95Ms = calculatePercentile(latencies, 95);
    const p99Ms = calculatePercentile(latencies, 99);
    const coldStartAvgMs =
      coldLatencies.reduce((sum, val) => sum + val, 0) / (coldLatencies.length || 1);
    const coldStartP95Ms = calculatePercentile(coldLatencies, 95);
    const steadyStateAvgMs =
      steadyLatencies.reduce((sum, val) => sum + val, 0) / (steadyLatencies.length || 1);
    const steadyStateP95Ms = calculatePercentile(steadyLatencies, 95);
    const throughputReqPerSec = (successfulRequests / (totalTimeMs / 1000));
    const errorRate = (failures / REQUESTS_PER_ENDPOINT) * 100;

    console.log(`[DONE] Overall p95: ${p95Ms.toFixed(2)}ms | Cold p95: ${coldStartP95Ms.toFixed(2)}ms | Steady p95: ${steadyStateP95Ms.toFixed(2)}ms | Err: ${errorRate.toFixed(1)}%`);

    results.push({
      endpoint: ep.name,
      totalRequests: REQUESTS_PER_ENDPOINT,
      successfulRequests,
      failedRequests: failures,
      errorRate,
      avgLatencyMs,
      p50Ms,
      p95Ms,
      p99Ms,
      coldStartAvgMs,
      coldStartP95Ms,
      steadyStateAvgMs,
      steadyStateP95Ms,
      throughputReqPerSec,
      totalTimeMs,
    });
  }

  console.log('\n====================================================================================================');
  console.log(' BENCHMARK SUMMARY TABLE (OVERALL, COLD-START & STEADY-STATE)');
  console.log('====================================================================================================');
  console.log('| Endpoint | Overall Avg | Overall p50 | Overall p95 | Cold p95 | Steady p95 | Throughput | Err |');
  console.log('| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |');
  for (const r of results) {
    console.log(
      `| \`${r.endpoint}\` | ${r.avgLatencyMs.toFixed(2)} ms | ${r.p50Ms.toFixed(2)} ms | **${r.p95Ms.toFixed(2)} ms** | ${r.coldStartP95Ms.toFixed(2)} ms | ${r.steadyStateP95Ms.toFixed(2)} ms | ${r.throughputReqPerSec.toFixed(1)} req/s | ${r.errorRate.toFixed(1)}% |`
    );
  }
  console.log('====================================================================================================\n');

  console.log(JSON.stringify(results, null, 2));

  await new Promise<void>((resolve) => server.close(() => resolve()));
  await disconnectDatabase();
}

runBenchmark().catch((err) => {
  console.error('Benchmark failed:', err);
  process.exit(1);
});
