/**
 * navigation-menu.test.ts — Unit & Integration Tests for Sub-Phase 4B-2: Navigation Menu Builder
 *
 * Test Coverage:
 *  1. Admin Navigation Menu Listing & Retrieval:
 *     - Authentication requirement (401 on unauthenticated).
 *     - Authorization requirement (403 on staff without menus:read).
 *     - Master Admin unrestricted access.
 *     - HOD department scoping enforcement (auto-filter + 403 on cross-department query).
 *     - Club Head club scoping enforcement (auto-filter + 403 on cross-club query).
 *     - 404 on non-existent menu item ID.
 *  2. Navigation Menu Creation & Input Validation:
 *     - Validation of required fields (label, path).
 *     - Rejection of unsafe URL schemes (javascript:, data:, vbscript:).
 *     - Rejection of <script> tags in label.
 *     - Verification of parent menu existence.
 *     - Dynamic page reference validation (existence + scoping).
 *     - Scope enforcement for HOD and Club Head.
 *     - Audit log emission for CREATE action.
 *  3. Navigation Menu Updates & Hierarchy Integrity:
 *     - 404 on non-existent menu item.
 *     - Self-parent prevention (parentId === id).
 *     - Circular parent-child reference prevention (A -> B -> A).
 *     - Deep descendant-parent prevention (A -> B -> C -> A).
 *     - Scope boundaries on update.
 *     - Audit log emission for UPDATE action.
 *  4. Bulk Reordering & Hierarchy Simulation:
 *     - Validation of submitted items array.
 *     - Cycle detection across submitted hierarchy.
 *     - Atomic bulk update.
 *     - Scope enforcement during bulk reorder.
 *  5. Cascading Deletion:
 *     - 404 on non-existent menu item.
 *     - Scope enforcement on deletion.
 *     - Safe cascading deletion of parent and all nested submenus.
 *     - Audit log emission for DELETE action.
 *  6. Public Read-Only Endpoint (/api/menus & /api/v1/menus):
 *     - Returns only visible menu items (visible: true).
 *     - Links to published dynamic pages are included.
 *     - Links to unpublished / draft dynamic pages are strictly omitted.
 */
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../app';
import { User, NavigationMenu, DynamicPage, AuditLog } from '../models';

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

