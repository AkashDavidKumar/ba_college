/**
 * placement.model.ts — Mongoose Model for Corporate Placements & Career Statistics
 *
 * Singleton document managing annual placement statistics, corporate recruiters,
 * student success stories, and training curricula.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPlacementStat {
  year: string;
  totalPlaced: number;
  highestPackage: string;
  averagePackage: string;
  placementRate: string;
}

export interface IRecruiter {
  id: string;
  name: string;
  logo: string;
  sector: string;
  hiringCount?: number;
  website?: string;
}

export interface ISuccessStory {
  id: string;
  studentName: string;
  program: string;
  company: string;
  package: string;
  batch: string;
  photo?: string;
  quote?: string;
}

export interface IPlacement {
  singletonKey: string;
  overview: string;
  stats: IPlacementStat[];
  recruiters: IRecruiter[];
  successStories: ISuccessStory[];
  placementProcess: string[];
  trainingPrograms: string[];
  isSeedManaged: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlacementDocument extends IPlacement, Document {}

const placementStatSubSchema = new Schema<IPlacementStat>(
  {
    year: { type: String, required: true },
    totalPlaced: { type: Number, required: true },
    highestPackage: { type: String, required: true },
    averagePackage: { type: String, required: true },
    placementRate: { type: String, required: true },
  },
  { _id: true }
);

const recruiterSubSchema = new Schema<IRecruiter>(
  {
    id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    logo: { type: String, required: true },
    sector: { type: String, required: true },
    hiringCount: Number,
    website: String,
  },
  { _id: true }
);

const successStorySubSchema = new Schema<ISuccessStory>(
  {
    id: { type: String, required: true },
    studentName: { type: String, required: true, trim: true },
    program: { type: String, required: true },
    company: { type: String, required: true },
    package: { type: String, required: true },
    batch: { type: String, required: true },
    photo: String,
    quote: String,
  },
  { _id: true }
);

const placementSchema = new Schema<IPlacementDocument>(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
      immutable: true,
      index: true,
    },
    overview: {
      type: String,
      default: '',
    },
    stats: [placementStatSubSchema],
    recruiters: [recruiterSubSchema],
    successStories: [successStorySubSchema],
    placementProcess: [{ type: String }],
    trainingPrograms: [{ type: String }],
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
    collection: 'placements',
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

export const Placement: Model<IPlacementDocument> =
  (mongoose.models.Placement as Model<IPlacementDocument>) ||
  mongoose.model<IPlacementDocument>('Placement', placementSchema, 'placements');
