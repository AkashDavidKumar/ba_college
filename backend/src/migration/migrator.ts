/**
 * migrator.ts — Idempotent Migration & Seeding Execution Engine
 *
 * Strict Safety Invariants:
 *  1. Requires explicit `--confirm` flag; fails closed if omitted.
 *  2. Executes and validates 100% offline dry-run first; aborts if any schema error.
 *  3. Executes database preflight checks; aborts if unhandled conflict or connection failure.
 *  4. Performs verified backup of all 15 collections BEFORE any write.
 *  5. Never touches or overwrites `users` or `contact_enquiries`.
 *  6. Admissions applicant records are excluded by default (zero PII written).
 *  7. Preserves admin customizations (isSeedManaged === false) unless explicitly requested.
 *  8. All writes are fully idempotent using natural-key upserts.
 */
import mongoose from 'mongoose';
import { executeDryRun } from './dry-run';
import { runPreflightChecks, GenericModel } from './preflight';
import { createBackup } from './backup';
import { transformSourceData } from './transformer';
import { RawSourceData, MigrationExecutionResult, MappedEntities } from './types';
import fs from 'fs';
import path from 'path';
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
} from '../models';

export interface MigrationExecuteOptions {
  confirm: boolean;
  sourceFilePath?: string;
  mongoUri?: string;
  overwriteCustomized?: boolean;
  includeSampleAdmissions?: boolean;
  customBackupDir?: string;
}

