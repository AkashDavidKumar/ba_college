/**
 * facility.model.ts — Mongoose Model for Campus Infrastructure & Amenities
 *
 * Stores campus laboratories, central library, sports complex, residential hostels,
 * and transportation fleet managed via facilities-dashboard.tsx.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFacility {
  name: string;
  category: string;
  description: string;
  amenities: string[];
  images: string[];
  details?: string;
  published: boolean;
  isActive: boolean;
  isSeedManaged: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFacilityDocument extends IFacility, Document {}

const facilitySchema = new Schema<IFacilityDocument>(
  {
    name: {
      type: String,
      required: [true, 'Facility name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Facility category is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Facility description is required'],
    },
    amenities: [
      {
        type: String,
        trim: true,
      },
    ],
    images: [
      {
        type: String,
        trim: true,
      },
    ],
    details: {
      type: String,
      default: '',
    },
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
    collection: 'facilities',
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

facilitySchema.index({ category: 1, published: 1, isActive: 1 });

export const Facility: Model<IFacilityDocument> =
  (mongoose.models.Facility as Model<IFacilityDocument>) ||
  mongoose.model<IFacilityDocument>('Facility', facilitySchema, 'facilities');
