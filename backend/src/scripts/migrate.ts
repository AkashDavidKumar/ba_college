/**
 * migrate.ts — Command-Line Interface for Bishop Ambrose College Migration & Seeding System
 *
 * Supported Commands & Flags:
 *   --dry-run                    Execute 100% offline validation (zero MongoDB connections)
 *   --preflight                  Run read-only database preflight and conflict detection
 *   --execute                    Run full migration (requires --confirm)
 *   --restore                    Restore database from a backup (requires --confirm and --backup-dir)
 *   --confirm                    Explicit confirmation flag required for database mutations
 *   --source=<path>              Optional path to alternative cms-database.json
 *   --backup-dir=<path>          Target directory for restore
 *   --overwrite-customized       Allow overwriting records customized by administrators (isSeedManaged=false)
 *   --include-sample-admissions  Local sandbox flag allowing import of sample admissions records
 */
import 'dotenv/config';
import {
  executeDryRun,
  formatDryRunReport,
  runPreflightChecks,
  formatPreflightReport,
  executeMigration,
  formatMigrationResult,
  restoreFromBackup,
  formatRestoreResult,
} from '../migration';
import { disconnectDatabase } from '../config/database';

function parseArgs(args: string[]) {
  const flags = {
    dryRun: false,
    preflight: false,
    execute: false,
    restore: false,
    confirm: false,
    overwriteCustomized: false,
    includeSampleAdmissions: false,
    sourcePath: undefined as string | undefined,
    backupDir: undefined as string | undefined,
  };

  for (const arg of args) {
    if (arg === '--dry-run') flags.dryRun = true;
    else if (arg === '--preflight') flags.preflight = true;
    else if (arg === '--execute') flags.execute = true;
    else if (arg === '--restore') flags.restore = true;
    else if (arg === '--confirm') flags.confirm = true;
    else if (arg === '--overwrite-customized') flags.overwriteCustomized = true;
    else if (arg === '--include-sample-admissions') flags.includeSampleAdmissions = true;
    else if (arg.startsWith('--source=')) flags.sourcePath = arg.split('=')[1];
    else if (arg.startsWith('--backup-dir=')) flags.backupDir = arg.split('=')[1];
  }

  return flags;
}

async function main() {
  const flags = parseArgs(process.argv.slice(2));

  // 1. Dry Run Mode (Default if no action specified or if --dry-run is set)
  if (flags.dryRun || (!flags.preflight && !flags.execute && !flags.restore)) {
    try {
      const report = executeDryRun({ sourceFilePath: flags.sourcePath });
      console.log(formatDryRunReport(report));
      process.exit(report.overallStatus === 'PASS' ? 0 : 1);
    } catch (err: unknown) {
      console.error('[Dry-Run Error]:', err instanceof Error ? err.message : String(err));
      process.exit(1);
    }
  }

  // 2. Preflight Mode
  if (flags.preflight) {
    try {
      const report = await runPreflightChecks({
        overwriteCustomized: flags.overwriteCustomized,
      });
      console.log(formatPreflightReport(report));
      await disconnectDatabase();
      process.exit(report.readyForMigration ? 0 : 1);
    } catch (err: unknown) {
      console.error('[Preflight Error]:', err instanceof Error ? err.message : String(err));
      await disconnectDatabase();
      process.exit(1);
    }
  }

  // 3. Restore Mode
  if (flags.restore) {
    if (!flags.backupDir) {
      console.error('[Restore Error]: --backup-dir=<path> is required when running --restore.');
      process.exit(1);
    }
    if (!flags.confirm) {
      console.error(
        '[Restore Error]: --confirm is strictly required to restore database state.\n' +
          'Usage: npm run migrate:restore -- --backup-dir=<dir> --confirm'
      );
      process.exit(1);
    }

    try {
      const result = await restoreFromBackup({
        backupDir: flags.backupDir,
        confirm: flags.confirm,
      });
      console.log(formatRestoreResult(result));
      await disconnectDatabase();
      process.exit(result.success ? 0 : 1);
    } catch (err: unknown) {
      console.error('[Restore Error]:', err instanceof Error ? err.message : String(err));
      await disconnectDatabase();
      process.exit(1);
    }
  }

  // 4. Execute Migration Mode
  if (flags.execute) {
    if (!flags.confirm) {
      console.error(
        '[Migration Error]: --confirm is strictly required to execute database mutations.\n' +
          'Usage: npm run migrate:execute -- --confirm'
      );
      process.exit(1);
    }

    try {
      const result = await executeMigration({
        confirm: flags.confirm,
        sourceFilePath: flags.sourcePath,
        overwriteCustomized: flags.overwriteCustomized,
        includeSampleAdmissions: flags.includeSampleAdmissions,
        customBackupDir: flags.backupDir,
      });
      console.log(formatMigrationResult(result));
      await disconnectDatabase();
      process.exit(result.success ? 0 : 1);
    } catch (err: unknown) {
      console.error('[Migration Error]:', err instanceof Error ? err.message : String(err));
      await disconnectDatabase();
      process.exit(1);
    }
  }
}

export async function runMigrationCli(): Promise<void> {
  return main();
}

if (require.main === module) {
  main();
}
