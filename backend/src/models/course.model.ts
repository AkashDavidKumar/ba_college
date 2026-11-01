/**
 * course.model.ts — Mongoose Model for Academic Degree Programmes (Courses)
 *
 * Authoritative collection storing undergraduate, postgraduate, doctoral,
 * and certification courses. Referenced by Department via departmentSlug.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export type CourseLevel = 'UG' | 'PG' | 'Doctoral' | 'Certificate';
export const COURSE_LEVELS: CourseLevel[] = ['UG', 'PG', 'Doctoral', 'Certificate'];

export interface ICourse {
  slug: string;
  name: string;
  code?: string;
  level: CourseLevel;
  department: string;
  departmentSlug: string;
  duration: string;
  durationYears?: number;
  eligibility: string;
  fees?: string;
  intake?: number;
  description: string;
  curriculum?: string;
  admissionInfo?: string;
  syllabusPdfUrl?: string;
  published: boolean;
  isActive: boolean;
  isSeedManaged: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICourseDocument extends ICourse, Document {}

const courseSchema = new Schema<ICourseDocument>(
  {
    slug: {
      type: String,
      required: [true, 'Course slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Course name is required'],
      trim: true,
    },
    code: {
      type: String,
      trim: true,
      uppercase: true,
    },
    level: {
      type: String,
      enum: {
        values: COURSE_LEVELS,
        message: 'Invalid level: {VALUE}. Must be UG, PG, Doctoral, or Certificate',
      },
      required: [true, 'Course level is required'],
      index: true,
    },
    department: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    departmentSlug: {
      type: String,
      required: [true, 'Department slug is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    duration: {
      type: String,
      required: [true, 'Course duration is required'],
      trim: true,
    },
    durationYears: Number,
    eligibility: {
      type: String,
      required: [true, 'Eligibility criteria is required'],
    },
    fees: String,
    intake: {
      type: Number,
      default: 60,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    curriculum: String,
    admissionInfo: String,
    syllabusPdfUrl: String,
    published: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isSeedManaged: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'courses',
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

courseSchema.index({ departmentSlug: 1, level: 1 });
courseSchema.index({ published: 1, isActive: 1 });

export const Course: Model<ICourseDocument> =
  (mongoose.models.Course as Model<ICourseDocument>) ||
  mongoose.model<ICourseDocument>('Course', courseSchema, 'courses');
