/**
 * form.model.ts — Reusable Dynamic Form Definition Mongoose Model
 *
 * Implements:
 *  1. Dynamic form configuration with 10 supported field types:
 *     (text, textarea, email, phone, number, select, radio, checkbox, date, url).
 *  2. Configurable field validation rules, help text, placeholders, and ordering.
 *  3. Publishing lifecycle (draft, submitted, pending, approved, published, archived).
 *  4. Institutional scoping for academic departments (departmentId) and campus clubs (clubId).
 *  5. Unique slug indexing and active/published compound querying.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export const FORM_FIELD_TYPES = [
  'text',
  'textarea',
  'email',
  'phone',
  'number',
  'select',
  'radio',
  'checkbox',
  'date',
  'url',
] as const;
export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export const FORM_STATUSES = [
  'draft',
  'submitted',
  'pending',
  'approved',
  'published',
  'archived',
] as const;
export type FormStatus = (typeof FORM_STATUSES)[number];

export const FORM_CATEGORIES = [
  'general',
  'admissions',
  'academics',
  'feedback',
  'events',
  'department',
  'club',
] as const;
export type FormCategory = (typeof FORM_CATEGORIES)[number];

export interface IFormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
}

export interface IFormField {
  id: string; // Unique field identifier (e.g., 'fld_full_name')
  label: string;
  type: FormFieldType;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  order: number;
  options?: string[]; // Options for select, radio, checkbox
  validation?: IFormFieldValidation;
}

export interface IForm {
  title: string;
  slug: string;
  description?: string;
  category: FormCategory;
  fields: IFormField[];
  status: FormStatus;
  isActive: boolean;
  submitButtonText: string;
  successMessage: string;
  departmentId?: string;
  clubId?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFormDocument extends IForm, Document {}

const formFieldSchema = new Schema<IFormField>(
  {
    id: {
      type: String,
      required: [true, 'Field ID is required'],
      trim: true,
    },
    label: {
      type: String,
      required: [true, 'Field label is required'],
      trim: true,
      maxlength: [200, 'Label cannot exceed 200 characters'],
    },
    type: {
      type: String,
      required: [true, 'Field type is required'],
      enum: {
        values: FORM_FIELD_TYPES,
        message: 'Invalid field type: {VALUE}',
      },
    },
    placeholder: {
      type: String,
      trim: true,
      maxlength: [200, 'Placeholder cannot exceed 200 characters'],
    },
    helpText: {
      type: String,
      trim: true,
      maxlength: [300, 'Help text cannot exceed 300 characters'],
    },
    required: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Order cannot be negative'],
    },
    options: {
      type: [String],
      default: undefined,
    },
    validation: {
      type: {
        minLength: { type: Number, min: 0 },
        maxLength: { type: Number, min: 1 },
        min: { type: Number },
        max: { type: Number },
        pattern: { type: String, trim: true },
      },
      default: undefined,
      _id: false,
    },
  },
  { _id: false }
);

const formSchema = new Schema<IFormDocument>(
  {
    title: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Form slug is required'],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    category: {
      type: String,
      enum: {
        values: FORM_CATEGORIES,
        message: 'Invalid category: {VALUE}',
      },
      default: 'general',
      index: true,
    },
    fields: {
      type: [formFieldSchema],
      default: [],
      validate: {
        validator(val: IFormField[]) {
          if (!Array.isArray(val)) return false;
          // Ensure field IDs within a form are unique
          const ids = val.map((f) => f.id);
          return new Set(ids).size === ids.length;
        },
        message: 'Field IDs within a form must be unique.',
      },
    },
    status: {
      type: String,
      enum: {
        values: FORM_STATUSES,
        message: 'Invalid status: {VALUE}',
      },
      default: 'draft',
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    submitButtonText: {
      type: String,
      trim: true,
      maxlength: [50, 'Submit button text cannot exceed 50 characters'],
      default: 'Submit',
    },
    successMessage: {
      type: String,
      trim: true,
      maxlength: [500, 'Success message cannot exceed 500 characters'],
      default: 'Thank you for your submission.',
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
    createdBy: {
      type: String,
      trim: true,
    },
    updatedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'cms_forms',
  }
);

// Compound Indexes for high-performance administrative & public queries
formSchema.index({ status: 1, isActive: 1 });
formSchema.index({ departmentId: 1, status: 1 });
formSchema.index({ clubId: 1, status: 1 });
formSchema.index({ category: 1, status: 1 });

export const Form: Model<IFormDocument> =
  (mongoose.models.Form as Model<IFormDocument>) ||
  mongoose.model<IFormDocument>('Form', formSchema, 'cms_forms');
