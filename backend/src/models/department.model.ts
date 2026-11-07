/**
 * department.model.ts — Mongoose Model for Academic Departments
 *
 * Stores academic departments with embedded faculty, labs, research stats,
 * and alumni profiles. Implements virtual population for degree programmes (courses).
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFacultyMember {
  id?: string;
  name: string;
  designation: string;
  qualification: string;
  experience?: string;
  specialization?: string | string[];
  email?: string;
  image?: string;
  publications?: number | string;
  order?: number;
}

export interface ILaboratory {
  name: string;
  description?: string;
  equipment?: string[];
  capacity?: number;
  image?: string;
}

export interface IAlumniMember {
  name: string;
  batch?: string | number;
  designation?: string;
  company?: string;
  testimonial?: string;
  image?: string;
}

export interface IHeadOfDepartment {
  name: string;
  qualification?: string;
  designation?: string;
  email?: string;
  image?: string;
  message?: string;
}

export interface IResearchStats {
  publications?: number;
  patents?: number;
  fundedProjects?: string | number;
}

export interface IDepartmentContact {
  email?: string;
  phone?: string;
  location?: string;
}

export interface IDepartment {
  slug: string;
  name: string;
  shortName: string;
  code: string;
  category: string;
  icon?: string;
  description: string;
  longDescription?: string;
  cover?: string;
  coverImage?: string;
  color?: string;
  vision?: string;
  mission?: string[];
  highlights?: string[];
  headOfDepartment?: IHeadOfDepartment;
  faculty: IFacultyMember[];
  labs: ILaboratory[];
  researchStats: IResearchStats;
  alumni: IAlumniMember[];
  achievements?: string[];
  flagshipEvents?: string[];
  contact?: IDepartmentContact;
  order: number;
  isSeedManaged: boolean;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IDepartmentDocument extends IDepartment, Document {}

const facultySubSchema = new Schema<IFacultyMember>(
  {
    id: String,
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },
    qualification: { type: String, required: true, trim: true },
    experience: String,
    specialization: Schema.Types.Mixed,
    email: { type: String, trim: true, lowercase: true },
    image: String,
    publications: { type: Schema.Types.Mixed, default: 0 },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const laboratorySubSchema = new Schema<ILaboratory>(
  {
    name: { type: String, required: true, trim: true },
    description: String,
    equipment: [String],
    capacity: Number,
    image: String,
  },
  { _id: true }
);

const alumniSubSchema = new Schema<IAlumniMember>(
  {
    name: { type: String, required: true, trim: true },
    batch: Schema.Types.Mixed,
    designation: String,
    company: String,
    testimonial: String,
    image: String,
  },
  { _id: true }
);

const departmentSchema = new Schema<IDepartmentDocument>(
  {
    slug: {
      type: String,
      required: [true, 'Department slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    shortName: {
      type: String,
      required: [true, 'Department short name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Department category is required'],
      trim: true,
      index: true,
    },
    icon: { type: String, default: 'Building2' },
    description: { type: String, required: true },
    longDescription: String,
    cover: String,
    coverImage: String,
    color: { type: String, default: 'from-blue-600 to-indigo-700' },
    vision: String,
    mission: [String],
    highlights: [String],
    headOfDepartment: {
      name: { type: String, default: '' },
      qualification: String,
      designation: String,
      email: String,
      image: String,
      message: String,
    },
    faculty: [facultySubSchema],
    labs: [laboratorySubSchema],
    researchStats: {
      publications: { type: Number, default: 0 },
      patents: { type: Number, default: 0 },
      fundedProjects: { type: Schema.Types.Mixed, default: '₹ 0' },
    },
    alumni: [alumniSubSchema],
    achievements: [String],
    flagshipEvents: [String],
    contact: {
      email: String,
      phone: String,
      location: String,
    },
    order: { type: Number, default: 0, index: true },
    isSeedManaged: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'departments',
    toJSON: {
      virtuals: true,
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

// Virtual population for courses referencing this department
departmentSchema.virtual('programs', {
  ref: 'Course',
  localField: 'slug',
  foreignField: 'departmentSlug',
  justOne: false,
});

departmentSchema.index({ isActive: 1, order: 1 });
departmentSchema.index({ isActive: 1, deletedAt: 1, order: 1, name: 1 });

export const Department: Model<IDepartmentDocument> =
  (mongoose.models.Department as Model<IDepartmentDocument>) ||
  mongoose.model<IDepartmentDocument>('Department', departmentSchema, 'departments');
