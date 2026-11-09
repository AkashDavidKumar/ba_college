/**
 * media-asset.model.ts — Mongoose Model for Media Library (Metadata & External URL Management)
 *
 * Implements:
 *  1. Pure metadata and external URL storage (no file uploads, no binary/base64 storage).
 *  2. Media categorization (image, video, document, audio, other).
 *  3. Folder / category taxonomy for CMS asset management.
 *  4. Scoped departmental and club ownership for multi-role RBAC.
 *  5. Compound and text indexes for fast search, filtering, and pagination.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export const MEDIA_TYPES = ['image', 'video', 'document', 'audio', 'other'] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];

export const MEDIA_STATUSES = ['active', 'archived'] as const;
export type MediaStatus = (typeof MEDIA_STATUSES)[number];

export interface IMediaAsset {
  title: string;
  altText: string;
  description?: string;
  mediaType: MediaType;
  url: string;
  thumbnailUrl?: string;
  mimeType?: string;
  fileName?: string;
  fileSize?: number; // size in bytes (optional metadata)
  width?: number; // image/video width in px
  height?: number; // image/video height in px
  folder: string; // folder / category, e.g. 'Campus Life', 'Academics', 'Infrastructure'
  tags: string[];
  status: MediaStatus;
  departmentId?: string;
  clubId?: string;
  createdBy?: mongoose.Types.ObjectId | string;
  updatedBy?: mongoose.Types.ObjectId | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IMediaAssetDocument extends IMediaAsset, Document {}

export type IMediaAssetModel = Model<IMediaAssetDocument>;

const mediaAssetSchema = new Schema<IMediaAssetDocument, IMediaAssetModel>(
  {
    title: {
      type: String,
      required: [true, 'Asset title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    altText: {
      type: String,
      required: [true, 'Alt text is required for accessibility'],
      trim: true,
      maxlength: [250, 'Alt text cannot exceed 250 characters'],
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    mediaType: {
      type: String,
      enum: {
        values: MEDIA_TYPES,
        message: 'Invalid mediaType: {VALUE}',
      },
      required: [true, 'Media type is required'],
      default: 'image',
    },
    url: {
      type: String,
      required: [true, 'External media URL is required'],
      trim: true,
      maxlength: [1000, 'Media URL cannot exceed 1000 characters'],
    },
    thumbnailUrl: {
      type: String,
      trim: true,
      maxlength: [1000, 'Thumbnail URL cannot exceed 1000 characters'],
      default: undefined,
    },
    mimeType: {
      type: String,
      trim: true,
      maxlength: [100, 'MIME type cannot exceed 100 characters'],
      default: undefined,
    },
    fileName: {
      type: String,
      trim: true,
      maxlength: [255, 'Filename cannot exceed 255 characters'],
      default: undefined,
    },
    fileSize: {
      type: Number,
      min: [0, 'File size cannot be negative'],
      default: undefined,
    },
    width: {
      type: Number,
      min: [0, 'Width cannot be negative'],
      default: undefined,
    },
    height: {
      type: Number,
      min: [0, 'Height cannot be negative'],
      default: undefined,
    },
    folder: {
      type: String,
      trim: true,
      maxlength: [100, 'Folder name cannot exceed 100 characters'],
      default: 'General',
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: {
        values: MEDIA_STATUSES,
        message: 'Invalid status: {VALUE}',
      },
      default: 'active',
    },
    departmentId: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    clubId: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, unknown>) => {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        delete ret['__v'];
        return ret;
      },
    },
  }
);

// Indexes for high-frequency admin and public filtering
mediaAssetSchema.index({ mediaType: 1, status: 1 });
mediaAssetSchema.index({ folder: 1, status: 1 });
mediaAssetSchema.index({ departmentId: 1, status: 1 });
mediaAssetSchema.index({ clubId: 1, status: 1 });
mediaAssetSchema.index({ createdAt: -1 });

// Text index for search across title, description, tags, and filename
mediaAssetSchema.index({
  title: 'text',
  description: 'text',
  fileName: 'text',
  tags: 'text',
});

export const MediaAsset =
  mongoose.models['MediaAsset'] ||
  mongoose.model<IMediaAssetDocument, IMediaAssetModel>('MediaAsset', mediaAssetSchema);
