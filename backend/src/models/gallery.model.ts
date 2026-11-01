/**
 * gallery.model.ts — Mongoose Model for Campus Photo Albums and Video Links
 *
 * Singleton document managing curated photo albums and campus video links
 * consumed by both gallery-dashboard.tsx and site-context.tsx.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGalleryPhoto {
  id?: string;
  url: string;
  caption?: string;
}

export interface IGalleryAlbum {
  id: string;
  title: string;
  category: string;
  coverImage?: string;
  image?: string; // alias for frontend compatibility
  count?: number;
  date?: string;
  photos?: IGalleryPhoto[];
}

export interface IGalleryVideo {
  id: string;
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  duration?: string;
}

export interface IGalleryData {
  singletonKey: string;
  albums: IGalleryAlbum[];
  videos: IGalleryVideo[];
  isSeedManaged: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGalleryDataDocument extends IGalleryData, Document {}

const galleryPhotoSubSchema = new Schema<IGalleryPhoto>(
  {
    id: String,
    url: { type: String, required: true },
    caption: String,
  },
  { _id: true }
);

const galleryAlbumSubSchema = new Schema<IGalleryAlbum>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    coverImage: String,
    image: String,
    count: { type: Number, default: 0 },
    date: String,
    photos: [galleryPhotoSubSchema],
  },
  { _id: true }
);

const galleryVideoSubSchema = new Schema<IGalleryVideo>(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    url: { type: String, required: true },
    thumbnail: String,
    description: String,
    duration: String,
  },
  { _id: true }
);

const galleryDataSchema = new Schema<IGalleryDataDocument>(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
      immutable: true,
      index: true,
    },
    albums: [galleryAlbumSubSchema],
    videos: [galleryVideoSubSchema],
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
    collection: 'gallery_data',
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

export const GalleryData: Model<IGalleryDataDocument> =
  (mongoose.models.GalleryData as Model<IGalleryDataDocument>) ||
  mongoose.model<IGalleryDataDocument>('GalleryData', galleryDataSchema, 'gallery_data');
