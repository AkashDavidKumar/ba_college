/**
 * iqac.validation.ts — Strict Zod validation schemas for IQACDossier
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const iqacStatsSchema = z
  .object({
    naacGrade: z.string().trim().max(50).optional(),
    cycle: z.string().trim().max(50).optional(),
    cgpa: z.string().trim().max(20).optional(),
    establishedYear: z.string().trim().max(20).optional(),
    nirfRankBand: z.string().trim().max(100).optional(),
    isoCertification: z.string().trim().max(100).optional(),
  })
  .strict();

export const iqacCriterionSchema = z
  .object({
    id: z.string().trim().min(1).max(50),
    name: z.string().trim().min(1).max(200),
    score: z.string().trim().max(50).optional(),
    status: z.string().trim().max(50).optional(),
    keyMetrics: z
      .array(
        z
          .object({
            label: z.string().trim().min(1).max(150),
            value: z.string().trim().min(1).max(100),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

export const aqarReportSchema = z
  .object({
    id: z.string().trim().min(1).max(50),
    year: z.string().trim().min(1).max(50),
    fileUrl: httpsUrlSchema.optional(),
    downloadCount: z.number().nonnegative().optional().default(0),
    status: z.string().trim().max(50).optional().default('Published'),
  })
  .strict();

export const ssrItemSchema = z
  .object({
    criterion: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(200),
    fileUrl: httpsUrlSchema.optional(),
    downloadCount: z.number().nonnegative().optional().default(0),
  })
  .strict();

export const sssItemSchema = z
  .object({
    year: z.string().trim().min(1).max(50),
    responsesCount: z.number().nonnegative().optional(),
    satisfactionRate: z.string().trim().max(50).optional(),
    fileUrl: httpsUrlSchema.optional(),
    downloadCount: z.number().nonnegative().optional().default(0),
  })
  .strict();

export const iqacCommitteeMemberSchema = z
  .object({
    name: z.string().trim().min(1).max(150),
    designation: z.string().trim().min(1).max(150),
    role: z.string().trim().min(1).max(100),
    department: z.string().trim().max(150).optional(),
  })
  .strict();

export const iqacInitiativeSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().min(1).max(2000),
    date: z.string().trim().max(100).optional(),
    impact: z.string().trim().max(1000).optional(),
  })
  .strict();

export const iqacDownloadItemSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    section: z.string().trim().min(1).max(100),
    title: z.string().trim().min(1).max(200),
    fileUrl: httpsUrlSchema.optional(),
    downloadCount: z.number().nonnegative().optional().default(0),
  })
  .strict();

export const updateIQACDossierSchema = z
  .object({
    stats: iqacStatsSchema.optional(),
    criteria: z.array(iqacCriterionSchema).optional(),
    aqarReports: z.array(aqarReportSchema).optional(),
    ssrDossier: z.array(ssrItemSchema).optional(),
    sssDossier: z.array(sssItemSchema).optional(),
    committee: z.array(iqacCommitteeMemberSchema).optional(),
    initiatives: z.array(iqacInitiativeSchema).optional(),
    downloads: z.array(iqacDownloadItemSchema).optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateIQACDossierInput = z.infer<typeof updateIQACDossierSchema>;
