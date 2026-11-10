/**
 * club-models-and-scope.test.ts — Unit & Integration Tests for Phase 4C-2A
 *
 * Tests:
 *  1. Club model validation, normalization, and defaults.
 *  2. ClubMembership model validation, normalization, role/status defaults, and directory consent tracking.
 *  3. Canonical identity resolution helper (`resolveClubDocument`) by ObjectId and slug.
 *  4. Scoped authorization guard (`assertClubScope`) across all actual repository roles.
 *  5. Zod validation schemas (creation, updates, safe media URLs, registration, review constraints).
 */
import mongoose from 'mongoose';
import {
  Club,
  IClub,
  resolveClubDocument,
  ClubMembership,
  IClubMembership,
} from '../models';
import {
  createClubSchema,
  updateClubSchema,
  assignClubHeadSchema,
  registerMembershipSchema,
  reviewMembershipSchema,
} from '../validations';
import { assertClubScope } from '../middleware/scope-guard';
import { IAuthUser } from '../types';

describe('Phase 4C-2A: Clubs Data Models, Validation Schemas & Scope Guards', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. CLUB MODEL DESIGN, NORMALIZATION & DEFAULTS
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Club Model Design & Normalization', () => {
    it('1.1: Instantiates a valid Club document with correct defaults', () => {
      const clubData: Partial<IClub> = {
        name: 'Fine Arts & Cultural Club',
        slug: 'fine-arts-club',
        code: 'FACC',
        category: 'Cultural',
        description: 'Organizes inter-collegiate arts fests and theatre performances.',
        facultyCoordinator: 'Prof. R. David',
        contactEmail: 'cultural@bac.edu.in',
      };

      const club = new Club(clubData);
      const err = club.validateSync();

      expect(err).toBeUndefined();
      expect(club.name).toBe('Fine Arts & Cultural Club');
      expect(club.slug).toBe('fine-arts-club');
      expect(club.code).toBe('FACC');
      expect(club.category).toBe('Cultural');
      expect(club.status).toBe('active');
      expect(club.isPublished).toBe(false);
      expect(club.isRecruiting).toBe(true);
      expect(club.memberCount).toBe(0);
      expect(club.achievements).toEqual([]);
    });

    it('1.2: Normalizes slug to lowercase and code to uppercase on validation and save', async () => {
      const club = new Club({
        name: 'Rotaract Club of BAC',
        slug: '  ROTARACT-CLUB  ',
        code: '  rotaract  ',
        category: 'Social Service',
        description: 'Youth wing of Rotary international for leadership and community service.',
        facultyCoordinator: 'Dr. M. Xavier',
        contactEmail: '  ROTARACT@BAC.EDU.IN  ',
        facultyCoordinatorEmail: '  XAVIER@BAC.EDU.IN  ',
        departmentId: '  COMMERCE  ',
      });

      await club.validate();
      expect(club.slug).toBe('rotaract-club');
      expect(club.code).toBe('ROTARACT');
      expect(club.contactEmail).toBe('rotaract@bac.edu.in');
      expect(club.facultyCoordinatorEmail).toBe('xavier@bac.edu.in');
      expect(club.departmentId).toBe('commerce');
    });

    it('1.3: Fails validation when required fields are missing', () => {
      const club = new Club({});
      const err = club.validateSync();

      expect(err).toBeDefined();
      expect(err?.errors.name).toBeDefined();
      expect(err?.errors.slug).toBeDefined();
      expect(err?.errors.code).toBeDefined();
      expect(err?.errors.category).toBeDefined();
      expect(err?.errors.description).toBeDefined();
      expect(err?.errors.facultyCoordinator).toBeDefined();
      expect(err?.errors.contactEmail).toBeDefined();
    });

    it('1.4: Rejects invalid club category', () => {
      const club = new Club({
        name: 'Secret Society',
        slug: 'secret-society',
        code: 'SEC',
        category: 'IllegalCategory' as any,
        description: 'Test description',
        facultyCoordinator: 'Prof. X',
        contactEmail: 'sec@bac.edu.in',
      });

      const err = club.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.category).toBeDefined();
      expect(err?.errors.category.message).toContain('Invalid club category');
    });

    it('1.5: Rejects negative memberCount', () => {
      const club = new Club({
        name: 'Sports Association',
        slug: 'sports-association',
        code: 'SAA',
        category: 'Sports',
        description: 'College sports and athletics association.',
        facultyCoordinator: 'Director P. Ravi',
        contactEmail: 'sports@bac.edu.in',
        memberCount: -5,
      });

      const err = club.validateSync();
      expect(err).toBeDefined();
      expect(err?.errors.memberCount).toBeDefined();
      expect(err?.errors.memberCount.message).toContain('cannot be negative');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. CLUB MEMBERSHIP MODEL & DIRECTORY CONSENT
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Club Membership Model & Consent Defaults', () => {
    it('2.1: Enforces server-side defaults: role=member, status=pending, isPublicDirectoryOptIn=false', () => {
      const membershipData: Partial<IClubMembership> = {
        clubSlug: 'fine-arts-club',
        studentName: 'Sanjay Krishnan',
        registerNumber: '22BCS045',
        departmentId: 'computer-science',
        degree: 'B.Sc Computer Science',
        yearOfStudy: 2,
        personalEmail: 'sanjay.k@gmail.com',
        phoneNumber: '+919876543210',
      };

      const membership = new ClubMembership(membershipData);
      const err = membership.validateSync();

      expect(err).toBeUndefined();
      expect(membership.role).toBe('member');
      expect(membership.status).toBe('pending');
      expect(membership.isPublicDirectoryOptIn).toBe(false);
      expect(membership.directoryConsentAt).toBeUndefined();
    });

    it('2.2: Normalizes registerNumber to uppercase and email/slug to lowercase on validation and save', async () => {
      const membership = new ClubMembership({
        clubSlug: '  Fine-Arts-Club  ',
        studentName: 'Kavitha M',
        registerNumber: '  23bba012  ',
        departmentId: '  MANAGEMENT  ',
        degree: 'BBA',
        yearOfStudy: 1,
        personalEmail: '  KAVITHA.M@GMAIL.COM  ',
        phoneNumber: '9845123456',
        isPublicDirectoryOptIn: true,
      });

      await membership.validate();
      expect(membership.registerNumber).toBe('23BBA012');
      expect(membership.personalEmail).toBe('kavitha.m@gmail.com');
      expect(membership.clubSlug).toBe('fine-arts-club');
      expect(membership.departmentId).toBe('management');
      // When opt-in is true, validation hook records consent timestamp
      expect(membership.directoryConsentAt).toBeInstanceOf(Date);
    });

    it('2.3: Clears directoryConsentAt when isPublicDirectoryOptIn is revoked/false', async () => {
      const membership = new ClubMembership({
        clubSlug: 'nss-unit',
        studentName: 'Arun Kumar',
        registerNumber: '21BCO099',
        departmentId: 'commerce',
        degree: 'B.Com',
        yearOfStudy: 3,
        personalEmail: 'arun@gmail.com',
        phoneNumber: '9876501234',
        isPublicDirectoryOptIn: false,
        directoryConsentAt: new Date(), // previously set
      });

      await membership.validate();
      expect(membership.isPublicDirectoryOptIn).toBe(false);
      expect(membership.directoryConsentAt).toBeUndefined();
    });

    it('2.4: Validates boundary years 1 and 4; rejects year 0, negative values, and year 5 or higher', () => {
      const baseData = {
        clubSlug: 'nss-unit',
        studentName: 'Test Student',
        registerNumber: '22BCS001',
        departmentId: 'cs',
        degree: 'B.Sc',
        personalEmail: 'test@gmail.com',
        phoneNumber: '9876543210',
      };

      // Valid boundary year 1
      const year1 = new ClubMembership({ ...baseData, yearOfStudy: 1 });
      expect(year1.validateSync()).toBeUndefined();

      // Valid boundary year 4
      const year4 = new ClubMembership({ ...baseData, yearOfStudy: 4 });
      expect(year4.validateSync()).toBeUndefined();

      // Invalid year 0
      const year0 = new ClubMembership({ ...baseData, yearOfStudy: 0 });
      expect(year0.validateSync()?.errors.yearOfStudy).toBeDefined();

      // Invalid negative year
      const yearNeg = new ClubMembership({ ...baseData, yearOfStudy: -1 });
      expect(yearNeg.validateSync()?.errors.yearOfStudy).toBeDefined();

      // Invalid year 5
      const year5 = new ClubMembership({ ...baseData, yearOfStudy: 5 });
      expect(year5.validateSync()?.errors.yearOfStudy).toBeDefined();

      // Invalid year 6
      const year6 = new ClubMembership({ ...baseData, yearOfStudy: 6 });
      expect(year6.validateSync()?.errors.yearOfStudy).toBeDefined();

      // Invalid email check
      const invalidEmail = new ClubMembership({ ...baseData, yearOfStudy: 2, personalEmail: 'not-an-email' });
      expect(invalidEmail.validateSync()?.errors.personalEmail).toBeDefined();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. CANONICAL IDENTITY RESOLUTION (resolveClubDocument)
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Canonical Identity Resolution (resolveClubDocument)', () => {
    it('3.1: Resolves club by valid 24-character hex ObjectId', async () => {
      const mockId = new mongoose.Types.ObjectId().toHexString();
      const mockDoc = {
        _id: new mongoose.Types.ObjectId(mockId),
        name: 'Rotaract Club',
        slug: 'rotaract-club',
      };

      jest.spyOn(Club, 'findById').mockResolvedValue(mockDoc as any);

      const resolved = await resolveClubDocument(mockId);
      expect(Club.findById).toHaveBeenCalledWith(mockId);
      expect(resolved.slug).toBe('rotaract-club');
    });

    it('3.2: Resolves club by lowercase canonical slug', async () => {
      const mockDoc = {
        _id: new mongoose.Types.ObjectId(),
        name: 'NSS Unit',
        slug: 'nss-unit',
      };

      jest.spyOn(Club, 'findOne').mockResolvedValue(mockDoc as any);

      const resolved = await resolveClubDocument('NSS-UNIT');
      expect(Club.findOne).toHaveBeenCalledWith({ slug: 'nss-unit' });
      expect(resolved.name).toBe('NSS Unit');
    });

    it('3.3: Throws 404 Not Found when club does not exist', async () => {
      jest.spyOn(Club, 'findOne').mockResolvedValue(null);

      await expect(resolveClubDocument('non-existent-club')).rejects.toMatchObject({
        statusCode: 404,
        message: expect.stringContaining('not found'),
      });
    });

    it('3.4: Throws 400 Bad Request on empty or missing identifier', async () => {
      await expect(resolveClubDocument('')).rejects.toMatchObject({
        statusCode: 400,
        message: expect.stringContaining('Club identifier is required'),
      });
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. SCOPE GUARD (assertClubScope) ACROSS ALL REPOSITORY ROLES
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Scoped Authorization Guard (assertClubScope)', () => {
    const targetClub = 'fine-arts-club';

    it('4.1: Allows master_admin and canonical alias ADMIN global access', () => {
      const masterAdmin: IAuthUser = {
        id: '1',
        name: 'Master Admin',
        email: 'master@bac.edu.in',
        role: 'master_admin',
        permissions: ['*'],
        status: 'active',
        tokenVersion: 1,
      };

      const adminAlias: IAuthUser = {
        ...masterAdmin,
        role: 'ADMIN',
      };

      expect(() => assertClubScope(masterAdmin, targetClub)).not.toThrow();
      expect(() => assertClubScope(adminAlias, targetClub)).not.toThrow();
    });

    it('4.2: Allows sub_admin global access', () => {
      const subAdmin: IAuthUser = {
        id: '2',
        name: 'Sub Admin',
        email: 'subadmin@bac.edu.in',
        role: 'sub_admin',
        permissions: ['clubs:update'],
        status: 'active',
        tokenVersion: 1,
      };

      expect(() => assertClubScope(subAdmin, targetClub)).not.toThrow();
    });

    it('4.3: Allows club_head access to their own assigned club (case-insensitive)', () => {
      const clubHead: IAuthUser = {
        id: '3',
        name: 'Siddharth Menon',
        email: 'siddharth@bac.edu.in',
        role: 'club_head',
        clubId: 'fine-arts-club',
        permissions: ['clubs:update', 'clubs:members:approve'],
        status: 'active',
        tokenVersion: 1,
      };

      expect(() => assertClubScope(clubHead, 'FINE-ARTS-CLUB')).not.toThrow();
    });

    it('4.4: Denies club_head attempting cross-club access with 403 Forbidden', () => {
      const clubHead: IAuthUser = {
        id: '3',
        name: 'Siddharth Menon',
        email: 'siddharth@bac.edu.in',
        role: 'club_head',
        clubId: 'fine-arts-club',
        permissions: ['clubs:update'],
        status: 'active',
        tokenVersion: 1,
      };

      expect(() => assertClubScope(clubHead, 'nss-unit')).toThrow(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Cross-club access forbidden'),
        })
      );
    });

    it('4.5: Denies club_head without assigned clubId with 403 Forbidden', () => {
      const unassignedHead: IAuthUser = {
        id: '4',
        name: 'Unassigned Head',
        email: 'unassigned@bac.edu.in',
        role: 'club_head',
        clubId: undefined,
        permissions: ['clubs:update'],
        status: 'active',
        tokenVersion: 1,
      };

      expect(() => assertClubScope(unassignedHead, targetClub)).toThrow(
        expect.objectContaining({
          statusCode: 403,
          message: expect.stringContaining('Account lacks an assigned club scope'),
        })
      );
    });

    it('4.6: Denies hod, content_editor, staff, EDITOR, VIEWER and unknown roles', () => {
      const prohibitedRoles = [
        'hod',
        'content_editor',
        'staff',
        'EDITOR',
        'VIEWER',
        'unknown_role',
      ];

      for (const role of prohibitedRoles) {
        const user: IAuthUser = {
          id: '5',
          name: 'Prohibited Role User',
          email: 'user@bac.edu.in',
          role,
          departmentId: 'cs',
          permissions: ['view'],
          status: 'active',
          tokenVersion: 1,
        };

        expect(() => assertClubScope(user, targetClub)).toThrow(
          expect.objectContaining({
            statusCode: 403,
            message: expect.stringContaining('Forbidden: You lack the required role to manage club resources'),
          })
        );
      }
    });

    it('4.7: Throws 401 Unauthorized when user is undefined', () => {
      expect(() => assertClubScope(undefined, targetClub)).toThrow(
        expect.objectContaining({
          statusCode: 401,
          message: expect.stringContaining('Authentication required'),
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. ZOD VALIDATION SCHEMAS
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Zod Validation Schemas', () => {
    it('5.1: createClubSchema parses valid club payload and enforces safe media URLs', () => {
      const validPayload = {
        name: 'Youth Red Cross (YRC)',
        slug: 'yrc-unit',
        code: 'YRC',
        category: 'Social Service',
        description: 'First aid training, disaster response, and health awareness programmes.',
        facultyCoordinator: 'Dr. Stella Mary',
        contactEmail: 'yrc@bac.edu.in',
        logoUrl: 'https://bac.edu.in/assets/yrc-logo.png',
        bannerImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d',
      };

      const parsed = createClubSchema.safeParse(validPayload);
      expect(parsed.success).toBe(true);
    });

    it('5.2: createClubSchema rejects dangerous or insecure HTTP media URLs', () => {
      const invalidUrlPayload = {
        name: 'Insecure Club',
        slug: 'insecure-club',
        code: 'IC',
        category: 'Cultural',
        description: 'Valid description for testing media safety checks.',
        facultyCoordinator: 'Prof. Test',
        contactEmail: 'test@bac.edu.in',
        logoUrl: 'http://arbitrary-untrusted-domain.com/logo.jpg', // Non-institutional HTTP
      };

      const parsed = createClubSchema.safeParse(invalidUrlPayload);
      expect(parsed.success).toBe(false);
      expect(parsed.error?.issues[0].message).toContain('secure HTTPS link or an institutional HTTP domain');
    });

    it('5.3: registerMembershipSchema validates phone, boundary years 1 and 4, and rejects 0, negative and 5+', () => {
      const validRegistration = {
        studentName: 'Praveen Kumar',
        registerNumber: '22bcs101',
        departmentId: 'computer-science',
        degree: 'B.Sc Computer Science',
        yearOfStudy: 3,
        personalEmail: 'praveen.kumar@gmail.com',
        phoneNumber: '+91 98765 43210',
        confirmPublicDirectoryConsent: true,
      };

      const parsed = registerMembershipSchema.safeParse(validRegistration);
      expect(parsed.success).toBe(true);
      if (parsed.success) {
        expect(parsed.data.confirmPublicDirectoryConsent).toBe(true);
      }

      // Valid boundary year 1
      const year1 = registerMembershipSchema.safeParse({ ...validRegistration, yearOfStudy: 1 });
      expect(year1.success).toBe(true);

      // Valid boundary year 4
      const year4 = registerMembershipSchema.safeParse({ ...validRegistration, yearOfStudy: 4 });
      expect(year4.success).toBe(true);

      // Reject year 0
      const year0 = registerMembershipSchema.safeParse({ ...validRegistration, yearOfStudy: 0 });
      expect(year0.success).toBe(false);

      // Reject negative year
      const yearNeg = registerMembershipSchema.safeParse({ ...validRegistration, yearOfStudy: -1 });
      expect(yearNeg.success).toBe(false);

      // Reject year 5
      const year5 = registerMembershipSchema.safeParse({ ...validRegistration, yearOfStudy: 5 });
      expect(year5.success).toBe(false);

      // Reject year 6
      const year6 = registerMembershipSchema.safeParse({ ...validRegistration, yearOfStudy: 6 });
      expect(year6.success).toBe(false);
    });

    it('5.4: reviewMembershipSchema requires rejectionReason when status is rejected', () => {
      const validApproval = reviewMembershipSchema.safeParse({
        status: 'active',
        role: 'member',
      });
      expect(validApproval.success).toBe(true);

      const invalidRejection = reviewMembershipSchema.safeParse({
        status: 'rejected',
        rejectionReason: '', // Empty reason
      });
      expect(invalidRejection.success).toBe(false);
      expect(invalidRejection.error?.issues[0].message).toContain('Rejection reason is required');

      const validRejection = reviewMembershipSchema.safeParse({
        status: 'rejected',
        rejectionReason: 'Student register number does not match current semester enrollment records.',
      });
      expect(validRejection.success).toBe(true);
    });

    it('5.5: assignClubHeadSchema validates 24-character hexadecimal ObjectId', () => {
      const validAssign = assignClubHeadSchema.safeParse({
        userId: new mongoose.Types.ObjectId().toHexString(),
        studentHeadName: 'Siddharth Menon',
      });
      expect(validAssign.success).toBe(true);

      const invalidAssign = assignClubHeadSchema.safeParse({
        userId: 'not-an-object-id',
      });
      expect(invalidAssign.success).toBe(false);
    });

    it('5.6: updateClubSchema parses valid partial updates and achievements array', () => {
      const updatePayload = {
        meetingSchedule: 'Every Friday at 4 PM',
        achievements: ['First prize at inter-college fest 2025'],
        isRecruiting: false,
      };
      const parsed = updateClubSchema.safeParse(updatePayload);
      expect(parsed.success).toBe(true);
    });
  });
});
