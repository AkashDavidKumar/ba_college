/**
 * notice.model.ts — Mongoose Model for College Notices & Circulars
 *
 * Implements:
 *  1. Canonical lowercase unique slug for URL routing.
 *  2. Full governance lifecycle: draft, pending, approved, scheduled, published, rejected, expired, archived.
 *  3. Target audience and academic department scoping.
 *  4. Priority categorization and pinning.
 *  5. Verified attachment URL references.
 *  6. Helper for ObjectId or slug resolution.
 */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ApiError } from '../utils/api-error';

export const NOTICE_CATEGORIES = [
  'General',
  'Examination',
  'Academic',
  'Admissions',
  'Fee',
  'Holiday',
  'Emergency',
] as const;
export type NoticeCategory = (typeof NOTICE_CATEGORIES)[number];

export const NOTICE_PRIORITIES = ['High', 'Medium', 'Low'] as const;
export type NoticePriority = (typeof NOTICE_PRIORITIES)[number];

export const NOTICE_TYPES = ['Circular', 'Notification', 'Order', 'Announcement'] as const;
export type NoticeType = (typeof NOTICE_TYPES)[number];

export const NOTICE_TARGET_AUDIENCES = ['All', 'Students', 'Faculty', 'Staff'] as const;
export type NoticeTargetAudience = (typeof NOTICE_TARGET_AUDIENCES)[number];

export const NOTICE_STATUSES = [
  'draft',
  'pending',
  'approved',
  'scheduled',
  'published',
  'rejected',
  'expired',
  'archived',
] as const;
export type NoticeStatus = (typeof NOTICE_STATUSES)[number];

export interface INoticeAuthor {
  userId: Types.ObjectId;
  name: string;
  role: string;
  departmentId?: string;
}

export interface INoticeReviewer {
  userId: Types.ObjectId;
  name: string;
  role: string;
  reviewedAt: Date;
}

export interface INotice {
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category: NoticeCategory;
  noticeType: NoticeType;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  departmentId?: string; // null or "all" for global institutional; specific slug for academic dept
  status: NoticeStatus;
  publishAt: Date;
  expiresAt?: Date;
  isPinned: boolean;
  attachmentUrl?: string;
  attachmentName?: string;
  author: INoticeAuthor;
  reviewer?: INoticeReviewer;
  rejectionReason?: string;
  viewsCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface INoticeDocument extends INotice, Document {}

export type INoticeModel = Model<INoticeDocument>;

const authorSubSchema = new Schema<INoticeAuthor>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    departmentId: { type: String, trim: true, lowercase: true },
  },
  { _id: false }
);

const reviewerSubSchema = new Schema<INoticeReviewer>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    reviewedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const noticeSchema = new Schema<INoticeDocument, INoticeModel>(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
      maxlength: [300, 'Notice title cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Notice slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'],
    },
    content: {
      type: String,
      required: [true, 'Notice content is required'],
      trim: true,
      maxlength: [20000, 'Content cannot exceed 20000 characters'],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [600, 'Summary cannot exceed 600 characters'],
    },
    category: {
      type: String,
      required: [true, 'Notice category is required'],
      enum: {
        values: NOTICE_CATEGORIES,
        message: 'Invalid notice category: {VALUE}',
      },
      default: 'General',
    },
    noticeType: {
      type: String,
      required: [true, 'Notice type is required'],
      enum: {
        values: NOTICE_TYPES,
        message: 'Invalid notice type: {VALUE}',
      },
      default: 'Circular',
    },
    priority: {
      type: String,
      required: [true, 'Priority is required'],
      enum: {
        values: NOTICE_PRIORITIES,
        message: 'Invalid priority: {VALUE}',
      },
      default: 'Medium',
    },
    targetAudience: {
      type: String,
      required: [true, 'Target audience is required'],
      enum: {
        values: NOTICE_TARGET_AUDIENCES,
        message: 'Invalid target audience: {VALUE}',
      },
      default: 'All',
    },
    departmentId: {
      type: String,
      trim: true,
      lowercase: true,
      default: null,
    },
    status: {
      type: String,
      required: [true, 'Notice status is required'],
      enum: {
        values: NOTICE_STATUSES,
        message: 'Invalid status: {VALUE}',
      },
      default: 'draft',
    },
    publishAt: {
      type: Date,
      required: [true, 'Publication date is required'],
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      trim: true,
      default: null,
    },
    attachmentName: {
      type: String,
      trim: true,
      default: null,
    },
    author: {
      type: authorSubSchema,
      required: true,
    },
    reviewer: {
      type: reviewerSubSchema,
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
    viewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: 'notices',
  }
);

// Compound indexes
noticeSchema.index({ status: 1, publishAt: -1, isPinned: -1 });
noticeSchema.index({ departmentId: 1, status: 1 });
noticeSchema.index({ category: 1, status: 1 });
noticeSchema.index({ isPinned: -1, publishAt: -1 });
noticeSchema.index({ expiresAt: 1 }, { sparse: true });

/**
 * Resolves a Notice document by either its 24-char hex ObjectId or canonical slug.
 */
export async function resolveNoticeDocument(
  identifier: string,
  extraFilter: Record<string, unknown> = {}
): Promise<INoticeDocument> {
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const filter = isObjectId
    ? { _id: new Types.ObjectId(identifier), ...extraFilter }
    : { slug: identifier.toLowerCase().trim(), ...extraFilter };

  const notice = await Notice.findOne(filter);
  if (!notice) {
    throw ApiError.notFound(`Notice with identifier "${identifier}" not found`);
  }
  return notice;
}

export const Notice = mongoose.model<INoticeDocument, INoticeModel>('Notice', noticeSchema);
