/**
 * event.model.ts — Mongoose Model for Campus Events
 *
 * Stores campus conferences, workshops, cultural festivals, and seminars
 * with embedded session schedules and session-specific speakers.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ISessionSpeaker {
  name: string;
  designation?: string;
  organization?: string;
  photo?: string;
  bio?: string;
}

export interface IEventScheduleItem {
  time: string;
  activity: string;
  speaker?: string;
}

export interface IEvent {
  slug: string;
  title: string;
  category: string;
  startDate: Date;
  endDate?: Date;
  date?: string;
  time?: string;
  venue: string;
  description: string;
  coverImage?: string;
  registrationUrl?: string;
  registrationDeadline?: Date;
  isFeatured: boolean;
  speakers: ISessionSpeaker[];
  schedule: IEventScheduleItem[];
  clubId?: string;
  departmentSlug?: string;
  isSeedManaged: boolean;
  isActive: boolean;
  isArchived: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventDocument extends IEvent, Document {}

const sessionSpeakerSubSchema = new Schema<ISessionSpeaker>(
  {
    name: { type: String, required: true, trim: true },
    designation: String,
    organization: String,
    photo: String,
    bio: String,
  },
  { _id: true }
);

const eventScheduleSubSchema = new Schema<IEventScheduleItem>(
  {
    time: { type: String, required: true },
    activity: { type: String, required: true },
    speaker: String,
  },
  { _id: true }
);

const eventSchema = new Schema<IEventDocument>(
  {
    slug: {
      type: String,
      required: [true, 'Event slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Event title is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Event category is required'],
      trim: true,
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },
    endDate: Date,
    date: String,
    time: String,
    venue: {
      type: String,
      required: [true, 'Venue is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    coverImage: String,
    registrationUrl: String,
    registrationDeadline: Date,
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    speakers: [sessionSpeakerSubSchema],
    schedule: [eventScheduleSubSchema],
    clubId: {
      type: String,
      trim: true,
      index: true,
    },
    departmentSlug: {
      type: String,
      trim: true,
      lowercase: true,
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
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'events',
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

eventSchema.index({ startDate: -1, isActive: 1 });
eventSchema.index({ isActive: 1, isArchived: 1, startDate: 1 });
eventSchema.index({ clubId: 1, isActive: 1 });
eventSchema.index({ departmentSlug: 1, isActive: 1 });

export const Event: Model<IEventDocument> =
  (mongoose.models.Event as Model<IEventDocument>) ||
  mongoose.model<IEventDocument>('Event', eventSchema, 'events');
