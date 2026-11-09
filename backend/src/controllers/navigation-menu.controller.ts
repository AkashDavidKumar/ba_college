/**
 * navigation-menu.controller.ts — Navigation Menu Builder Controller
 *
 * Implements:
 *  1. Admin CRUD endpoints for hierarchical navigation menus (main menus, submenus, nested links).
 *  2. Public read-only endpoint returning strictly visible menus and published dynamic pages.
 *  3. Complete hierarchy validation before persistence (prevention of self-parenting, cycles, descendant-as-parent).
 *  4. Atomic bulk update and reordering.
 *  5. Safe cascading deletion for nested submenus.
 *  6. Granular RBAC and departmental / club scoping guards.
 *  7. Persistent audit logging for all mutations.
 */
import { Request, Response, NextFunction } from 'express';
import mongoose, { FilterQuery } from 'mongoose';
import { NavigationMenu, INavigationMenuDocument } from '../models/navigation-menu.model';
import { DynamicPage } from '../models/dynamic-page.model';
import { ApiError } from '../utils/api-error';
import { logAdminAction } from '../utils/audit-log';
import logger from '../utils/logger';

/**
 * Traverses the database to collect all descendant IDs of a given menu item.
 */
async function getAllDescendantIds(menuId: string): Promise<string[]> {
  const descendants: string[] = [];
  const queue: string[] = [menuId];

  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const children = await NavigationMenu.find({ parentId: currentId }).select('_id').lean();
    for (const child of children) {
      const childId = String(child._id);
      descendants.push(childId);
      queue.push(childId);
    }
  }

  return descendants;
}

/**
 * Validates a referenced dynamic page: confirms existence, verifies status, and validates scoping.
 */
async function validateReferencedPage(
  pageId: string,
  user?: { role?: string; departmentId?: string; clubId?: string }
): Promise<{ departmentId?: string; clubId?: string; isPublished: boolean; title: string; slug: string }> {
  const isObjectId = mongoose.Types.ObjectId.isValid(pageId);
  const query = isObjectId ? { $or: [{ _id: pageId }, { slug: pageId.toLowerCase().trim() }] } : { slug: pageId.toLowerCase().trim() };

  const page = await DynamicPage.findOne(query).lean();
  if (!page) {
    throw ApiError.badRequest(`Referenced dynamic page '${pageId}' does not exist.`);
  }

  // Scoping verification on referenced page
  if (user?.role === 'hod' && page.departmentId && page.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
    throw ApiError.forbidden(
      'You cannot create or link a navigation menu item to a page belonging to another department.',
      'FORBIDDEN_DEPARTMENT_SCOPE'
    );
  }
  if (user?.role === 'club_head' && page.clubId && page.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
    throw ApiError.forbidden(
      'You cannot create or link a navigation menu item to a page belonging to another club.',
      'FORBIDDEN_CLUB_SCOPE'
    );
  }

  return {
    departmentId: page.departmentId,
    clubId: page.clubId,
    isPublished: page.status === 'published',
    title: page.title,
    slug: page.slug,
  };
}

/**
 * GET /api/admin/menus (Protected Admin Listing)
 */
