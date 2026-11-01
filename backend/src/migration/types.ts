/**
 * types.ts — TypeScript Interfaces for Bishop Ambrose College Migration & Seeding System
 */
export interface RawSourceData {
  logo?: Record<string, unknown>;
  hero?: Record<string, unknown>;
  heroSection?: Record<string, unknown>;
  announcements?: Array<Record<string, unknown>>;
  about?: Record<string, unknown>;
  footer?: Record<string, unknown>;
  departments?: Array<Record<string, unknown>>;
  events?: Array<Record<string, unknown>>;
  guestSpeakers?: Array<Record<string, unknown>>;
  eventGallery?: Array<Record<string, unknown>>;
  erpModules?: Array<Record<string, unknown>>;
  admissionsPortalFeatures?: Array<Record<string, unknown>>;
  admissionsApplications?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface MappedEntities {
  siteContent: Record<string, unknown>;
  aboutPage: Record<string, unknown>;
  departments: Array<Record<string, unknown>>;
  courses: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
  guestSpeakers: Array<Record<string, unknown>>;
  galleryData: Record<string, unknown>;
  newsArticles: Array<Record<string, unknown>>;
  iqacDossier: Record<string, unknown>;
  admissionsApplications: Array<Record<string, unknown>>;
  facilities: Array<Record<string, unknown>>;
  placement: Record<string, unknown>;
  contactInfo: Record<string, unknown>;
  contactEnquiries: Array<Record<string, unknown>>;
}

export interface DryRunValidationIssue {
  collection: string;
  identifier: string;
  path?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface CollectionDryRunSummary {
  collection: string;
  sourceCount: number;
  validCount: number;
  invalidCount: number;
  skippedCount: number;
  issues: DryRunValidationIssue[];
}

export interface DryRunReport {
  timestamp: string;
  sourceFile: string;
  sourceFileSize: number;
  overallStatus: 'PASS' | 'FAIL';
  collections: CollectionDryRunSummary[];
  unmappedSourceFields: string[];
  totalExpectedInserts: number;
  totalExpectedUpdates: number;
  totalSkipped: number;
  sensitiveRecordsDetected: number;
  sensitiveRecordsExcluded: number;
}

export interface ConflictRecord {
  collection: string;
  naturalKey: string;
  naturalKeyValue: string;
  reason: 'MANUAL_RECORD_PRESERVED' | 'ADMIN_CUSTOMIZED_RECORD' | 'COLLISION_DETECTED';
  action: 'SKIP' | 'FAIL' | 'UPDATE';
  details: string;
}

export interface PreflightReport {
  timestamp: string;
  databaseUriRedacted: string;
  connected: boolean;
  accessibleCollections: string[];
  conflicts: ConflictRecord[];
  readyForMigration: boolean;
}

export interface BackupCollectionMetadata {
  collection: string;
  fileName: string;
  documentCount: number;
  fileSizeBytes: number;
  sha256Hash: string;
}

export interface BackupMetadata {
  timestamp: string;
  backupDir: string;
  collections: BackupCollectionMetadata[];
  totalDocuments: number;
  totalSizeBytes: number;
  nodeVersion: string;
  gitCommit?: string;
}

export interface MigrationExecutionResult {
  timestamp: string;
  success: boolean;
  backupVerified: boolean;
  backupDir: string;
  collectionsProcessed: Array<{
    collection: string;
    inserted: number;
    updated: number;
    skipped: number;
  }>;
  totalWritten: number;
  durationMs: number;
  error?: string;
}

export interface RestoreResult {
  timestamp: string;
  success: boolean;
  backupDir: string;
  collectionsRestored: Array<{
    collection: string;
    restoredCount: number;
  }>;
  durationMs: number;
  error?: string;
}
