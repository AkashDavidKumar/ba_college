/**
 * notice.ts — Type Definitions for Notices Management System
 *
 * Defines contracts for:
 *  1. Full administrative Notice document.
 *  2. Public projection Notice item.
 *  3. Dashboard metrics counters.
 *  4. Request DTOs (create, update, review, publish).
 */

export type NoticeCategory =
  | 'General'
  | 'Examination'
  | 'Academic'
  | 'Admissions'
  | 'Fee'
  | 'Holiday'
  | 'Emergency';

export type NoticePriority = 'High' | 'Medium' | 'Low';

export type NoticeType = 'Circular' | 'Notification' | 'Order' | 'Announcement';

export type NoticeTargetAudience = 'All' | 'Students' | 'Faculty' | 'Staff';

export type NoticeStatus =
  | 'draft'
  | 'pending'
  | 'approved'
  | 'scheduled'
  | 'published'
  | 'rejected'
  | 'expired'
  | 'archived';

export interface NoticeAuthor {
  userId: string;
  name: string;
  role: string;
  departmentId?: string;
}

export interface NoticeReviewer {
  userId: string;
  name: string;
  role: string;
  reviewedAt: string;
}

export interface Notice {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category: NoticeCategory;
  noticeType: NoticeType;
  priority: NoticePriority;
  targetAudience: NoticeTargetAudience;
  departmentId?: string | null;
  status: NoticeStatus;
  publishAt: string;
  expiresAt?: string | null;
  isPinned: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  author: NoticeAuthor;
  reviewer?: NoticeReviewer | null;
  rejectionReason?: string | null;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PublicNotice {
  id: string;
  _id?: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  category: string;
  noticeType: string;
  priority: string;
  targetAudience: string;
  departmentId?: string | null;
  publishAt: string;
  expiresAt?: string | null;
  isPinned: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  author?: {
    name: string;
    role: string;
  };
}

export interface NoticeMetrics {
  total: number;
  draft: number;
  pending: number;
  approved: number;
  scheduled: number;
  published: number;
  rejected: number;
  expired: number;
  archived: number;
}

export interface CreateNoticeDto {
  title: string;
  slug?: string;
  content: string;
  summary?: string;
  category: NoticeCategory;
  noticeType?: NoticeType;
  priority: NoticePriority;
  targetAudience?: NoticeTargetAudience;
  departmentId?: string | null;
  status?: 'draft' | 'pending' | 'published' | 'scheduled';
  publishAt?: string;
  expiresAt?: string | null;
  isPinned?: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}

export interface UpdateNoticeDto {
  title?: string;
  content?: string;
  summary?: string;
  category?: NoticeCategory;
  noticeType?: NoticeType;
  priority?: NoticePriority;
  targetAudience?: NoticeTargetAudience;
  departmentId?: string | null;
  status?: NoticeStatus;
  publishAt?: string;
  expiresAt?: string | null;
  isPinned?: boolean;
  attachmentUrl?: string | null;
  attachmentName?: string | null;
}

export interface ReviewNoticeDto {
  action: 'approve' | 'reject';
  rejectionReason?: string;
}

export interface PublishNoticeDto {
  publishAt?: string;
  expiresAt?: string | null;
}

export interface NoticeCategoryCount {
  category: string;
  count: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  notice?: T;
  metrics?: NoticeMetrics;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
