/**
 * site-content.validation.ts — Strict Zod validation schemas for SiteContent
 */
import { z } from 'zod';

const httpsUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => !val || val.startsWith('https://') || val.startsWith('/'),
    { message: 'URL must be a secure HTTPS link or relative asset path' }
  );

export const logoSchema = z
  .object({
    text1: z.string().trim().max(100).optional(),
    text2: z.string().trim().max(100).optional(),
    image: httpsUrlSchema.optional(),
    url: z.string().trim().optional(),
    alt: z.string().trim().max(200).optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional(),
  })
  .strict();

export const heroBannerSchema = z
  .object({
    badge: z.string().trim().max(200).optional(),
    title: z.string().trim().min(1, 'Hero title is required').max(300),
    subtitle: z.string().trim().max(1000).optional(),
    ctaText: z.string().trim().max(100).optional(),
    ctaLink: z.string().trim().max(500).optional(),
    secondaryCtaText: z.string().trim().max(100).optional(),
    secondaryCtaLink: z.string().trim().max(500).optional(),
    virtualTourUrl: z.string().trim().max(500).optional(),
    backgroundImage: httpsUrlSchema.optional(),
    stats: z
      .array(
        z
          .object({
            label: z.string().trim().min(1).max(100),
            value: z.string().trim().min(1).max(50),
            suffix: z.string().trim().max(20).optional(),
          })
          .strict()
      )
      .optional(),
  })
  .strict();

export const announcementItemSchema = z
  .object({
    id: z.string().trim().optional(),
    title: z.string().trim().min(1, 'Announcement title is required').max(300),
    link: z.string().trim().max(500).optional(),
    category: z.enum(['academic', 'admission', 'examination', 'general']).optional().default('general'),
    isNewItem: z.boolean().optional().default(true),
    publishDate: z.string().or(z.date()).optional(),
    date: z.string().trim().optional(),
    badge: z.string().trim().max(50).optional(),
  })
  .strict();

export const footerSectionSchema = z
  .object({
    title: z.string().trim().min(1).max(100),
    links: z.array(z.string().trim().max(200)),
    isDepartment: z.boolean().optional(),
  })
  .strict();

export const footerContentSchema = z
  .object({
    ctaBadge: z.string().trim().max(100).optional(),
    ctaTitle: z.string().trim().max(200).optional(),
    ctaDescription: z.string().trim().max(1000).optional(),
    aboutText: z.string().trim().max(2000).optional(),
    address: z.string().trim().max(500).optional(),
    phone: z.string().trim().max(100).optional(),
    email: z.string().trim().email().optional(),
    infoEmail: z.string().trim().email().optional(),
    facebook: httpsUrlSchema.optional(),
    twitter: httpsUrlSchema.optional(),
    instagram: httpsUrlSchema.optional(),
    linkedin: httpsUrlSchema.optional(),
    youtube: httpsUrlSchema.optional(),
    sections: z.array(footerSectionSchema).optional(),
    copyright: z.string().trim().max(300).optional(),
  })
  .strict();

export const erpModuleSchema = z
  .object({
    id: z.string().trim().min(1).max(100),
    name: z.string().trim().min(1).max(150),
    url: z.string().trim().min(1).max(500),
    icon: z.string().trim().max(100).optional(),
    description: z.string().trim().max(500).optional(),
    badge: z.string().trim().max(50).optional(),
  })
  .strict();

export const heroSectionConfigSchema = z
  .object({
    backgroundVideo: httpsUrlSchema.optional(),
    fallbackImage: httpsUrlSchema.optional(),
    blurIntensity: z.number().min(0).max(100).optional().default(80),
    overlayOpacity: z.number().min(0).max(100).optional().default(75),
    enabled: z.boolean().optional().default(true),
  })
  .strict();

export const virtualTourConfigSchema = z
  .object({
    enabled: z.boolean().optional().default(true),
    mediaType: z.enum(['youtube', 'mp4', 'iframe']).optional().default('youtube'),
    mediaUrl: httpsUrlSchema.optional(),
    posterImage: httpsUrlSchema.optional(),
    heading: z.string().trim().max(200).optional(),
    subheading: z.string().trim().max(300).optional(),
    campusName: z.string().trim().max(200).optional(),
    campusDescription: z.string().trim().max(1000).optional(),
    showStats: z.boolean().optional().default(true),
    ctaLabel: z.string().trim().max(100).optional(),
  })
  .strict();

export const locationConfigSchema = z
  .object({
    campusAddress: z.string().trim().max(500).optional(),
    city: z.string().trim().max(100).optional(),
    state: z.string().trim().max(100).optional(),
    pincode: z.string().trim().max(20).optional(),
    coordinates: z
      .object({
        lat: z.number(),
        lng: z.number(),
      })
      .strict()
      .optional(),
    googleMapsEmbedUrl: httpsUrlSchema.optional(),
    directions: z.string().trim().max(1000).optional(),
  })
  .strict();

export const updateSiteContentSchema = z
  .object({
    logo: logoSchema.optional(),
    hero: heroBannerSchema.optional(),
    announcements: z.array(announcementItemSchema).optional(),
    footer: footerContentSchema.optional(),
    erpModules: z.array(erpModuleSchema).optional(),
    admissionsPortalFeatures: z
      .array(
        z
          .object({
            title: z.string().trim().min(1).max(150),
            description: z.string().trim().min(1).max(500),
            icon: z.string().trim().max(100).optional(),
          })
          .strict()
      )
      .optional(),
    statistics: z
      .array(
        z
          .object({
            label: z.string().trim().min(1).max(100),
            value: z.string().trim().min(1).max(50),
            suffix: z.string().trim().max(20).optional(),
          })
          .strict()
      )
      .optional(),
    heroSection: heroSectionConfigSchema.optional(),
    virtualTour: virtualTourConfigSchema.optional(),
    location: locationConfigSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .strict();

export type UpdateSiteContentInput = z.infer<typeof updateSiteContentSchema>;
