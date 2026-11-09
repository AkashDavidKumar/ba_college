/**
 * approval.model.ts — Content Workflow & Approvals Mongoose Model
 *
 * Implements:
 *  1. Workflow approval tracking for sensitive content submissions.
 *  2. Self-approval prevention and reviewer attribution.
 *  3. Departmental and club scoped approval state enforcement.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export const APPROVAL_ENTITY_TYPES = [
  'page',
  'event',
  'notice',
  'news',
  'department',
  'club',
  'achievement',
] as const;

export type ApprovalEntityType = (typeof APPROVAL_ENTITY_TYPES)[number];

export const APPROVAL_STATUSES = ['pending', 'approved', 'rejected'] as const;
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];

export interface IApproval {
  entityType: ApprovalEntityType;
  entityId: string;
  title: string;
  departmentId?: string;
  clubId?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  status: ApprovalStatus;
  rejectionReason?: string;
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  reviewerName?: string;
  previewData?: Record<string, unknown>;
}

export interface IApprovalDocument extends IApproval, Document {}

export type IApprovalModel = Model<IApprovalDocument>;

const approvalSchema = new Schema<IApprovalDocument, IApprovalModel>(
  {
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      enum: {
        values: APPROVAL_ENTITY_TYPES,
        message: 'Invalid entity type: {VALUE}',
      },
    },
    entityId: {
      type: String,
      required: [true, 'Entity ID is required'],
      trim: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    departmentId: {
      type: String,
      trim: true,
      default: undefined,
      index: true,
    },
    clubId: {
      type: String,
      trim: true,
      default: undefined,
      index: true,
    },
    authorId: {
      type: String,
      required: [true, 'Author ID is required'],
      trim: true,
      index: true,
    },
    authorName: {
      type: String,
      required: [true, 'Author name is required'],
      trim: true,
    },
    authorRole: {
      type: String,
      required: [true, 'Author role is required'],
      trim: true,
    },
    status: {
      type: String,
      required: [true, 'Status is required'],
      enum: {
        values: APPROVAL_STATUSES,
        message: 'Invalid approval status: {VALUE}',
      },
      default: 'pending',
      index: true,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: undefined,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    reviewedAt: {
      type: Date,
      default: undefined,
    },
    reviewerId: {
      type: String,
      trim: true,
      default: undefined,
    },
    reviewerName: {
      type: String,
      trim: true,
      default: undefined,
    },
    previewData: {
      type: Schema.Types.Mixed,
      default: undefined,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

approvalSchema.index({ status: 1, submittedAt: -1 });

export const Approval: IApprovalModel =
  (mongoose.models.Approval as IApprovalModel) ||
  mongoose.model<IApprovalDocument, IApprovalModel>('Approval', approvalSchema, 'approvals');
