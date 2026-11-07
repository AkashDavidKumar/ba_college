/**
 * revoke-test-token.ts
 *
 * Security cleanup:
 * 1. Connects ONLY to the test database (bac_test_integration_phase3f).
 * 2. Safely recreates the dedicated test account with tokenVersion = 1 (revoking tokenVersion = 0).
 * 3. Sends GET /api/auth/me with the exposed token to verify it is rejected with HTTP 401.
 */
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/bac_test_integration_phase3f';
process.env.NODE_ENV = 'test';

import supertest from 'supertest';
import { createApp } from '../app';
import { connectDatabase, disconnectDatabase } from '../config/database';
import { getEnv } from '../config/env';
import { User } from '../models/user.model';

const TEST_DB_URI = 'mongodb://127.0.0.1:27017/bac_test_integration_phase3f';

async function main() {
  console.log(`[SECURITY CLEANUP] Connecting strictly to test database: ${TEST_DB_URI}`);
  await connectDatabase(TEST_DB_URI);

  const authInfoPath = path.resolve(__dirname, '../../.benchmark-auth.json');
  if (!fs.existsSync(authInfoPath)) {
    throw new Error(`Session file not found: ${authInfoPath}`);
  }

  const authData = JSON.parse(fs.readFileSync(authInfoPath, 'utf-8'));
  const exposedToken = authData.token;
  const targetUserId = authData.userId || '6aef175ad52264331da5437d';
  const targetEmail = authData.email || 'bench.admin@bac.edu.in';

  console.log(`[SECURITY CLEANUP] Target test user: ${targetEmail} (_id: ${targetUserId})`);

  // Ensure user exists in test DB with tokenVersion: 1 (incremented / revoked)
  await User.deleteMany({ _id: new mongoose.Types.ObjectId(targetUserId) });
  await User.deleteMany({ email: targetEmail });

  const revokedUser = await User.create({
    _id: new mongoose.Types.ObjectId(targetUserId),
    name: 'Benchmark Admin (Revoked)',
    email: targetEmail,
    password: crypto.randomBytes(24).toString('base64'),
    role: 'master_admin',
    status: 'active',
    tokenVersion: 1, // Token payload has tokenVersion: 0, so 1 guarantees revocation
  });

  console.log(
    `[SECURITY CLEANUP] Test user secured in DB: id=${revokedUser._id}, tokenVersion=${revokedUser.tokenVersion}, status=${revokedUser.status}`
  );

  // Initialize Express application configured for test environment
  const env = getEnv();
  const app = createApp({
    corsOrigins: env.CORS_ORIGINS,
    trustProxy: env.TRUST_PROXY,
  });

  // Verify that GET /api/auth/me rejects the exposed token with HTTP 401
  console.log('[SECURITY CLEANUP] Testing GET /api/auth/me with the exposed token (tokenVersion=0)...');
  const res = await supertest(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${exposedToken}`);

  console.log(`[SECURITY CLEANUP] Response Status: ${res.status}`);
  console.log(`[SECURITY CLEANUP] Response Code: ${res.body?.code}`);
  console.log(`[SECURITY CLEANUP] Response Message: ${res.body?.message}`);

  if (res.status === 401 && res.body?.code === 'TOKEN_REVOKED') {
    console.log('[SECURITY CLEANUP] SUCCESS: The exposed token is strictly REJECTED with HTTP 401 (TOKEN_REVOKED).');
  } else {
    console.error(`[SECURITY CLEANUP] UNEXPECTED RESULT: Expected 401 TOKEN_REVOKED, got ${res.status} ${res.body?.code}`);
    process.exitCode = 1;
  }

  // Also verify that if the account is deactivated or removed, it still returns 401
  await User.updateOne({ _id: revokedUser._id }, { status: 'suspended' });
  const suspendedRes = await supertest(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${exposedToken}`);
  console.log(`[SECURITY CLEANUP] Suspended user rejection test: Status ${suspendedRes.status}, Code ${suspendedRes.body?.code}`);

  // Clean up user from test database
  await User.deleteMany({ email: targetEmail });
  const deletedRes = await supertest(app)
    .get('/api/auth/me')
    .set('Authorization', `Bearer ${exposedToken}`);
  console.log(`[SECURITY CLEANUP] Deleted user rejection test: Status ${deletedRes.status}, Code ${deletedRes.body?.code}`);

  if (deletedRes.status === 401) {
    console.log('[SECURITY CLEANUP] Verified: Token remains rejected (401) regardless of user state.');
  }

  await disconnectDatabase();
}

main().catch((err) => {
  console.error('[SECURITY CLEANUP] Fatal Error:', err);
  process.exit(1);
});
