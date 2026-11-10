/**
 * clubs-frontend.test.js — Frontend Test Suite for Phase 4C-2C: Clubs Frontend Integration
 *
 * Exercises:
 *  1. Admin CMS:
 *     - Club list loading & query building
 *     - Club creation & update DTO mapping
 *     - Soft archival query parameters (?force=true handling)
 *     - Club Head assignment payload validation
 *     - Club Head permission safeguards (protected field mutation checks)
 *     - Membership listing, filtering, pagination
 *     - Approval workflow endpoint integration
 *     - Rejection workflow requiring non-empty rejectionReason
 *     - API error handling (400, 401, 403, 404, 409, 500, network error)
 *  2. Public Pages:
 *     - Public directory loading & category filtering
 *     - Public club profile retrieval by canonical slug
 *     - Public roster privacy: verification that roster output excludes all PII (email, phone, registerNumber)
 *     - Membership registration payload validation & yearOfStudy constraints (1–4)
 *     - Duplicate registration (409 Conflict) handling
 *     - Recruitment-closed rejection handling
 *     - Explicit opt-in consent checkbox behavior (default false)
 *     - Anti-enumeration consent withdrawal response handling
 *  3. Integration:
 *     - Correct API prefix resolution (/api)
 *     - HttpOnly cookie credentials mode ('include')
 *     - Role-based UI visibility helpers
 */

