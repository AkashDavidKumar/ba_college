/**
 * form.test.ts — Comprehensive Test Suite for Sub-Phase 4B-4 Forms & Inquiries Engine
 *
 * Verifies:
 *  1. Zod input validation & schema enforcement:
 *     - Rejection of invalid titles, slugs, field types, and script tags.
 *     - Enforcement of options for choice fields (select, radio, checkbox).
 *     - Duplicate slug conflict prevention (409).
 *     - Duplicate field ID rejection.
 *  2. Form publishing lifecycle & public API parity:
 *     - Published & active forms accessible via public endpoints (/api/forms/:slug & /api/v1/forms/:slug).
 *     - Complete sanitization of creator, audit, and internal metadata.
 *     - Inaccessibility of draft, archived, and inactive forms to public users (404).
 *  3. Dynamic submission validation & reference generation:
 *     - Dynamic validation against defined form fields.
 *     - Strict rejection of unknown / unexpected field IDs (400).
 *     - Rejection of missing required fields, invalid emails, invalid numbers, and unlisted options.
 *     - Generation of unique human-readable submission references (SUB-YYYY-XXXXXXXX).
 *     - Rejection of submissions to inactive or draft forms.
 *  4. RBAC role enforcement & scoping:
 *     - master_admin, sub_admin, hod, club_head, content_editor, staff.
 *     - Departmental scope isolation (HOD).
 *     - Club scope isolation (Club Head).
 *     - Direct publishing permission enforcement.
 *  5. Reference protection & archival:
 *     - 409 Conflict preventing permanent deletion of forms with submissions.
 *     - Soft-archival (?archive=true) preserving historical submission records.
 *     - Permanent deletion of unsubmitted forms.
 *  6. Inquiry management & triage:
 *     - Listing, pagination, search, status transitions, and internal notes.
 *  7. Audit-log coverage & negative path isolation:
 *     - CREATE, UPDATE, PUBLISH, ARCHIVE, DELETE emit persistent AuditLog records.
 *     - 400/403/409 errors do NOT produce false-positive success audit logs.
 *     - Submitted applicant data is not logged in audit trails.
 */
import request from 'supertest';
import { createApp } from '../app';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { Form } from '../models/form.model';
import { FormSubmission } from '../models/form-submission.model';
import { AuditLog } from '../models/audit-log.model';
import { getEnv } from '../config/env';

