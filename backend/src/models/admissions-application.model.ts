/**
 * admissions-application.model.ts — Mongoose Model for Student Admission Applications
 *
 * Strictly private operational collection storing student application submissions,
 * human-readable tracking numbers (BAC-ADM-YYYY-XXXX), review statuses, and internal notes.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export type AdmissionApplicationStatus =
  | 'new'
  | 'submitted'
  | 'under_review'
  | 'shortlisted'
  | 'approved'
  | 'rejected'
  | 'archived';

export const ADMISSION_STATUSES: AdmissionApplicationStatus[] = [
  'new',
  'submitted',
  'under_review',
  'shortlisted',
  'approved',
  'rejected',
  'archived',
];

export interface IApplicationRemark {
  author: string;
  text: string;
  date: Date;
}

export interface IAdmissionsApplication {
  appNumber: string;
  candidateName: string;
  name?: string; // compatibility alias
  email: string;
  phone: string;
  program: string;
  courseSlug?: string;
  dateOfBirth?: Date;
  gender?: string;
  parentOrGuardianName?: string;
  qualifyingExam?: string;
  gpa?: string;
  marksPercentage?: number;
  schoolName?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  status: AdmissionApplicationStatus;
  submittedAt: Date;
  appliedAt?: Date; // compatibility alias
  notes: string;
  remarks: IApplicationRemark[];
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  isArchived: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IAdmissionsApplicationDocument extends IAdmissionsApplication, Document {}

const applicationRemarkSubSchema = new Schema<IApplicationRemark>(
  {
    author: { type: String, required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
  },
  { _id: true }
);

const admissionsApplicationSchema = new Schema<IAdmissionsApplicationDocument>(
  {
    appNumber: {
      type: String,
      required: [true, 'Application tracking number is required'],
      unique: true,
      index: true,
      trim: true,
    },
    candidateName: {
      type: String,
      required: [true, 'Candidate name is required'],
      trim: true,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    program: {
      type: String,
      required: [true, 'Programme is required'],
      trim: true,
    },
    courseSlug: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    parentOrGuardianName: String,
    qualifyingExam: String,
    gpa: String,
    marksPercentage: Number,
    schoolName: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    status: {
      type: String,
      enum: {
        values: ADMISSION_STATUSES,
        message: 'Invalid admission status: {VALUE}',
      },
      default: 'submitted',
      index: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    appliedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
    remarks: [applicationRemarkSubSchema],
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'admissions_applications',
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        // Map candidateName to name for frontend admissions-tab compatibility
        if (!ret['name'] && ret['candidateName']) {
          ret['name'] = ret['candidateName'];
        }
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

admissionsApplicationSchema.index({ status: 1, submittedAt: -1 });
admissionsApplicationSchema.index({ email: 1, courseSlug: 1 });

export const AdmissionsApplication: Model<IAdmissionsApplicationDocument> =
  (mongoose.models.AdmissionsApplication as Model<IAdmissionsApplicationDocument>) ||
  mongoose.model<IAdmissionsApplicationDocument>(
    'AdmissionsApplication',
    admissionsApplicationSchema,
    'admissions_applications'
  );
