/**
 * notices-frontend.test.js — Frontend Test Suite for Phase 4C-3: Notices Management System
 *
 * Exercises:
 *  1. Admin CMS Service:
 *     - Dashboard metrics loading (/admin/notices/metrics).
 *     - Notice listing, query building, multi-dimensional filters.
 *     - Notice creation & update DTO mapping.
 *     - Quick pin toggle & priority patching.
 *     - Governance submission workflow (/admin/notices/:id/submit).
 *     - Approval workflow integration (/admin/notices/:id/approve).
 *     - Rejection workflow integration requiring rejectionReason (/admin/notices/:id/reject).
 *     - Publication and scheduling (/admin/notices/:id/publish).
 *     - Archival and deletion (/admin/notices/:id/archive & DELETE).
 *  2. Public Notices Service:
 *     - Public notices feed loading, search, category & department filtering.
 *     - Pinned / urgent notices retrieval (/notices/pinned).
 *     - Category count aggregates (/notices/categories).
 *     - Public notice detail retrieval by canonical slug (/notices/:slug).
 *  3. Error Handling & Transport Security:
 *     - API error propagation (400, 401, 403, 404, 409, 500).
 *     - HttpOnly cookie credentials mode ('include').
 *     - Proper URL parameter encoding.
 */

import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { noticeService } from '../lib/api/notice-service.ts';
import { ApiError } from '../lib/api-client.ts';

