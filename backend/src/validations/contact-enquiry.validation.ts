/**
 * contact-enquiry.validation.ts — Strict Zod validation schemas for ContactEnquiry
 */
import { z } from 'zod';
import { ENQUIRY_STATUSES } from '../models/contact-enquiry.model';

export const submitContactEnquirySchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(150),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .email('Please provide a valid email address')
      .max(255),
    phone: z
      .string()
      .trim()
      .max(25)
      .regex(/^[0-9+\s()-]*$/, 'Phone number must contain only numbers and standard dialing symbols')
      .optional(),
    subject: z.string().trim().min(2, 'Subject is required').max(300),
    message: z.string().trim().min(5, 'Message must be at least 5 characters').max(5000),
    department: z.string().trim().max(100).optional(),
  })
  .strict();

export const updateContactEnquiryStatusSchema = z
  .object({
    status: z.enum(ENQUIRY_STATUSES as [string, ...string[]]),
    responseNotes: z.string().trim().max(5000).optional(),
  })
  .strict();

export type SubmitContactEnquiryInput = z.infer<typeof submitContactEnquirySchema>;
export type UpdateContactEnquiryStatusInput = z.infer<typeof updateContactEnquiryStatusSchema>;
