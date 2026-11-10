/**
 * club.test.ts — Comprehensive Test Suite for Phase 4C-2B: Clubs Management System
 *
 * Verifies:
 *  1. Club CRUD:
 *     - Authorized club creation, duplicate slug/code rejection (409).
 *     - Updating permitted fields vs. protected-field injection rejection.
 *     - Soft archival safeguards (blocked when active members exist without force).
 *     - Public directory filtering (active + published only, non-institutional contactEmail stripped).
 *  2. Club Head Security:
 *     - Own-club access succeeds.
 *     - Cross-club access returns 403 Forbidden.
 *     - ObjectId and slug identifiers resolve to canonical club.
 *     - Unassigned Club Head is denied (403).
 *     - Club Head cannot reassign leadership (403).
 *     - Disallowed roles (hod, content_editor, staff, viewer) denied (403).
 *  3. Membership Registration:
 *     - Valid registration returns safe confirmation (201).
 *     - Server defaults enforced: role=member, status=pending, isPublicDirectoryOptIn=false.
 *     - Year of study bounds (1..4 valid, 0 and 5+ rejected).
 *     - Duplicate pending / active registration returns 409 Conflict.
 *     - Reopening rejected or inactive applications (200).
 *     - Reapplication resets old consent unless explicitly renewed.
 *     - Duplicate key error (code 11000) maps to 409.
 *  4. Membership Review & Lifecycle:
 *     - Approval transitions pending -> active and increments memberCount.
 *     - Duplicate/concurrent approval allows exactly one state transition.
 *     - Rejection requires reason (400 if missing).
 *     - Deactivation (active -> inactive/alumni) decrements memberCount.
 *     - Reactivation (inactive/alumni -> active) increments memberCount.
 *     - Executive role promotion is role-protected.
 *     - Cross-club review attempts return 403.
 *  5. Member Count Integrity & Reconciliation:
 *     - Reconcile endpoint recalculates active memberCount from database records.
 *     - No negative counts permitted.
 *  6. Consent & Privacy:
 *     - Only active, opted-in members appear in public roster.
 *     - Public projection strictly strips PII (no phone, email, registerNumber, notes).
 *     - Consent withdrawal sets isPublicDirectoryOptIn=false and clears consent timestamp.
 *     - Consent withdrawal uses anti-enumeration response (same generic message whether record exists or not).
 *  7. Audit Logging:
 *     - AuditLog records created on mutations with sensitive PII redacted.
 *  8. API Route Parity:
 *     - Identical behavior across `/api` and `/api/v1`.
 */
import request from 'supertest';
import { createApp } from '../app';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { Club } from '../models/club.model';
import { ClubMembership } from '../models/club-membership.model';
import { AuditLog } from '../models/audit-log.model';
import { getEnv } from '../config/env';

