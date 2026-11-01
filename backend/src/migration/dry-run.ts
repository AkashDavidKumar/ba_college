/**
 * dry-run.ts — 100% Offline Migration Validation Engine
 *
 * Security & Isolation Guarantees:
 *  1. ZERO network connections or MongoDB sockets opened.
 *  2. Does not touch or mutate MongoDB in any way.
 *  3. Validates mapped records against Phase 3A Zod schemas.
 *  4. Detects intra-file duplicate natural keys and broken relationships.
 *  5. Calculates expected insert, update, and skip counts.
 */
import fs from 'fs';
import path from 'path';
import { RawSourceData, DryRunReport, CollectionDryRunSummary, DryRunValidationIssue } from './types';
import { transformSourceData } from './transformer';

import {
  updateSiteContentSchema,
  updateAboutPageSchema,
  createDepartmentSchema,
  createCourseSchema,
  createEventSchema,
  createGuestSpeakerSchema,
  updateGallerySchema,
  createNewsArticleSchema,
  updateIQACDossierSchema,
  createFacilitySchema,
  updatePlacementSchema,
  updateContactInfoSchema,
} from '../validations';

export interface ExecuteDryRunOptions {
  sourceFilePath?: string;
  silent?: boolean;
}

export function executeDryRun(options: ExecuteDryRunOptions = {}): DryRunReport {
  const defaultPath = path.resolve(process.cwd(), '../data/cms-database.json');
  const alternatePath = path.resolve(process.cwd(), 'data/cms-database.json');
  const sourcePath =
    options.sourceFilePath || (fs.existsSync(defaultPath) ? defaultPath : alternatePath);

  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Migration source file not found at: ${sourcePath}`);
  }

  const stat = fs.statSync(sourcePath);
  const rawContent = fs.readFileSync(sourcePath, 'utf8');

  let rawData: RawSourceData;
  try {
    rawData = JSON.parse(rawContent);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to parse source JSON from ${sourcePath}: ${errorMsg}`);
  }

  const transformResult = transformSourceData(rawData, { includeSampleAdmissions: false });
  const { entities, unmappedFields, sensitiveRecordsDetected, sensitiveRecordsExcluded } =
    transformResult;

  const collections: CollectionDryRunSummary[] = [];

  // Helper for single document validation
  function validateSingleton(
    name: string,
    data: Record<string, unknown>,
    schema: { safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ path: Array<unknown>; message: string }> } } }
  ): CollectionDryRunSummary {
    const issues: DryRunValidationIssue[] = [];
    // Strip internal DB keys before validating against API schema
    const dataToValidate = { ...data };
    delete dataToValidate['isSeedManaged'];
    delete dataToValidate['singletonKey'];
    const parse = schema.safeParse(dataToValidate);
    let valid = 0;
    let invalid = 0;

    if (parse.success) {
      valid = 1;
    } else {
      invalid = 1;
      parse.error?.issues.forEach((iss) => {
        issues.push({
          collection: name,
          identifier: 'singleton:default',
          path: iss.path.map(String).join('.'),
          message: iss.message,
          severity: 'error',
        });
      });
    }

    return {
      collection: name,
      sourceCount: 1,
      validCount: valid,
      invalidCount: invalid,
      skippedCount: 0,
      issues,
    };
  }

  // Helper for multiple documents validation
  function validateMultiple(
    name: string,
    items: Array<Record<string, unknown>>,
    idKey: string,
    schema: { safeParse: (data: unknown) => { success: boolean; error?: { issues: Array<{ path: Array<unknown>; message: string }> } } }
  ): CollectionDryRunSummary {
    const issues: DryRunValidationIssue[] = [];
    let valid = 0;
    let invalid = 0;

    items.forEach((item, idx) => {
      const identifier = String(item[idKey] || item['name'] || item['id'] || `item-${idx + 1}`);
      // Strip internal DB keys before validating against API schema
      const itemToValidate = { ...item };
      delete itemToValidate['isSeedManaged'];
      delete itemToValidate['singletonKey'];
      const parse = schema.safeParse(itemToValidate);

      if (parse.success) {
        valid++;
      } else {
        invalid++;
        parse.error?.issues.forEach((iss) => {
          issues.push({
            collection: name,
            identifier,
            path: iss.path.map(String).join('.'),
            message: iss.message,
            severity: 'error',
          });
        });
      }
    });

    return {
      collection: name,
      sourceCount: items.length,
      validCount: valid,
      invalidCount: invalid,
      skippedCount: 0,
      issues,
    };
  }

  // 1. Site Content
  collections.push(validateSingleton('site_contents', entities.siteContent, updateSiteContentSchema));

  // 2. About Page
  collections.push(validateSingleton('about_pages', entities.aboutPage, updateAboutPageSchema));

  // 3. Departments
  const deptSummary = validateMultiple(
    'departments',
    entities.departments,
    'slug',
    createDepartmentSchema
  );

  // Check intra-file duplicate department slugs and codes
  const seenDeptSlugs = new Set<string>();
  const seenDeptCodes = new Set<string>();
  entities.departments.forEach((d) => {
    const slug = String(d['slug']);
    const code = String(d['code']);
    if (seenDeptSlugs.has(slug)) {
      deptSummary.invalidCount++;
      deptSummary.issues.push({
        collection: 'departments',
        identifier: slug,
        message: `Duplicate department slug detected in source: '${slug}'`,
        severity: 'error',
      });
    }
    seenDeptSlugs.add(slug);

    if (seenDeptCodes.has(code)) {
      deptSummary.invalidCount++;
      deptSummary.issues.push({
        collection: 'departments',
        identifier: code,
        message: `Duplicate department code detected in source: '${code}'`,
        severity: 'error',
      });
    }
    seenDeptCodes.add(code);
  });
  collections.push(deptSummary);

  // 4. Courses
  const courseSummary = validateMultiple('courses', entities.courses, 'slug', createCourseSchema);

  // Check intra-file duplicate course slugs and relationship integrity
  const seenCourseSlugs = new Set<string>();
  entities.courses.forEach((c) => {
    const slug = String(c['slug']);
    const deptSlug = String(c['departmentSlug']);

    if (seenCourseSlugs.has(slug)) {
      courseSummary.invalidCount++;
      courseSummary.issues.push({
        collection: 'courses',
        identifier: slug,
        message: `Duplicate course slug detected in source: '${slug}'`,
        severity: 'error',
      });
    }
    seenCourseSlugs.add(slug);

    if (!seenDeptSlugs.has(deptSlug)) {
      courseSummary.invalidCount++;
      courseSummary.issues.push({
        collection: 'courses',
        identifier: slug,
        message: `Broken relationship: course references unknown departmentSlug '${deptSlug}'`,
        severity: 'error',
      });
    }
  });
  collections.push(courseSummary);

  // 5. Events
  const eventSummary = validateMultiple('events', entities.events, 'slug', createEventSchema);
  const seenEventSlugs = new Set<string>();
  entities.events.forEach((e) => {
    const slug = String(e['slug']);
    if (seenEventSlugs.has(slug)) {
      eventSummary.invalidCount++;
      eventSummary.issues.push({
        collection: 'events',
        identifier: slug,
        message: `Duplicate event slug detected in source: '${slug}'`,
        severity: 'error',
      });
    }
    seenEventSlugs.add(slug);
  });
  collections.push(eventSummary);

  // 6. Guest Speakers
  collections.push(
    validateMultiple('guest_speakers', entities.guestSpeakers, 'name', createGuestSpeakerSchema)
  );

  // 7. Gallery Data
  collections.push(validateSingleton('gallery_data', entities.galleryData, updateGallerySchema));

  // 8. News Articles
  collections.push(
    validateMultiple('news_articles', entities.newsArticles, 'slug', createNewsArticleSchema)
  );

  // 9. IQAC Dossier
  collections.push(validateSingleton('iqac_dossiers', entities.iqacDossier, updateIQACDossierSchema));

  // 10. Admissions Applications (PII check)
  collections.push({
    collection: 'admissions_applications',
    sourceCount: sensitiveRecordsDetected,
    validCount: 0,
    invalidCount: 0,
    skippedCount: sensitiveRecordsExcluded,
    issues: [
      {
        collection: 'admissions_applications',
        identifier: 'PII_EXCLUSION_POLICY',
        message: `Excluded ${sensitiveRecordsExcluded} sensitive applicant records from migration by default.`,
        severity: 'warning',
      },
    ],
  });

  // 11. Facilities
  collections.push(validateMultiple('facilities', entities.facilities, 'name', createFacilitySchema));

  // 12. Placements
  collections.push(validateSingleton('placements', entities.placement, updatePlacementSchema));

  // 13. Contact Info
  collections.push(validateSingleton('contact_info', entities.contactInfo, updateContactInfoSchema));

  // 14. Contact Enquiries
  collections.push({
    collection: 'contact_enquiries',
    sourceCount: 0,
    validCount: 0,
    invalidCount: 0,
    skippedCount: 0,
    issues: [],
  });

  // Calculate totals
  let totalErrors = 0;
  let totalExpectedInserts = 0;

  collections.forEach((col) => {
    const errors = col.issues.filter((i) => i.severity === 'error').length;
    totalErrors += errors;
    totalExpectedInserts += col.validCount;
  });

  const overallStatus: 'PASS' | 'FAIL' = totalErrors === 0 ? 'PASS' : 'FAIL';

  const report: DryRunReport = {
    timestamp: new Date().toISOString(),
    sourceFile: sourcePath,
    sourceFileSize: stat.size,
    overallStatus,
    collections,
    unmappedSourceFields: unmappedFields,
    totalExpectedInserts,
    totalExpectedUpdates: 0,
    totalSkipped: sensitiveRecordsExcluded,
    sensitiveRecordsDetected,
    sensitiveRecordsExcluded,
  };

  return report;
}

