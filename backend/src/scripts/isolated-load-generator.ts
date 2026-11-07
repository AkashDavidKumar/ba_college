/**
 * isolated-load-generator.ts
 *
 * Process B — Independent HTTP Load Generator for Phase 3F Validation
 *
 * Architecture:
 *  - Separate OS process from the running Express backend.
 *  - Communicates exclusively over real TCP loopback (http://127.0.0.1:5001).
 *  - Uses Node.js native http.Agent with HTTP Keep-Alive.
 *  - Does NOT import Express, Mongoose, or the server application.
 *  - Simulates 20 concurrent users executing 100 requests per endpoint.
 *  - Collects: request count, success, fail, error rate, avg, p50, p90, p95, p99, min, max, throughput,
 *    cold-start p95, steady-state p95, and overall p95.
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { performance } from 'perf_hooks';

const BASE_URL = process.env.BENCHMARK_TARGET_URL || 'http://127.0.0.1:5001';
const CONCURRENT_USERS = 20;
const REQUESTS_PER_ENDPOINT = 100;
const REQUEST_TIMEOUT_MS = 10000;

// Read authentication token from .benchmark-auth.json
const authInfoPath = path.resolve(__dirname, '../../.benchmark-auth.json');
if (!fs.existsSync(authInfoPath)) {
  console.error(`Missing auth session file: ${authInfoPath}. Run seed-isolated-benchmark.ts first.`);
  process.exit(1);
}
const authInfo = JSON.parse(fs.readFileSync(authInfoPath, 'utf-8'));
const AUTH_TOKEN: string = authInfo.token;

// Shared HTTP Agent with Keep-Alive enabled for realistic connection pooling
const httpAgent = new http.Agent({
  keepAlive: true,
  keepAliveMsecs: 1000,
  maxSockets: 50,
  maxFreeSockets: 20,
  timeout: REQUEST_TIMEOUT_MS,
});

export interface RunMetrics {
  endpoint: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  errorRate: number;
  minMs: number;
  maxMs: number;
  avgLatencyMs: number;
  p50Ms: number;
  p90Ms: number;
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

function executeHttpRequest(
  endpointPath: string,
  clientIp: string,
  token?: string
): Promise<{ status: number; durationMs: number; error?: Error }> {
  return new Promise((resolve) => {
    const url = new URL(endpointPath, BASE_URL);
    const headers: Record<string, string> = {
      'X-Forwarded-For': clientIp,
      'User-Agent': 'BAC-Isolated-Benchmark/1.0',
      Accept: 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const t0 = performance.now();
    const req = http.request(
      url,
      {
        method: 'GET',
        headers,
        agent: httpAgent,
        timeout: REQUEST_TIMEOUT_MS,
      },
      (res) => {
        // Consume response body to free socket back to agent pool
        res.on('data', () => {});
        res.on('end', () => {
          const durationMs = performance.now() - t0;
          resolve({ status: res.statusCode || 500, durationMs });
        });
      }
    );

    req.on('timeout', () => {
      req.destroy(new Error('Request timed out'));
    });

    req.on('error', (err) => {
      const durationMs = performance.now() - t0;
      resolve({ status: 500, durationMs, error: err });
    });

    req.end();
  });
}

const ENDPOINTS = [
  { name: 'GET /api/health', path: '/api/health', auth: false },
  { name: 'GET /api/auth/me', path: '/api/auth/me', auth: true },
  { name: 'GET /api/departments', path: '/api/departments', auth: false },
  { name: 'GET /api/courses', path: '/api/courses', auth: false },
  { name: 'GET /api/events', path: '/api/events', auth: false },
  { name: 'GET /api/news', path: '/api/news', auth: false },
  { name: 'GET /api/iqac', path: '/api/iqac', auth: false },
];

export async function runIsolatedBenchmark(runNumber: number): Promise<RunMetrics[]> {
  console.log(`\n========================================================================================`);
  console.log(` ISOLATED-PROCESS BENCHMARK — RUN ${runNumber}`);
  console.log(` Target Server: ${BASE_URL} (Separate OS Process)`);
  console.log(` Concurrency: ${CONCURRENT_USERS} concurrent users | Requests/endpoint: ${REQUESTS_PER_ENDPOINT}`);
  console.log(`========================================================================================\n`);

  // Verify server is ready by making a health check probe
  const probe = await executeHttpRequest('/api/health', `192.168.${10 + runNumber}.1`);
  if (probe.status !== 200) {
    throw new Error(`Target backend at ${BASE_URL} is not responding (status: ${probe.status})`);
  }
  console.log(`Backend probe confirmed ready at ${BASE_URL} (probe latency: ${probe.durationMs.toFixed(2)}ms)`);

  const runResults: RunMetrics[] = [];
  const requestsPerUser = Math.ceil(REQUESTS_PER_ENDPOINT / CONCURRENT_USERS); // 5 requests per user

  for (const ep of ENDPOINTS) {
    process.stdout.write(`Testing ${ep.name.padEnd(35)} ... `);
    const allLatencies: number[] = [];
    const coldLatencies: number[] = [];
    const steadyLatencies: number[] = [];
    let failures = 0;

    const tStart = performance.now();

    const workers = Array.from({ length: CONCURRENT_USERS }, async (_, idx) => {
      const clientIp = `192.168.${10 + runNumber}.${idx + 1}`;
      const token = ep.auth ? AUTH_TOKEN : undefined;

      for (let r = 0; r < requestsPerUser; r++) {
        const result = await executeHttpRequest(ep.path, clientIp, token);

        if (result.status >= 200 && result.status < 400 && !result.error) {
          allLatencies.push(result.durationMs);
          if (r === 0) {
            coldLatencies.push(result.durationMs);
          } else {
            steadyLatencies.push(result.durationMs);
          }
        } else {
          failures++;
        }
      }
    });

    await Promise.all(workers);

    const totalTimeMs = performance.now() - tStart;
    allLatencies.sort((a, b) => a - b);
    coldLatencies.sort((a, b) => a - b);
    steadyLatencies.sort((a, b) => a - b);

    const successfulRequests = allLatencies.length;
    const errorRate = (failures / REQUESTS_PER_ENDPOINT) * 100;
    const minMs = allLatencies.length > 0 ? allLatencies[0] : 0;
    const maxMs = allLatencies.length > 0 ? allLatencies[allLatencies.length - 1] : 0;
    const avgLatencyMs = allLatencies.reduce((a, b) => a + b, 0) / (allLatencies.length || 1);
    const p50Ms = calculatePercentile(allLatencies, 50);
    const p90Ms = calculatePercentile(allLatencies, 90);
    const p95Ms = calculatePercentile(allLatencies, 95);
    const p99Ms = calculatePercentile(allLatencies, 99);

    const coldStartAvgMs = coldLatencies.reduce((a, b) => a + b, 0) / (coldLatencies.length || 1);
    const coldStartP95Ms = calculatePercentile(coldLatencies, 95);
    const steadyStateAvgMs = steadyLatencies.reduce((a, b) => a + b, 0) / (steadyLatencies.length || 1);
    const steadyStateP95Ms = calculatePercentile(steadyLatencies, 95);
    const throughputReqPerSec = successfulRequests / (totalTimeMs / 1000);

    console.log(
      `[DONE] p95: ${p95Ms.toFixed(2)}ms | Avg: ${avgLatencyMs.toFixed(2)}ms | Cold p95: ${coldStartP95Ms.toFixed(2)}ms | Steady p95: ${steadyStateP95Ms.toFixed(2)}ms | Err: ${errorRate.toFixed(1)}%`
    );

    runResults.push({
      endpoint: ep.name,
      totalRequests: REQUESTS_PER_ENDPOINT,
      successfulRequests,
      failedRequests: failures,
      errorRate,
      minMs,
      maxMs,
      avgLatencyMs,
      p50Ms,
      p90Ms,
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

  return runResults;
}

// Master execution: 3 independent benchmark runs
async function main() {
  const allRuns: RunMetrics[][] = [];

  for (let run = 1; run <= 3; run++) {
    const results = await runIsolatedBenchmark(run);
    allRuns.push(results);
    // Pause briefly between runs to allow socket cleanup
    if (run < 3) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  // Print Complete Summary Table for all 3 runs + Median p95
  console.log('\n========================================================================================================================');
  console.log(' FINAL ISOLATED-PROCESS BENCHMARK AUDIT: THREE-RUN REPRODUCIBILITY SUMMARY');
  console.log('========================================================================================================================');
  console.log('| Endpoint | Run 1 p95 | Run 2 p95 | Run 3 p95 | Median p95 | Run 1 Avg | Run 2 Avg | Run 3 Avg | Steady p95 (Run 2) | Status (<100ms) |');
  console.log('| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |');

  for (let i = 0; i < ENDPOINTS.length; i++) {
    const epName = ENDPOINTS[i].name;
    const r1 = allRuns[0][i];
    const r2 = allRuns[1][i];
    const r3 = allRuns[2][i];

    const p95s = [r1.p95Ms, r2.p95Ms, r3.p95Ms].sort((a, b) => a - b);
    const medianP95 = p95s[1];
    const status = medianP95 < 100 ? 'PASS' : 'FAIL';

    console.log(
      `| \`${epName}\` | ${r1.p95Ms.toFixed(2)} ms | ${r2.p95Ms.toFixed(2)} ms | ${r3.p95Ms.toFixed(2)} ms | **${medianP95.toFixed(2)} ms** | ${r1.avgLatencyMs.toFixed(2)} ms | ${r2.avgLatencyMs.toFixed(2)} ms | ${r3.avgLatencyMs.toFixed(2)} ms | ${r2.steadyStateP95Ms.toFixed(2)} ms | **${status}** |`
    );
  }
  console.log('========================================================================================================================\n');

  // Save results to json for inclusion in report
  const outputPath = path.resolve(__dirname, '../../.benchmark-isolated-results.json');
  fs.writeFileSync(outputPath, JSON.stringify(allRuns, null, 2));
  console.log(`Detailed metrics saved to: ${outputPath}`);

  httpAgent.destroy();
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Benchmark execution error:', err);
    process.exit(1);
  });
}
