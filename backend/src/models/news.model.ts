/**
 * news.model.ts — Mongoose Model for Campus News & Press Releases
 *
 * Stores campus news articles, press releases, faculty/student achievements,
 * and news display configuration.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface INewsAuthor {
  name: string;
  role?: string;
  avatar?: string;
}

export interface INewsArticle {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: INewsAuthor;
  publishDate: Date;
  readTime?: string;
  coverImage?: string;
  isFeatured: boolean;
  status: 'draft' | 'published' | 'archived';
  isSeedManaged: boolean;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface INewsArticleDocument extends INewsArticle, Document {}

const newsAuthorSubSchema = new Schema<INewsAuthor>(
  {
    name: { type: String, required: true, trim: true },
    role: String,
    avatar: String,
  },
  { _id: false }
);

const newsArticleSchema = new Schema<INewsArticleDocument>(
  {
    slug: {
      type: String,
      required: [true, 'News slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      index: true,
    },
    author: {
      type: newsAuthorSubSchema,
      required: true,
    },
    publishDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    readTime: {
      type: String,
      default: '3 min read',
    },
    coverImage: String,
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'archived'],
      default: 'published',
      index: true,
    },
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
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'news_articles',
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

newsArticleSchema.index({ publishDate: -1, status: 1 });
newsArticleSchema.index({ isActive: 1, isFeatured: 1 });

export const NewsArticle: Model<INewsArticleDocument> =
  (mongoose.models.NewsArticle as Model<INewsArticleDocument>) ||
  mongoose.model<INewsArticleDocument>('NewsArticle', newsArticleSchema, 'news_articles');
