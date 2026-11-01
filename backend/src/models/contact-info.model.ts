/**
 * contact-info.model.ts — Mongoose Model for College Contact Information
 *
 * Singleton document managing campus postal address, official phone lines,
 * department contact desks, maps embed, and enquiry form routing.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IContactPhone {
  label: string;
  number: string;
}

export interface IContactEmail {
  label: string;
  address: string;
}

export interface ISocialLink {
  platform: string;
  url: string;
  icon?: string;
}

export interface IDepartmentContactDesk {
  dept: string;
  person: string;
  phone: string;
  email: string;
}

export interface IContactInfo {
  singletonKey: string;
  address: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  phones: IContactPhone[];
  emails: IContactEmail[];
  admissionHelpline?: string;
  officeHours: string;
  mapsEmbedUrl?: string;
  socialLinks: ISocialLink[];
  departmentContacts: IDepartmentContactDesk[];
  formRecipientEmail?: string;
  formAutoReply: boolean;
  isSeedManaged: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IContactInfoDocument extends IContactInfo, Document {}

const contactPhoneSubSchema = new Schema<IContactPhone>(
  {
    label: { type: String, required: true },
    number: { type: String, required: true },
  },
  { _id: true }
);

const contactEmailSubSchema = new Schema<IContactEmail>(
  {
    label: { type: String, required: true },
    address: { type: String, required: true },
  },
  { _id: true }
);

const socialLinkSubSchema = new Schema<ISocialLink>(
  {
    platform: { type: String, required: true },
    url: { type: String, required: true },
    icon: String,
  },
  { _id: true }
);

const departmentContactDeskSubSchema = new Schema<IDepartmentContactDesk>(
  {
    dept: { type: String, required: true },
    person: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
  },
  { _id: true }
);

const contactInfoSchema = new Schema<IContactInfoDocument>(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
      immutable: true,
      index: true,
    },
    address: {
      type: String,
      required: [true, 'Campus address is required'],
    },
    addressLine2: String,
    city: { type: String, default: 'Coimbatore' },
    state: { type: String, default: 'Tamil Nadu' },
    pincode: { type: String, default: '641047' },
    phones: [contactPhoneSubSchema],
    emails: [contactEmailSubSchema],
    admissionHelpline: String,
    officeHours: {
      type: String,
      default: 'Mon – Sat: 9:00 AM – 5:00 PM',
    },
    mapsEmbedUrl: String,
    socialLinks: [socialLinkSubSchema],
    departmentContacts: [departmentContactDeskSubSchema],
    formRecipientEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    formAutoReply: {
      type: Boolean,
      default: false,
    },
    isSeedManaged: {
      type: Boolean,
      default: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'contact_info',
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret['id'] = ret['_id'] ? String(ret['_id']) : undefined;
        delete ret['_id'];
        delete ret['__v'];
        return ret;
      },
    },
  }
);

export const ContactInfo: Model<IContactInfoDocument> =
  (mongoose.models.ContactInfo as Model<IContactInfoDocument>) ||
  mongoose.model<IContactInfoDocument>('ContactInfo', contactInfoSchema, 'contact_info');
