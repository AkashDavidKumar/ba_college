/**
 * alumni.model.ts — Mongoose Model for Alumni Directory and Verification
 *
 * Implements:
 *  1. Public/Professional profile fields (name, degree, graduation year, employment, city, etc.)
 *  2. Sensitive personal data (personalEmail, phoneNumber, registerNumber, residentialAddress, notes)
 *  3. Verification lifecycle: 'pending' (default) -> 'verified' | 'rejected'
 *  4. Public directory opt-in toggle (isPublicDirectoryOptIn, default false)
 *  5. Duplicate detection flags and indexes (case-insensitive email, unique registerNumber)
 *  6. Actor tracking (verifiedBy, verifiedAt)
 */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';

export type AlumniVerificationStatus = 'pending' | 'verified' | 'rejected';
export type AlumniAccountStatus = 'active' | 'suspended' | 'archived';

export interface IAlumni extends Document {
  firstName: string;
  lastName: string;
  fullName: string;
  degree: string;
  departmentId: string;
  departmentSlug?: string;
  graduationYear: number;
  registerNumber?: string;
  personalEmail: string;
  phoneNumber?: string;
  residentialAddress?: string;
  currentCompany?: string;
  designation?: string;
  industry?: string;
  employmentType?: 'Salaried' | 'Entrepreneur' | 'Homemaker' | 'Higher Studies' | 'Other';
  city?: string;
  country?: string;
  linkedInUrl?: string;
  avatarMediaId?: Types.ObjectId;
  avatarUrl?: string;
  testimonial?: string;
  isFeatured: boolean;
  isPublicDirectoryOptIn: boolean;
  isWillingToMentor?: boolean;
  verificationStatus: AlumniVerificationStatus;
  rejectionReason?: string;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
  status: AlumniAccountStatus;
  internalNotes?: string;
  registeredIp?: string;
  flaggedAsPotentialDuplicate: boolean;
  duplicateMatchDetails?: string;
  createdAt: Date;
  updatedAt: Date;
}

const alumniSchema = new Schema<IAlumni>(
  {
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      maxlength: [60, 'First name cannot exceed 60 characters'],
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
      maxlength: [60, 'Last name cannot exceed 60 characters'],
    },
    fullName: {
      type: String,
      trim: true,
    },
    degree: {
      type: String,
      required: [true, 'Degree is required'],
      trim: true,
      maxlength: [100, 'Degree cannot exceed 100 characters'],
    },
    departmentId: {
      type: String,
      required: [true, 'Department ID is required'],
      trim: true,
      lowercase: true,
      index: true,
    },
    departmentSlug: {
      type: String,
      trim: true,
      lowercase: true,
    },
    graduationYear: {
      type: Number,
      required: [true, 'Graduation year is required'],
      min: [1980, 'Graduation year must be 1980 or later'],
      max: [2100, 'Graduation year is invalid'],
      index: true,
    },
    registerNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },
    personalEmail: {
      type: String,
      required: [true, 'Personal email address is required'],
      trim: true,
      lowercase: true,
    },
    phoneNumber: {
      type: String,
      trim: true,
      maxlength: [25, 'Phone number cannot exceed 25 characters'],
    },
    residentialAddress: {
      type: String,
      trim: true,
      maxlength: [300, 'Address cannot exceed 300 characters'],
    },
    currentCompany: {
      type: String,
      trim: true,
      maxlength: [120, 'Company name cannot exceed 120 characters'],
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [120, 'Designation cannot exceed 120 characters'],
    },
    industry: {
      type: String,
      trim: true,
      maxlength: [100, 'Industry cannot exceed 100 characters'],
    },
    employmentType: {
      type: String,
      enum: ['Salaried', 'Entrepreneur', 'Homemaker', 'Higher Studies', 'Other'],
      default: 'Salaried',
    },
    city: {
      type: String,
      trim: true,
      maxlength: [80, 'City cannot exceed 80 characters'],
    },
    country: {
      type: String,
      trim: true,
      default: 'India',
      maxlength: [80, 'Country cannot exceed 80 characters'],
    },
    linkedInUrl: {
      type: String,
      trim: true,
      maxlength: [300, 'LinkedIn URL cannot exceed 300 characters'],
    },
    avatarMediaId: {
      type: Schema.Types.ObjectId,
      ref: 'MediaAsset',
    },
    avatarUrl: {
      type: String,
      trim: true,
      maxlength: [500, 'Avatar URL cannot exceed 500 characters'],
    },
    testimonial: {
      type: String,
      trim: true,
      maxlength: [1000, 'Testimonial cannot exceed 1000 characters'],
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPublicDirectoryOptIn: {
      type: Boolean,
      default: false,
      index: true,
    },
    isWillingToMentor: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      maxlength: [500, 'Rejection reason cannot exceed 500 characters'],
    },
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'suspended', 'archived'],
      default: 'active',
      index: true,
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: [2000, 'Internal notes cannot exceed 2000 characters'],
    },
    registeredIp: {
      type: String,
      trim: true,
    },
    flaggedAsPotentialDuplicate: {
      type: Boolean,
      default: false,
      index: true,
    },
    duplicateMatchDetails: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Pre-save hook: auto-compute fullName and synchronize departmentSlug
alumniSchema.pre('save', function (next) {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
  if (this.departmentId && !this.departmentSlug) {
    this.departmentSlug = this.departmentId;
  }
  if (this.personalEmail) {
    this.personalEmail = this.personalEmail.toLowerCase().trim();
  }
  if (this.registerNumber) {
    this.registerNumber = this.registerNumber.toUpperCase().trim();
  }
  next();
});

// Indexes for high performance and integrity
alumniSchema.index({ personalEmail: 1 }, { unique: true });
alumniSchema.index({ registerNumber: 1 }, { unique: true, sparse: true });
alumniSchema.index({ verificationStatus: 1, isPublicDirectoryOptIn: 1, status: 1 });
alumniSchema.index({ graduationYear: 1, departmentId: 1 });
alumniSchema.index({ isFeatured: 1, status: 1 });

export const Alumni: Model<IAlumni> =
  mongoose.models.Alumni || mongoose.model<IAlumni>('Alumni', alumniSchema);
export default Alumni;