/** Formats the dry-run report for terminal display */
export function formatDryRunReport(report: DryRunReport): string {
  const lines: string[] = [];
  lines.push('================================================================================');
  lines.push('          BISHOP AMBROSE COLLEGE — OFFLINE MIGRATION DRY-RUN REPORT             ');
  lines.push('================================================================================');
  lines.push(`Timestamp:             ${report.timestamp}`);
  lines.push(`Source File:           ${report.sourceFile}`);
  lines.push(`Source File Size:      ${(report.sourceFileSize / 1024).toFixed(2)} KB`);
  lines.push(`Overall Status:        [${report.overallStatus}]`);
  lines.push(`Database Connection:   NONE (100% Offline Mode - Zero Database Writes)`);
  lines.push(`Sensitive PII Filter:  ${report.sensitiveRecordsExcluded} of ${report.sensitiveRecordsDetected} records safely excluded`);
  lines.push('--------------------------------------------------------------------------------');
  lines.push('COLLECTION SUMMARY:');
  lines.push(
    `${'Collection'.padEnd(25)} | ${'Source'.padEnd(8)} | ${'Valid'.padEnd(8)} | ${'Invalid'.padEnd(8)} | ${'Skipped'.padEnd(8)}`
  );
  lines.push('-'.repeat(80));

  report.collections.forEach((c) => {
    lines.push(
      `${c.collection.padEnd(25)} | ${String(c.sourceCount).padEnd(8)} | ${String(c.validCount).padEnd(8)} | ${String(c.invalidCount).padEnd(8)} | ${String(c.skippedCount).padEnd(8)}`
    );
  });

  lines.push('--------------------------------------------------------------------------------');
  lines.push(`Expected Total Inserts:  ${report.totalExpectedInserts}`);
  lines.push(`Unmapped Source Fields:  ${report.unmappedSourceFields.length > 0 ? report.unmappedSourceFields.join(', ') : 'None (100% Mapped)'}`);

  const errors = report.collections.flatMap((c) => c.issues.filter((i) => i.severity === 'error'));
  if (errors.length > 0) {
    lines.push('--------------------------------------------------------------------------------');
    lines.push('VALIDATION ERRORS DETECTED:');
    errors.forEach((err) => {
      lines.push(` - [${err.collection}] ${err.identifier}: ${err.message}${err.path ? ` (path: ${err.path})` : ''}`);
    });
  }

  lines.push('================================================================================');
  return lines.join('\n');
}
