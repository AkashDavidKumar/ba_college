/**
 * user.model.ts — Mongoose User Model for Administrator Authentication & RBAC
 *
 * Security guarantees:
 *  1. Passwords are never stored in plaintext — hashed using bcrypt (cost 12).
 *  2. `password` field has `select: false` — never returned in queries by default.
 *  3. `toJSON` transform deletes `password`, `__v`, `tokenVersion`, and internal fields.
 *  4. Email is normalized (trimmed, lowercased) and protected by a unique index.
 *  5. Brute-force lockout: 5 consecutive failed attempts locks account for 15 minutes.
 *  6. `tokenVersion` enables instant revocation of all active sessions for a user.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export const USER_ROLES = [
  'master_admin',
  'sub_admin',
  'hod',
  'club_head',
  'content_editor',
  'staff',
  // Canonical aliases
  'ADMIN',
  'EDITOR',
  'VIEWER',
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const USER_STATUSES = ['active', 'deactivated', 'locked'] as const;
export type UserStatus = (typeof USER_STATUSES)[number];

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  departmentId?: string;
  clubId?: string;
  permissions: string[];
  status: UserStatus;
  tokenVersion: number;
  failedLoginAttempts: number;
  lockUntil?: Date;
  lastLogin?: Date;
  phone?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked(): boolean;
  incLoginAttempts(): Promise<void>;
  resetLoginAttempts(): Promise<void>;
}

export interface IUserModel extends Model<IUserDocument> {
  findByNormalizedEmail(email: string): Promise<IUserDocument | null>;
}

const userSchema = new Schema<IUserDocument, IUserModel>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [255, 'Email cannot exceed 255 characters'],
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      select: false, // Never return password in default queries
    },
    role: {
      type: String,
      enum: {
        values: USER_ROLES,
        message: 'Invalid role specified: {VALUE}',
      },
      default: 'staff',
    },
    departmentId: {
      type: String,
      trim: true,
      default: undefined,
    },
    clubId: {
      type: String,
      trim: true,
      default: undefined,
    },
    permissions: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: USER_STATUSES,
      default: 'active',
    },
    tokenVersion: {
      type: Number,
      default: 0,
      select: false,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
    },
    phone: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        delete ret['_id'];
        delete ret['__v'];
        delete ret['password'];
        delete ret['tokenVersion'];
        delete ret['failedLoginAttempts'];
        delete ret['lockUntil'];
        return ret;
      },
    },
  }
);

// ── Pre-save password hashing ───────────────────────────────────────────────
userSchema.pre('save', async function (next) {
  // Only hash password if it has been modified or is new
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const saltRounds = 12; // High security work factor for administrative accounts
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    // Invalidate existing sessions when password changes on an existing user
    if (!this.isNew) {
      this.tokenVersion = (this.tokenVersion || 0) + 1;
    }
    next();
  } catch (err) {
    next(err as Error);
  }
});

// ── Instance Methods ────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  if (!this.password) {
    return false;
  }
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function (): boolean {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
};

userSchema.methods.incLoginAttempts = async function (): Promise<void> {
  const maxAttempts = 5;
  const lockTimeMs = 15 * 60 * 1000; // 15 minutes
  const now = new Date();
  const UserModel = this.constructor as IUserModel;

  // 1. If previous lock has expired, reset counter to 1 and remove lock atomically
  if (this.lockUntil && this.lockUntil.getTime() <= now.getTime()) {
    await UserModel.findByIdAndUpdate(this._id, {
      $set: { failedLoginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    this.failedLoginAttempts = 1;
    this.lockUntil = undefined;
    return;
  }

  const lockUntilDate = new Date(now.getTime() + lockTimeMs);

  // 2. Atomic lock transition: When counter is already at or above (maxAttempts - 1),
  // this attempt reaches or exceeds threshold. Atomically increment AND set lockUntil
  // in a single, atomic operation to eliminate concurrent race conditions.
  const lockedDoc = await UserModel.findOneAndUpdate(
    {
      _id: this._id,
      failedLoginAttempts: { $gte: maxAttempts - 1 },
    },
    {
      $inc: { failedLoginAttempts: 1 },
      $set: { lockUntil: lockUntilDate },
    },
    { new: true, select: '+failedLoginAttempts +lockUntil' }
  );

  if (lockedDoc) {
    this.failedLoginAttempts = lockedDoc.failedLoginAttempts;
    this.lockUntil = lockedDoc.lockUntil;
    return;
  }

  // 3. Otherwise (counter is below threshold), atomically increment counter
  const updated = await UserModel.findByIdAndUpdate(
    this._id,
    { $inc: { failedLoginAttempts: 1 } },
    { new: true, select: '+failedLoginAttempts' }
  );

  this.failedLoginAttempts = updated ? updated.failedLoginAttempts : (this.failedLoginAttempts || 0) + 1;
};

userSchema.methods.resetLoginAttempts = async function (): Promise<void> {
  const UserModel = this.constructor as IUserModel;
  await UserModel.findByIdAndUpdate(this._id, {
    $set: { failedLoginAttempts: 0 },
    $unset: { lockUntil: 1 },
  });
  this.failedLoginAttempts = 0;
  this.lockUntil = undefined;
};

// ── Static Methods ──────────────────────────────────────────────────────────
userSchema.statics.findByNormalizedEmail = function (
  email: string
): Promise<IUserDocument | null> {
  return this.findOne({ email: email.trim().toLowerCase() }).select('+password +tokenVersion +failedLoginAttempts +lockUntil');
};

export const User: IUserModel = mongoose.model<IUserDocument, IUserModel>(
  'User',
  userSchema
);
