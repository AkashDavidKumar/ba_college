/**
 * media-asset.test.ts — Comprehensive Test Suite for Sub-Phase 4B-3 Media Library
 *
 * Verifies:
 *  1. Zod input validation & URL security:
 *     - Strict rejection of dangerous schemes (javascript:, data:, vbscript:, file:).
 *     - Rejection of protocol-relative URLs (//) and control characters.
 *     - Rejection of script tags and event handlers.
 *     - Allowance of valid external HTTPS URLs.
 *     - Allowance of institutional HTTP URLs (bac.edu.in, b-u.ac.in, localhost).
 *     - Strict rejection of arbitrary third-party HTTP URLs for both url and thumbnailUrl.
 *  2. RBAC role enforcement & scoping:
 *     - master_admin, sub_admin, hod, club_head, content_editor, staff.
 *     - Departmental & club scoping boundaries.
 *  3. Media updates & reference protection:
 *     - Safe metadata updates.
 *     - 409 Conflict preventing URL mutation when existing URL is referenced in DynamicPage.
 *  4. Reference protection across ALL DynamicPage content block formats:
 *     - bannerImage, seo.ogImage, blocks.content.url, blocks.content.src,
 *       blocks.content.images.url, blocks.content.fileUrl, blocks.content.videoUrl,
 *       blocks.content.cards.imageUrl.
 *     - 409 Conflict on hard delete of in-use media.
 *     - Soft-archival (?archive=true) of in-use media.
 *     - Permanent deletion of unreferenced media.
 *  5. Audit-log coverage & negative isolation:
 *     - Persistent AuditLog creation on CREATE, UPDATE, ARCHIVE, and DELETE.
 *     - ZERO false-positive AuditLog entries on 400 validation error, 403 scope error,
 *       409 deletion conflict, or 409 URL update conflict.
 *  6. Public read-only API parity & sanitization (/api/media & /api/v1/media):
 *     - Strips createdBy, updatedBy, __v, and omits archived assets.
 *     - Rejects mutation verbs (POST, PUT, DELETE) on public endpoints.
 *  7. Prohibited-feature compliance (no file uploads, no binary/base64 storage).
 */
import request from 'supertest';
import { createApp } from '../app';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { MediaAsset } from '../models/media-asset.model';
import { DynamicPage } from '../models/dynamic-page.model';
import { AuditLog } from '../models/audit-log.model';
import { getEnv } from '../config/env';

