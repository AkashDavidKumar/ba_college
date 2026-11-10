/**
 * club.ts — TypeScript Interfaces and DTOs for Clubs & Memberships
 * Matching Bishop Ambrose College Backend Phase 4C-2 Specifications
 */

export const CLUB_CATEGORIES = [
  'Cultural',
  'Sports',
  'Social Service',
  'Academic',
  'Leadership',
  'Technical',
] as const;
export type ClubCategory = (typeof CLUB_CATEGORIES)[number];

export const CLUB_STATUSES = ['active', 'inactive', 'archived'] as const;
export type ClubStatus = (typeof CLUB_STATUSES)[number];

export const MEMBERSHIP_ROLES = [
  'member',
  'volunteer',
  'executive',
  'treasurer',
  'secretary',
  'vice_president',
  'president',
] as const;
export type MembershipRole = (typeof MEMBERSHIP_ROLES)[number];

export const MEMBERSHIP_STATUSES = [
  'pending',
  'active',
  'rejected',
  'inactive',
  'alumni',
] as const;
export type MembershipStatus = (typeof MEMBERSHIP_STATUSES)[number];

/** Full Club document interface for administrative views */
export interface Club {
  _id: string;
  name: string;
  slug: string;
  code: string;
  category: ClubCategory;
  description: string;
  departmentId?: string;
  facultyCoordinator: string;
  facultyCoordinatorEmail?: string;
  studentHeadUserId?: string;
  studentHeadName?: string;
  contactEmail: string;
  logoUrl?: string;
  bannerImage?: string;
  meetingSchedule?: string;
  roomOrVenue?: string;
  isRecruiting: boolean;
  memberCount: number;
  featuredOrder: number;
  isPublished: boolean;
  status: ClubStatus;
  achievements: string[];
  createdAt: string;
  updatedAt: string;
}

/** Public directory projection (strictly stripped of administrative/private info) */
export interface PublicClub {
  name: string;
  slug: string;
  code: string;
  category: ClubCategory;
  description: string;
  departmentId?: string;
  facultyCoordinator: string;
  contactEmail: string;
  logoUrl?: string;
  bannerImage?: string;
  meetingSchedule?: string;
  roomOrVenue?: string;
  isRecruiting: boolean;
  memberCount: number;
  achievements: string[];
}

/** Public roster entry (strictly active + opted-in only, zero applicant PII) */
export interface PublicClubMember {
  studentName: string;
  degree: string;
  yearOfStudy: number;
  role: MembershipRole;
  joinedAt?: string;
}

/** Administrative membership application and roster interface */
export interface AdminClubMembership {
  _id: string;
  clubSlug: string;
  clubId?: string;
  studentName: string;
  registerNumber: string;
  departmentId: string;
  degree: string;
  yearOfStudy: number;
  personalEmail: string;
  phoneNumber: string;
  reasonForJoining?: string;
  role: MembershipRole;
  status: MembershipStatus;
  isPublicDirectoryOptIn: boolean;
  directoryConsentAt?: string;
  registeredIp?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  internalNotes?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Create Club Payload */
export interface CreateClubDto {
  name: string;
  slug: string;
  code: string;
  category: ClubCategory;
  description: string;
  departmentId?: string;
  facultyCoordinator: string;
  facultyCoordinatorEmail?: string;
  contactEmail: string;
  logoUrl?: string;
  bannerImage?: string;
  meetingSchedule?: string;
  roomOrVenue?: string;
  isRecruiting?: boolean;
  featuredOrder?: number;
  isPublished?: boolean;
}

/** Update Club Payload */
export interface UpdateClubDto extends Partial<CreateClubDto> {
  status?: ClubStatus;
  achievements?: string[];
}

/** Assign Club Head Payload */
export interface AssignClubHeadDto {
  userId: string;
  studentHeadName?: string;
}

/** Public Membership Registration Payload */
export interface RegisterMembershipDto {
  studentName: string;
  registerNumber: string;
  departmentId: string;
  degree: string;
  yearOfStudy: number;
  personalEmail: string;
  phoneNumber: string;
  reasonForJoining?: string;
  confirmPublicDirectoryConsent?: boolean;
}

/** Review Membership (Approve/Reject) Payload */
export interface ReviewMembershipDto {
  status?: 'active' | 'rejected';
  role?: MembershipRole;
  rejectionReason?: string;
  internalNotes?: string;
}

/** Update Membership Lifecycle Payload */
export interface UpdateMembershipLifecycleDto {
  status?: MembershipStatus;
  role?: MembershipRole;
  internalNotes?: string;
}

/** Public Directory Consent Withdrawal Payload */
export interface WithdrawConsentDto {
  registerNumber: string;
  personalEmail: string;
}

/** Standard Paginated API Response Envelope */
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  count?: number;
  total?: number;
  page?: number;
  totalPages?: number;
}
