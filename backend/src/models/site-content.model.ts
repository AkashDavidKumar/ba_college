/**
 * site-content.model.ts — Mongoose Model for Global Site Content & Homepage Configuration
 *
 * Singleton document storing institutional branding, hero banner, announcements,
 * footer links, statistics, virtual tour, location, and ERP modules.
 */
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface ILogo {
  text1?: string;
  text2?: string;
  image?: string;
  url?: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface IHeroBanner {
  badge?: string;
  title: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  virtualTourUrl?: string;
  backgroundImage?: string;
  stats?: Array<{ label: string; value: string; suffix?: string }>;
}

export interface IAnnouncement {
  id?: string;
  title: string;
  link?: string;
  category?: 'academic' | 'admission' | 'examination' | 'general';
  isNewItem?: boolean;
  publishDate?: Date;
  date?: string;
  badge?: string;
}

export interface IFooterSection {
  title: string;
  links: string[];
  isDepartment?: boolean;
}

export interface IFooterContent {
  ctaBadge?: string;
  ctaTitle?: string;
  ctaDescription?: string;
  aboutText?: string;
  address?: string;
  phone?: string;
  email?: string;
  infoEmail?: string;
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
  youtube?: string;
  sections?: IFooterSection[];
  copyright?: string;
}

export interface IERPModule {
  id: string;
  name: string;
  url: string;
  icon?: string;
  description?: string;
  badge?: string;
}

export interface IHeroSectionConfig {
  backgroundVideo?: string;
  fallbackImage?: string;
  blurIntensity?: number;
  overlayOpacity?: number;
  enabled?: boolean;
}

export interface IVirtualTourConfig {
  enabled?: boolean;
  mediaType?: 'youtube' | 'mp4' | 'iframe';
  mediaUrl?: string;
  posterImage?: string;
  heading?: string;
  subheading?: string;
  campusName?: string;
  campusDescription?: string;
  showStats?: boolean;
  ctaLabel?: string;
}

export interface ILocationConfig {
  campusAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  coordinates?: { lat: number; lng: number };
  googleMapsEmbedUrl?: string;
  directions?: string;
}

export interface ISiteContent {
  singletonKey: string;
  logo: ILogo;
  hero: IHeroBanner;
  announcements: IAnnouncement[];
  footer: IFooterContent;
  erpModules: IERPModule[];
  admissionsPortalFeatures: Array<{ title: string; description: string; icon?: string }>;
  statistics: Array<{ label: string; value: string; suffix?: string }>;
  heroSection: IHeroSectionConfig;
  virtualTour: IVirtualTourConfig;
  location: ILocationConfig;
  isSeedManaged: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISiteContentDocument extends ISiteContent, Document {}

const siteContentSchema = new Schema<ISiteContentDocument>(
  {
    singletonKey: {
      type: String,
      default: 'default',
      unique: true,
      immutable: true,
      index: true,
    },
    logo: {
      text1: { type: String, default: 'Bishop Ambrose' },
      text2: { type: String, default: 'College' },
      image: { type: String, default: '' },
      url: { type: String, default: '' },
      alt: { type: String, default: 'Bishop Ambrose College Logo' },
      width: Number,
      height: Number,
    },
    hero: {
      badge: { type: String, default: 'Excellence in Higher Education Since 1986' },
      title: { type: String, required: true },
      subtitle: { type: String, default: '' },
      ctaText: { type: String, default: 'Explore Programs' },
      ctaLink: { type: String, default: '/courses' },
      secondaryCtaText: { type: String, default: 'Virtual Tour' },
      secondaryCtaLink: { type: String, default: '/about' },
      virtualTourUrl: { type: String, default: '' },
      backgroundImage: { type: String, default: '' },
      stats: [
        {
          label: { type: String, required: true },
          value: { type: String, required: true },
          suffix: { type: String, default: '' },
        },
      ],
    },
    announcements: [
      {
        id: String,
        title: { type: String, required: true },
        link: { type: String, default: '' },
        category: {
          type: String,
          enum: ['academic', 'admission', 'examination', 'general'],
          default: 'general',
        },
        isNewItem: { type: Boolean, default: true },
        publishDate: { type: Date, default: Date.now },
        date: String,
        badge: String,
      },
    ],
    footer: {
      ctaBadge: String,
      ctaTitle: String,
      ctaDescription: String,
      aboutText: String,
      address: String,
      phone: String,
      email: String,
      infoEmail: String,
      facebook: String,
      twitter: String,
      instagram: String,
      linkedin: String,
      youtube: String,
      sections: [
        {
          title: String,
          links: [String],
          isDepartment: Boolean,
        },
      ],
      copyright: String,
    },
    erpModules: [
      {
        id: { type: String, required: true },
        name: { type: String, required: true },
        url: { type: String, required: true },
        icon: String,
        description: String,
        badge: String,
      },
    ],
    admissionsPortalFeatures: [
      {
        title: { type: String, required: true },
        description: { type: String, required: true },
        icon: String,
      },
    ],
    statistics: [
      {
        label: { type: String, required: true },
        value: { type: String, required: true },
        suffix: { type: String, default: '' },
      },
    ],
    heroSection: {
      backgroundVideo: String,
      fallbackImage: String,
      blurIntensity: { type: Number, default: 80 },
      overlayOpacity: { type: Number, default: 75 },
      enabled: { type: Boolean, default: true },
    },
    virtualTour: {
      enabled: { type: Boolean, default: true },
      mediaType: {
        type: String,
        enum: ['youtube', 'mp4', 'iframe'],
        default: 'youtube',
      },
      mediaUrl: String,
      posterImage: String,
      heading: String,
      subheading: String,
      campusName: String,
      campusDescription: String,
      showStats: { type: Boolean, default: true },
      ctaLabel: String,
    },
    location: {
      campusAddress: String,
      city: String,
      state: String,
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
      googleMapsEmbedUrl: String,
      directions: String,
    },
    isSeedManaged: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true,
    collection: 'site_contents',
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

export const SiteContent: Model<ISiteContentDocument> =
  (mongoose.models.SiteContent as Model<ISiteContentDocument>) ||
  mongoose.model<ISiteContentDocument>('SiteContent', siteContentSchema, 'site_contents');