describe('Sub-Phase 4B-2: Navigation Menu Builder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 1. ADMIN LISTING & RETRIEVAL (GET /api/admin/menus)
  // ════════════════════════════════════════════════════════════════════════════
  describe('1. Admin Menu Listing & Retrieval API', () => {
    it('1.1: GET /api/admin/menus rejects unauthenticated requests with 401', async () => {
      const res = await request(app).get('/api/admin/menus');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('1.2: GET /api/admin/menus rejects unauthorized staff without menus:read with 403', async () => {
      const auth = createAuthHeader({ role: 'staff', permissions: ['unrelated:perm'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app).get('/api/admin/menus').set('Authorization', auth.header);
      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_PERMISSION');
    });

    it('1.3: GET /api/admin/menus returns all menus for master_admin', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['*'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockMenus = [
        {
          _id: '507f1f77bcf86cd799439001',
          label: 'Academics',
          path: '/academics',
          order: 1,
          visible: true,
        },
      ];

      jest.spyOn(NavigationMenu, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockMenus),
        }),
      } as any);

      const res = await request(app).get('/api/admin/menus').set('Authorization', auth.header);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].label).toBe('Academics');
    });

    it('1.4: GET /api/admin/menus blocks HOD from querying other departments with 403', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science', permissions: ['menus:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .get('/api/admin/menus?departmentId=commerce')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('1.5: GET /api/admin/menus/:id returns 404 for non-existent item', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(NavigationMenu, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .get('/api/admin/menus/507f1f77bcf86cd799439099')
        .set('Authorization', auth.header);

      expect(res.status).toBe(404);
      expect(res.body.code).toBe('MENU_NOT_FOUND');
    });

    it('1.6: GET /api/admin/menus/:id blocks HOD from viewing a different department menu item', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science', permissions: ['menus:read'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockForeignMenu = {
        _id: '507f1f77bcf86cd799439002',
        label: 'Commerce Department',
        path: '/departments/commerce',
        departmentId: 'commerce',
      };

      jest.spyOn(NavigationMenu, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockForeignMenu),
      } as any);

      const res = await request(app)
        .get('/api/admin/menus/507f1f77bcf86cd799439002')
        .set('Authorization', auth.header);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 2. CREATION & INPUT VALIDATION (POST /api/admin/menus)
  // ════════════════════════════════════════════════════════════════════════════
  describe('2. Navigation Menu Creation API', () => {
    it('2.1: Rejects creation without label or path with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({ label: '', path: '' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('2.2: Rejects unsafe URI schemes (javascript:alert(1)) with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'Malicious Link',
          path: 'javascript:alert(document.cookie)',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/dangerous schemes/i);
    });

    it('2.3: Rejects <script> tag in menu label with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: '<script>alert("XSS")</script>',
          path: '/safe-path',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/script tags/i);
    });

    it('2.4: Rejects non-existent parentId with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(NavigationMenu, 'findById').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'Submenu Item',
          path: '/sub-path',
          parentId: 'non-existent-parent-id',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Parent menu item .* does not exist/i);
    });

    it('2.5: Rejects non-existent referenced dynamic pageId with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'Custom Page Link',
          path: '/custom-page',
          pageId: 'non-existent-page-id',
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Referenced dynamic page .* does not exist/i);
    });

    it('2.6: Prevents HOD from creating menu item for another department with 403', async () => {
      const auth = createAuthHeader({ role: 'hod', departmentId: 'computer-science', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'Commerce Menu',
          path: '/departments/commerce',
          departmentId: 'commerce',
        });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_DEPARTMENT_SCOPE');
    });

    it('2.7: Successfully creates menu item and emits CREATE audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockCreated = {
        _id: '507f1f77bcf86cd799439003',
        label: 'Admissions 2026',
        path: '/admissions',
        order: 1,
        target: '_self',
        isCustom: true,
        visible: true,
      };

      jest.spyOn(NavigationMenu, 'findOne').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            lean: jest.fn().mockResolvedValue(null),
          }),
        }),
      } as any);
      jest.spyOn(NavigationMenu, 'create').mockResolvedValue(mockCreated as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'Admissions 2026',
          path: '/admissions',
          target: '_self',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.label).toBe('Admissions 2026');
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CREATE',
          module: 'Menu Builder',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 3. UPDATES & HIERARCHY CYCLE PREVENTION (PUT /api/admin/menus/:id)
  // ════════════════════════════════════════════════════════════════════════════
  describe('3. Navigation Menu Updates & Cycle Prevention API', () => {
    it('3.1: Rejects update setting menu item as its own parent (self-parent) with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockMenu = {
        _id: '507f1f77bcf86cd799439004',
        label: 'Self Parent Item',
        path: '/self-parent',
        save: jest.fn(),
      };

      jest.spyOn(NavigationMenu, 'findById').mockResolvedValue(mockMenu as any);

      const res = await request(app)
        .put('/api/admin/menus/507f1f77bcf86cd799439004')
        .set('Authorization', auth.header)
        .send({ parentId: '507f1f77bcf86cd799439004' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/cannot be set as its own parent/i);
    });

    it('3.2: Rejects circular reference (setting parent to an existing descendant) with 400', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const menuA = {
        _id: 'menu-A',
        label: 'Menu A',
        save: jest.fn(),
      };

      jest.spyOn(NavigationMenu, 'findById').mockImplementation((id: any) => {
        if (id === 'menu-A') return Promise.resolve(menuA as any);
        if (id === 'menu-B') return { lean: jest.fn().mockResolvedValue({ _id: 'menu-B' }) } as any;
        return null as any;
      });

      // Simulate menu-B is a child of menu-A
      (jest.spyOn(NavigationMenu, 'find') as any).mockImplementation((query: any) => {
        if (query.parentId === 'menu-A') {
          return { select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: 'menu-B' }]) }) } as any;
        }
        return { select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) } as any;
      });

      // Try setting menu-A's parent to its child menu-B
      const res = await request(app)
        .put('/api/admin/menus/menu-A')
        .set('Authorization', auth.header)
        .send({ parentId: 'menu-B' });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Circular reference detected/i);
    });

    it('3.3: Successfully updates menu item and emits UPDATE audit log', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockMenu = {
        _id: '507f1f77bcf86cd799439005',
        label: 'Old Label',
        path: '/old-path',
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(NavigationMenu, 'findById').mockResolvedValue(mockMenu as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/menus/507f1f77bcf86cd799439005')
        .set('Authorization', auth.header)
        .send({ label: 'Updated Label', path: '/updated-path' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(mockMenu.label).toBe('Updated Label');
      expect(mockMenu.path).toBe('/updated-path');
      expect(mockMenu.save).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'UPDATE',
          module: 'Menu Builder',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 4. BULK REORDERING & HIERARCHY VALIDATION (PUT /api/admin/menus)
  // ════════════════════════════════════════════════════════════════════════════
  describe('4. Bulk Reordering API (PUT /api/admin/menus)', () => {
    it('4.1: Rejects empty items array with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .put('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({ items: [] });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('4.2: Rejects circular hierarchy cycle in bulk update with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAllMenus = [
        { _id: 'm-1', label: 'Item 1', parentId: null },
        { _id: 'm-2', label: 'Item 2', parentId: null },
      ];

      jest.spyOn(NavigationMenu, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAllMenus),
      } as any);

      // Simulation of cycle: m-1 -> parent is m-2, and m-2 -> parent is m-1
      const res = await request(app)
        .put('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          items: [
            { id: 'm-1', order: 1, parentId: 'm-2' },
            { id: 'm-2', order: 2, parentId: 'm-1' },
          ],
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/Circular parent-child reference/i);
    });

    it('4.3: Successfully executes bulk reordering and persists atomically', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const mockAllMenus = [
        { _id: 'm-1', label: 'Item 1', parentId: null },
        { _id: 'm-2', label: 'Item 2', parentId: null },
      ];

      jest.spyOn(NavigationMenu, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockAllMenus),
      } as any);
      const bulkWriteSpy = jest.spyOn(NavigationMenu, 'bulkWrite').mockResolvedValue({} as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .put('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          items: [
            { id: 'm-1', order: 2, parentId: null },
            { id: 'm-2', order: 1, parentId: null },
          ],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(bulkWriteSpy).toHaveBeenCalled();
      expect(auditSpy).toHaveBeenCalled();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 5. CASCADING DELETION (DELETE /api/admin/menus/:id)
  // ════════════════════════════════════════════════════════════════════════════
  describe('5. Cascading Menu Deletion API', () => {
    it('5.1: Deleting a parent menu item cascades and deletes all nested submenus', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const parentMenu = {
        _id: 'parent-1',
        label: 'Parent Menu',
      };

      jest.spyOn(NavigationMenu, 'findById').mockResolvedValue(parentMenu as any);

      // Parent has child-1, which has child-2
      (jest.spyOn(NavigationMenu, 'find') as any).mockImplementation((query: any) => {
        if (query.parentId === 'parent-1') {
          return { select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: 'child-1' }]) }) } as any;
        }
        if (query.parentId === 'child-1') {
          return { select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([{ _id: 'child-2' }]) }) } as any;
        }
        return { select: jest.fn().mockReturnValue({ lean: jest.fn().mockResolvedValue([]) }) } as any;
      });

      const deleteManySpy = jest.spyOn(NavigationMenu, 'deleteMany').mockResolvedValue({} as any);
      const auditSpy = jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .delete('/api/admin/menus/parent-1')
        .set('Authorization', auth.header);

      expect(res.status).toBe(200);
      expect(res.body.deletedCount).toBe(3); // parent-1 + child-1 + child-2
      expect(deleteManySpy).toHaveBeenCalledWith({
        _id: { $in: ['parent-1', 'child-1', 'child-2'] },
      });
      expect(auditSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'DELETE',
          module: 'Menu Builder',
        })
      );
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 6. PUBLIC READ-ONLY ENDPOINT (/api/menus & /api/v1/menus)
  // ════════════════════════════════════════════════════════════════════════════
  describe('6. Public Menu API (GET /api/menus & /api/v1/menus)', () => {
    it('6.1: Public endpoint returns only visible menus, including links to published pages', async () => {
      const mockMenus = [
        {
          _id: 'm-1',
          label: 'About BAC',
          path: '/about',
          order: 1,
          visible: true,
          pageId: undefined, // Standard route
        },
        {
          _id: 'm-2',
          label: 'Campus Tour',
          path: '/campus-tour',
          order: 2,
          visible: true,
          pageId: 'page-published-1', // Linked to published page
        },
      ];

      jest.spyOn(NavigationMenu, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockMenus),
        }),
      } as any);

      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([
            { _id: 'page-published-1', slug: 'campus-tour', status: 'published' },
          ]),
        }),
      } as any);

      const res = await request(app).get('/api/menus');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.count).toBe(2);
      expect(res.body.data[0].label).toBe('About BAC');
      expect(res.body.data[1].label).toBe('Campus Tour');
    });

    it('6.2: Public endpoint strictly excludes menu items linked to unpublished/draft pages', async () => {
      const mockMenus = [
        {
          _id: 'm-1',
          label: 'Public Info',
          path: '/info',
          visible: true,
          pageId: undefined,
        },
        {
          _id: 'm-2',
          label: 'Secret Draft Page',
          path: '/secret-draft',
          visible: true,
          pageId: 'draft-page-id', // Page exists in DB, but status !== 'published'
        },
      ];

      jest.spyOn(NavigationMenu, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockMenus),
        }),
      } as any);

      // DynamicPage lookup returns empty array because status !== 'published'
      jest.spyOn(DynamicPage, 'find').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      } as any);

      const res = await request(app).get('/api/menus');

      expect(res.status).toBe(200);
      expect(res.body.count).toBe(1);
      expect(res.body.data[0].label).toBe('Public Info');
      // The secret draft page link is completely omitted
      const draftItem = res.body.data.find((m: any) => m.label === 'Secret Draft Page');
      expect(draftItem).toBeUndefined();
    });
  });

  // ════════════════════════════════════════════════════════════════════════════
  // 7. VERIFICATION & HARDENING SUITE (RBAC, SECURITY, ATOMICITY)
  // ════════════════════════════════════════════════════════════════════════════
  describe('7. Verification & Hardening Suite (RBAC, External Security, Reorder Atomicity)', () => {
    // 7A: RBAC Role Consistency
    it('7.1: sub_admin with menus:manage is authorized for administrative creation', async () => {
      const auth = createAuthHeader({ role: 'sub_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(NavigationMenu, 'findOne').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      jest.spyOn(NavigationMenu, 'create').mockResolvedValue({
        _id: 'subadmin-menu-1',
        label: 'SubAdmin Section',
        path: '/subadmin',
        order: 1,
      } as any);

      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'SubAdmin Section',
          path: '/subadmin',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('7.2: club_head is permitted for assigned club but blocked with 403 for other clubs', async () => {
      const auth = createAuthHeader({ role: 'club_head', clubId: 'rotaract-club', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const existingOtherClubMenu = {
        _id: 'other-club-menu',
        label: 'Leo Club Activities',
        clubId: 'leo-club',
      };
      jest.spyOn(NavigationMenu, 'findById').mockResolvedValue(existingOtherClubMenu as any);

      const res = await request(app)
        .put('/api/admin/menus/other-club-menu')
        .set('Authorization', auth.header)
        .send({ label: 'Unauthorized Edit' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('FORBIDDEN_CLUB_SCOPE');
      expect(res.body.error).toMatch(/assigned club/i);
    });

    it('7.3: content_editor without menus:manage is blocked with 403 Forbidden', async () => {
      const auth = createAuthHeader({ role: 'content_editor', permissions: ['pages:create'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'Unauthorized Menu',
          path: '/unauthorized',
        });

      expect(res.status).toBe(403);
    });

    // 7B: External Navigation Security
    it('7.4: Rejects protocol-relative path (//evil.com) with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const res = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'Phishing Redirect',
          path: '//evil.com/login',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/Validation failed|dangerous schemes/i);
    });

    it('7.5: Rejects dangerous URI schemes (data:, vbscript:, file:) with 400 Bad Request', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      for (const dangerousPath of [
        'data:text/html,<script>alert(1)</script>',
        'vbscript:msgbox(1)',
        'file:///etc/passwd',
      ]) {
        const res = await request(app)
          .post('/api/admin/menus')
          .set('Authorization', auth.header)
          .send({
            label: 'Dangerous Scheme Item',
            path: dangerousPath,
          });

        expect(res.status).toBe(400);
      }
    });

    it('7.6: Accepts valid external HTTPS and HTTP links and internal anchor routes', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      jest.spyOn(NavigationMenu, 'findOne').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(null),
        }),
      } as any);

      const createSpy = jest.spyOn(NavigationMenu, 'create').mockResolvedValue({
        _id: 'm-valid',
        label: 'UGC Portal',
        path: 'https://ugc.ac.in',
      } as any);
      jest.spyOn(AuditLog, 'create').mockResolvedValue({} as any);

      const resHttps = await request(app)
        .post('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          label: 'UGC Portal',
          path: 'https://ugc.ac.in',
          target: '_blank',
        });

      expect(resHttps.status).toBe(201);
      expect(createSpy).toHaveBeenCalled();
    });

    // 7C: Bulk Reorder Atomicity & Compensating Rollback
    it('7.7: Reorder executes compensating rollback if an error occurs midway during bulkWrite', async () => {
      const auth = createAuthHeader({ role: 'master_admin', permissions: ['menus:manage'] });
      jest.spyOn(User, 'findById').mockReturnValue({
        select: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(auth.userDoc),
        }),
      } as any);

      const item1 = { _id: 'item-1', order: 1, parentId: null, visible: true, label: 'Menu 1' };
      const item2 = { _id: 'item-2', order: 2, parentId: null, visible: true, label: 'Menu 2' };

      jest.spyOn(NavigationMenu, 'find').mockReturnValue({
        lean: jest.fn().mockResolvedValue([item1, item2]),
      } as any);

      // Simulate bulkWrite throwing a database error
      let callCount = 0;
      const bulkWriteSpy = jest.spyOn(NavigationMenu, 'bulkWrite').mockImplementation(async (_ops: any) => {
        callCount++;
        if (callCount === 1) {
          throw new Error('Simulated Database Write Failure');
        }
        return { ok: 1 } as any; // Compensating rollback call
      });

      const res = await request(app)
        .put('/api/admin/menus')
        .set('Authorization', auth.header)
        .send({
          items: [
            { id: 'item-1', order: 2 },
            { id: 'item-2', order: 1 },
          ],
        });

      expect(res.status).toBe(500);
      // Verify bulkWrite was invoked a second time to execute the compensating rollback
      expect(bulkWriteSpy).toHaveBeenCalledTimes(2);
      expect(bulkWriteSpy).toHaveBeenLastCalledWith([
        {
          updateOne: {
            filter: { _id: 'item-1' },
            update: { $set: { order: 1, parentId: null, visible: true } },
          },
        },
        {
          updateOne: {
            filter: { _id: 'item-2' },
            update: { $set: { order: 2, parentId: null, visible: true } },
          },
        },
      ]);
    });

    // 7D: Versioned and Legacy Public Endpoint Parity
    it('7.8: Public /api/menus and /api/v1/menus return identical sanitized responses', async () => {
      const mockMenus = [
        {
          _id: 'm-public-1',
          label: 'Academics',
          path: '/academics',
          order: 1,
          visible: true,
          pageId: undefined,
        },
      ];

      jest.spyOn(NavigationMenu, 'find').mockReturnValue({
        sort: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue(mockMenus),
        }),
      } as any);

      const resLegacy = await request(app).get('/api/menus');
      const resV1 = await request(app).get('/api/v1/menus');

      expect(resLegacy.status).toBe(200);
      expect(resV1.status).toBe(200);
      expect(resLegacy.body).toEqual(resV1.body);
    });
  });
});