describe('Sub-Phase 4B-4: Forms & Inquiries Engine', () => {
  const app = createApp({ corsOrigins: ['http://localhost:3000'], trustProxy: false });
  const env = getEnv();

  function createAuthHeader(userProps: {
    id?: string;
    role: string;
    permissions?: string[];
    departmentId?: string;
    clubId?: string;
  }) {
    const userId = userProps.id || '507f1f77bcf86cd799439001';
    const payload = {
      sub: userId,
      email: `${userProps.role}@bac.edu.in`,
      role: userProps.role,
      tokenVersion: 1,
    };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: '1h' });
    return {
      header: `Bearer ${token}`,
      userDoc: {
        _id: userId,
        name: `${userProps.role} User`,
        email: `${userProps.role}@bac.edu.in`,
        role: userProps.role,
        departmentId: userProps.departmentId,
        clubId: userProps.clubId,
        permissions: userProps.permissions || [],
        status: 'active',
        tokenVersion: 1,
      },
    };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. FORM MODEL & INPUT VALIDATION
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Form Validation & Configuration Security', () => {
    it('1.1: Rejects form creation without title, slug, or fields with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: '',
          slug: '',
          fields: [],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('1.2: Rejects invalid slug formatting with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);
      jest.spyOn(Form, 'findOne').mockResolvedValue(null);

      const invalidSlugs = ['Invalid_Slug', 'slug with spaces', 'slug/slash', 'UPPERCASE'];
      for (const badSlug of invalidSlugs) {
        const res = await request(app)
          .post('/api/admin/forms')
          .set('Authorization', auth.header)
          .send({
            title: 'Sample Form',
            slug: badSlug,
            fields: [{ id: 'fld_name', label: 'Full Name', type: 'text' }],
          });

        expect(res.status).toBe(400);
      }
    });

    it('1.3: Rejects duplicate field IDs within a single form with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Duplicate Field Form',
          slug: 'duplicate-fields',
          fields: [
            { id: 'fld_email', label: 'Primary Email', type: 'email' },
            { id: 'fld_email', label: 'Alternate Email', type: 'email' },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/unique/i);
    });

    it('1.4: Rejects select or radio fields without options with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Choice Form',
          slug: 'choice-form',
          fields: [{ id: 'fld_program', label: 'Select Programme', type: 'select', options: [] }],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/options/i);
    });

    it('1.5: Rejects script tags or event handlers in title, description, or labels with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Feedback <script>alert("xss")</script>',
          slug: 'feedback-xss',
          fields: [{ id: 'fld_1', label: 'Valid Label', type: 'text' }],
        });

      expect(res.status).toBe(400);
    });

    it('1.6: Successfully creates form with complete field configurations and emits CREATE audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(Form, 'findOne').mockResolvedValue(null);

      const mockCreated = {
        _id: '507f1f77bcf86cd799439050',
        title: 'Admissions Inquiry 2026',
        slug: 'admissions-inquiry-2026',
        description: 'Undergraduate inquiries for the 2026 academic year.',
        category: 'admissions',
        fields: [
          { id: 'fld_name', label: 'Full Name', type: 'text', required: true, order: 1 },
          { id: 'fld_email', label: 'Email Address', type: 'email', required: true, order: 2 },
          { id: 'fld_phone', label: 'Phone Number', type: 'phone', required: false, order: 3 },
          {
            id: 'fld_course',
            label: 'Interested Programme',
            type: 'select',
            options: ['B.Sc. Computer Science', 'B.Com.', 'B.A. English'],
            required: true,
            order: 4,
          },
          { id: 'fld_message', label: 'Query Details', type: 'textarea', required: false, order: 5 },
        ],
        status: 'published',
        isActive: true,
        submitButtonText: 'Submit Inquiry',
        successMessage: 'Thank you for reaching out to Bishop Ambrose College.',
      };

      jest.spyOn(Form, 'create').mockResolvedValue(mockCreated as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Admissions Inquiry 2026',
          slug: 'admissions-inquiry-2026',
          description: 'Undergraduate inquiries for the 2026 academic year.',
          category: 'admissions',
          fields: mockCreated.fields,
          status: 'published',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('admissions-inquiry-2026');
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          module: 'Form Builder',
          recordId: '507f1f77bcf86cd799439050',
        })
      );
    });

    it('1.7: Rejects duplicate slug creation with 409 Conflict', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(Form, 'findOne').mockResolvedValue({ _id: '507f1f77bcf86cd799439051', slug: 'existing-form' } as any);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Another Form',
          slug: 'existing-form',
          fields: [{ id: 'fld_1', label: 'Query', type: 'text' }],
        });

      expect(res.status).toBe(409);
      expect(res.body.error).toMatch(/already exists/i);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. PUBLIC FORM RENDERING & WORKFLOW LIFECYCLE
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Public Form Rendering & Lifecycle Parity', () => {
    it('2.1: Public GET /api/forms/:slug returns active published form, sanitized of internal metadata', async () => {
      const mockForm = {
        title: 'Campus Tour Registration',
        slug: 'campus-tour',
        description: 'Schedule a visit to Bishop Ambrose College.',
        category: 'events',
        fields: [
          { id: 'fld_name', label: 'Your Name', type: 'text', required: true, order: 1 },
          { id: 'fld_date', label: 'Preferred Date', type: 'date', required: true, order: 2 },
        ],
        submitButtonText: 'Book Tour',
        successMessage: 'Your tour has been booked!',
        createdBy: 'user-internal-id',
        updatedBy: 'user-internal-id',
        __v: 0,
      };

      jest.spyOn(Form, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockForm),
        }),
      } as any);

      const res = await request(app).get('/api/forms/campus-tour');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Campus Tour Registration');
      expect(res.body.data.fields).toHaveLength(2);
      expect(res.body.data.createdBy).toBeUndefined();
      expect(res.body.data.updatedBy).toBeUndefined();
      expect(res.body.data.__v).toBeUndefined();
    });

    it('2.2: Public /api/forms/:slug and /api/v1/forms/:slug return identical sanitized payloads', async () => {
      const mockForm = {
        title: 'Feedback Survey',
        slug: 'feedback-survey',
        description: 'Provide feedback.',
        category: 'feedback',
        fields: [{ id: 'fld_text', label: 'Feedback', type: 'textarea', required: true, order: 1 }],
        submitButtonText: 'Submit',
        successMessage: 'Thanks',
      };

      jest.spyOn(Form, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockForm),
        }),
      } as any);

      const resLegacy = await request(app).get('/api/forms/feedback-survey');
      const resV1 = await request(app).get('/api/v1/forms/feedback-survey');

      expect(resLegacy.status).toBe(200);
      expect(resV1.status).toBe(200);
      expect(resLegacy.body).toEqual(resV1.body);
    });

    it('2.3: Public GET returns 404 for draft, archived, or inactive forms', async () => {
      jest.spyOn(Form, 'findOne').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      const resDraft = await request(app).get('/api/forms/internal-draft');
      expect(resDraft.status).toBe(404);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. DYNAMIC SUBMISSION VALIDATION & ABUSE PREVENTION
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Dynamic Submission Validation & Reference Generation', () => {
    const activeFormDoc = {
      _id: '507f1f77bcf86cd799439052',
      title: 'UG Admission Form',
      slug: 'ug-admissions',
      category: 'admissions',
      status: 'published',
      isActive: true,
      departmentId: 'computer-science',
      successMessage: 'Your application has been received.',
      fields: [
        { id: 'fld_name', label: 'Candidate Name', type: 'text', required: true, validation: { minLength: 3, maxLength: 100 } },
        { id: 'fld_email', label: 'Email', type: 'email', required: true },
        { id: 'fld_phone', label: 'Phone', type: 'phone', required: false },
        { id: 'fld_score', label: '+2 Percentage', type: 'number', required: true, validation: { min: 35, max: 100 } },
        { id: 'fld_stream', label: 'Stream', type: 'select', options: ['Science', 'Commerce', 'Arts'], required: true },
        { id: 'fld_hostel', label: 'Need Hostel', type: 'checkbox', required: false },
        { id: 'fld_dob', label: 'Date of Birth', type: 'date', required: false },
      ],
    };

    it('3.1: Accepts valid submission, generates SUB-YYYY-XXXXXXXX reference, and returns 201', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);

      const mockSavedSubmission = {
        _id: '507f1f77bcf86cd799439053',
        formId: activeFormDoc._id,
        formSlug: activeFormDoc.slug,
        formTitle: activeFormDoc.title,
        submissionReference: 'SUB-2026-A1B2C3D4',
        answers: {
          fld_name: 'David Kumar',
          fld_email: 'david@example.com',
          fld_phone: '+91 9876543210',
          fld_score: 88.5,
          fld_stream: 'Science',
          fld_hostel: true,
          fld_dob: '2005-04-12T00:00:00.000Z',
        },
        status: 'new',
        submittedAt: new Date(),
      };

      const createSpy = jest.spyOn(FormSubmission, 'create').mockResolvedValue(mockSavedSubmission as any);

      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            fld_email: 'david@example.com',
            fld_phone: '+91 9876543210',
            fld_score: 88.5,
            fld_stream: 'Science',
            fld_hostel: true,
            fld_dob: '2005-04-12',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.submissionReference).toMatch(/^SUB-\d{4}-[A-F0-9]{8}$/);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          formSlug: 'ug-admissions',
          status: 'new',
          departmentId: 'computer-science',
        })
      );
    });

    it('3.2: Rejects submission missing required fields with 400 Bad Request', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);

      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            // Missing required fld_email, fld_score, fld_stream
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('REQUIRED_FIELD_MISSING');
    });

    it('3.3: Rejects submission containing unexpected / unknown fields with 400 Bad Request', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);

      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            fld_email: 'david@example.com',
            fld_score: 90,
            fld_stream: 'Science',
            injected_admin_field: 'unauthorized_payload',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('UNKNOWN_FORM_FIELD');
    });

    it('3.4: Rejects submission with invalid email format with 400 Bad Request', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);

      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            fld_email: 'not-an-email',
            fld_score: 90,
            fld_stream: 'Science',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/valid email/i);
    });

    it('3.5: Rejects numeric answer outside specified min/max bounds with 400 Bad Request', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);

      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            fld_email: 'david@example.com',
            fld_score: 150, // exceeds max: 100
            fld_stream: 'Science',
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot exceed 100/i);
    });

    it('3.6: Rejects selection outside of configured options with 400 Bad Request', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);

      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            fld_email: 'david@example.com',
            fld_score: 85,
            fld_stream: 'Architecture', // Not in Science, Commerce, Arts
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/invalid/i);
    });

    it('3.7: Rejects submissions to draft or archived forms with 404 Not Found', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/forms/archived-form/submissions')
        .send({
          answers: { fld_name: 'David' },
        });

      expect(res.status).toBe(404);
    });

    it('3.8: Privacy Check — Error responses do NOT echo sensitive submitted answer values', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);

      const sensitivePayload = 'CONFIDENTIAL_SECRET_12345';
      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            fld_email: 'david@example.com',
            fld_score: 85,
            fld_stream: sensitivePayload,
          },
        });

      expect(res.status).toBe(400);
      expect(JSON.stringify(res.body)).not.toContain(sensitivePayload);
      expect(res.body.error).toMatch(/selection for "stream" is invalid/i);
    });

    it('3.9: Privacy Check — Public submission response body never returns applicant answers', async () => {
      jest.spyOn(Form, 'findOne').mockResolvedValue(activeFormDoc as any);
      jest.spyOn(FormSubmission, 'create').mockResolvedValue({
        submissionReference: 'SUB-2026-F981AA72',
        submittedAt: new Date(),
      } as any);

      const res = await request(app)
        .post('/api/forms/ug-admissions/submissions')
        .send({
          answers: {
            fld_name: 'David Kumar',
            fld_email: 'david@example.com',
            fld_phone: '+91 9876543210',
            fld_score: 95,
            fld_stream: 'Science',
            fld_hostel: true,
            fld_dob: '2005-04-12',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.data.submissionReference).toBe('SUB-2026-F981AA72');
      expect(res.body.data.answers).toBeUndefined();
      expect(JSON.stringify(res.body.data)).not.toContain('david@example.com');
      expect(JSON.stringify(res.body.data)).not.toContain('+91 9876543210');
    });

    it('3.10: Privacy Check — Public endpoints have no route to retrieve submissions by reference or ID', async () => {
      const res = await request(app).get('/api/forms/ug-admissions/submissions/SUB-2026-F981AA72');
      expect(res.status).toBe(404);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. RBAC ROLE ENFORCEMENT & SCOPING
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. RBAC Role Enforcement & Resource Scoping', () => {
    it('4.1: Rejects unauthenticated requests with 401 Unauthorized', async () => {
      const res = await request(app).get('/api/admin/forms');
      expect(res.status).toBe(401);
    });

    it('4.2: Rejects staff without form permissions with 403 Forbidden', async () => {
      const auth = createAuthHeader({ role: 'staff', permissions: ['unrelated:perm'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/forms')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
    });

    it('4.3: Allows master_admin and sub_admin to query forms across all departments', async () => {
      const auth = createAuthHeader({ role: 'sub_admin', permissions: ['forms:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(Form, 'countDocuments').mockResolvedValue(2 as any);
      jest.spyOn(Form, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '1', title: 'Form 1', slug: 'form-1' },
                { _id: '2', title: 'Form 2', slug: 'form-2' },
              ]),
            }),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/forms')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('4.4: Enforces HOD scope boundary (rejects querying another department with 403)', async () => {
      const auth = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['forms:read'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/forms?departmentId=physics')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('4.5: Enforces Club Head scope boundary (rejects creating form for another club with 403)', async () => {
      const auth = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['forms:create'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Leo Club Registration',
          slug: 'leo-club-reg',
          clubId: 'leo-club',
          fields: [{ id: 'fld_name', label: 'Name', type: 'text' }],
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('4.6: Rejects direct form publishing for users without forms:publish permission with 403', async () => {
      const auth = createAuthHeader({
        role: 'content_editor',
        permissions: ['forms:create'], // lacks forms:publish
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(Form, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Draft Form',
          slug: 'draft-form',
          status: 'published', // Attempts direct publish
          fields: [{ id: 'fld_name', label: 'Name', type: 'text' }],
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_FORM_PUBLISH');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. REFERENCE PROTECTION & ARCHIVAL SAFEGUARDS
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Reference Protection & Deletion Safeguards (DELETE /api/admin/forms/:id)', () => {
    it('5.1: Rejects hard deletion with 409 Conflict when form has existing submissions', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockFormDoc = {
        _id: '507f1f77bcf86cd799439055',
        title: 'Active Form with Submissions',
        slug: 'active-form',
      };

      jest.spyOn(Form, 'findOne').mockResolvedValue(mockFormDoc as any);
      // Form has 5 existing submissions on record
      jest.spyOn(FormSubmission, 'countDocuments').mockResolvedValue(5);
      const deleteSpy = jest.spyOn(Form, 'findByIdAndDelete');

      const res = await request(app)
        .delete('/api/admin/forms/507f1f77bcf86cd799439055')
        .set('Authorization', auth.header);

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('FORM_HAS_SUBMISSIONS');
      expect(res.body.error).toMatch(/5 submission\(s\) on file/i);
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('5.2: Successfully soft-archives form with submissions when ?archive=true query is supplied', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockFormDoc = {
        _id: '507f1f77bcf86cd799439056',
        title: 'Active Form with Submissions',
        slug: 'active-form-2',
        status: 'published',
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Form, 'findOne').mockResolvedValue(mockFormDoc as any);
      jest.spyOn(FormSubmission, 'countDocuments').mockResolvedValue(3);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/forms/507f1f77bcf86cd799439056?archive=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(mockFormDoc.status).toBe('archived');
      expect(mockFormDoc.isActive).toBe(false);
      expect(mockFormDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ARCHIVE',
          module: 'Form Builder',
        })
      );
    });

    it('5.3: Permanently deletes unsubmitted form when archive query is omitted', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockFormDoc = {
        _id: '507f1f77bcf86cd799439057',
        title: 'Empty Form',
        slug: 'empty-form',
      };

      jest.spyOn(Form, 'findOne').mockResolvedValue(mockFormDoc as any);
      jest.spyOn(FormSubmission, 'countDocuments').mockResolvedValue(0);
      const deleteSpy = jest.spyOn(Form, 'findByIdAndDelete').mockResolvedValue(mockFormDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/forms/507f1f77bcf86cd799439057')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439057');
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          module: 'Form Builder',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. INQUIRY MANAGEMENT & TRIAGE
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. Inquiry & Submission Administration', () => {
    it('6.1: Lists inquiries with status filter and pagination', async () => {
      const auth = createAuthHeader({ role: 'sub_admin', permissions: ['form_submissions:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(FormSubmission, 'countDocuments').mockResolvedValue(1 as any);
      jest.spyOn(FormSubmission, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                {
                  _id: '507f1f77bcf86cd799439060',
                  formSlug: 'ug-admissions',
                  formTitle: 'UG Admissions',
                  submissionReference: 'SUB-2026-B9F8E7D6',
                  answers: { fld_name: 'Candidate A' },
                  status: 'new',
                  submittedAt: new Date(),
                },
              ]),
            }),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/form-submissions?status=new')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].submissionReference).toBe('SUB-2026-B9F8E7D6');
    });

    it('6.2: Successfully updates inquiry status, saves internal notes, and emits UPDATE audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['form_submissions:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockSubmissionDoc = {
        _id: '507f1f77bcf86cd799439061',
        submissionReference: 'SUB-2026-11223344',
        status: 'new',
        notes: '',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(FormSubmission, 'findOne').mockResolvedValue(mockSubmissionDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .patch('/api/admin/form-submissions/SUB-2026-11223344/status')
        .set('Authorization', auth.header)
        .send({
          status: 'in_review',
          notes: 'Candidate verified for interview on Wednesday.',
        });

      expect(res.status).toBe(200);
      expect(mockSubmissionDoc.status).toBe('in_review');
      expect(mockSubmissionDoc.notes).toBe('Candidate verified for interview on Wednesday.');
      expect(mockSubmissionDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'Inquiry Management',
          recordId: '507f1f77bcf86cd799439061',
        })
      );
    });

    it('6.3: Blocks HOD from viewing or triaging inquiries belonging to another department', async () => {
      const auth = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['form_submissions:read', 'form_submissions:update'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockSubmissionDoc = {
        _id: '507f1f77bcf86cd799439062',
        submissionReference: 'SUB-2026-CHEM001',
        departmentId: 'chemistry',
      };

      jest.spyOn(FormSubmission, 'findOne').mockResolvedValue(mockSubmissionDoc as any);

      const res = await request(app)
        .patch('/api/admin/form-submissions/SUB-2026-CHEM001/status')
        .set('Authorization', auth.header)
        .send({ status: 'resolved' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('6.4: Rejects unauthorized or invalid triage status transitions with 400 Bad Request', async () => {
      const auth = createAuthHeader({
        role: 'master_admin',
        permissions: ['form_submissions:update'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .patch('/api/admin/form-submissions/SUB-2026-11223344/status')
        .set('Authorization', auth.header)
        .send({ status: 'INVALID_STATUS_VALUE' });

      expect(res.status).toBe(400);
      expect(res.body.code).toBe('VALIDATION_ERROR');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. AUDIT LOG ISOLATION & NEGATIVE TESTING
  // ════════════════════════════════════════════════════════════════════════════
  describe('7. Audit-Log Coverage & Negative Path Isolation', () => {
    it('7.1: Emits PUBLISH audit log when form is published', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:publish'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockFormDoc = {
        _id: '507f1f77bcf86cd799439070',
        title: 'Feedback Form',
        slug: 'feedback-form',
        status: 'draft',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Form, 'findOne').mockResolvedValue(mockFormDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/forms/feedback-form/publish')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'PUBLISH',
          module: 'Form Builder',
          recordId: '507f1f77bcf86cd799439070',
        })
      );
    });

    it('7.2: AuditLog.create is NOT called when form creation validation fails (400 Bad Request)', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({ title: '', slug: 'bad' });

      expect(res.status).toBe(400);
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('7.3: AuditLog.create is NOT called when role scope boundary is violated (403 Forbidden)', async () => {
      const auth = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['forms:create'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .post('/api/admin/forms')
        .set('Authorization', auth.header)
        .send({
          title: 'Physics Form',
          slug: 'physics-form',
          departmentId: 'physics',
          fields: [{ id: 'fld_1', label: 'Name', type: 'text' }],
        });

      expect(res.status).toBe(403);
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('7.4: AuditLog.create is NOT called when hard deletion is rejected due to submissions (409 Conflict)', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['forms:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockFormDoc = {
        _id: '507f1f77bcf86cd799439071',
        title: 'Conflict Form',
      };
      jest.spyOn(Form, 'findOne').mockResolvedValue(mockFormDoc as any);
      jest.spyOn(FormSubmission, 'countDocuments').mockResolvedValue(10);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .delete('/api/admin/forms/507f1f77bcf86cd799439071')
        .set('Authorization', auth.header);

      expect(res.status).toBe(409);
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('7.5: Privacy Check — AuditLog.create is NEVER called with applicant answers or PII during submission or triage', async () => {
      const auth = createAuthHeader({
        role: 'master_admin',
        permissions: ['form_submissions:update'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockSubmissionDoc = {
        _id: '507f1f77bcf86cd799439061',
        submissionReference: 'SUB-2026-PRIVACY-AUDIT',
        formTitle: 'Sensitive Health Form',
        status: 'new',
        answers: {
          fld_medical_history: 'CONFIDENTIAL_HEALTH_REMARKS_XYZ',
          fld_phone: '+91 99999 88888',
        },
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(FormSubmission, 'findOne').mockResolvedValue(mockSubmissionDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .patch('/api/admin/form-submissions/SUB-2026-PRIVACY-AUDIT/status')
        .set('Authorization', auth.header)
        .send({
          status: 'resolved',
          notes: 'Case marked completed.',
        });

      expect(res.status).toBe(200);
      expect(auditSpy).toHaveBeenCalled();
      const auditCallArgs = JSON.stringify(auditSpy.mock.calls);
      expect(auditCallArgs).not.toContain('CONFIDENTIAL_HEALTH_REMARKS_XYZ');
      expect(auditCallArgs).not.toContain('+91 99999 88888');
    });
  });
});