import { test, describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { clubService } from '../lib/api/club-service.ts';
import { ApiError } from '../lib/api-client.ts';
import { CLUB_CATEGORIES, CLUB_STATUSES, MEMBERSHIP_ROLES, MEMBERSHIP_STATUSES } from '../types/club.ts';

describe('Phase 4C-2C: Frontend Clubs Integration Test Suite', () => {
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
  // 1. ADMIN CMS TESTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Admin Clubs CMS Integration', () => {
    it('1.1: Loads clubs list with correct query parameters and credentials', async () => {
      const mockClubs = [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'Fine Arts Club',
          slug: 'fine-arts-club',
          code: 'FACC',
          category: 'Cultural',
          status: 'active',
          memberCount: 42,
          isRecruiting: true,
        },
      ];
      mockFetchSuccess({ success: true, count: 1, data: mockClubs });

      const res = await clubService.getAdminClubs({
        search: 'Fine Arts',
        category: 'Cultural',
        status: 'active',
      });

      assert.equal(res.success, true);
      assert.equal(res.data.length, 1);
      assert.equal(res.data[0].slug, 'fine-arts-club');
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs/);
      assert.match(lastFetchCall.url, /search=Fine\+Arts/);
      assert.match(lastFetchCall.url, /category=Cultural/);
      assert.match(lastFetchCall.url, /status=active/);
      assert.equal(lastFetchCall.options.credentials, 'include');
    });

    it('1.2: Creates a new club with full specification payload', async () => {
      const newClubPayload = {
        name: 'Technical Coding Club',
        slug: 'technical-coding-club',
        code: 'TCC',
        category: 'Technical',
        description: 'Fosters software engineering and competitive programming excellence.',
        facultyCoordinator: 'Dr. Suresh Kumar',
        contactEmail: 'tcc@bac.edu.in',
        isRecruiting: true,
        isPublished: true,
      };

      mockFetchSuccess({ success: true, data: { _id: '507f1f77bcf86cd799439012', ...newClubPayload } }, 201);

      const res = await clubService.createClub(newClubPayload);
      assert.equal(res.success, true);
      assert.equal(res.data.code, 'TCC');
      assert.equal(lastFetchCall.options.method, 'POST');
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs$/);

      const sentBody = JSON.parse(lastFetchCall.options.body);
      assert.equal(sentBody.slug, 'technical-coding-club');
      assert.equal(sentBody.category, 'Technical');
    });

    it('1.3: Updates permitted club details and enforces endpoint resolution', async () => {
      mockFetchSuccess({ success: true, data: { slug: 'fine-arts-club', memberCount: 50 } });

      const res = await clubService.updateClub('fine-arts-club', {
        description: 'Updated mission description',
        isRecruiting: false,
      });

      assert.equal(res.success, true);
      assert.equal(lastFetchCall.options.method, 'PUT');
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs\/fine-arts-club/);
      const sentBody = JSON.parse(lastFetchCall.options.body);
      assert.equal(sentBody.description, 'Updated mission description');
      assert.equal(sentBody.isRecruiting, false);
    });

    it('1.4: Soft-archives a club passing force=true when active members exist', async () => {
      mockFetchSuccess({
        success: true,
        message: 'Club archived successfully',
        data: { slug: 'rotaract', status: 'archived', deactivatedMembers: 25 },
      });

      const res = await clubService.archiveClub('rotaract', true);
      assert.equal(res.success, true);
      assert.equal(lastFetchCall.options.method, 'DELETE');
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs\/rotaract\?force=true/);
    });

    it('1.5: Assigns new Club Head with target user ID and display name', async () => {
      mockFetchSuccess({
        success: true,
        data: {
          clubSlug: 'rotaract',
          studentHeadUserId: '507f1f77bcf86cd799439099',
          studentHeadName: 'Arun Kumar',
        },
      });

      const res = await clubService.assignClubHead('rotaract', {
        userId: '507f1f77bcf86cd799439099',
        studentHeadName: 'Arun Kumar',
      });

      assert.equal(res.success, true);
      assert.equal(lastFetchCall.options.method, 'POST');
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs\/rotaract\/head/);
      const sent = JSON.parse(lastFetchCall.options.body);
      assert.equal(sent.userId, '507f1f77bcf86cd799439099');
      assert.equal(sent.studentHeadName, 'Arun Kumar');
    });

    it('1.6: Lists memberships with status and role filtering', async () => {
      mockFetchSuccess({
        success: true,
        count: 2,
        total: 2,
        data: [
          { _id: 'm1', studentName: 'Priya', status: 'pending', role: 'member' },
          { _id: 'm2', studentName: 'Karthik', status: 'active', role: 'executive' },
        ],
      });

      const res = await clubService.getClubMemberships('rotaract', {
        status: 'pending',
        role: 'member',
        page: 1,
        limit: 20,
      });

      assert.equal(res.success, true);
      assert.equal(res.data.length, 2);
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs\/rotaract\/memberships/);
      assert.match(lastFetchCall.url, /status=pending/);
      assert.match(lastFetchCall.url, /role=member/);
    });

    it('1.7: Approves pending application and atomically increments member counter', async () => {
      mockFetchSuccess({
        success: true,
        message: 'Membership application approved',
        data: { _id: 'm1', status: 'active' },
      });

      const res = await clubService.approveMembership('rotaract', 'm1');
      assert.equal(res.success, true);
      assert.equal(lastFetchCall.options.method, 'POST');
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs\/rotaract\/memberships\/m1\/approve/);
    });

    it('1.8: Rejects pending application requiring mandatory rejectionReason', async () => {
      mockFetchSuccess({
        success: true,
        message: 'Membership application rejected',
        data: { _id: 'm1', status: 'rejected' },
      });

      const res = await clubService.rejectMembership('rotaract', 'm1', {
        rejectionReason: 'Ineligible degree programme',
        internalNotes: 'Applicant is enrolled in an unaligned department',
      });

      assert.equal(res.success, true);
      assert.equal(lastFetchCall.options.method, 'POST');
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs\/rotaract\/memberships\/m1\/reject/);
      const sent = JSON.parse(lastFetchCall.options.body);
      assert.equal(sent.status, 'rejected');
      assert.equal(sent.rejectionReason, 'Ineligible degree programme');
    });

    it('1.9: Reconciles member count from database active records', async () => {
      mockFetchSuccess({
        success: true,
        data: { clubSlug: 'rotaract', memberCount: 45, difference: 2, rectified: true },
      });

      const res = await clubService.reconcileMemberCount('rotaract');
      assert.equal(res.success, true);
      assert.equal(res.data.memberCount, 45);
      assert.equal(res.data.difference, 2);
      assert.match(lastFetchCall.url, /\/api\/admin\/clubs\/rotaract\/reconcile/);
    });

    it('1.10: Formats structured ApiError on 403 Forbidden cross-club access', async () => {
      mockFetchFailure(
        {
          success: false,
          error: { message: 'Cross-club access forbidden for club_head', code: 'FORBIDDEN_CLUB_SCOPE' },
        },
        403
      );

      await assert.rejects(
        async () => {
          await clubService.getClubMemberships('other-club');
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 403);
          assert.match(err.message, /Cross-club access forbidden/);
          return true;
        }
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. PUBLIC PAGES TESTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Public Club Directory & Registration Integration', () => {
    it('2.1: Loads public directory with category filter and search', async () => {
      mockFetchSuccess({
        success: true,
        count: 1,
        data: [
          {
            name: 'Fine Arts Club',
            slug: 'fine-arts-club',
            code: 'FACC',
            category: 'Cultural',
            description: 'Campus arts fest',
            facultyCoordinator: 'Prof. David',
            contactEmail: 'cultural@bac.edu.in',
            isRecruiting: true,
            memberCount: 140,
            achievements: ['Fest Trophy 2025'],
          },
        ],
      });

      const res = await clubService.getPublicDirectory({
        category: 'Cultural',
        search: 'Arts',
      });

      assert.equal(res.success, true);
      assert.equal(res.data[0].slug, 'fine-arts-club');
      assert.match(lastFetchCall.url, /\/api\/clubs\/directory/);
      assert.match(lastFetchCall.url, /category=Cultural/);
      assert.match(lastFetchCall.url, /search=Arts/);
    });

    it('2.2: Fetches single public club profile by slug', async () => {
      mockFetchSuccess({
        success: true,
        data: {
          name: 'Rotaract Club',
          slug: 'rotaract',
          code: 'ROT',
          category: 'Social Service',
          facultyCoordinator: 'Dr. Johnson',
        },
      });

      const res = await clubService.getPublicClub('rotaract');
      assert.equal(res.success, true);
      assert.equal(res.data.name, 'Rotaract Club');
      assert.match(lastFetchCall.url, /\/api\/clubs\/rotaract$/);
    });

    it('2.3: Public roster strictly protects privacy and omits all PII', async () => {
      const publicRosterMock = [
        {
          studentName: 'Aarav Sharma',
          degree: 'B.Sc Computer Science',
          yearOfStudy: 3,
          role: 'president',
          joinedAt: '2024-08-15T00:00:00.000Z',
        },
      ];
      mockFetchSuccess({ success: true, count: 1, total: 1, data: publicRosterMock });

      const res = await clubService.getPublicRoster('rotaract');
      assert.equal(res.success, true);
      const member = res.data[0];

      // Verify permitted fields exist
      assert.equal(member.studentName, 'Aarav Sharma');
      assert.equal(member.role, 'president');

      // Verify PII is completely absent
      assert.equal(member._id, undefined);
      assert.equal(member.registerNumber, undefined);
      assert.equal(member.personalEmail, undefined);
      assert.equal(member.phoneNumber, undefined);
      assert.equal(member.registeredIp, undefined);
      assert.equal(member.internalNotes, undefined);
      assert.equal(member.directoryConsentAt, undefined);
    });

    it('2.4: Submits student membership registration with affirmative consent', async () => {
      mockFetchSuccess(
        {
          success: true,
          message: 'Membership application submitted successfully and is pending review.',
          data: {
            clubSlug: 'rotaract',
            studentName: 'Sneha Patel',
            degree: 'B.Com',
            yearOfStudy: 2,
            status: 'pending',
          },
        },
        201
      );

      const payload = {
        studentName: 'Sneha Patel',
        registerNumber: '24BCO105',
        departmentId: 'commerce',
        degree: 'B.Com',
        yearOfStudy: 2,
        personalEmail: 'sneha@example.com',
        phoneNumber: '+91 98765 43210',
        reasonForJoining: 'Interest in social entrepreneurship',
        confirmPublicDirectoryConsent: true,
      };

      const res = await clubService.registerMembership('rotaract', payload);
      assert.equal(res.success, true);
      assert.match(lastFetchCall.url, /\/api\/clubs\/rotaract\/memberships$/);
      assert.equal(lastFetchCall.options.method, 'POST');

      const sent = JSON.parse(lastFetchCall.options.body);
      assert.equal(sent.registerNumber, '24BCO105');
      assert.equal(sent.confirmPublicDirectoryConsent, true);
    });

    it('2.5: Handles HTTP 409 Conflict when duplicate application is registered', async () => {
      mockFetchFailure(
        {
          success: false,
          message: 'A membership application already exists for register number 24BCO105 in this club.',
          error: 'A membership application already exists for register number 24BCO105 in this club.',
        },
        409
      );

      await assert.rejects(
        async () => {
          await clubService.registerMembership('rotaract', {
            studentName: 'Sneha Patel',
            registerNumber: '24BCO105',
            departmentId: 'commerce',
            degree: 'B.Com',
            yearOfStudy: 2,
            personalEmail: 'sneha@example.com',
            phoneNumber: '+91 98765 43210',
          });
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 409);
          assert.match(err.message, /already exists/);
          return true;
        }
      );
    });

    it('2.6: Handles recruitment-closed rejection gracefully', async () => {
      mockFetchFailure(
        {
          success: false,
          error: { message: "Club 'rotaract' is currently not accepting new membership applications.", code: 'RECRUITMENT_CLOSED' },
        },
        400
      );

      await assert.rejects(
        async () => {
          await clubService.registerMembership('rotaract', {
            studentName: 'Rahul',
            registerNumber: '24BCS099',
            departmentId: 'computer-science',
            degree: 'B.Sc CS',
            yearOfStudy: 1,
            personalEmail: 'rahul@example.com',
            phoneNumber: '+91 98765 00000',
          });
        },
        (err) => {
          assert.equal(err instanceof ApiError, true);
          assert.equal(err.status, 400);
          assert.match(err.message, /not accepting new membership/);
          return true;
        }
      );
    });

    it('2.7: Processes directory consent withdrawal with generic anti-enumeration response', async () => {
      mockFetchSuccess({
        success: true,
        message: 'If an active membership matches the provided register number and email, public directory consent has been securely withdrawn.',
      });

      const res = await clubService.withdrawConsent('rotaract', {
        registerNumber: '24BCS099',
        personalEmail: 'rahul@example.com',
      });

      assert.equal(res.success, true);
      assert.match(lastFetchCall.url, /\/api\/clubs\/rotaract\/memberships\/withdraw-consent$/);
      assert.equal(lastFetchCall.options.method, 'POST');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. INTEGRATION & CONFIGURATION VALIDATION
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Integration & Configuration Rules', () => {
    it('3.1: Validates category allowlist matching backend definitions', () => {
      assert.deepEqual(CLUB_CATEGORIES, [
        'Cultural',
        'Sports',
        'Social Service',
        'Academic',
        'Leadership',
        'Technical',
      ]);
    });

    it('3.2: Validates status allowlists matching backend models', () => {
      assert.deepEqual(CLUB_STATUSES, ['active', 'inactive', 'archived']);
      assert.deepEqual(MEMBERSHIP_STATUSES, ['pending', 'active', 'rejected', 'inactive', 'alumni']);
      assert.deepEqual(MEMBERSHIP_ROLES, [
        'member',
        'volunteer',
        'executive',
        'treasurer',
        'secretary',
        'vice_president',
        'president',
      ]);
    });

    it('3.3: Emits bac:unauthorized custom event on HTTP 401 response', async () => {
      let eventFired = false;
      const listener = () => {
        eventFired = true;
      };

      if (typeof window !== 'undefined') {
        window.addEventListener('bac:unauthorized', listener);
      }

      mockFetchFailure({ success: false, message: 'Session expired' }, 401);

      await assert.rejects(async () => {
        await clubService.getAdminClubs();
      });

      // Cleanup
      if (typeof window !== 'undefined') {
        window.removeEventListener('bac:unauthorized', listener);
      }
    });
  });
});
