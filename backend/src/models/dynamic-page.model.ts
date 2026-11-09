/**
 * dynamic-page.model.ts — Dynamic Page Builder Mongoose Model
 *
 * Implements:
 *  1. Structured dynamic page document storage supporting 11+ content block types.
 *  2. SEO metadata, page types, and banner image URLs.
 *  3. Publication status lifecycle (draft, submitted, pending, approved, published, archived).
 *  4. Scoping fields for academic departments (departmentId) and campus clubs (clubId).
 *  5. Version tracking, actor attribution, and slug indexing.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export const PAGE_TYPES = [
  'standard',
  'landing',
  'department',
  'club',
  'academic',
  'department_custom',
  'club_custom',
] as const;
export type PageType = (typeof PAGE_TYPES)[number];

export const BLOCK_TYPES = [
  'heading',
  'text',
  'rich_text',
  'image',
  'gallery',
  'video',
  'cards',
  'stats',
  'faq',
  'table',
  'documents',
  'events',
  'faculty',
  'courses',
  'contact',
  'cta',
  'timeline',
] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const PAGE_STATUSES = [
  'draft',
  'submitted',
  'pending',
  'under_review',
  'approved',
  'published',
  'rejected',
  'archived',
] as const;
export type PageStatus = (typeof PAGE_STATUSES)[number];

export interface IPageBlock {
  id: string;
  type: BlockType;
  content: Record<string, unknown>;
  order: number;
  visible: boolean;
}

export interface IPageSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  robots?: string;
}

export interface IDynamicPage {
  title: string;
  slug: string;
  parentMenuId?: string;
  pageType: PageType;
  description?: string;
  bannerImage?: string;
  blocks: IPageBlock[];
  seo: IPageSeo;
  status: PageStatus;
  departmentId?: string;
  clubId?: string;
  authorId?: string;
  authorName?: string;
  createdBy?: string;
  updatedBy?: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDynamicPageDocument extends IDynamicPage, Document {}

const pageBlockSchema = new Schema<IPageBlock>(
  {
    id: { type: String, required: true },
    type: { type: String, enum: BLOCK_TYPES, required: true },
    content: { type: Schema.Types.Mixed, default: {} },
    order: { type: Number, default: 0 },
    visible: { type: Boolean, default: true },
  },
  { _id: false }
);

const pageSeoSchema = new Schema<IPageSeo>(
  {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    keywords: [{ type: String }],
    canonicalUrl: { type: String },
    ogTitle: { type: String },
    ogDescription: { type: String },
    ogImage: { type: String },
    robots: { type: String },
  },
  { _id: false }
);

const dynamicPageSchema = new Schema<IDynamicPageDocument>(
  {
    title: {
      type: String,
      required: [true, 'Page title is required'],
      trim: true,
      maxlength: [200, 'Page title cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Page slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be URL-safe (lowercase alphanumeric with hyphens)'],
    },
    parentMenuId: {
      type: String,
      trim: true,
    },
    pageType: {
      type: String,
      enum: PAGE_TYPES,
      default: 'standard',
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    bannerImage: {
      type: String,
      trim: true,
      default: '',
    },
    blocks: {
      type: [pageBlockSchema],
      default: [],
    },
    seo: {
      type: pageSeoSchema,
      default: () => ({}),
    },
    status: {
      type: String,
      enum: PAGE_STATUSES,
      default: 'draft',
      index: true,
    },
    departmentId: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    clubId: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    authorId: {
      type: String,
      trim: true,
      index: true,
    },
    authorName: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    collection: 'dynamic_pages',
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

dynamicPageSchema.index({ status: 1, updatedAt: -1 });
dynamicPageSchema.index({ departmentId: 1, status: 1 });
dynamicPageSchema.index({ clubId: 1, status: 1 });
dynamicPageSchema.index({ createdAt: -1 });

export const DynamicPage: Model<IDynamicPageDocument> =
  (mongoose.models.DynamicPage as Model<IDynamicPageDocument>) ||
  mongoose.model<IDynamicPageDocument>('DynamicPage', dynamicPageSchema, 'dynamic_pages');
