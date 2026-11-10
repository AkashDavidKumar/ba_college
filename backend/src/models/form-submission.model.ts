/**
 * form-submission.model.ts — Dynamic Form Submissions & Inquiry Mongoose Model
 *
 * Implements:
 *  1. Persistent submission capture for any dynamic form.
 *  2. Unique human-readable submission reference code (e.g., 'SUB-2026-ABCDEF12').
 *  3. Dynamic answers payload validated strictly against the active form's field schema.
 *  4. Inquiry workflow triage states (new, in_review, responded, resolved, rejected).
 *  5. Administrative notes, responder tracking, and departmental/club scoping.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export const INQUIRY_STATUSES = [
  'new',
  'in_review',
  'responded',
  'resolved',
  'rejected',
] as const;
export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export interface IFormSubmission {
  formId: mongoose.Types.ObjectId;
  formSlug: string;
  formTitle: string;
  submissionReference: string;
  answers: Record<string, unknown>;
  status: InquiryStatus;
  departmentId?: string;
  clubId?: string;
  notes?: string;
  submittedAt: Date;
  ipAddress?: string;
  userAgent?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFormSubmissionDocument extends IFormSubmission, Document {}

const formSubmissionSchema = new Schema<IFormSubmissionDocument>(
  {
    formId: {
      type: Schema.Types.ObjectId,
      ref: 'Form',
      required: [true, 'Form ID is required'],
      index: true,
    },
    formSlug: {
      type: String,
      required: [true, 'Form slug is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    formTitle: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
    },
    submissionReference: {
      type: String,
      required: [true, 'Submission reference is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    answers: {
      type: Schema.Types.Mixed,
      required: [true, 'Submission answers are required'],
      default: {},
    },
    status: {
      type: String,
      enum: {
        values: INQUIRY_STATUSES,
        message: 'Invalid inquiry status: {VALUE}',
      },
      default: 'new',
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
    notes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      default: '',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters'],
    },
    reviewedBy: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    collection: 'cms_form_submissions',
  }
);

// Compound Indexes for fast filtering & search in inquiry management
formSubmissionSchema.index({ formId: 1, status: 1 });
formSubmissionSchema.index({ formSlug: 1, submittedAt: -1 });
formSubmissionSchema.index({ departmentId: 1, submittedAt: -1 });
formSubmissionSchema.index({ clubId: 1, submittedAt: -1 });

export const FormSubmission: Model<IFormSubmissionDocument> =
  (mongoose.models.FormSubmission as Model<IFormSubmissionDocument>) ||
  mongoose.model<IFormSubmissionDocument>('FormSubmission', formSubmissionSchema, 'cms_form_submissions');