export async function listAdminMenus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const { visible, parentId, departmentId, clubId } = req.query;

    const filter: FilterQuery<INavigationMenuDocument> = {};

    // ── Scope Boundary Enforcement ──
    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (departmentId && (departmentId as string).toLowerCase().trim() !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only view menus for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      // HOD sees department menus and global menus
      filter.$or = [{ departmentId: userDept }, { departmentId: { $exists: false } }, { departmentId: null }, { departmentId: '' }];
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (clubId && (clubId as string).toLowerCase().trim() !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only view menus for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      // Club Head sees club menus and global menus
      filter.$or = [{ clubId: userClub }, { clubId: { $exists: false } }, { clubId: null }, { clubId: '' }];
    } else {
      if (departmentId) {
        filter.departmentId = (departmentId as string).toLowerCase().trim();
      }
      if (clubId) {
        filter.clubId = (clubId as string).toLowerCase().trim();
      }
    }

    if (visible !== undefined) {
      filter.visible = visible === 'true';
    }
    if (parentId !== undefined) {
      filter.parentId = parentId === 'null' || parentId === '' ? null : (parentId as string);
    }

    const menus = await NavigationMenu.find(filter).sort({ parentId: 1, order: 1, createdAt: 1 }).lean();

    const formatted = menus.map((m) => ({
      id: String(m._id),
      _id: m._id,
      label: m.label,
      path: m.path,
      icon: m.icon,
      order: m.order,
      parentId: m.parentId,
      target: m.target,
      isCustom: m.isCustom,
      visible: m.visible,
      pageId: m.pageId,
      departmentId: m.departmentId,
      clubId: m.clubId,
      createdBy: m.createdBy,
      updatedBy: m.updatedBy,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/admin/menus/:id (Protected Admin Retrieval)
 */
export async function getAdminMenuById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const menu = await NavigationMenu.findById(id).lean();
    if (!menu) {
      throw new ApiError(404, `Navigation menu item with ID '${id}' not found.`, 'MENU_NOT_FOUND');
    }

    // Scope check
    if (user?.role === 'hod' && menu.departmentId && menu.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot access navigation menus belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
    }
    if (user?.role === 'club_head' && menu.clubId && menu.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
      throw ApiError.forbidden('You cannot access navigation menus belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
    }

    res.status(200).json({
      success: true,
      data: {
        id: String(menu._id),
        ...menu,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/admin/menus (Protected Admin Creation)
 */
export async function createNavigationMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const {
      label,
      path,
      icon,
      order,
      parentId,
      target,
      isCustom,
      visible,
      pageId,
      departmentId: declaredDept,
      clubId: declaredClub,
    } = req.body;

    // 1. Parent existence verification
    const normalizedParentId = parentId && parentId.trim() !== '' ? parentId.trim() : null;
    if (normalizedParentId) {
      const parentExists = await NavigationMenu.findById(normalizedParentId).lean();
      if (!parentExists) {
        throw ApiError.badRequest(`Parent menu item '${normalizedParentId}' does not exist.`);
      }
    }

    // 2. Referenced Page verification & Scoping Inference
    let resolvedDept = declaredDept ? declaredDept.toLowerCase().trim() : undefined;
    let resolvedClub = declaredClub ? declaredClub.toLowerCase().trim() : undefined;

    if (pageId && pageId.trim() !== '') {
      const pageInfo = await validateReferencedPage(pageId.trim(), user);
      resolvedDept = pageInfo.departmentId || resolvedDept;
      resolvedClub = pageInfo.clubId || resolvedClub;
    }

    // 3. User Role Scoping Enforcement
    if (user?.role === 'hod') {
      const userDept = user.departmentId?.toLowerCase().trim();
      if (resolvedDept && resolvedDept !== userDept) {
        throw ApiError.forbidden(
          `Department scope mismatch: You can only create menu items for your assigned department (${user.departmentId}).`,
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
      resolvedDept = userDept;
    } else if (user?.role === 'club_head') {
      const userClub = user.clubId?.toLowerCase().trim();
      if (resolvedClub && resolvedClub !== userClub) {
        throw ApiError.forbidden(
          `Club scope mismatch: You can only create menu items for your assigned club (${user.clubId}).`,
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
      resolvedClub = userClub;
    }

    // 4. Calculate auto-order if not provided
    let finalOrder = order;
    if (finalOrder === undefined || finalOrder === null) {
      const highestOrderDoc = await NavigationMenu.findOne({ parentId: normalizedParentId })
        .sort({ order: -1 })
        .select('order')
        .lean();
      finalOrder = highestOrderDoc ? highestOrderDoc.order + 1 : 1;
    }

    // 5. Persistence
    const newMenu = await NavigationMenu.create({
      label: label.trim(),
      path: path.trim(),
      icon: icon ? icon.trim() : '',
      order: finalOrder,
      parentId: normalizedParentId,
      target: target || '_self',
      isCustom: isCustom !== undefined ? isCustom : true,
      visible: visible !== undefined ? visible : true,
      pageId: pageId && pageId.trim() !== '' ? pageId.trim() : undefined,
      departmentId: resolvedDept,
      clubId: resolvedClub,
      createdBy: user?.id,
      updatedBy: user?.id,
    });

    // 6. Audit Logging
    logAdminAction(req, {
      action: 'CREATE',
      module: 'Menu Builder',
      recordId: String(newMenu._id),
      recordTitle: `Created menu item: "${newMenu.label}" (${newMenu.path})`,
      status: 'SUCCESS',
    });

    res.status(201).json({
      success: true,
      message: 'Navigation menu item created successfully.',
      data: newMenu,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/menus/:id (Protected Admin Single Item Update)
 */
export async function updateNavigationMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const menu = await NavigationMenu.findById(id);
    if (!menu) {
      throw new ApiError(404, `Navigation menu item with ID '${id}' not found.`, 'MENU_NOT_FOUND');
    }

    // 1. Role Scope Boundary Check
    if (user?.role === 'hod') {
      if (!menu.departmentId || menu.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          'You can only modify navigation menu items scoped to your assigned department.',
          'FORBIDDEN_DEPARTMENT_SCOPE'
        );
      }
    } else if (user?.role === 'club_head') {
      if (!menu.clubId || menu.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
        throw ApiError.forbidden(
          'You can only modify navigation menu items scoped to your assigned club.',
          'FORBIDDEN_CLUB_SCOPE'
        );
      }
    }

    const {
      label,
      path,
      icon,
      order,
      parentId,
      target,
      isCustom,
      visible,
      pageId,
      departmentId: declaredDept,
      clubId: declaredClub,
    } = req.body;

    // 2. Parent & Hierarchy Validations
    if (parentId !== undefined) {
      const normalizedParentId = parentId && parentId.trim() !== '' ? parentId.trim() : null;

      if (normalizedParentId !== null) {
        // Self-parent check
        if (normalizedParentId === String(menu._id)) {
          throw ApiError.badRequest('A navigation menu item cannot be set as its own parent.');
        }

        // Parent existence check
        const parentDoc = await NavigationMenu.findById(normalizedParentId).lean();
        if (!parentDoc) {
          throw ApiError.badRequest(`Parent menu item '${normalizedParentId}' does not exist.`);
        }

        // Descendant-parent check (prevention of circular reference)
        const descendantIds = await getAllDescendantIds(String(menu._id));
        if (descendantIds.includes(normalizedParentId)) {
          throw ApiError.badRequest(
            'Circular reference detected: A menu item cannot have its parent set to one of its own descendants.'
          );
        }
      }

      menu.parentId = normalizedParentId;
    }

    // 3. Referenced Page validation
    if (pageId !== undefined) {
      const trimmedPageId = pageId ? pageId.trim() : '';
      if (trimmedPageId !== '') {
        const pageInfo = await validateReferencedPage(trimmedPageId, user);
        menu.pageId = trimmedPageId;
        menu.departmentId = pageInfo.departmentId || menu.departmentId;
        menu.clubId = pageInfo.clubId || menu.clubId;
      } else {
        menu.pageId = undefined;
      }
    }

    // 4. Scope update validation
    if (declaredDept !== undefined) {
      const normalizedDept = declaredDept ? declaredDept.toLowerCase().trim() : undefined;
      if (user?.role === 'hod' && normalizedDept !== user.departmentId?.toLowerCase().trim()) {
        throw ApiError.forbidden('You cannot change department scope to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
      }
      menu.departmentId = normalizedDept;
    }

    if (declaredClub !== undefined) {
      const normalizedClub = declaredClub ? declaredClub.toLowerCase().trim() : undefined;
      if (user?.role === 'club_head' && normalizedClub !== user.clubId?.toLowerCase().trim()) {
        throw ApiError.forbidden('You cannot change club scope to another club.', 'FORBIDDEN_CLUB_SCOPE');
      }
      menu.clubId = normalizedClub;
    }

    // 5. Update content fields
    if (label !== undefined) menu.label = label.trim();
    if (path !== undefined) menu.path = path.trim();
    if (icon !== undefined) menu.icon = icon ? icon.trim() : '';
    if (order !== undefined) menu.order = order;
    if (target !== undefined) menu.target = target;
    if (isCustom !== undefined) menu.isCustom = isCustom;
    if (visible !== undefined) menu.visible = visible;

    menu.updatedBy = user?.id;
    await menu.save();

    // 6. Audit Logging
    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Menu Builder',
      recordId: String(menu._id),
      recordTitle: `Updated menu item: "${menu.label}" (${menu.path})`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Navigation menu item updated successfully.',
      data: menu,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * PUT /api/admin/menus (Protected Admin Bulk Hierarchy Reordering)
 */
export async function reorderNavigationMenus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const { items } = req.body as { items: Array<{ id: string; order: number; parentId?: string | null; visible?: boolean }> };

    if (!Array.isArray(items) || items.length === 0) {
      throw ApiError.badRequest('At least one menu item is required for reordering.');
    }

    // 1. Fetch all items in database to perform full-hierarchy cycle validation
    const allDbMenus = await NavigationMenu.find().lean();
    const dbMenuMap = new Map<string, (typeof allDbMenus)[0]>();
    for (const m of allDbMenus) {
      dbMenuMap.set(String(m._id), m);
    }

    // 2. Validate all submitted items exist and check scoping
    const parentMap = new Map<string, string | null>();
    // Pre-populate with existing DB hierarchy
    for (const m of allDbMenus) {
      parentMap.set(String(m._id), m.parentId || null);
    }

    for (const update of items) {
      const existing = dbMenuMap.get(update.id);
      if (!existing) {
        throw ApiError.badRequest(`Menu item with ID '${update.id}' does not exist in navigation.`);
      }

      // Scope check
      if (user?.role === 'hod') {
        if (!existing.departmentId || existing.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
          throw ApiError.forbidden('You cannot reorder global menus or menus belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
        }
      } else if (user?.role === 'club_head') {
        if (!existing.clubId || existing.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
          throw ApiError.forbidden('You cannot reorder global menus or menus belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
        }
      }

      // Self-parent check
      if (update.parentId && update.parentId === update.id) {
        throw ApiError.badRequest(`Menu item '${existing.label}' cannot be set as its own parent.`);
      }

      // Parent existence check if changed
      if (update.parentId) {
        const parentDoc = dbMenuMap.get(update.parentId);
        if (!parentDoc) {
          throw ApiError.badRequest(`Parent menu item '${update.parentId}' does not exist.`);
        }
      }

      // Apply to simulated parent map
      parentMap.set(update.id, update.parentId !== undefined ? (update.parentId ? update.parentId.trim() : null) : existing.parentId || null);
    }

    // 3. Complete Cycle Detection across simulated hierarchy
    for (const [startId] of parentMap) {
      const visited = new Set<string>();
      let curr: string | null = startId;
      while (curr) {
        if (visited.has(curr)) {
          throw ApiError.badRequest('Circular parent-child reference detected in navigation hierarchy.');
        }
        visited.add(curr);
        curr = parentMap.get(curr) || null;
      }
    }

    // 4. Safe Atomic Bulk Update with Transaction and Compensating Rollback Support
    const originalSnapshots = items.map((item) => {
      const doc = dbMenuMap.get(item.id)!;
      return {
        id: item.id,
        order: doc.order,
        parentId: doc.parentId || null,
        visible: doc.visible,
      };
    });

    const bulkOps = items.map((item) => {
      const updateDoc: Record<string, unknown> = {
        order: item.order,
        updatedBy: user?.id,
      };
      if (item.parentId !== undefined) {
        updateDoc['parentId'] = item.parentId && item.parentId.trim() !== '' ? item.parentId.trim() : null;
      }
      if (item.visible !== undefined) {
        updateDoc['visible'] = item.visible;
      }
      return {
        updateOne: {
          filter: { _id: item.id },
          update: { $set: updateDoc },
        },
      };
    });

    let session: mongoose.ClientSession | null = null;
    let transactionActive = false;

    if (mongoose.connection.readyState === 1) {
      try {
        session = await mongoose.startSession();
        session.startTransaction();
        transactionActive = true;
      } catch {
        // Transactions not supported in standalone MongoDB; fall back to compensating rollback
        session = null;
        transactionActive = false;
      }
    }

    try {
      if (session && transactionActive) {
        await NavigationMenu.bulkWrite(bulkOps, { session });
        await session.commitTransaction();
      } else {
        await NavigationMenu.bulkWrite(bulkOps, { ordered: true });
      }
    } catch (writeErr) {
      if (session && transactionActive) {
        try {
          await session.abortTransaction();
        } catch {
          // Ignore abort errors
        }
      } else {
        // Standalone fallback: execute compensating rollback to restore pre-mutation state
        try {
          const rollbackOps = originalSnapshots.map((snap) => ({
            updateOne: {
              filter: { _id: snap.id },
              update: {
                $set: {
                  order: snap.order,
                  parentId: snap.parentId,
                  visible: snap.visible,
                },
              },
            },
          }));
          await NavigationMenu.bulkWrite(rollbackOps);
        } catch (compensationErr) {
          logger.error('[NavigationMenu] Compensating rollback failed', {
            error: (compensationErr as Error)?.message,
          });
        }
      }
      throw writeErr;
    } finally {
      if (session) {
        session.endSession();
      }
    }

    // 5. Audit Logging
    logAdminAction(req, {
      action: 'UPDATE',
      module: 'Menu Builder',
      recordId: 'reorder',
      recordTitle: `Reordered navigation hierarchy (${items.length} items updated)`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Navigation hierarchy reordered successfully.',
      updatedCount: items.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * DELETE /api/admin/menus/:id (Protected Admin Cascading Deletion)
 */
export async function deleteNavigationMenu(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user;
    const rawId = req.params.id;
    const id = Array.isArray(rawId) ? rawId[0] : String(rawId || '');

    const menu = await NavigationMenu.findById(id);
    if (!menu) {
      throw new ApiError(404, `Navigation menu item with ID '${id}' not found.`, 'MENU_NOT_FOUND');
    }

    // 1. Scope Boundary Check
    if (user?.role === 'hod') {
      if (!menu.departmentId || menu.departmentId.toLowerCase() !== user.departmentId?.toLowerCase().trim()) {
        throw ApiError.forbidden('You cannot delete global menus or menus belonging to another department.', 'FORBIDDEN_DEPARTMENT_SCOPE');
      }
    } else if (user?.role === 'club_head') {
      if (!menu.clubId || menu.clubId.toLowerCase() !== user.clubId?.toLowerCase().trim()) {
        throw ApiError.forbidden('You cannot delete global menus or menus belonging to another club.', 'FORBIDDEN_CLUB_SCOPE');
      }
    }

    // 2. Safe Cascading: Collect all descendants
    const descendantIds = await getAllDescendantIds(String(menu._id));
    const allIdsToDelete = [menu._id, ...descendantIds];

    // 3. Atomic deletion of target and all nested submenus
    await NavigationMenu.deleteMany({ _id: { $in: allIdsToDelete } });

    // 4. Audit Logging
    logAdminAction(req, {
      action: 'DELETE',
      module: 'Menu Builder',
      recordId: String(menu._id),
      recordTitle: `Deleted menu item: "${menu.label}" and ${descendantIds.length} nested submenus`,
      status: 'SUCCESS',
    });

    res.status(200).json({
      success: true,
      message: 'Navigation menu item and nested submenus deleted successfully.',
      deletedCount: allIdsToDelete.length,
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/menus & /api/v1/menus (Public Read-Only Endpoint)
 *
 * Requirements:
 *  - Return only visible menu items (visible: true).
 *  - If an item links to a dynamic page, verify that the referenced page is published.
 *  - Do NOT expose menu links to draft, submitted, pending, or archived pages.
 */
export async function getPublicNavigationMenus(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    // 1. Fetch all visible menu items
    const visibleMenus = await NavigationMenu.find({ visible: true })
      .sort({ parentId: 1, order: 1, createdAt: 1 })
      .lean();

    // 2. Identify all referenced pageIds
    const referencedPageIds = visibleMenus
      .map((m) => m.pageId)
      .filter((id): id is string => !!id && id.trim() !== '');

    let publishedPageSet = new Set<string>();
    if (referencedPageIds.length > 0) {
      const objectIds: string[] = [];
      const slugs: string[] = [];

      for (const pid of referencedPageIds) {
        if (mongoose.Types.ObjectId.isValid(pid)) {
          objectIds.push(pid);
        } else {
          slugs.push(pid.toLowerCase().trim());
        }
      }

      const publishedPages = await DynamicPage.find({
        $or: [
          { _id: { $in: objectIds }, status: 'published' },
          { slug: { $in: slugs }, status: 'published' },
        ],
      })
        .select('_id slug status')
        .lean();

      publishedPageSet = new Set([
        ...publishedPages.map((p) => String(p._id)),
        ...publishedPages.map((p) => p.slug.toLowerCase().trim()),
      ]);
    }

    // 3. Filter out menu items whose referenced page is not published
    const publishableMenus = visibleMenus.filter((m) => {
      if (!m.pageId || m.pageId.trim() === '') {
        return true; // Standard route or external URL
      }
      const pageKey = m.pageId.trim().toLowerCase();
      const pageIdKey = m.pageId.trim();
      return publishedPageSet.has(pageKey) || publishedPageSet.has(pageIdKey);
    });

    // 4. Format clean output
    const formatted = publishableMenus.map((m) => ({
      id: String(m._id),
      label: m.label,
      path: m.path,
      icon: m.icon,
      order: m.order,
      parentId: m.parentId,
      target: m.target,
      isCustom: m.isCustom,
      pageId: m.pageId,
      departmentId: m.departmentId,
      clubId: m.clubId,
    }));

    res.status(200).json({
      success: true,
      count: formatted.length,
      data: formatted,
    });
  } catch (err) {
    next(err);
  }
}
