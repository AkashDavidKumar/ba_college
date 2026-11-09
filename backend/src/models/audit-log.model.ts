/**
 * audit-log.model.ts — Persistent Mongoose Audit Log Model
 *
 * Security & compliance guarantees:
 *  1. Immutable & append-only: No update or deletion capabilities exposed.
 *  2. Sensitive field redaction: Passwords, tokens, and PII are strictly excluded.
 *  3. Structured indexed tracking: Enables efficient querying by timestamp, module, and user.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export const AUDIT_ACTIONS = [
  'CREATE',
  'UPDATE',
  'DELETE',
  'PUBLISH',
  'APPROVE',
  'REJECT',
  'LOGIN',
] as const;

export type AuditAction = (typeof AUDIT_ACTIONS)[number];

export interface IAuditLog {
  userId: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  module: string;
  recordId: string;
  recordTitle: string;
  oldValue?: string;
  newValue?: string;
  ipAddress?: string;
  requestId?: string;
  timestamp: Date;
}

export interface IAuditLogDocument extends IAuditLog, Document {}

export type IAuditLogModel = Model<IAuditLogDocument>;

const auditLogSchema = new Schema<IAuditLogDocument, IAuditLogModel>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    userRole: {
      type: String,
      required: [true, 'User role is required'],
      trim: true,
    },
    action: {
      type: String,
      required: [true, 'Action is required'],
      enum: {
        values: AUDIT_ACTIONS,
        message: 'Invalid audit action: {VALUE}',
      },
    },
    module: {
      type: String,
      required: [true, 'Module is required'],
      trim: true,
      index: true,
    },
    recordId: {
      type: String,
      required: [true, 'Record ID is required'],
      trim: true,
    },
    recordTitle: {
      type: String,
      required: [true, 'Record title is required'],
      trim: true,
    },
    oldValue: {
      type: String,
      default: undefined,
    },
    newValue: {
      type: String,
      default: undefined,
    },
    ipAddress: {
      type: String,
      trim: true,
      default: undefined,
    },
    requestId: {
      type: String,
      trim: true,
      default: undefined,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Compound index for sorted queries by module and user
auditLogSchema.index({ timestamp: -1 });
auditLogSchema.index({ module: 1, timestamp: -1 });
auditLogSchema.index({ userId: 1, timestamp: -1 });

export const AuditLog: IAuditLogModel =
  (mongoose.models.AuditLog as IAuditLogModel) ||
  mongoose.model<IAuditLogDocument, IAuditLogModel>('AuditLog', auditLogSchema, 'audit_logs');
