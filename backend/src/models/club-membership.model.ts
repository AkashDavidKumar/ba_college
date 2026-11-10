/**
 * club-membership.model.ts — Mongoose Model for Student Club Memberships
 *
 * Implements:
 *  1. Canonical `clubSlug` reference and student institutional identity via `registerNumber`.
 *  2. Partial unique index on `{ clubSlug: 1, registerNumber: 1 }` preventing duplicate
 *     pending/active applications while permitting past rejections or archived records.
 *  3. Membership role hierarchy ('member' -> 'committee/executive' -> 'president').
 *  4. Application lifecycle state machine: 'pending' -> 'active' | 'rejected' | 'inactive' | 'alumni'.
 *  5. Explicit public directory opt-in toggle (`isPublicDirectoryOptIn`, default `false`) with timestamping (`directoryConsentAt`).
 *  6. Protected administrative review metadata (`reviewedBy`, `reviewedAt`, `rejectionReason`, `internalNotes`).
 */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export const MEMBERSHIP_ROLES = [
  'member',
  'volunteer',
  'executive',
  'treasurer',
  'secretary',
  'vice_president',
  'president',
] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const MEMBERSHIP_STATUSES = [
  'pending',
  'active',
  'rejected',
  'inactive',
  'alumni',
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

export interface IClubMembership {
  clubSlug: string;
  clubId?: Types.ObjectId;
  studentName: string;
  registerNumber: string;
  departmentId: string;
  degree: string;
  yearOfStudy: number;
  personalEmail: string;
  phoneNumber: string;
  role: MembershipRole;
  status: MembershipStatus;
  reasonForJoining?: string;
  rejectionReason?: string;
  reviewedBy?: Types.ObjectId;
  reviewedAt?: Date;
  joinedAt?: Date;
  internalNotes?: string;
  registeredIp?: string;
  isPublicDirectoryOptIn: boolean;
  directoryConsentAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClubMembershipDocument extends IClubMembership, Document {}

export type IClubMembershipModel = Model<IClubMembershipDocument>;

const clubMembershipSchema = new Schema<IClubMembershipDocument, IClubMembershipModel>(
  {
    clubSlug: {
      type: String,
      required: [true, 'Club slug is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    clubId: {
      type: Schema.Types.ObjectId,
      ref: 'Club',
      default: undefined,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters'],
    },
    registerNumber: {
      type: String,
      required: [true, 'Register number is required'],
      uppercase: true,
      trim: true,
      maxlength: [30, 'Register number cannot exceed 30 characters'],
    },
    departmentId: {
      type: String,
      required: [true, 'Department ID is required'],
      lowercase: true,
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters'],
    },
    yearOfStudy: {
      type: Number,
      required: [true, 'Year of study is required'],
      min: [1, 'Year of study must be at least 1'],
      max: [4, 'Year of study cannot exceed 4'],
    },
    personalEmail: {
      type: String,
      required: [true, 'Personal email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },
    role: {
      type: String,
      enum: {
        values: MEMBERSHIP_ROLES,
        message: 'Invalid membership role: {VALUE}',
      },
      default: 'member',
    },
    status: {
      type: String,
      enum: {
        values: MEMBERSHIP_STATUSES,
        message: 'Invalid membership status: {VALUE}',
      },
      default: 'pending',
      index: true,
    },
    reasonForJoining: {
      type: String,
      trim: true,
      maxlength: [1000, 'Reason for joining cannot exceed 1000 characters'],
      default: undefined,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [1000, 'Rejection reason cannot exceed 1000 characters'],
      default: undefined,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    reviewedAt: {
      type: Date,
      default: undefined,
    },
    joinedAt: {
      type: Date,
      default: undefined,
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
      default: undefined,
    },
    registeredIp: {
      type: String,
      trim: true,
      default: undefined,
    },
    isPublicDirectoryOptIn: {
      type: Boolean,
      default: false,
    },
    directoryConsentAt: {
      type: Date,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Field normalization and consent tracking helper
function normalizeMembershipFields(doc: IClubMembershipDocument): void {
  if (doc.registerNumber) {
    doc.registerNumber = doc.registerNumber.toUpperCase().trim();
  }
  if (doc.personalEmail) {
    doc.personalEmail = doc.personalEmail.toLowerCase().trim();
  }
  if (doc.clubSlug) {
    doc.clubSlug = doc.clubSlug.toLowerCase().trim();
  }
  if (doc.departmentId) {
    doc.departmentId = doc.departmentId.toLowerCase().trim();
  }

  // Affirmative consent timestamping
  if (doc.isPublicDirectoryOptIn) {
    if (!doc.directoryConsentAt) {
      doc.directoryConsentAt = new Date();
    }
  } else {
    doc.directoryConsentAt = undefined;
  }
}

// Pre-validate and pre-save hooks
clubMembershipSchema.pre('validate', function () {
  normalizeMembershipFields(this);
});

clubMembershipSchema.pre('save', function () {
  normalizeMembershipFields(this);
});

// Partial compound unique index: Prevents duplicate pending or active memberships for a student in a club
clubMembershipSchema.index(
  { clubSlug: 1, registerNumber: 1 },
  {
    unique: true,
    partialFilterExpression: {
      status: { $in: ['pending', 'active'] },
    },
  }
);

// Query performance indexes
clubMembershipSchema.index({ clubSlug: 1, status: 1 });
clubMembershipSchema.index({ clubSlug: 1, status: 1, isPublicDirectoryOptIn: 1 });
clubMembershipSchema.index({ clubSlug: 1, personalEmail: 1 });
clubMembershipSchema.index({ registerNumber: 1 });

export const ClubMembership: IClubMembershipModel =
  (mongoose.models.ClubMembership as IClubMembershipModel) ||
  mongoose.model<IClubMembershipDocument, IClubMembershipModel>('ClubMembership', clubMembershipSchema);

export default ClubMembership;
