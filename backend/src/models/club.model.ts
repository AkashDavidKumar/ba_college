/**
 * club.model.ts — Mongoose Model for Institutional Clubs & Student Committees
 *
 * Implements:
 *  1. Canonical immutable lowercase `slug` for zero-friction interoperability.
 *  2. Unique indexes on `slug` and institutional short code `code`.
 *  3. Comprehensive profile, categorization, faculty coordinator, and recruitment state.
 *  4. Aggregate active member counter (`memberCount`).
 *  5. Reusable `resolveClubDocument` helper for secure ObjectId/slug identity resolution.
 */
import mongoose, { Document, Model, Schema, Types } from 'mongoose';
import { ApiError } from '../utils/api-error';

export const CLUB_CATEGORIES = [
  'Cultural',
  'Sports',
  'Social Service',
  'Academic',
  'Leadership',
  'Technical',
] as const;
export type ClubCategory = (typeof CLUB_CATEGORIES)[number];

export const CLUB_STATUSES = ['active', 'inactive', 'archived'] as const;
export type ClubStatus = (typeof CLUB_STATUSES)[number];

export interface IClub {
  name: string;
  slug: string;
  code: string;
  category: ClubCategory;
  description: string;
  departmentId?: string;
  facultyCoordinator: string;
  facultyCoordinatorEmail?: string;
  studentHeadUserId?: Types.ObjectId;
  studentHeadName?: string;
  contactEmail: string;
  logoUrl?: string;
  bannerImage?: string;
  memberCount: number;
  achievements: string[];
  meetingSchedule?: string;
  roomOrVenue?: string;
  isRecruiting: boolean;
  featuredOrder?: number;
  status: ClubStatus;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IClubDocument extends IClub, Document {}

export type IClubModel = Model<IClubDocument>;

const clubSchema = new Schema<IClubDocument, IClubModel>(
  {
    name: {
      type: String,
      required: [true, 'Club name is required'],
      trim: true,
      maxlength: [150, 'Club name cannot exceed 150 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Club slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'],
    },
    code: {
      type: String,
      required: [true, 'Club short code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Club code cannot exceed 20 characters'],
    },
    category: {
      type: String,
      required: [true, 'Club category is required'],
      enum: {
        values: CLUB_CATEGORIES,
        message: 'Invalid club category: {VALUE}',
      },
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Club description is required'],
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
    },
    departmentId: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    facultyCoordinator: {
      type: String,
      required: [true, 'Faculty coordinator is required'],
      trim: true,
      maxlength: [100, 'Faculty coordinator name cannot exceed 100 characters'],
    },
    facultyCoordinatorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: undefined,
    },
    studentHeadUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: undefined,
    },
    studentHeadName: {
      type: String,
      trim: true,
      maxlength: [100, 'Student head name cannot exceed 100 characters'],
      default: undefined,
    },
    contactEmail: {
      type: String,
      required: [true, 'Contact email is required'],
      trim: true,
      lowercase: true,
    },
    logoUrl: {
      type: String,
      trim: true,
      default: undefined,
    },
    bannerImage: {
      type: String,
      trim: true,
      default: undefined,
    },
    memberCount: {
      type: Number,
      default: 0,
      min: [0, 'Member count cannot be negative'],
    },
    achievements: {
      type: [String],
      default: [],
    },
    meetingSchedule: {
      type: String,
      trim: true,
      maxlength: [200, 'Meeting schedule cannot exceed 200 characters'],
      default: undefined,
    },
    roomOrVenue: {
      type: String,
      trim: true,
      maxlength: [100, 'Room or venue cannot exceed 100 characters'],
      default: undefined,
    },
    isRecruiting: {
      type: Boolean,
      default: true,
      index: true,
    },
    featuredOrder: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: {
        values: CLUB_STATUSES,
        message: 'Invalid club status: {VALUE}',
      },
      default: 'active',
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Field normalization helper
function normalizeClubFields(doc: IClubDocument): void {
  if (doc.slug) {
    doc.slug = doc.slug.toLowerCase().trim();
  }
  if (doc.code) {
    doc.code = doc.code.toUpperCase().trim();
  }
  if (doc.contactEmail) {
    doc.contactEmail = doc.contactEmail.toLowerCase().trim();
  }
  if (doc.facultyCoordinatorEmail) {
    doc.facultyCoordinatorEmail = doc.facultyCoordinatorEmail.toLowerCase().trim();
  }
  if (doc.departmentId) {
    doc.departmentId = doc.departmentId.toLowerCase().trim();
  }
  if (doc.memberCount !== undefined && doc.memberCount < 0) {
    doc.memberCount = 0;
  }
}

// Pre-validate & pre-save normalization hooks
clubSchema.pre('validate', function () {
  normalizeClubFields(this);
});

clubSchema.pre('save', function () {
  normalizeClubFields(this);
});

// Compound indexes
clubSchema.index({ status: 1, isPublished: 1, category: 1 });
clubSchema.index({ studentHeadUserId: 1 }, { sparse: true });
clubSchema.index({ departmentId: 1 }, { sparse: true });

export const Club: IClubModel =
  (mongoose.models.Club as IClubModel) || mongoose.model<IClubDocument, IClubModel>('Club', clubSchema);

/**
 * Resolves a club document from the database using either a 24-character hexadecimal
 * ObjectId or a canonical lowercase slug.
 *
 * Security Guarantee:
 * Resolving the document from the database ensures that all subsequent authorization
 * checks use the document's verified canonical slug (`club.slug`) rather than unverified
 * URL parameters or request payloads.
 *
 * @param identifier MongoDB ObjectId string or club slug
 * @throws ApiError 404 if no matching club exists
 */
export async function resolveClubDocument(identifier: string): Promise<IClubDocument> {
  if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
    throw ApiError.badRequest('Club identifier is required.', 'INVALID_CLUB_IDENTIFIER');
  }

  const trimmed = identifier.trim().toLowerCase();
  let club: IClubDocument | null = null;

  // 1. If valid 24-char hex ObjectId, look up by primary key
  if (mongoose.Types.ObjectId.isValid(trimmed) && trimmed.length === 24) {
    club = await Club.findById(trimmed);
  }

  // 2. Fall back to canonical slug lookup
  if (!club) {
    club = await Club.findOne({ slug: trimmed });
  }

  if (!club) {
    throw ApiError.notFound(`Club with identifier "${identifier}"`);
  }

  return club;
}

export default Club;