export async function executeMigration(
  options: MigrationExecuteOptions
): Promise<MigrationExecutionResult> {
  const startTime = Date.now();

  // 1. Invariant: Explicit confirmation required
  if (!options.confirm) {
    throw new Error(
      'Migration execution aborted: --confirm flag is strictly required to apply database mutations.'
    );
  }

  // 2. Resolve source data path
  const defaultPath = path.resolve(process.cwd(), '../data/cms-database.json');
  const alternatePath = path.resolve(process.cwd(), 'data/cms-database.json');
  const sourcePath =
    options.sourceFilePath || (fs.existsSync(defaultPath) ? defaultPath : alternatePath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Migration source file not found at: ${sourcePath}`);
  }

  const rawContent = fs.readFileSync(sourcePath, 'utf8');
  const rawData: RawSourceData = JSON.parse(rawContent);

  // 3. Step 1: Run 100% Offline Dry-Run Validation
  const dryRunReport = executeDryRun({ sourceFilePath: sourcePath, silent: true });
  if (dryRunReport.overallStatus !== 'PASS') {
    const errorDetails = dryRunReport.collections
      .flatMap((c) => c.issues.filter((i) => i.severity === 'error'))
      .map((i) => `[${i.collection}] ${i.identifier}: ${i.message}`)
      .join('\n');
    throw new Error(
      `Migration execution aborted: Dry-run validation failed with errors:\n${errorDetails}`
    );
  }

  // 4. Transform data into mapped entities
  const transformResult = transformSourceData(rawData, {
    includeSampleAdmissions: options.includeSampleAdmissions ?? false,
  });
  const entities: MappedEntities = transformResult.entities;

  // 5. Step 2: Database Preflight Verification
  const preflightReport = await runPreflightChecks({
    mongoUri: options.mongoUri,
    sourceEntities: entities,
    overwriteCustomized: options.overwriteCustomized ?? false,
  });

  if (!preflightReport.readyForMigration) {
    const fatalConflicts = preflightReport.conflicts
      .filter((c) => c.action === 'FAIL')
      .map((c) => `${c.collection}: ${c.details}`)
      .join('; ');
    throw new Error(`Migration execution aborted: Preflight check failed: ${fatalConflicts}`);
  }

  // 6. Step 3: Verified Pre-Write Backup of All 15 Collections
  const backupMetadata = await createBackup({
    customBackupDir: options.customBackupDir,
  });

  // 7. Step 4: Idempotent Database Mutations
  const collectionsProcessed: MigrationExecutionResult['collectionsProcessed'] = [];
  let totalWritten = 0;

  // Helper for singletons
  async function upsertSingleton(
    colName: string,
    model: GenericModel,
    data: Record<string, unknown>
  ) {
    const existing = (await model.findOne({})) as ({ isSeedManaged?: boolean } & mongoose.Document) | null;
    if (existing) {
      if (existing.isSeedManaged === false && !options.overwriteCustomized) {
        collectionsProcessed.push({
          collection: colName,
          inserted: 0,
          updated: 0,
          skipped: 1,
        });
        return;
      }
      await model.updateOne({}, { $set: { ...data, isSeedManaged: true } });
      collectionsProcessed.push({
        collection: colName,
        inserted: 0,
        updated: 1,
        skipped: 0,
      });
      totalWritten++;
    } else {
      await model.create({ ...data, isSeedManaged: true });
      collectionsProcessed.push({
        collection: colName,
        inserted: 1,
        updated: 0,
        skipped: 0,
      });
      totalWritten++;
    }
  }

  // Helper for multiple documents
  async function upsertMultiple(
    colName: string,
    model: GenericModel,
    items: Array<Record<string, unknown>>,
    keyField: string
  ) {
    let inserted = 0;
    let updated = 0;
    let skipped = 0;

    for (const item of items) {
      const keyValue = item[keyField];
      const existing = (await model.findOne({ [keyField]: keyValue })) as ({ isSeedManaged?: boolean } & mongoose.Document) | null;

      if (existing) {
        if (existing.isSeedManaged === false && !options.overwriteCustomized) {
          skipped++;
          continue;
        }
        await model.updateOne(
          { [keyField]: keyValue },
          { $set: { ...item, isSeedManaged: true } }
        );
        updated++;
        totalWritten++;
      } else {
        await model.create({ ...item, isSeedManaged: true });
        inserted++;
        totalWritten++;
      }
    }

    collectionsProcessed.push({
      collection: colName,
      inserted,
      updated,
      skipped,
    });
  }

  // 1. Site Content
  await upsertSingleton('site_contents', SiteContent, entities.siteContent);

  // 2. About Page
  await upsertSingleton('about_pages', AboutPage, entities.aboutPage);

  // 3. Departments
  await upsertMultiple('departments', Department, entities.departments, 'slug');

  // 4. Courses
  await upsertMultiple('courses', Course, entities.courses, 'slug');

  // 5. Events
  await upsertMultiple('events', Event, entities.events, 'slug');

  // 6. Guest Speakers
  await upsertMultiple('guest_speakers', GuestSpeaker, entities.guestSpeakers, 'name');

  // 7. Gallery Data
  await upsertSingleton('gallery_data', GalleryData, entities.galleryData);

  // 8. News Articles
  await upsertMultiple('news_articles', NewsArticle, entities.newsArticles, 'slug');

  // 9. IQAC Dossier
  await upsertSingleton('iqac_dossiers', IQACDossier, entities.iqacDossier);

  // 10. Facilities
  await upsertMultiple('facilities', Facility, entities.facilities, 'name');

  // 11. Placement
  await upsertSingleton('placements', Placement, entities.placement);

  // 12. Contact Info
  await upsertSingleton('contact_info', ContactInfo, entities.contactInfo);

  // 13. Admissions Applications (Strict Isolation)
  if (options.includeSampleAdmissions && entities.admissionsApplications.length > 0) {
    await upsertMultiple(
      'admissions_applications',
      AdmissionsApplication,
      entities.admissionsApplications,
      'appNumber'
    );
  } else {
    collectionsProcessed.push({
      collection: 'admissions_applications',
      inserted: 0,
      updated: 0,
      skipped: transformResult.sensitiveRecordsExcluded,
    });
  }

  // 14. Contact Enquiries (Never seeded)
  collectionsProcessed.push({
    collection: 'contact_enquiries',
    inserted: 0,
    updated: 0,
    skipped: 0,
  });

  // 15. Users (Never modified by migration)
  collectionsProcessed.push({
    collection: 'users',
    inserted: 0,
    updated: 0,
    skipped: 0,
  });

  const durationMs = Date.now() - startTime;

  return {
    timestamp: new Date().toISOString(),
    success: true,
    backupVerified: true,
    backupDir: backupMetadata.backupDir,
    collectionsProcessed,
    totalWritten,
    durationMs,
  };
}

/** Formats migration execution result for terminal output */
export function formatMigrationResult(result: MigrationExecutionResult): string {
  const lines: string[] = [];
  lines.push('================================================================================');
  lines.push('            BISHOP AMBROSE COLLEGE — MIGRATION EXECUTION SUMMARY                ');
  lines.push('================================================================================');
  lines.push(`Timestamp:             ${result.timestamp}`);
  lines.push(`Status:                ${result.success ? '[SUCCESS]' : '[FAILED]'}`);
  lines.push(`Duration:              ${result.durationMs}ms`);
  lines.push(`Verified Backup:       ${result.backupDir}`);
  lines.push(`Total Documents Saved: ${result.totalWritten}`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push(
    `${'Collection'.padEnd(25)} | ${'Inserted'.padEnd(10)} | ${'Updated'.padEnd(10)} | ${'Skipped'.padEnd(10)}`
  );
  lines.push('-'.repeat(80));

  result.collectionsProcessed.forEach((c) => {
    lines.push(
      `${c.collection.padEnd(25)} | ${String(c.inserted).padEnd(10)} | ${String(c.updated).padEnd(10)} | ${String(c.skipped).padEnd(10)}`
    );
  });

  lines.push('================================================================================');
  return lines.join('\n');
}
