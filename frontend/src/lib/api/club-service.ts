/**
 * club-service.ts — Centralized Frontend API Service for Clubs & Memberships
 *
 * Implements:
 *  1. Public Club Directory & Profile retrieval
 *  2. Public Member Roster retrieval (strictly active & opted-in only)
 *  3. Public Student Membership Registration with server defaults
 *  4. Public Directory Consent Withdrawal with anti-enumeration protection
 *  5. Administrative Club Management (CRUD, scope-guarded updates, soft archival with force option)
 *  6. Administrative Club Head Assignment with conflict detection
 *  7. Administrative Membership Application Review (approval, rejection with mandatory reason)
 *  8. Administrative Membership Lifecycle Management & Role Promotion
 *  9. Member Count Synchronization & Reconciliation
 */

import { apiClient, ApiError } from '../api-client.ts';
import type {
  Club,
  PublicClub,
  PublicClubMember,
  AdminClubMembership,
  CreateClubDto,
  UpdateClubDto,
  AssignClubHeadDto,
  RegisterMembershipDto,
  ReviewMembershipDto,
  UpdateMembershipLifecycleDto,
  WithdrawConsentDto,
  ApiResponse,
} from '../../types/club.ts';

export const clubService = {
  // ════════════════════════════════════════════════════════════════════════════
  // 1. PUBLIC DIRECTORY & ROSTER ENDPOINTS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Fetch active and published clubs for public directory display.
   * Strip non-institutional contact details server-side.
   */
  async getPublicDirectory(params?: {
    category?: string;
    search?: string;
  }): Promise<ApiResponse<PublicClub[]>> {
    return apiClient.get<ApiResponse<PublicClub[]>>('/clubs/directory', {
      params: {
        category: params?.category && params.category !== 'All' ? params.category : undefined,
        search: params?.search ? params.search.trim() : undefined,
      },
    });
  },

  /**
   * Fetch a single published club profile by its canonical slug.
   */
  async getPublicClub(slug: string): Promise<ApiResponse<PublicClub>> {
    const cleanSlug = encodeURIComponent(slug.toLowerCase().trim());
    return apiClient.get<ApiResponse<PublicClub>>(`/clubs/${cleanSlug}`);
  },

  /**
   * Fetch public member roster for a club.
   * Strictly returns active members with verified affirmative directory consent.
   */
  async getPublicRoster(
    slug: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PublicClubMember[]>> {
    const cleanSlug = encodeURIComponent(slug.toLowerCase().trim());
    return apiClient.get<ApiResponse<PublicClubMember[]>>(`/clubs/${cleanSlug}/members`, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
  },

  /**
   * Submit student membership application for a club.
   * Server strictly enforces pending status, member role, and optional directory consent.
   */
  async registerMembership(
    slug: string,
    payload: RegisterMembershipDto
  ): Promise<ApiResponse<Record<string, unknown>>> {
    const cleanSlug = encodeURIComponent(slug.toLowerCase().trim());
    return apiClient.post<ApiResponse<Record<string, unknown>>>(
      `/clubs/${cleanSlug}/memberships`,
      payload
    );
  },

  /**
   * Public directory consent withdrawal.
   * Returns generic anti-enumeration response whether record exists or not.
   */
  async withdrawConsent(
    slug: string,
    payload: WithdrawConsentDto
  ): Promise<ApiResponse<null>> {
    const cleanSlug = encodeURIComponent(slug.toLowerCase().trim());
    return apiClient.post<ApiResponse<null>>(
      `/clubs/${cleanSlug}/memberships/withdraw-consent`,
      payload
    );
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2. ADMINISTRATIVE CLUB MANAGEMENT ENDPOINTS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * List all clubs for administrative management.
   * Automatically filtered to assigned club for club_head by backend scope guard.
   */
  async getAdminClubs(params?: {
    search?: string;
    category?: string;
    status?: string;
  }): Promise<ApiResponse<Club[]>> {
    return apiClient.get<ApiResponse<Club[]>>('/admin/clubs', {
      params: {
        search: params?.search ? params.search.trim() : undefined,
        category: params?.category && params.category !== 'All' ? params.category : undefined,
        status: params?.status && params.status !== 'All' ? params.status : undefined,
      },
    });
  },

  /**
   * Fetch single club administrative record by ID or canonical slug.
   */
  async getAdminClub(idOrSlug: string): Promise<ApiResponse<Club>> {
    const identifier = encodeURIComponent(idOrSlug.trim());
    return apiClient.get<ApiResponse<Club>>(`/admin/clubs/${identifier}`);
  },

  /**
   * Create a new club (Master Admin / Sub Admin only).
   */
  async createClub(payload: CreateClubDto): Promise<ApiResponse<Club>> {
    return apiClient.post<ApiResponse<Club>>('/admin/clubs', payload);
  },

  /**
   * Update existing club details.
   * Club Heads are forbidden from mutating protected organizational fields.
   */
  async updateClub(idOrSlug: string, payload: UpdateClubDto): Promise<ApiResponse<Club>> {
    const identifier = encodeURIComponent(idOrSlug.trim());
    return apiClient.put<ApiResponse<Club>>(`/admin/clubs/${identifier}`, payload);
  },

  /**
   * Soft-archive a club.
   * If active members exist, force=true is required to transition them to inactive.
   */
  async archiveClub(
    idOrSlug: string,
    force = false
  ): Promise<ApiResponse<{ id: string; slug: string; status: string; memberCount: number; deactivatedMembers: number }>> {
    const identifier = encodeURIComponent(idOrSlug.trim());
    return apiClient.delete<ApiResponse<{ id: string; slug: string; status: string; memberCount: number; deactivatedMembers: number }>>(
      `/admin/clubs/${identifier}`,
      {
        params: { force: force ? 'true' : undefined },
      }
    );
  },

  /**
   * Assign or replace student head for a club (Master Admin / Sub Admin only).
   */
  async assignClubHead(
    idOrSlug: string,
    payload: AssignClubHeadDto
  ): Promise<ApiResponse<{ clubId: string; clubSlug: string; studentHeadUserId: string; studentHeadName: string }>> {
    const identifier = encodeURIComponent(idOrSlug.trim());
    return apiClient.post<ApiResponse<{ clubId: string; clubSlug: string; studentHeadUserId: string; studentHeadName: string }>>(
      `/admin/clubs/${identifier}/head`,
      payload
    );
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 3. ADMINISTRATIVE MEMBERSHIP & ROSTER ENDPOINTS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * List all membership applications and roster entries for a club.
   */
  async getClubMemberships(
    idOrSlug: string,
    params?: {
      status?: string;
      role?: string;
      search?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<AdminClubMembership[]>> {
    const identifier = encodeURIComponent(idOrSlug.trim());
    return apiClient.get<ApiResponse<AdminClubMembership[]>>(`/admin/clubs/${identifier}/memberships`, {
      params: {
        status: params?.status && params.status !== 'All' ? params.status : undefined,
        role: params?.role && params.role !== 'All' ? params.role : undefined,
        search: params?.search ? params.search.trim() : undefined,
        page: params?.page || 1,
        limit: params?.limit || 50,
      },
    });
  },

  /**
   * Approve a pending membership application and increment memberCount.
   */
  async approveMembership(
    idOrSlug: string,
    memberId: string
  ): Promise<ApiResponse<AdminClubMembership>> {
    const clubId = encodeURIComponent(idOrSlug.trim());
    const mId = encodeURIComponent(memberId.trim());
    return apiClient.post<ApiResponse<AdminClubMembership>>(
      `/admin/clubs/${clubId}/memberships/${mId}/approve`
    );
  },

  /**
   * Reject a pending membership application with mandatory rejection reason.
   */
  async rejectMembership(
    idOrSlug: string,
    memberId: string,
    payload: { rejectionReason: string; internalNotes?: string }
  ): Promise<ApiResponse<AdminClubMembership>> {
    const clubId = encodeURIComponent(idOrSlug.trim());
    const mId = encodeURIComponent(memberId.trim());
    return apiClient.post<ApiResponse<AdminClubMembership>>(
      `/admin/clubs/${clubId}/memberships/${mId}/reject`,
      {
        status: 'rejected',
        rejectionReason: payload.rejectionReason,
        internalNotes: payload.internalNotes,
      }
    );
  },

  /**
   * Update membership status, promote to executive role, or update internal notes.
   */
  async updateMembership(
    idOrSlug: string,
    memberId: string,
    payload: UpdateMembershipLifecycleDto
  ): Promise<ApiResponse<AdminClubMembership>> {
    const clubId = encodeURIComponent(idOrSlug.trim());
    const mId = encodeURIComponent(memberId.trim());
    return apiClient.patch<ApiResponse<AdminClubMembership>>(
      `/admin/clubs/${clubId}/memberships/${mId}`,
      payload
    );
  },

  /**
   * Recalculate and reconcile club memberCount from actual active database records.
   */
  async reconcileMemberCount(
    idOrSlug: string
  ): Promise<ApiResponse<{ clubSlug: string; memberCount: number; difference: number; rectified: boolean }>> {
    const identifier = encodeURIComponent(idOrSlug.trim());
    return apiClient.post<ApiResponse<{ clubSlug: string; memberCount: number; difference: number; rectified: boolean }>>(
      `/admin/clubs/${identifier}/reconcile`
    );
  },
};

export default clubService;
