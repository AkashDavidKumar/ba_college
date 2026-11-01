/**
 * guest-speaker.model.ts — Mongoose Model for Notable Campus Guest Lecturers
 *
 * Stores distinguished campus guest speakers returned in the /api/events bundle.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IGuestSpeaker {
  name: string;
  role: string;
  topic?: string;
  image?: string;
  date?: string;
  order: number;
  isSeedManaged: boolean;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IGuestSpeakerDocument extends IGuestSpeaker, Document {}

const guestSpeakerSchema = new Schema<IGuestSpeakerDocument>(
  {
    name: {
      type: String,
      required: [true, 'Speaker name is required'],
      trim: true,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Speaker role is required'],
      trim: true,
    },
    topic: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    date: {
      type: String,
      default: '',
      trim: true,
    },
    order: {
      type: Number,
      default: 0,
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
    collection: 'guest_speakers',
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

guestSpeakerSchema.index({ isActive: 1, order: 1 });

export const GuestSpeaker: Model<IGuestSpeakerDocument> =
  (mongoose.models.GuestSpeaker as Model<IGuestSpeakerDocument>) ||
  mongoose.model<IGuestSpeakerDocument>('GuestSpeaker', guestSpeakerSchema, 'guest_speakers');