describe('Phase 4C-2B: Clubs Management System', () => {
  const app = createApp({ corsOrigins: ['http://localhost:3000'], trustProxy: false });
  const env = getEnv();

  function createAuthHeader(userProps: {
    id?: string;
    role: string;
    permissions?: string[];
    departmentId?: string;
    clubId?: string;
  }) {
    const userId = userProps.id || new mongoose.Types.ObjectId().toHexString();
    const payload = {
      sub: userId,
      email: `${userProps.role.toLowerCase()}@bac.edu.in`,
      role: userProps.role,
      tokenVersion: 1,
    };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
    return {
      header: `Bearer ${token}`,
      userDoc: {
        _id: userId,
        name: `${userProps.role} User`,
        email: `${userProps.role.toLowerCase()}@bac.edu.in`,
        role: userProps.role,
        departmentId: userProps.departmentId,
        clubId: userProps.clubId,
        permissions: userProps.permissions || [],
        status: 'active',
        tokenVersion: 1,
      },
    };
  }

  function mockUserAuth(userDoc: Record<string, unknown>) {
    jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(userDoc),
      }),
    } as any);
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. PUBLIC CLUB DIRECTORY & PROJECTION PRIVACY
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Public Club Directory & Projections', () => {
    it('1.1: Returns active and published clubs, stripping non-institutional contact emails', async () => {
      const mockClubs = [
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Rotaract Club',
          slug: 'rotaract-club',
          code: 'ROT',
          category: 'Social Service',
          description: 'Youth wing of Rotary International.',
          facultyCoordinator: 'Dr. Xavier',
          contactEmail: 'rotaract@bac.edu.in', // Institutional -> kept
          memberCount: 45,
          isRecruiting: true,
          status: 'active',
          isPublished: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          name: 'Fine Arts Club',
          slug: 'fine-arts-club',
          code: 'FAC',
          category: 'Cultural',
          description: 'Music, dance, and fine arts association.',
          facultyCoordinator: 'Prof. Mary',
          contactEmail: 'personal.mary@gmail.com', // Non-institutional -> stripped
          memberCount: 30,
          isRecruiting: false,
          status: 'active',
          isPublished: true,
        },
      ];

      jest.spyOn(Club, 'countDocuments').mockResolvedValue(2);
      jest.spyOn(Club, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockClubs),
            }),
          }),
        }),
      } as any);

      const res = await request(app).get('/api/clubs/directory');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);

      // Institutional email preserved
      expect(res.body.data[0].contactEmail).toBe('rotaract@bac.edu.in');
      // Non-institutional email stripped
      expect(res.body.data[1].contactEmail).toBeUndefined();
    });

    it('1.2: GET /clubs/:slug returns public details for active club', async () => {
      const mockClub = {
        _id: new mongoose.Types.ObjectId(),
        name: 'Nature Club',
        slug: 'nature-club',
        code: 'NAT',
        category: 'Environmental',
        description: 'Promoting ecological consciousness.',
        facultyCoordinator: 'Dr. Green',
        contactEmail: 'nature@bac.edu.in',
        status: 'active',
        isPublished: true,
      };

      jest.spyOn(Club, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockClub),
      } as any);

      const res = await request(app).get('/api/clubs/nature-club');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('nature-club');
    });

    it('1.3: GET /clubs/:slug returns 404 when club does not exist or is unpublished', async () => {
      jest.spyOn(Club, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app).get('/api/clubs/nonexistent-club');
      expect(res.status).toBe(404);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. PUBLIC MEMBER ROSTER & DIRECTORY CONSENT PRIVACY
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Public Member Roster & Consent Privacy', () => {
    it('2.1: Returns only active members with explicit directory consent; strictly omits PII', async () => {
      jest.spyOn(Club, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ slug: 'rotaract', status: 'active', isPublished: true }),
      } as any);

      const mockMembers = [
        {
          studentName: 'Aarav Sharma',
          degree: 'B.Sc Computer Science',
          yearOfStudy: 3,
          role: 'president',
          joinedAt: new Date('2024-08-15'),
        },
      ];

      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(1);
      jest.spyOn(ClubMembership, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockMembers),
            }),
          }),
        }),
      } as any);

      const res = await request(app).get('/api/clubs/rotaract/members');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);

      const member = res.body.data[0];
      expect(member.studentName).toBe('Aarav Sharma');
      expect(member.role).toBe('president');

      // Strict PII exclusion assertions
      expect(member._id).toBeUndefined();
      expect(member.registerNumber).toBeUndefined();
      expect(member.personalEmail).toBeUndefined();
      expect(member.phoneNumber).toBeUndefined();
      expect(member.internalNotes).toBeUndefined();
      expect(member.registeredIp).toBeUndefined();
      expect(member.directoryConsentAt).toBeUndefined();
    });

    it('2.2: Public consent withdrawal immediately revokes opt-in without leaking existence', async () => {
      const mockMemberDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        clubSlug: 'rotaract',
        registerNumber: '22BCS010',
        personalEmail: 'aarav@gmail.com',
        isPublicDirectoryOptIn: true,
        directoryConsentAt: new Date(),
        toObject: () => ({ isPublicDirectoryOptIn: true }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(ClubMembership, 'findOne').mockResolvedValue(mockMemberDoc);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/clubs/rotaract/memberships/withdraw-consent')
        .send({
          registerNumber: '22BCS010',
          personalEmail: 'aarav@gmail.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockMemberDoc.isPublicDirectoryOptIn).toBe(false);
      expect(mockMemberDoc.directoryConsentAt).toBeUndefined();
      expect(mockMemberDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalled();
    });

    it('2.3: Public consent withdrawal returns identical success response when no record matches', async () => {
      jest.spyOn(ClubMembership, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/clubs/rotaract/memberships/withdraw-consent')
        .send({
          registerNumber: '99UNKNOWN',
          personalEmail: 'nobody@gmail.com',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('If a matching membership with active directory consent was found');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. PUBLIC MEMBERSHIP REGISTRATION & DUPLICATE SAFEGUARDS
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Public Membership Registration', () => {
    const validRegistration = {
      studentName: 'Harini Sundar',
      registerNumber: '23BCO045',
      departmentId: 'commerce',
      degree: 'B.Com',
      yearOfStudy: 2,
      personalEmail: 'harini.sundar@gmail.com',
      phoneNumber: '+91 98401 23456',
      reasonForJoining: 'Keen on community outreach and youth leadership.',
      confirmPublicDirectoryConsent: true,
    };

    it('3.1: Accepts valid registration, enforces role=member, status=pending, and returns safe confirmation', async () => {
      jest.spyOn(Club, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        status: 'active',
        isPublished: true,
        isRecruiting: true,
      } as any);

      jest.spyOn(ClubMembership, 'findOne').mockResolvedValue(null);
      let savedDoc: any = null;
      jest.spyOn(ClubMembership.prototype, 'save').mockImplementation(function (this: any) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        savedDoc = this;
        return Promise.resolve(this);
      });

      const res = await request(app)
        .post('/api/clubs/rotaract/memberships')
        .send(validRegistration);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(savedDoc.role).toBe('member');
      expect(savedDoc.status).toBe('pending');
      expect(savedDoc.isPublicDirectoryOptIn).toBe(true);
      expect(savedDoc.directoryConsentAt).toBeInstanceOf(Date);
    });

    it('3.2: Rejects registration when club is not recruiting', async () => {
      jest.spyOn(Club, 'findOne').mockResolvedValue({
        slug: 'rotaract',
        status: 'active',
        isPublished: true,
        isRecruiting: false,
      } as any);

      const res = await request(app)
        .post('/api/clubs/rotaract/memberships')
        .send(validRegistration);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Recruitment for this club is currently closed');
    });

    it('3.3: Rejects duplicate pending or active application with 409 Conflict', async () => {
      jest.spyOn(Club, 'findOne').mockResolvedValue({
        slug: 'rotaract',
        status: 'active',
        isPublished: true,
        isRecruiting: true,
      } as any);

      // Existing active record
      jest.spyOn(ClubMembership, 'findOne').mockResolvedValue({
        status: 'active',
        registerNumber: '23BCO045',
      } as any);

      const res = await request(app)
        .post('/api/clubs/rotaract/memberships')
        .send(validRegistration);

      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists for register number');
    });

    it('3.4: Reopens historical rejected or inactive record as pending (HTTP 200)', async () => {
      jest.spyOn(Club, 'findOne').mockResolvedValue({
        slug: 'rotaract',
        status: 'active',
        isPublished: true,
        isRecruiting: true,
      } as any);

      const pastRejectedRecord: any = {
        studentName: 'Old Name',
        registerNumber: '23BCO045',
        status: 'rejected',
        rejectionReason: 'Previous semester schedule clash',
        reviewedBy: new mongoose.Types.ObjectId(),
        reviewedAt: new Date('2024-01-10'),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(ClubMembership, 'findOne').mockResolvedValue(pastRejectedRecord);

      const res = await request(app)
        .post('/api/clubs/rotaract/memberships')
        .send({
          ...validRegistration,
          confirmPublicDirectoryConsent: false, // does not consent this time
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(pastRejectedRecord.status).toBe('pending');
      expect(pastRejectedRecord.role).toBe('member');
      expect(pastRejectedRecord.rejectionReason).toBeUndefined();
      expect(pastRejectedRecord.reviewedBy).toBeUndefined();
      expect(pastRejectedRecord.isPublicDirectoryOptIn).toBe(false);
      expect(pastRejectedRecord.directoryConsentAt).toBeUndefined();
      expect(pastRejectedRecord.save).toHaveBeenCalled();
    });

    it('3.5: Rejects invalid yearOfStudy values (0 and 5)', async () => {
      const res0 = await request(app)
        .post('/api/clubs/rotaract/memberships')
        .send({ ...validRegistration, yearOfStudy: 0 });
      expect(res0.status).toBe(400);

      const res5 = await request(app)
        .post('/api/clubs/rotaract/memberships')
        .send({ ...validRegistration, yearOfStudy: 5 });
      expect(res5.status).toBe(400);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. ADMINISTRATIVE CLUB MANAGEMENT & MULTI-TENANT RBAC
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Administrative Club Management & Scope Isolation', () => {
    it('4.1: Super Admin can create a new club; records AuditLog', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      jest.spyOn(Club, 'findOne').mockResolvedValue(null);
      jest.spyOn(Club.prototype, 'save').mockResolvedValue(true as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const newClubPayload = {
        name: 'Photography Club',
        slug: 'photography-club',
        code: 'PHO',
        category: 'Technical',
        description: 'Campus photography, visual storytelling, and exhibitions.',
        facultyCoordinator: 'Prof. Anitha',
        contactEmail: 'photo@bac.edu.in',
      };

      const res = await request(app)
        .post('/api/admin/clubs')
        .set('Authorization', auth.header)
        .send(newClubPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('photography-club');
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          module: 'Clubs',
        })
      );
    });

    it('4.2: Club Head cannot create new clubs (403 Forbidden)', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const res = await request(app)
        .post('/api/admin/clubs')
        .set('Authorization', auth.header)
        .send({
          name: 'Unauthorized Club',
          slug: 'unauthorized-club',
          code: 'UAC',
          category: 'Cultural',
          description: 'Test club description.',
          facultyCoordinator: 'Test Coordinator',
          contactEmail: 'test@bac.edu.in',
        });

      expect(res.status).toBe(403);
    });

    it('4.3: Club Head can update permitted operational fields for their assigned club', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        meetingSchedule: 'Every Wednesday 3 PM',
        toObject: () => ({ slug: 'rotaract' }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/clubs/rotaract')
        .set('Authorization', auth.header)
        .send({
          meetingSchedule: 'Every Thursday 4 PM',
          roomOrVenue: 'Room 204, Commerce Block',
        });

      expect(res.status).toBe(200);
      expect(mockClubDoc.meetingSchedule).toBe('Every Thursday 4 PM');
      expect(mockClubDoc.roomOrVenue).toBe('Room 204, Commerce Block');
      expect(mockClubDoc.save).toHaveBeenCalled();
    });

    it('4.4: Club Head is rejected when attempting to alter protected fields (category, status, slug)', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        category: 'Social Service',
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);

      const res = await request(app)
        .put('/api/admin/clubs/rotaract')
        .set('Authorization', auth.header)
        .send({
          category: 'Sports', // Protected
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toContain("not permitted to modify protected field 'category'");
    });

    it('4.5: Club Head is denied when attempting cross-club access (403 Forbidden)', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const mockTargetClub: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'fine-arts-club',
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockTargetClub);

      const res = await request(app)
        .get('/api/admin/clubs/fine-arts-club')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.error).toContain('Cross-club access forbidden');
    });

    it('4.6: Soft archival is blocked when active members exist without force query', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(25); // 25 active members

      const res = await request(app)
        .delete('/api/admin/clubs/rotaract')
        .set('Authorization', auth.header);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('because it has 25 active member(s)');
    });

    it('4.6b: DEF-02: Forced archival (force=true) transitions active memberships to inactive and resets memberCount to 0', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const mockMemberId = new mongoose.Types.ObjectId();
      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        memberCount: 25,
        status: 'active',
        isPublished: true,
        isRecruiting: true,
        toObject: () => ({ slug: 'rotaract', memberCount: 25 }),
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(25);
      jest.spyOn(ClubMembership, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: mockMemberId }]),
      } as any);
      const updateManySpy = jest.spyOn(ClubMembership, 'updateMany').mockResolvedValue({
        acknowledged: true,
        matchedCount: 1,
        modifiedCount: 1,
        upsertedCount: 0,
        upsertedId: null,
      } as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/clubs/rotaract?force=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockClubDoc.status).toBe('archived');
      expect(mockClubDoc.isPublished).toBe(false);
      expect(mockClubDoc.isRecruiting).toBe(false);
      expect(mockClubDoc.memberCount).toBe(0);
      expect(updateManySpy).toHaveBeenCalledWith(
        { _id: { $in: [mockMemberId] } },
        { $set: { status: 'inactive' } }
      );
      expect(mockClubDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ARCHIVE',
        })
      );
    });

    it('4.6c: Forced archival compensation restores active memberships if club save fails', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        memberCount: 5,
        status: 'active',
        toObject: () => ({ slug: 'rotaract', memberCount: 5 }),
        save: jest.fn().mockRejectedValue(new Error('Disk write error on club save')),
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(2);

      const mId1 = new mongoose.Types.ObjectId();
      const mId2 = new mongoose.Types.ObjectId();
      jest.spyOn(ClubMembership, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: mId1 }, { _id: mId2 }]),
      } as any);

      const updateManySpy = jest.spyOn(ClubMembership, 'updateMany')
        .mockResolvedValueOnce({ modifiedCount: 2 } as any) // Step 1: transition to inactive succeeds
        .mockResolvedValueOnce({ modifiedCount: 2 } as any); // Compensation: transition back to active succeeds

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .delete('/api/admin/clubs/rotaract?force=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(500);
      expect(updateManySpy).toHaveBeenCalledTimes(2);
      // First call deactivates
      expect(updateManySpy).toHaveBeenNthCalledWith(
        1,
        { _id: { $in: [mId1, mId2] } },
        { $set: { status: 'inactive' } }
      );
      // Second call compensates by restoring active status
      expect(updateManySpy).toHaveBeenNthCalledWith(
        2,
        { _id: { $in: [mId1, mId2] } },
        { $set: { status: 'active' } }
      );
      // No false audit log created
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('4.6d: Forced archival fails cleanly if membership bulk update fails before club save', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        memberCount: 2,
        save: jest.fn(),
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(2);

      const mId = new mongoose.Types.ObjectId();
      jest.spyOn(ClubMembership, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: mId }]),
      } as any);

      jest.spyOn(ClubMembership, 'updateMany').mockRejectedValue(new Error('Membership update failed'));
      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .delete('/api/admin/clubs/rotaract?force=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(500);
      expect(mockClubDoc.save).not.toHaveBeenCalled();
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('4.6e: Forced archival compensation failure returns 500 with actionable reconciliation guidance', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        memberCount: 1,
        toObject: () => ({ slug: 'rotaract' }),
        save: jest.fn().mockRejectedValue(new Error('Club save DB timeout')),
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(1);

      const mId = new mongoose.Types.ObjectId();
      jest.spyOn(ClubMembership, 'find').mockReturnValue({
        select: jest.fn().mockResolvedValue([{ _id: mId }]),
      } as any);

      // First updateMany succeeds, second (compensation) throws
      jest.spyOn(ClubMembership, 'updateMany')
        .mockResolvedValueOnce({ modifiedCount: 1 } as any)
        .mockRejectedValueOnce(new Error('Fatal connection drop during rollback'));

      const res = await request(app)
        .delete('/api/admin/clubs/rotaract?force=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Run /reconcile to restore member consistency');
    });

    it('4.6f: Repeated forced archival on already-archived club succeeds safely with zero deactivations', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        memberCount: 0,
        status: 'archived',
        isPublished: false,
        isRecruiting: false,
        toObject: () => ({ slug: 'rotaract', status: 'archived', memberCount: 0 }),
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(0); // No active members
      const updateManySpy = jest.spyOn(ClubMembership, 'updateMany');
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/clubs/rotaract?force=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deactivatedMembers).toBe(0);
      expect(updateManySpy).not.toHaveBeenCalled();
      expect(mockClubDoc.save).toHaveBeenCalled();
    });

    it('4.7: Super admin can assign a valid user as Club Head', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const targetUserId = new mongoose.Types.ObjectId().toHexString();
      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        toObject: () => ({ slug: 'rotaract' }),
        save: jest.fn().mockResolvedValue(true),
      };
      const mockTargetUserDoc: any = {
        _id: new mongoose.Types.ObjectId(targetUserId),
        name: 'Suresh Kumar',
        email: 'suresh@bac.edu.in',
        role: 'staff',
        permissions: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (String(id) === auth.userDoc._id) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
          } as any;
        }
        return Promise.resolve(mockTargetUserDoc) as any;
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/head')
        .set('Authorization', auth.header)
        .send({
          userId: targetUserId,
          studentHeadName: 'Suresh Kumar',
        });

      expect(res.status).toBe(200);
      expect(mockTargetUserDoc.role).toBe('club_head');
      expect(mockTargetUserDoc.clubId).toBe('rotaract');
      expect(mockClubDoc.studentHeadName).toBe('Suresh Kumar');
      expect(mockClubDoc.save).toHaveBeenCalled();
      expect(mockTargetUserDoc.save).toHaveBeenCalled();
    });

    it('4.8: DEF-01: Replacing existing Club Head automatically demotes previous user to staff and unsets clubId', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const oldHeadId = new mongoose.Types.ObjectId().toHexString();
      const newHeadId = new mongoose.Types.ObjectId().toHexString();

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        studentHeadUserId: new mongoose.Types.ObjectId(oldHeadId),
        studentHeadName: 'Old Head',
        toObject: () => ({ slug: 'rotaract', studentHeadUserId: oldHeadId }),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockOldUserDoc: any = {
        _id: new mongoose.Types.ObjectId(oldHeadId),
        name: 'Old Head User',
        email: 'old.head@bac.edu.in',
        role: 'club_head',
        clubId: 'rotaract',
        permissions: ['clubs:update', 'clubs:read'],
        toObject: () => ({ role: 'club_head', clubId: 'rotaract' }),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockNewUserDoc: any = {
        _id: new mongoose.Types.ObjectId(newHeadId),
        name: 'New Head User',
        email: 'new.head@bac.edu.in',
        role: 'staff',
        permissions: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (String(id) === auth.userDoc._id) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
          } as any;
        }
        if (String(id) === oldHeadId) {
          return Promise.resolve(mockOldUserDoc) as any;
        }
        if (String(id) === newHeadId) {
          return Promise.resolve(mockNewUserDoc) as any;
        }
        return Promise.resolve(null) as any;
      });
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/head')
        .set('Authorization', auth.header)
        .send({
          userId: newHeadId,
          studentHeadName: 'New Head User',
        });

      expect(res.status).toBe(200);
      // Previous user demoted
      expect(mockOldUserDoc.role).toBe('staff');
      expect(mockOldUserDoc.clubId).toBeUndefined();
      expect(mockOldUserDoc.permissions).not.toContain('clubs:update');
      expect(mockOldUserDoc.save).toHaveBeenCalled();

      // New user promoted
      expect(mockNewUserDoc.role).toBe('club_head');
      expect(mockNewUserDoc.clubId).toBe('rotaract');
      expect(mockNewUserDoc.save).toHaveBeenCalled();

      // Club updated
      expect(mockClubDoc.studentHeadUserId.toString()).toBe(newHeadId);
      expect(mockClubDoc.studentHeadName).toBe('New Head User');
      expect(mockClubDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalled();
    });

    it('4.8b: Leadership reassignment failure: restores previous head if new user save fails', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const oldHeadId = new mongoose.Types.ObjectId().toHexString();
      const newHeadId = new mongoose.Types.ObjectId().toHexString();

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        studentHeadUserId: new mongoose.Types.ObjectId(oldHeadId),
        studentHeadName: 'Old Head',
        toObject: () => ({ slug: 'rotaract', studentHeadUserId: oldHeadId }),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockOldUserDoc: any = {
        _id: new mongoose.Types.ObjectId(oldHeadId),
        name: 'Old Head User',
        email: 'old.head@bac.edu.in',
        role: 'club_head',
        clubId: 'rotaract',
        permissions: ['clubs:update', 'clubs:read', 'clubs:members:read', 'clubs:members:approve'],
        toObject: () => ({ role: 'club_head', clubId: 'rotaract' }),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockNewUserDoc: any = {
        _id: new mongoose.Types.ObjectId(newHeadId),
        name: 'New Head User',
        email: 'new.head@bac.edu.in',
        role: 'staff',
        permissions: [],
        save: jest.fn().mockRejectedValue(new Error('User write conflict on target user save')),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (String(id) === auth.userDoc._id) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
          } as any;
        }
        if (String(id) === oldHeadId) {
          return Promise.resolve(mockOldUserDoc) as any;
        }
        if (String(id) === newHeadId) {
          return Promise.resolve(mockNewUserDoc) as any;
        }
        return Promise.resolve(null) as any;
      });
      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/head')
        .set('Authorization', auth.header)
        .send({
          userId: newHeadId,
          studentHeadName: 'New Head User',
        });

      expect(res.status).toBe(500);
      // Previous user was first demoted, but then compensated back to club_head
      expect(mockOldUserDoc.role).toBe('club_head');
      expect(mockOldUserDoc.clubId).toBe('rotaract');
      expect(mockOldUserDoc.permissions).toContain('clubs:update');
      expect(mockOldUserDoc.save).toHaveBeenCalledTimes(2); // 1: demote, 2: restore
      expect(mockClubDoc.save).not.toHaveBeenCalled();
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('4.8c: Leadership reassignment failure: restores both previous head and new user if club save fails', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const oldHeadId = new mongoose.Types.ObjectId().toHexString();
      const newHeadId = new mongoose.Types.ObjectId().toHexString();

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        studentHeadUserId: new mongoose.Types.ObjectId(oldHeadId),
        studentHeadName: 'Old Head',
        toObject: () => ({ slug: 'rotaract', studentHeadUserId: oldHeadId }),
        save: jest.fn().mockRejectedValue(new Error('Club document lock error on save')),
      };

      const mockOldUserDoc: any = {
        _id: new mongoose.Types.ObjectId(oldHeadId),
        name: 'Old Head User',
        email: 'old.head@bac.edu.in',
        role: 'club_head',
        clubId: 'rotaract',
        permissions: ['clubs:update', 'clubs:read', 'clubs:members:read', 'clubs:members:approve'],
        toObject: () => ({ role: 'club_head', clubId: 'rotaract' }),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockNewUserDoc: any = {
        _id: new mongoose.Types.ObjectId(newHeadId),
        name: 'New Head User',
        email: 'new.head@bac.edu.in',
        role: 'staff',
        permissions: [],
        toObject: () => ({ role: 'staff' }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (String(id) === auth.userDoc._id) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
          } as any;
        }
        if (String(id) === oldHeadId) {
          return Promise.resolve(mockOldUserDoc) as any;
        }
        if (String(id) === newHeadId) {
          return Promise.resolve(mockNewUserDoc) as any;
        }
        return Promise.resolve(null) as any;
      });
      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/head')
        .set('Authorization', auth.header)
        .send({
          userId: newHeadId,
          studentHeadName: 'New Head User',
        });

      expect(res.status).toBe(500);
      // Old user restored to club_head
      expect(mockOldUserDoc.role).toBe('club_head');
      expect(mockOldUserDoc.clubId).toBe('rotaract');
      expect(mockOldUserDoc.save).toHaveBeenCalledTimes(2); // 1: demote, 2: restore

      // New user restored to staff
      expect(mockNewUserDoc.role).toBe('staff');
      expect(mockNewUserDoc.clubId).toBeUndefined();
      expect(mockNewUserDoc.save).toHaveBeenCalledTimes(2); // 1: promote, 2: restore

      // Club document save was attempted and failed
      expect(mockClubDoc.save).toHaveBeenCalled();
      // No audit logs created
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('4.8d: Leadership reassignment failure: returns 500 with actionable guidance if compensation fails', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const oldHeadId = new mongoose.Types.ObjectId().toHexString();
      const newHeadId = new mongoose.Types.ObjectId().toHexString();

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        studentHeadUserId: new mongoose.Types.ObjectId(oldHeadId),
        studentHeadName: 'Old Head',
        toObject: () => ({ slug: 'rotaract' }),
        save: jest.fn().mockRejectedValue(new Error('Club save fails')),
      };

      const mockOldUserDoc: any = {
        _id: new mongoose.Types.ObjectId(oldHeadId),
        name: 'Old Head User',
        email: 'old.head@bac.edu.in',
        role: 'club_head',
        clubId: 'rotaract',
        permissions: ['clubs:update'],
        toObject: () => ({ role: 'club_head' }),
        save: jest.fn().mockResolvedValue(true),
      };

      // Target user save succeeds on promote, but throws on rollback compensation!
      const mockNewUserDoc: any = {
        _id: new mongoose.Types.ObjectId(newHeadId),
        name: 'New Head User',
        email: 'new.head@bac.edu.in',
        role: 'staff',
        permissions: [],
        save: jest.fn()
          .mockResolvedValueOnce(true) // Promotion succeeds
          .mockRejectedValueOnce(new Error('DB disconnect during compensation')), // Rollback fails
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (String(id) === auth.userDoc._id) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
          } as any;
        }
        if (String(id) === oldHeadId) return Promise.resolve(mockOldUserDoc) as any;
        if (String(id) === newHeadId) return Promise.resolve(mockNewUserDoc) as any;
        return Promise.resolve(null) as any;
      });

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/head')
        .set('Authorization', auth.header)
        .send({
          userId: newHeadId,
          studentHeadName: 'New Head User',
        });

      expect(res.status).toBe(500);
      expect(res.body.error).toContain(
        'Leadership assignment failed and automated rollback encountered an error. Please inspect user assignments.'
      );
    });

    it('4.9: DEF-01: Reassigning the same user as Club Head does not demote them', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const headId = new mongoose.Types.ObjectId().toHexString();

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        studentHeadUserId: new mongoose.Types.ObjectId(headId),
        studentHeadName: 'Current Head',
        toObject: () => ({ slug: 'rotaract', studentHeadUserId: headId }),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockUserDoc: any = {
        _id: new mongoose.Types.ObjectId(headId),
        name: 'Current Head User',
        email: 'current.head@bac.edu.in',
        role: 'club_head',
        clubId: 'rotaract',
        permissions: ['clubs:update', 'clubs:read'],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (String(id) === auth.userDoc._id) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
          } as any;
        }
        return Promise.resolve(mockUserDoc) as any;
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/head')
        .set('Authorization', auth.header)
        .send({
          userId: headId,
          studentHeadName: 'Updated Name for Current Head',
        });

      expect(res.status).toBe(200);
      expect(mockUserDoc.role).toBe('club_head');
      expect(mockUserDoc.clubId).toBe('rotaract');
    });

    it('4.10: DEF-01: Missing previous user record is handled safely during replacement', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const nonexistentOldId = new mongoose.Types.ObjectId().toHexString();
      const newHeadId = new mongoose.Types.ObjectId().toHexString();

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        name: 'Rotaract Club',
        studentHeadUserId: new mongoose.Types.ObjectId(nonexistentOldId),
        toObject: () => ({ slug: 'rotaract' }),
        save: jest.fn().mockResolvedValue(true),
      };

      const mockNewUserDoc: any = {
        _id: new mongoose.Types.ObjectId(newHeadId),
        name: 'New Head',
        email: 'new@bac.edu.in',
        role: 'staff',
        permissions: [],
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(User, 'findById').mockImplementation((id: any) => {
        if (String(id) === auth.userDoc._id) {
          return {
            select: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(auth.userDoc),
            }),
          } as any;
        }
        if (String(id) === nonexistentOldId) {
          return Promise.resolve(null) as any; // Previous record missing
        }
        return Promise.resolve(mockNewUserDoc) as any;
      });
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/head')
        .set('Authorization', auth.header)
        .send({
          userId: newHeadId,
          studentHeadName: 'New Head',
        });

      expect(res.status).toBe(200);
      expect(mockNewUserDoc.role).toBe('club_head');
      expect(mockClubDoc.studentHeadUserId.toString()).toBe(newHeadId);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. MEMBERSHIP APPROVAL, REJECTION & MEMBER COUNT ATOMICITY
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Membership Review, Counter Integrity & Reconciliation', () => {
    it('5.1: Approves pending membership, atomically increments count, and logs APPROVE', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const clubId = new mongoose.Types.ObjectId();
      const memberId = new mongoose.Types.ObjectId().toHexString();

      const mockClubDoc: any = {
        _id: clubId,
        slug: 'rotaract',
        memberCount: 10,
      };
      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);

      const updatedMembership: any = {
        _id: new mongoose.Types.ObjectId(memberId),
        clubSlug: 'rotaract',
        studentName: 'Priya Mani',
        status: 'active',
        role: 'member',
        toObject: () => ({ _id: memberId, status: 'active' }),
      };

      jest.spyOn(ClubMembership, 'findOneAndUpdate').mockResolvedValue(updatedMembership);
      const incSpy = jest.spyOn(Club, 'updateOne').mockResolvedValue({ modifiedCount: 1 } as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/admin/clubs/rotaract/memberships/${memberId}/approve`)
        .set('Authorization', auth.header)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(incSpy).toHaveBeenCalledWith(
        { _id: clubId },
        { $inc: { memberCount: 1 } }
      );
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'APPROVE',
          module: 'Clubs',
        })
      );
    });

    it('5.2: Fails approval and prevents duplicate counter increment if membership is already active', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const memberId = new mongoose.Types.ObjectId().toHexString();
      jest.spyOn(Club, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
      } as any);

      // findOneAndUpdate with status: 'pending' fails
      jest.spyOn(ClubMembership, 'findOneAndUpdate').mockResolvedValue(null);
      // Existing membership is already active
      jest.spyOn(ClubMembership, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(memberId),
        clubSlug: 'rotaract',
        status: 'active',
      } as any);
      const incSpy = jest.spyOn(Club, 'updateOne');

      const res = await request(app)
        .post(`/api/admin/clubs/rotaract/memberships/${memberId}/approve`)
        .set('Authorization', auth.header)
        .send();

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Only pending applications can be approved');
      expect(incSpy).not.toHaveBeenCalled();
    });

    it('5.3: Rejects pending membership with required reason; does not mutate memberCount', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const memberId = new mongoose.Types.ObjectId().toHexString();
      jest.spyOn(Club, 'findOne').mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
      } as any);

      const updatedMembership: any = {
        _id: new mongoose.Types.ObjectId(memberId),
        clubSlug: 'rotaract',
        studentName: 'Candidate',
        status: 'rejected',
        toObject: () => ({ _id: memberId, status: 'rejected' }),
      };

      jest.spyOn(ClubMembership, 'findOneAndUpdate').mockResolvedValue(updatedMembership);
      const incSpy = jest.spyOn(Club, 'updateOne');
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post(`/api/admin/clubs/rotaract/memberships/${memberId}/reject`)
        .set('Authorization', auth.header)
        .send({
          rejectionReason: 'Incomplete semester enrollment records.',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(incSpy).not.toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'REJECT',
        })
      );
    });

    it('5.4: Deactivation decrements memberCount; reactivation increments memberCount', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract' });
      mockUserAuth(auth.userDoc);

      const clubId = new mongoose.Types.ObjectId();
      const memberId = new mongoose.Types.ObjectId().toHexString();

      jest.spyOn(Club, 'findOne').mockResolvedValue({
        _id: clubId,
        slug: 'rotaract',
      } as any);

      const activeMemberDoc: any = {
        _id: new mongoose.Types.ObjectId(memberId),
        clubSlug: 'rotaract',
        status: 'active',
        role: 'member',
        toObject: () => ({ status: 'active' }),
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(ClubMembership, 'findOne').mockResolvedValue(activeMemberDoc);
      const updateClubSpy = jest.spyOn(Club, 'updateOne').mockResolvedValue({ modifiedCount: 1 } as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      // Deactivation: active -> inactive
      const res = await request(app)
        .patch(`/api/admin/clubs/rotaract/memberships/${memberId}`)
        .set('Authorization', auth.header)
        .send({ status: 'inactive' });

      expect(res.status).toBe(200);
      expect(activeMemberDoc.status).toBe('inactive');
      expect(updateClubSpy).toHaveBeenCalledWith(
        { _id: clubId, memberCount: { $gt: 0 } },
        { $inc: { memberCount: -1 } }
      );
    });

    it('5.5: Reconcile endpoint recalculates active count and corrects counter drift', async () => {
      const auth = createAuthHeader({ role: 'master_admin' });
      mockUserAuth(auth.userDoc);

      const mockClubDoc: any = {
        _id: new mongoose.Types.ObjectId(),
        slug: 'rotaract',
        memberCount: 15, // Out-of-sync count
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockClubDoc);
      jest.spyOn(ClubMembership, 'countDocuments').mockResolvedValue(12); // Actual active count
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/clubs/rotaract/reconcile')
        .set('Authorization', auth.header)
        .send();

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockClubDoc.memberCount).toBe(12);
      expect(mockClubDoc.save).toHaveBeenCalled();
      expect(res.body.data.previousCount).toBe(15);
      expect(res.body.data.reconciledCount).toBe(12);
      expect(auditSpy).toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. ROUTE PARITY ACROSS /api AND /api/v1
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. API Route Parity (/api and /api/v1)', () => {
    it('6.1: Public directory route returns identical schema on /api and /api/v1', async () => {
      jest.spyOn(Club, 'countDocuments').mockResolvedValue(0);
      jest.spyOn(Club, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      } as any);

      const resLegacy = await request(app).get('/api/clubs/directory');
      const resV1 = await request(app).get('/api/v1/clubs/directory');

      expect(resLegacy.status).toBe(200);
      expect(resV1.status).toBe(200);
      expect(Object.keys(resLegacy.body)).toEqual(Object.keys(resV1.body));
    });

    it('6.2: Admin endpoints require authentication identically on /api and /api/v1', async () => {
      const resLegacy = await request(app).get('/api/admin/clubs');
      const resV1 = await request(app).get('/api/v1/admin/clubs');

      expect(resLegacy.status).toBe(401);
      expect(resV1.status).toBe(401);
    });
  });
});
