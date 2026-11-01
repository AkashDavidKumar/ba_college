/**
 * seed-cms-database.ts — Entrypoint wrapper conforming to phase3_implementation_plan Section 7.1
 */
import { runMigrationCli } from './migrate';

void runMigrationCli();
