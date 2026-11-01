/**
 * contact-enquiry.model.ts — Mongoose Model for Public Contact Enquiries
 *
 * Strictly private operational collection storing incoming visitor enquiries
 * and communications submitted via the public contact form.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export type EnquiryStatus = 'new' | 'in_progress' | 'resolved' | 'archived';
export const ENQUIRY_STATUSES: EnquiryStatus[] = ['new', 'in_progress', 'resolved', 'archived'];

export interface IContactEnquiry {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  department?: string;
  status: EnquiryStatus;
  submittedAt: Date;
  respondedAt?: Date;
  responseNotes?: string;
  ipAddress?: string;
  isArchived: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactEnquiryDocument extends IContactEnquiry, Document {}

const contactEnquirySchema = new Schema<IContactEnquiryDocument>(
  {
    name: {
      type: String,
      required: [true, 'Sender name is required'],
      trim: true,
      maxlength: [150, 'Name cannot exceed 150 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [300, 'Subject cannot exceed 300 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [5000, 'Message cannot exceed 5000 characters'],
    },
    department: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: {
        values: ENQUIRY_STATUSES,
        message: 'Invalid enquiry status: {VALUE}',
      },
      default: 'new',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    respondedAt: Date,
    responseNotes: {
      type: String,
      default: '',
    },
    ipAddress: String,
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'contact_enquiries',
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

contactEnquirySchema.index({ status: 1, submittedAt: -1 });

export const ContactEnquiry: Model<IContactEnquiryDocument> =
  (mongoose.models.ContactEnquiry as Model<IContactEnquiryDocument>) ||
  mongoose.model<IContactEnquiryDocument>(
    'ContactEnquiry',
    contactEnquirySchema,
    'contact_enquiries'
  );
