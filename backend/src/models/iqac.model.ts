/**
 * iqac.model.ts — Mongoose Model for IQAC Accreditation & Quality Dossier
 *
 * Singleton document managing NAAC accreditation metrics, AQAR reports,
 * SSR data, SSS surveys, committee rosters, and document download counters.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IIQACStats {
  naacGrade?: string;
  cycle?: string;
  cgpa?: string;
  establishedYear?: string;
  nirfRankBand?: string;
  isoCertification?: string;
}

export interface IIQACCriterion {
  id: string;
  name: string;
  score?: string;
  status?: string;
  keyMetrics?: Array<{ label: string; value: string }>;
}

export interface IAQARReport {
  id: string;
  year: string;
  fileUrl?: string;
  downloadCount: number;
  status?: string;
}

export interface ISSRItem {
  criterion: string;
  title: string;
  fileUrl?: string;
  downloadCount: number;
}

export interface ISSSItem {
  year: string;
  responsesCount?: number;
  satisfactionRate?: string;
  fileUrl?: string;
  downloadCount: number;
}

export interface IIQACCommitteeMember {
  name: string;
  designation: string;
  role: string;
  department?: string;
}

export interface IIQACInitiative {
  title: string;
  description: string;
  date?: string;
  impact?: string;
}

export interface IIQACDownloadItem {
  id: string;
  section: string;
  title: string;
  fileUrl?: string;
  downloadCount: number;
}

export interface IIQACDossier {
  singletonKey: string;
  stats: IIQACStats;
  criteria: IIQACCriterion[];
  aqarReports: IAQARReport[];
  ssrDossier: ISSRItem[];
  sssDossier: ISSSItem[];
  committee: IIQACCommitteeMember[];
  initiatives: IIQACInitiative[];
  downloads: IIQACDownloadItem[];
  isSeedManaged: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IIQACDossierDocument extends IIQACDossier, Document {}

const iqacCriterionSubSchema = new Schema<IIQACCriterion>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    score: String,
    status: String,
    keyMetrics: [
      {
        label: String,
        value: String,
      },
    ],
  },
  { _id: true }
);

const aqarReportSubSchema = new Schema<IAQARReport>(
  {
    id: { type: String, required: true },
    year: { type: String, required: true },
    fileUrl: String,
    downloadCount: { type: Number, default: 0 },
    status: { type: String, default: 'Published' },
  },
  { _id: true }
);

const ssrItemSubSchema = new Schema<ISSRItem>(
  {
    criterion: { type: String, required: true },
    title: { type: String, required: true },
    fileUrl: String,
    downloadCount: { type: Number, default: 0 },
  },
  { _id: true }
);

const sssItemSubSchema = new Schema<ISSSItem>(
  {
    year: { type: String, required: true },
    responsesCount: Number,
    satisfactionRate: String,
    fileUrl: String,
    downloadCount: { type: Number, default: 0 },
  },
  { _id: true }
);

const iqacCommitteeSubSchema = new Schema<IIQACCommitteeMember>(
  {
    name: { type: String, required: true },
    designation: { type: String, required: true },
    role: { type: String, required: true },
    department: String,
  },
  { _id: true }
);

const iqacInitiativeSubSchema = new Schema<IIQACInitiative>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: String,
    impact: String,
  },
  { _id: true }
);

const iqacDownloadItemSubSchema = new Schema<IIQACDownloadItem>(
  {
    id: { type: String, required: true },
    section: { type: String, required: true },
    title: { type: String, required: true },
    fileUrl: String,
    downloadCount: { type: Number, default: 0 },
  },
  { _id: true }
);

const iqacDossierSchema = new Schema<IIQACDossierDocument>(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
      immutable: true,
      index: true,
    },
    stats: {
      naacGrade: { type: String, default: 'A+' },
      cycle: { type: String, default: 'Cycle 3' },
      cgpa: { type: String, default: '3.42' },
      establishedYear: { type: String, default: '2004' },
      nirfRankBand: { type: String, default: 'Rank-band 101-150' },
      isoCertification: { type: String, default: 'ISO 9001:2015' },
    },
    criteria: [iqacCriterionSubSchema],
    aqarReports: [aqarReportSubSchema],
    ssrDossier: [ssrItemSubSchema],
    sssDossier: [sssItemSubSchema],
    committee: [iqacCommitteeSubSchema],
    initiatives: [iqacInitiativeSubSchema],
    downloads: [iqacDownloadItemSubSchema],
    isSeedManaged: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'iqac_dossiers',
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

export const IQACDossier: Model<IIQACDossierDocument> =
  (mongoose.models.IQACDossier as Model<IIQACDossierDocument>) ||
  mongoose.model<IIQACDossierDocument>('IQACDossier', iqacDossierSchema, 'iqac_dossiers');
