/**
 * notice-service.ts — Centralized Frontend API Service for Notices & Circulars
 *
 * Implements:
 *  1. Public Notices Feed retrieval (active, published, non-expired circulars).
 *  2. Public Pinned Notices and category count aggregates.
 *  3. Single public notice retrieval by slug.
 *  4. Administrative notice management (CRUD, scoped listing, metric counters).
 *  5. Governance approval workflow (submit, review, approve, reject with reason).
 *  6. Publication scheduling and lifecycle archival.
 */
import { apiClient } from '../api-client.ts';
import type {
  Notice,
  PublicNotice,
  NoticeMetrics,
  NoticeCategoryCount,
  CreateNoticeDto,
  UpdateNoticeDto,
  ReviewNoticeDto,
  PublishNoticeDto,
  ApiResponse,
} from '../../types/notice.ts';

export const noticeService = {
  // ════════════════════════════════════════════════════════════════════════════
  // 1. PUBLIC ENDPOINTS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Retrieves active published notices for public college website.
   */
  async getPublicNotices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    departmentId?: string;
    targetAudience?: string;
  }): Promise<ApiResponse<PublicNotice[]>> {
    return apiClient.get<ApiResponse<PublicNotice[]>>('/notices', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search ? params.search.trim() : undefined,
        category: params?.category && params.category !== 'All' ? params.category : undefined,
        departmentId: params?.departmentId && params.departmentId !== 'all' ? params.departmentId : undefined,
        targetAudience: params?.targetAudience && params.targetAudience !== 'All' ? params.targetAudience : undefined,
      },
    });
  },

  /**
   * Retrieves pinned and urgent circulars for homepage tickers or alert banners.
   */
  async getPublicPinnedNotices(): Promise<ApiResponse<PublicNotice[]>> {
    return apiClient.get<ApiResponse<PublicNotice[]>>('/notices/pinned');
  },

  /**
   * Retrieves active category counts.
   */
  async getPublicCategories(): Promise<ApiResponse<NoticeCategoryCount[]>> {
    return apiClient.get<ApiResponse<NoticeCategoryCount[]>>('/notices/categories');
  },

  /**
   * Retrieves a single published notice by slug.
   */
  async getPublicNotice(slug: string): Promise<ApiResponse<PublicNotice>> {
    const cleanSlug = encodeURIComponent(slug.toLowerCase().trim());
    return apiClient.get<ApiResponse<PublicNotice>>(`/notices/${cleanSlug}`);
  },

  // ════════════════════════════════════════════════════════════════════════════
  // 2. ADMINISTRATIVE ENDPOINTS
  // ════════════════════════════════════════════════════════════════════════════

  /**
   * Retrieves aggregate metric counters for admin dashboard.
   */
  async getAdminMetrics(): Promise<ApiResponse<NoticeMetrics>> {
    return apiClient.get<ApiResponse<NoticeMetrics>>('/admin/notices/metrics');
  },

  /**
   * Lists administrative notices with multidimensional filters and pagination.
   */
  async listAdminNotices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    priority?: string;
    status?: string;
    departmentId?: string;
    targetAudience?: string;
  }): Promise<ApiResponse<Notice[]>> {
    return apiClient.get<ApiResponse<Notice[]>>('/admin/notices', {
      params: {
        page: params?.page,
        limit: params?.limit,
        search: params?.search ? params.search.trim() : undefined,
        category: params?.category && params.category !== 'all' ? params.category : undefined,
        priority: params?.priority && params.priority !== 'all' ? params.priority : undefined,
        status: params?.status && params.status !== 'all' ? params.status : undefined,
        departmentId: params?.departmentId && params.departmentId !== 'all' ? params.departmentId : undefined,
        targetAudience: params?.targetAudience && params.targetAudience !== 'all' ? params.targetAudience : undefined,
      },
    });
  },

  /**
   * Retrieves single notice by ID or slug for administrative editing.
   */
  async getAdminNotice(id: string): Promise<ApiResponse<Notice>> {
    return apiClient.get<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}`);
  },

  /**
   * Creates a new Notice with governance controls.
   */
  async createNotice(dto: CreateNoticeDto): Promise<ApiResponse<Notice>> {
    return apiClient.post<ApiResponse<Notice>>('/admin/notices', dto);
  },

  /**
   * Updates an existing Notice.
   */
  async updateNotice(id: string, dto: UpdateNoticeDto): Promise<ApiResponse<Notice>> {
    return apiClient.put<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}`, dto);
  },

  /**
   * Quick toggle (pinned, priority).
   */
  async patchNotice(id: string, dto: { isPinned?: boolean; priority?: string }): Promise<ApiResponse<Notice>> {
    return apiClient.patch<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}`, dto);
  },

  /**
   * Submits a draft or rejected notice for review.
   */
  async submitNotice(id: string): Promise<ApiResponse<Notice>> {
    return apiClient.post<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}/submit`);
  },

  /**
   * Reviews a pending notice (approve or reject with mandatory reason).
   */
  async reviewNotice(id: string, dto: ReviewNoticeDto): Promise<ApiResponse<Notice>> {
    return apiClient.post<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}/review`, dto);
  },

  /**
   * Quick convenience wrapper for approval.
   */
  async approveNotice(id: string): Promise<ApiResponse<Notice>> {
    return apiClient.post<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}/approve`);
  },

  /**
   * Quick convenience wrapper for rejection.
   */
  async rejectNotice(id: string, rejectionReason: string): Promise<ApiResponse<Notice>> {
    return apiClient.post<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}/reject`, {
      rejectionReason,
    });
  },

  /**
   * Publishes or schedules an approved notice.
   */
  async publishNotice(id: string, dto?: PublishNoticeDto): Promise<ApiResponse<Notice>> {
    return apiClient.post<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}/publish`, dto || {});
  },

  /**
   * Archives a notice.
   */
  async archiveNotice(id: string): Promise<ApiResponse<Notice>> {
    return apiClient.post<ApiResponse<Notice>>(`/admin/notices/${encodeURIComponent(id)}/archive`);
  },

  /**
   * Permanently deletes or soft-archives notice.
   */
  async deleteNotice(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<ApiResponse<void>>(`/admin/notices/${encodeURIComponent(id)}`);
  },
};
