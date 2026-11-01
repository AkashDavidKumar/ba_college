/**
 * restore.ts — Verified Rollback & Restore Engine
 *
 * Safety & Reliability Invariants:
 *  1. Requires explicit `--confirm` flag to execute restore mutations.
 *  2. Cryptographically verifies backup directory (SHA-256 hashes, file sizes, counts) before restore.
 *  3. By default, never overwrites or modifies `users` to protect administrative access.
 *  4. Idempotently restores documents via upsert on document `_id`.
 */
import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import { verifyBackup, sanitizeBackupDir } from './backup';
import { RestoreResult } from './types';
import logger from '../utils/logger';

export interface RestoreOptions {
  backupDir: string;
  confirm: boolean;
  collections?: string[];
  includeUsers?: boolean;
}

export async function restoreFromBackup(options: RestoreOptions): Promise<RestoreResult> {
  const startTime = Date.now();

  // 1. Strict confirmation requirement
  if (!options.confirm) {
    throw new Error(
      'Restore aborted: --confirm flag is strictly required to restore database state.'
    );
  }

  // 2. Sanitize and verify the backup directory
  const safeDir = sanitizeBackupDir(options.backupDir);
  const verification = verifyBackup(safeDir);
  if (!verification.valid || !verification.metadata) {
    throw new Error(
      `Restore aborted: Backup integrity check failed:\n${verification.errors.join('\n')}`
    );
  }

  const db = mongoose.connection.db;
  if (!db || mongoose.connection.readyState !== 1) {
    throw new Error('Restore aborted: MongoDB connection is not active.');
  }

  const metadata = verification.metadata;
  const collectionsRestored: RestoreResult['collectionsRestored'] = [];

  for (const colMeta of metadata.collections) {
    const colName = colMeta.collection;

    // Filter collections if specified
    if (options.collections && !options.collections.includes(colName)) {
      continue;
    }

    // Protection: never restore users collection unless explicitly requested
    if (colName === 'users' && !options.includeUsers) {
      logger.warn(
        `[Restore] Skipping 'users' collection to preserve current administrative credentials.`
      );
      continue;
    }

    const filePath = path.join(safeDir, colMeta.fileName);
    const content = fs.readFileSync(filePath, 'utf8');
    const docs = JSON.parse(content) as Array<Record<string, unknown>>;

    if (docs.length === 0) {
      collectionsRestored.push({
        collection: colName,
        restoredCount: 0,
      });
      continue;
    }

    // Perform bulk upsert by _id
    const bulkOps = docs.map((doc) => {
      const { _id, ...fields } = doc;
      return {
        updateOne: {
          filter: { _id },
          update: { $set: fields },
          upsert: true,
        },
      };
    });

    try {
      await db
        .collection(colName)
        .bulkWrite(bulkOps as unknown as mongoose.mongo.AnyBulkWriteOperation[], {
          ordered: false,
        });
      collectionsRestored.push({
        collection: colName,
        restoredCount: docs.length,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to restore collection '${colName}': ${msg}`);
    }
  }

  const durationMs = Date.now() - startTime;

  return {
    timestamp: new Date().toISOString(),
    success: true,
    backupDir: safeDir,
    collectionsRestored,
    durationMs,
  };
}

/** Formats restore result for terminal output */
export function formatRestoreResult(result: RestoreResult): string {
  const lines: string[] = [];
  lines.push('================================================================================');
  lines.push('             BISHOP AMBROSE COLLEGE — DATABASE RESTORE SUMMARY                  ');
  lines.push('================================================================================');
  lines.push(`Timestamp:             ${result.timestamp}`);
  lines.push(`Status:                ${result.success ? '[SUCCESS]' : '[FAILED]'}`);
  lines.push(`Duration:              ${result.durationMs}ms`);
  lines.push(`Source Backup:         ${result.backupDir}`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push(`${'Collection'.padEnd(30)} | ${'Restored Count'.padEnd(15)}`);
  lines.push('-'.repeat(60));

  result.collectionsRestored.forEach((c) => {
    lines.push(`${c.collection.padEnd(30)} | ${String(c.restoredCount).padEnd(15)}`);
  });

  lines.push('================================================================================');
  return lines.join('\n');
}