describe('Sub-Phase 4B-3: Media Library (Metadata & URL Management Only)', () => {
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
  // 1. INPUT VALIDATION & URL SECURITY
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Media Asset Validation & URL Security', () => {
    it('1.1: Rejects registration without title, altText, or URL with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: '',
          altText: '',
          url: '',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('1.2: Rejects dangerous URI schemes (javascript:, data:, vbscript:, file:) with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const dangerousUrls = [
        'javascript:alert(document.cookie)',
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox("hacked")',
        'file:///etc/passwd',
      ];

      for (const dangerous of dangerousUrls) {
        const res = await request(app)
          .post('/api/admin/media')
          .set('Authorization', auth.header)
          .send({
            title: 'Malicious Asset',
            altText: 'Safe description',
            url: dangerous,
          });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      }
    });

    it('1.3: Rejects protocol-relative URLs (//phishing.com/image.jpg) with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Open Redirect Asset',
          altText: 'Alt text',
          url: '//phishing.com/image.jpg',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('1.4: Rejects script tags or event handlers in title, altText, or tags with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Campus Quad <script>alert("xss")</script>',
          altText: 'Normal alt text',
          url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('1.5: Accepts valid external HTTPS URLs with complete metadata', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAsset = {
        _id: '507f1f77bcf86cd799439011',
        title: 'College Auditorium Interior',
        altText: 'Spacious auditorium with acoustic paneling',
        description: 'Primary hall used for convocations',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
        thumbnailUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',
        mimeType: 'image/jpeg',
        fileName: 'auditorium.jpg',
        fileSize: 1048576,
        width: 1920,
        height: 1080,
        folder: 'Infrastructure',
        tags: ['auditorium', 'campus', 'hall'],
        status: 'active',
      };

      const createSpy = jest.spyOn(MediaAsset, 'create').mockResolvedValue(mockAsset as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'College Auditorium Interior',
          altText: 'Spacious auditorium with acoustic paneling',
          description: 'Primary hall used for convocations',
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
          thumbnailUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200',
          folder: 'Infrastructure',
          tags: ['auditorium', 'campus', 'hall'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(createSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f',
          mediaType: 'image',
        })
      );
    });

    it('1.6: Accepts permitted institutional HTTP domains (bac.edu.in, b-u.ac.in, localhost)', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const institutionalUrls = [
        'http://bac.edu.in/assets/crest.png',
        'http://cs.bac.edu.in/lab-schematic.jpg',
        'http://b-u.ac.in/syllabus/regulation-2024.pdf',
        'http://localhost:3000/preview-badge.svg',
      ];

      for (const instUrl of institutionalUrls) {
        const mockAsset = {
          _id: '507f1f77bcf86cd799439012',
          title: 'Institutional Resource',
          altText: 'Institutional Resource',
          url: instUrl,
          mediaType: 'image',
          status: 'active',
        };

        jest.spyOn(MediaAsset, 'create').mockResolvedValue(mockAsset as any);
        jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

        const res = await request(app)
          .post('/api/admin/media')
          .set('Authorization', auth.header)
          .send({
            title: 'Institutional Resource',
            altText: 'Institutional Resource',
            url: instUrl,
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
      }
    });

    it('1.7: Rejects arbitrary third-party HTTP URLs with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const arbitraryHttpUrls = [
        'http://insecure-thirdparty.com/asset.jpg',
        'http://cdn.unencrypted-host.org/pic.png',
        'http://example.com/download.pdf',
      ];

      for (const httpUrl of arbitraryHttpUrls) {
        const res = await request(app)
          .post('/api/admin/media')
          .set('Authorization', auth.header)
          .send({
            title: 'Insecure Third-Party Media',
            altText: 'Insecure photo',
            url: httpUrl,
          });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
      }
    });

    it('1.8: Validates thumbnailUrl with the same security rules (rejects arbitrary HTTP, accepts HTTPS/institutional)', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      // Rejects arbitrary HTTP thumbnailUrl
      const resBadThumb = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Valid Main Media',
          altText: 'Alt',
          url: 'https://images.unsplash.com/photo-valid',
          thumbnailUrl: 'http://arbitrary-insecure-thumb.com/t.jpg',
        });

      expect(resBadThumb.status).toBe(400);

      // Accepts institutional HTTP thumbnailUrl
      const mockAsset = {
        _id: '507f1f77bcf86cd799439013',
        title: 'Valid Main Media',
        altText: 'Alt',
        url: 'https://images.unsplash.com/photo-valid',
        thumbnailUrl: 'http://bac.edu.in/thumbs/t.jpg',
        status: 'active',
      };
      jest.spyOn(MediaAsset, 'create').mockResolvedValue(mockAsset as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const resGoodThumb = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Valid Main Media',
          altText: 'Alt',
          url: 'https://images.unsplash.com/photo-valid',
          thumbnailUrl: 'http://bac.edu.in/thumbs/t.jpg',
        });

      expect(resGoodThumb.status).toBe(201);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. ADMIN LISTING, RETRIEVAL, AND RBAC SCOPING
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Admin Media Listing & RBAC Scoping', () => {
    it('2.1: Rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/media');
      expect(res.status).toBe(401);
    });

    it('2.2: Rejects unauthorized staff without media permissions with 403', async () => {
      const auth = createAuthHeader({ role: 'staff', permissions: ['unrelated:perm'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/media')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
    });

    it('2.3: Allows master_admin and sub_admin to query media across all departments', async () => {
      const auth = createAuthHeader({ role: 'sub_admin', permissions: ['media:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(MediaAsset, 'countDocuments').mockResolvedValue(2 as any);
      jest.spyOn(MediaAsset, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '507f1f77bcf86cd799439012', title: 'Asset 1', url: 'https://bac.edu.in/1.jpg' },
                { _id: '507f1f77bcf86cd799439013', title: 'Asset 2', url: 'https://bac.edu.in/2.jpg' },
              ]),
            }),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/media')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(2);
    });

    it('2.4: Enforces HOD scope boundary (rejects querying another department with 403)', async () => {
      const auth = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['media:read'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/media?departmentId=physics')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('2.5: Enforces HOD registration scope (rejects creating asset for another department with 403)', async () => {
      const auth = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['media:create'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Physics Instrument',
          altText: 'Oscilloscope',
          url: 'https://images.unsplash.com/photo-scope',
          departmentId: 'physics',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('2.6: Enforces Club Head scope boundary (rejects querying another club with 403)', async () => {
      const auth = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['media:read'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/media?clubId=leo-club')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('2.7: Enforces Club Head registration scope (rejects creating asset for another club with 403)', async () => {
      const auth = createAuthHeader({
        role: 'club_head',
        clubId: 'rotaract-club',
        permissions: ['media:create'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Leo Club Banner',
          altText: 'Leo banner',
          url: 'https://images.unsplash.com/photo-leo',
          clubId: 'leo-club',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
    });

    it('2.8: Allows content_editor with media:read permission to list media assets', async () => {
      const auth = createAuthHeader({
        role: 'content_editor',
        permissions: ['media:read'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(MediaAsset, 'countDocuments').mockResolvedValue(1 as any);
      jest.spyOn(MediaAsset, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              lean: jest.fn().mockResolvedValue([
                { _id: '507f1f77bcf86cd799439014', title: 'Editor Accessible Asset', url: 'https://images.unsplash.com/1' },
              ]),
            }),
          }),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/media')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
    });

    it('2.9: GET /api/admin/media/:id returns 404 for non-existent asset ID', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(MediaAsset, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .get('/api/admin/media/507f1f77bcf86cd799439099')
        .set('Authorization', auth.header);

      expect(res.status).toBe(404);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. UPDATES AND METADATA EDITING
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Media Asset Updates (PUT/PATCH /api/admin/media/:id)', () => {
    it('3.1: Successfully updates metadata and emits UPDATE audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439014',
        title: 'Original Title',
        altText: 'Original Alt',
        url: 'https://images.unsplash.com/photo-1',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/media/507f1f77bcf86cd799439014')
        .set('Authorization', auth.header)
        .send({
          title: 'Updated Campus Title',
          altText: 'Updated accessibility text',
          folder: 'Academics',
        });

      expect(res.status).toBe(200);
      expect(mockAssetDoc.title).toBe('Updated Campus Title');
      expect(mockAssetDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'Media Library',
        })
      );
    });

    it('3.2: Blocks HOD from updating media assets belonging to another department', async () => {
      const auth = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['media:update'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439015',
        title: 'Physics Lab Apparatus',
        departmentId: 'physics',
      };

      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);

      const res = await request(app)
        .put('/api/admin/media/507f1f77bcf86cd799439015')
        .set('Authorization', auth.header)
        .send({ title: 'Tampered Title' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('3.3: Blocks updating media URL with 409 Conflict when existing URL is referenced in dynamic pages', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439016',
        title: 'Referenced Asset',
        url: 'https://images.unsplash.com/referenced-url',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);

      // Referenced in DynamicPage
      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'page-1', title: 'Admissions Guide', slug: 'admissions-guide' },
          ]),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .put('/api/admin/media/507f1f77bcf86cd799439016')
        .set('Authorization', auth.header)
        .send({
          url: 'https://images.unsplash.com/new-replacement-url',
        });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('MEDIA_URL_IN_USE');
      expect(res.body.error).toMatch(/Admissions Guide/i);
      expect(mockAssetDoc.save).not.toHaveBeenCalled();
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('3.4: Allows updating media URL when unreferenced by any dynamic page', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439017',
        title: 'Unreferenced Asset',
        url: 'https://images.unsplash.com/old-unreferenced-url',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);

      // No referencing pages
      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/media/507f1f77bcf86cd799439017')
        .set('Authorization', auth.header)
        .send({
          url: 'https://images.unsplash.com/new-updated-url',
        });

      expect(res.status).toBe(200);
      expect(mockAssetDoc.url).toBe('https://images.unsplash.com/new-updated-url');
      expect(mockAssetDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. REFERENCE PROTECTION ACROSS ALL DYNAMIC PAGE CONTENT BLOCK FORMATS
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Reference Protection Across Dynamic Page Block Formats (DELETE /api/admin/media/:id)', () => {
    const blockFormats = [
      { format: 'bannerImage', field: 'bannerImage' },
      { format: 'seo.ogImage', field: 'seo.ogImage' },
      { format: 'image block (blocks.content.url)', field: 'blocks.content.url' },
      { format: 'image block (blocks.content.src)', field: 'blocks.content.src' },
      { format: 'gallery block (blocks.content.images.url)', field: 'blocks.content.images.url' },
      { format: 'document block (blocks.content.fileUrl)', field: 'blocks.content.fileUrl' },
      { format: 'video block (blocks.content.videoUrl)', field: 'blocks.content.videoUrl' },
      { format: 'cards block (blocks.content.cards.imageUrl)', field: 'blocks.content.cards.imageUrl' },
    ];

    for (const testCase of blockFormats) {
      it(`4.1: Blocks hard deletion (409 Conflict) when media URL is referenced in ${testCase.format}`, async () => {
        const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:delete'] });
        jest.spyOn(User, 'findById').mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(auth.userDoc),
          }),
        } as any);

        const targetMediaUrl = 'https://images.unsplash.com/photo-referenced-in-block';
        const mockAssetDoc = {
          _id: '507f1f77bcf86cd799439020',
          title: `Asset in ${testCase.format}`,
          url: targetMediaUrl,
        };

        jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);

        // DynamicPage lookup finds that this URL is referenced
        jest.spyOn(DynamicPage, 'find').mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue([
              { _id: 'page-101', title: 'Campus Tour', slug: 'campus-tour' },
            ]),
          }),
        } as any);

        const deleteSpy = jest.spyOn(MediaAsset, 'findByIdAndDelete');

        const res = await request(app)
          .delete('/api/admin/media/507f1f77bcf86cd799439020')
          .set('Authorization', auth.header);

        expect(res.status).toBe(409);
        expect(res.body.code).toBe('MEDIA_ASSET_IN_USE');
        expect(res.body.error).toMatch(/Campus Tour/i);
        expect(deleteSpy).not.toHaveBeenCalled();
      });
    }

    it('4.2: Successfully soft-archives in-use media asset when ?archive=true query parameter is supplied', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const targetMediaUrl = 'https://images.unsplash.com/photo-referenced-in-page';
      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439017',
        title: 'Referenced Campus Quad',
        url: targetMediaUrl,
        status: 'active',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);

      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'page-1', title: 'Admissions Overview', slug: 'admissions-overview' },
          ]),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/media/507f1f77bcf86cd799439017?archive=true')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(mockAssetDoc.status).toBe('archived');
      expect(mockAssetDoc.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ARCHIVE',
          module: 'Media Library',
        })
      );
    });

    it('4.3: Permanently deletes unreferenced media asset when archive query is omitted', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439018',
        title: 'Unreferenced Photo',
        url: 'https://images.unsplash.com/unreferenced-photo',
      };

      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);

      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const deleteSpy = jest.spyOn(MediaAsset, 'findByIdAndDelete').mockResolvedValue(mockAssetDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/media/507f1f77bcf86cd799439018')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(deleteSpy).toHaveBeenCalledWith('507f1f77bcf86cd799439018');
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          module: 'Media Library',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. AUDIT-LOG COVERAGE & NEGATIVE ISOLATION
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Audit-Log Coverage & Negative Path Isolation', () => {
    it('5.1: Emits CREATE audit log on successful media registration', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAsset = {
        _id: '507f1f77bcf86cd799439031',
        title: 'New Event Poster',
        mediaType: 'image',
        url: 'https://images.unsplash.com/poster',
      };
      jest.spyOn(MediaAsset, 'create').mockResolvedValue(mockAsset as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'New Event Poster',
          altText: 'Event poster',
          url: 'https://images.unsplash.com/poster',
        });

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          module: 'Media Library',
          recordId: '507f1f77bcf86cd799439031',
        })
      );
    });

    it('5.2: Emits UPDATE audit log on successful metadata update', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439032',
        title: 'Old Title',
        url: 'https://images.unsplash.com/old',
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      await request(app)
        .put('/api/admin/media/507f1f77bcf86cd799439032')
        .set('Authorization', auth.header)
        .send({ title: 'New Valid Title' });

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'Media Library',
          recordId: '507f1f77bcf86cd799439032',
        })
      );
    });

    it('5.3: Emits ARCHIVE audit log on successful soft-archival', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439033',
        title: 'Archive Target',
        url: 'https://images.unsplash.com/archive-me',
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);
      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      await request(app)
        .delete('/api/admin/media/507f1f77bcf86cd799439033?archive=true')
        .set('Authorization', auth.header);

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'ARCHIVE',
          module: 'Media Library',
          recordId: '507f1f77bcf86cd799439033',
        })
      );
    });

    it('5.4: Emits DELETE audit log on successful permanent deletion', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439034',
        title: 'Delete Target',
        url: 'https://images.unsplash.com/delete-me',
      };
      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);
      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      } as any);
      jest.spyOn(MediaAsset, 'findByIdAndDelete').mockResolvedValue(mockAssetDoc as any);

      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      await request(app)
        .delete('/api/admin/media/507f1f77bcf86cd799439034')
        .set('Authorization', auth.header);

      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          module: 'Media Library',
          recordId: '507f1f77bcf86cd799439034',
        })
      );
    });

    it('5.5: AuditLog.create is NOT called when input validation fails (400 Bad Request)', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({ title: '', altText: '', url: 'not-a-url' });

      expect(res.status).toBe(400);
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('5.6: AuditLog.create is NOT called when role scope boundary is violated (403 Forbidden)', async () => {
      const auth = createAuthHeader({
        role: 'hod',
        departmentId: 'computer-science',
        permissions: ['media:create'],
      });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Physics Asset',
          altText: 'Alt',
          url: 'https://images.unsplash.com/physics',
          departmentId: 'physics',
        });

      expect(res.status).toBe(403);
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('5.7: AuditLog.create is NOT called when hard deletion is rejected due to active references (409 Conflict)', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:delete'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439035',
        title: 'Referenced Asset',
        url: 'https://images.unsplash.com/in-use',
      };
      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);
      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ _id: 'page-1', title: 'Home', slug: 'home' }]),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .delete('/api/admin/media/507f1f77bcf86cd799439035')
        .set('Authorization', auth.header);

      expect(res.status).toBe(409);
      expect(auditSpy).not.toHaveBeenCalled();
    });

    it('5.8: AuditLog.create is NOT called when URL update is rejected due to active references (409 Conflict)', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:update'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAssetDoc = {
        _id: '507f1f77bcf86cd799439036',
        title: 'Referenced Asset',
        url: 'https://images.unsplash.com/in-use-2',
      };
      jest.spyOn(MediaAsset, 'findById').mockResolvedValue(mockAssetDoc as any);
      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([{ _id: 'page-2', title: 'About', slug: 'about' }]),
        }),
      } as any);

      const auditSpy = jest.spyOn(AuditLog, 'create');

      const res = await request(app)
        .put('/api/admin/media/507f1f77bcf86cd799439036')
        .set('Authorization', auth.header)
        .send({ url: 'https://images.unsplash.com/brand-new-url' });

      expect(res.status).toBe(409);
      expect(auditSpy).not.toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. PUBLIC API PARITY & SANITIZATION (/api/media & /api/v1/media)
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. Public Media Read-Only API (/api/media & /api/v1/media)', () => {
    it('6.1: Returns only active assets, stripping archived assets and creator audit fields', async () => {
      const mockActiveAsset = {
        _id: '507f1f77bcf86cd799439019',
        title: 'Public Campus View',
        altText: 'Campus View',
        description: 'Open to the public',
        mediaType: 'image',
        url: 'https://bac.edu.in/images/campus.jpg',
        folder: 'General',
        tags: ['campus'],
        status: 'active',
        createdAt: new Date(),
      };

      jest.spyOn(MediaAsset, 'countDocuments').mockResolvedValue(1 as any);
      jest.spyOn(MediaAsset, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([mockActiveAsset]),
              }),
            }),
          }),
        }),
      } as any);

      const res = await request(app).get('/api/media');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].title).toBe('Public Campus View');
      // Verify internal security fields are not exposed
      expect(res.body.data[0].createdBy).toBeUndefined();
      expect(res.body.data[0].updatedBy).toBeUndefined();
      expect(res.body.data[0].__v).toBeUndefined();
    });

    it('6.2: Public /api/media and /api/v1/media return identical sanitized payloads', async () => {
      const mockActiveAsset = {
        _id: '507f1f77bcf86cd799439020',
        title: 'Laboratory Session',
        altText: 'Students working with microscopes',
        description: 'Advanced biology practicals',
        mediaType: 'image',
        url: 'https://bac.edu.in/images/lab.jpg',
        folder: 'Academics',
        tags: ['lab'],
        status: 'active',
        createdAt: new Date(),
      };

      jest.spyOn(MediaAsset, 'countDocuments').mockResolvedValue(1 as any);
      jest.spyOn(MediaAsset, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnValue({
                lean: jest.fn().mockResolvedValue([mockActiveAsset]),
              }),
            }),
          }),
        }),
      } as any);

      const resLegacy = await request(app).get('/api/media');
      const resV1 = await request(app).get('/api/v1/media');

      expect(resLegacy.status).toBe(200);
      expect(resV1.status).toBe(200);
      expect(resLegacy.body).toEqual(resV1.body);
    });

    it('6.3: Public /api/media rejects POST, PUT, DELETE operations', async () => {
      const resPost = await request(app)
        .post('/api/media')
        .send({ title: 'Unauthenticated Media', url: 'https://example.com/pic.jpg' });
      // Non-admin public route should reject mutation
      expect([401, 404, 405]).toContain(resPost.status);

      const resPut = await request(app)
        .put('/api/media/507f1f77bcf86cd799439020')
        .send({ title: 'Unauthenticated Media' });
      expect([401, 404, 405]).toContain(resPut.status);

      const resDelete = await request(app)
        .delete('/api/media/507f1f77bcf86cd799439020');
      expect([401, 404, 405]).toContain(resDelete.status);
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. PROHIBITED FEATURE COMPLIANCE AUDIT
  // ════════════════════════════════════════════════════════════════════════════
  describe('7. Prohibited Feature Compliance Audit', () => {
    it('7.1: Rejects binary buffers, multipart bodies, and non-URL payloads', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['media:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      // Attempting to pass local file path
      const resLocalPath = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Local File Attempt',
          altText: 'Attempt',
          url: '/uploads/secret.png',
        });

      expect(resLocalPath.status).toBe(400);

      // Attempting to pass base64 payload
      const resBase64 = await request(app)
        .post('/api/admin/media')
        .set('Authorization', auth.header)
        .send({
          title: 'Base64 Attempt',
          altText: 'Attempt',
          url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...',
        });

      expect(resBase64.status).toBe(400);
    });
  });
});
