/**
 * about.model.ts — Mongoose Model for Institutional About Page
 *
 * Singleton document storing college history, vision, mission, principal's message,
 * institutional milestones, and accreditation awards.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IPrincipalMessage {
  name: string;
  designation: string;
  qualification?: string;
  image?: string;
  message: string;
  quote?: string;
}

export interface IMilestone {
  year: string;
  event: string;
  description?: string;
}

export interface IAward {
  title: string;
  year?: string;
  issuer?: string;
  description?: string;
  image?: string;
}

export interface IAboutStat {
  label: string;
  value: string;
}

export interface IAboutPage {
  singletonKey: string;
  title: string;
  text1: string;
  text2: string;
  history?: string;
  vision?: string;
  mission?: string[];
  coreValues?: string[];
  principalMessage?: IPrincipalMessage;
  milestones?: IMilestone[];
  awards?: IAward[];
  stats?: IAboutStat[];
  isSeedManaged: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAboutPageDocument extends IAboutPage, Document {}

const aboutPageSchema = new Schema<IAboutPageDocument>(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
      immutable: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    text1: { type: String, required: true },
    text2: { type: String, default: '' },
    history: { type: String, default: '' },
    vision: { type: String, default: '' },
    mission: [{ type: String }],
    coreValues: [{ type: String }],
    principalMessage: {
      name: { type: String, default: '' },
      designation: { type: String, default: '' },
      qualification: { type: String, default: '' },
      image: { type: String, default: '' },
      message: { type: String, default: '' },
      quote: { type: String, default: '' },
    },
    milestones: [
      {
        year: { type: String, required: true },
        event: { type: String, required: true },
        description: { type: String, default: '' },
      },
    ],
    awards: [
      {
        title: { type: String, required: true },
        year: String,
        issuer: String,
        description: String,
        image: String,
      },
    ],
    stats: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
      },
    ],
    isSeedManaged: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: 'about_pages',
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

export const AboutPage: Model<IAboutPageDocument> =
  (mongoose.models.AboutPage as Model<IAboutPageDocument>) ||
  mongoose.model<IAboutPageDocument>('AboutPage', aboutPageSchema, 'about_pages');