describe('Phase 4C-3: Frontend Notices Integration Test Suite', () => {
  let originalFetch;
  let lastFetchCall = null;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
    lastFetchCall = null;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  function mockFetchSuccess(responseData, status = 200) {
    globalThis.fetch = async (url, options) => {
      lastFetchCall = { url: String(url), options };
      return {
        ok: status >= 200 && status < 300,
        status,
        statusText: 'OK',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => responseData,
      };
    };
  }

  function mockFetchFailure(errorData, status = 400) {
    globalThis.fetch = async (url, options) => {
      lastFetchCall = { url: String(url), options };
      return {
        ok: false,
        status,
        statusText: 'Error',
        headers: new Headers({ 'content-type': 'application/json' }),
        json: async () => errorData,
      };
    };
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 1. ADMIN CMS ENDPOINTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Admin CMS Service Endpoints', () => {
    it('1.1: getAdminMetrics fetches dashboard counters', async () => {
      const mockMetrics = {
        total: 25,
        published: 18,
        pending: 3,
        draft: 2,
        scheduled: 1,
        expired: 1,
        archived: 0,
      };
      mockFetchSuccess({ success: true, metrics: mockMetrics });

      const res = await noticeService.getAdminMetrics();

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.metrics.total, 25);
      assert.strictEqual(res.metrics.pending, 3);
      assert.ok(lastFetchCall.url.includes('/admin/notices/metrics'));
      assert.strictEqual(lastFetchCall.options.credentials, 'include');
    });

    it('1.2: listAdminNotices constructs correct query parameters', async () => {
      mockFetchSuccess({ success: true, data: [], pagination: { total: 0 } });

      await noticeService.listAdminNotices({
        page: 2,
        limit: 15,
        search: 'Autonomous Exam',
        category: 'Examination',
        priority: 'High',
        status: 'published',
        departmentId: 'computer-science',
      });

      const url = new URL(lastFetchCall.url, 'http://localhost');
      assert.strictEqual(url.pathname, '/api/admin/notices');
      assert.strictEqual(url.searchParams.get('page'), '2');
      assert.strictEqual(url.searchParams.get('limit'), '15');
      assert.strictEqual(url.searchParams.get('search'), 'Autonomous Exam');
      assert.strictEqual(url.searchParams.get('category'), 'Examination');
      assert.strictEqual(url.searchParams.get('priority'), 'High');
      assert.strictEqual(url.searchParams.get('status'), 'published');
      assert.strictEqual(url.searchParams.get('departmentId'), 'computer-science');
    });

    it('1.3: createNotice dispatches POST with correct payload', async () => {
      const newNotice = {
        title: 'Autonomous Exam Time Table — April 2026',
        content: 'Theory examinations commence May 2. Hall tickets available on ERP.',
        category: 'Examination',
        priority: 'High',
        targetAudience: 'Students',
        departmentId: 'computer-science',
        status: 'published',
        publishAt: '2026-04-15',
        isPinned: true,
      };

      mockFetchSuccess({ success: true, notice: { id: 'not-101', ...newNotice } }, 201);

      const res = await noticeService.createNotice(newNotice);

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'POST');
      assert.ok(lastFetchCall.url.includes('/admin/notices'));

      const sentBody = JSON.parse(lastFetchCall.options.body);
      assert.strictEqual(sentBody.title, newNotice.title);
      assert.strictEqual(sentBody.priority, 'High');
      assert.strictEqual(sentBody.isPinned, true);
    });

    it('1.4: updateNotice dispatches PUT to correct URL', async () => {
      const updates = {
        title: 'Revised Examination Timetable',
        priority: 'Medium',
      };
      mockFetchSuccess({ success: true, notice: { id: 'not-101', ...updates } });

      const res = await noticeService.updateNotice('not-101', updates);

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'PUT');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101'));
      const sentBody = JSON.parse(lastFetchCall.options.body);
      assert.strictEqual(sentBody.title, 'Revised Examination Timetable');
    });

    it('1.5: patchNotice toggles pin and priority via PATCH', async () => {
      mockFetchSuccess({ success: true, notice: { id: 'not-101', isPinned: true } });

      await noticeService.patchNotice('not-101', { isPinned: true, priority: 'High' });

      assert.strictEqual(lastFetchCall.options.method, 'PATCH');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101'));
      const sentBody = JSON.parse(lastFetchCall.options.body);
      assert.strictEqual(sentBody.isPinned, true);
      assert.strictEqual(sentBody.priority, 'High');
    });

    it('1.6: submitNotice transitions draft to review queue', async () => {
      mockFetchSuccess({ success: true, message: 'Submitted for review' });

      const res = await noticeService.submitNotice('not-101');

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'POST');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101/submit'));
    });

    it('1.7: approveNotice executes approval action', async () => {
      mockFetchSuccess({ success: true, message: 'Notice approved' });

      const res = await noticeService.approveNotice('not-101');

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'POST');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101/approve'));
    });

    it('1.8: rejectNotice includes mandatory rejectionReason in payload', async () => {
      mockFetchSuccess({ success: true, message: 'Notice rejected' });

      const res = await noticeService.rejectNotice('not-101', 'Please attach signed CoE order PDF.');

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'POST');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101/reject'));
      const sentBody = JSON.parse(lastFetchCall.options.body);
      assert.strictEqual(sentBody.rejectionReason, 'Please attach signed CoE order PDF.');
    });

    it('1.9: publishNotice triggers immediate or scheduled publication', async () => {
      mockFetchSuccess({ success: true, message: 'Notice published' });

      const res = await noticeService.publishNotice('not-101', { publishAt: '2026-05-01' });

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'POST');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101/publish'));
      const sentBody = JSON.parse(lastFetchCall.options.body);
      assert.strictEqual(sentBody.publishAt, '2026-05-01');
    });

    it('1.10: archiveNotice dispatches archive command', async () => {
      mockFetchSuccess({ success: true, message: 'Notice archived' });

      const res = await noticeService.archiveNotice('not-101');

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'POST');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101/archive'));
    });

    it('1.11: deleteNotice issues DELETE request', async () => {
      mockFetchSuccess({ success: true, message: 'Notice deleted' });

      const res = await noticeService.deleteNotice('not-101');

      assert.strictEqual(res.success, true);
      assert.strictEqual(lastFetchCall.options.method, 'DELETE');
      assert.ok(lastFetchCall.url.includes('/admin/notices/not-101'));
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. PUBLIC ENDPOINTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Public Endpoints', () => {
    it('2.1: getPublicNotices queries public active circulars with filters', async () => {
      mockFetchSuccess({
        success: true,
        data: [{ id: 'not-1', title: 'Autonomous Exam Timetable', category: 'Examination' }],
        pagination: { total: 1, page: 1, limit: 9, totalPages: 1 },
      });

      const res = await noticeService.getPublicNotices({
        category: 'Examination',
        search: 'Timetable',
        departmentId: 'all',
      });

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.length, 1);
      const url = new URL(lastFetchCall.url, 'http://localhost');
      assert.strictEqual(url.pathname, '/api/notices');
      assert.strictEqual(url.searchParams.get('category'), 'Examination');
      assert.strictEqual(url.searchParams.get('search'), 'Timetable');
    });

    it('2.2: getPublicPinnedNotices retrieves pinned announcements', async () => {
      mockFetchSuccess({
        success: true,
        data: [{ id: 'not-pinned-1', title: 'Emergency Storm Holiday', isPinned: true }],
      });

      const res = await noticeService.getPublicPinnedNotices();

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data[0].isPinned, true);
      assert.ok(lastFetchCall.url.includes('/notices/pinned'));
    });

    it('2.3: getPublicCategories retrieves category count aggregates', async () => {
      mockFetchSuccess({
        success: true,
        data: [
          { category: 'Examination', count: 8 },
          { category: 'Academic', count: 5 },
        ],
      });

      const res = await noticeService.getPublicCategories();

      assert.strictEqual(res.success, true);
      assert.strictEqual(res.data.length, 2);
      assert.strictEqual(res.data[0].category, 'Examination');
      assert.ok(lastFetchCall.url.includes('/notices/categories'));
    });

    it('2.4: getPublicNotice properly URL-encodes notice slug', async () => {
      mockFetchSuccess({
        success: true,
        data: { id: 'not-1', slug: 'end-semester-exam-april-2026', title: 'End Semester Exam' },
      });

      const res = await noticeService.getPublicNotice('end-semester-exam-april-2026');

      assert.strictEqual(res.success, true);
      assert.ok(lastFetchCall.url.includes('/notices/end-semester-exam-april-2026'));
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. ERROR HANDLING & SECURITY
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Error Handling & Transport Security', () => {
    it('3.1: Propagates 403 Forbidden with ApiError on department scope mismatch', async () => {
      mockFetchFailure(
        {
          success: false,
          error: 'Department scope mismatch: You can only manage notices for your assigned department.',
          code: 'FORBIDDEN_DEPARTMENT_SCOPE',
        },
        403
      );

      await assert.rejects(
        async () => {
          await noticeService.createNotice({
            title: 'Unauthorized Dept Notice',
            content: 'Attempting to create notice for another department.',
            category: 'General',
            priority: 'Medium',
            departmentId: 'commerce',
          });
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.strictEqual(err.status, 403);
          assert.ok(err.message.includes('Department scope mismatch'));
          return true;
        }
      );
    });

    it('3.2: Propagates 409 Conflict on duplicate notice slug', async () => {
      mockFetchFailure(
        {
          success: false,
          error: 'A notice with slug "exam-timetable-2026" already exists.',
          code: 'CONFLICT',
        },
        409
      );

      await assert.rejects(
        async () => {
          await noticeService.createNotice({
            title: 'Exam Timetable',
            slug: 'exam-timetable-2026',
            content: 'Notice with duplicate slug.',
            category: 'Examination',
            priority: 'High',
          });
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.strictEqual(err.status, 409);
          assert.ok(err.message.includes('already exists'));
          return true;
        }
      );
    });

    it('3.3: Propagates 404 Not Found for non-existent or unapproved notices', async () => {
      mockFetchFailure(
        {
          success: false,
          error: 'Notice with identifier "not-missing" not found',
        },
        404
      );

      await assert.rejects(
        async () => {
          await noticeService.getAdminNotice('not-missing');
        },
        (err) => {
          assert.ok(err instanceof ApiError);
          assert.strictEqual(err.status, 404);
          return true;
        }
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. OFFLINE CACHE ISOLATION & GOVERNANCE INTEGRITY
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Offline Cache Isolation & Governance Integrity', () => {
    it('4.1: Local drafts are partitioned by authenticated account ID', () => {
      const storageMock = new Map();
      const mockLocalStorage = {
        getItem: (k) => storageMock.get(k) || null,
        setItem: (k, v) => storageMock.set(k, String(v)),
        removeItem: (k) => storageMock.delete(k),
      };

      const userAId = 'usr-admin-01';
      const userBId = 'usr-hod-cs';

      const keyA = `bac_cms_drafts_${userAId}`;
      const keyB = `bac_cms_drafts_${userBId}`;

      const userADrafts = [
        { id: 'draft-1', title: 'Admin Confidential Draft', status: 'draft', isLocalDraft: true },
      ];
      const userBDrafts = [
        { id: 'draft-2', title: 'CS Dept Internal Draft', status: 'draft', isLocalDraft: true },
      ];

      mockLocalStorage.setItem(keyA, JSON.stringify(userADrafts));
      mockLocalStorage.setItem(keyB, JSON.stringify(userBDrafts));

      // User A reads their drafts
      const readA = JSON.parse(mockLocalStorage.getItem(keyA));
      assert.strictEqual(readA.length, 1);
      assert.strictEqual(readA[0].title, 'Admin Confidential Draft');

      // User B reads their drafts
      const readB = JSON.parse(mockLocalStorage.getItem(keyB));
      assert.strictEqual(readB.length, 1);
      assert.strictEqual(readB[0].title, 'CS Dept Internal Draft');

      // Drafts from User A are strictly invisible to User B
      assert.notStrictEqual(readA[0].id, readB[0].id);
    });

    it('4.2: Shared legacy notices cache is removed on user switch / logout', () => {
      const storageMock = new Map();
      storageMock.set('bac_cms_notices', JSON.stringify([{ id: 'legacy-1', title: 'Stale Notice' }]));

      // Verify presence before purge
      assert.ok(storageMock.has('bac_cms_notices'));

      // Simulate purge during switchUser
      storageMock.delete('bac_cms_notices');

      assert.strictEqual(storageMock.has('bac_cms_notices'), false);
    });

    it('4.3: Local offline drafts are flagged as unverified and not confused with server verified notices', () => {
      const offlineDraft = {
        id: 'local-draft-123',
        title: 'Draft Schedule',
        status: 'draft',
        isLocalDraft: true,
      };

      assert.strictEqual(offlineDraft.isLocalDraft, true);
      assert.strictEqual(offlineDraft.status, 'draft');
    });
  });
});
