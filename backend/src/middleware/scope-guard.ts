/**
 * scope-guard.ts — Resource-Level Authorization & Ownership Verification Guards
 *
 * Implements strict departmental (HOD) and club (Club Head) ownership validation:
 *  1. HODs can only create, update, or delete resources belonging to their assigned departmentId.
 *  2. Club Heads can only create, update, or delete events belonging to their assigned clubId.
 *  3. Fail closed: Users lacking assigned scopes are unconditionally blocked (403 Forbidden).
 *  4. Global guest speakers and photo galleries are strictly guarded against unauthorized HOD/Club Head mutation.
 *  5. Master Admin and Sub Admin maintain approved global management authority.
 */
import { IAuthUser } from '../types';
import { ApiError } from '../utils/api-error';

/**
 * Asserts that the authenticated user has authority to manage resources for the target department.
 *
 * @param user Authenticated user from req.user
 * @param targetDepartmentSlug Slug of the target department being mutated
 */
export function assertDepartmentScope(user: IAuthUser | undefined, targetDepartmentSlug: string): void {
  if (!user) {
    throw ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED');
  }

  // Master Admin and Sub Admin have global institutional scope
  if (user.role === 'master_admin' || user.role === 'ADMIN' || user.role === 'sub_admin') {
    return;
  }

  // HOD must strictly match assigned departmentId
  if (user.role === 'hod') {
    if (!user.departmentId || user.departmentId.trim() === '') {
      throw ApiError.forbidden(
        'Account lacks an assigned department scope. Please contact the administrator.',
        'UNASSIGNED_SCOPE'
      );
    }

    if (user.departmentId.trim().toLowerCase() !== targetDepartmentSlug.trim().toLowerCase()) {
      throw ApiError.forbidden(
        `You can only modify your own assigned department (${user.departmentId}).`,
        'FORBIDDEN_DEPARTMENT_SCOPE'
      );
    }
    return;
  }

  throw ApiError.forbidden(
    'Forbidden: You do not have permission to manage academic department resources.',
    'FORBIDDEN_ROLE'
  );
}

/**
 * Asserts that the authenticated user has authority to manage a course under target departmentSlug.
 */
export function assertCourseScope(user: IAuthUser | undefined, targetDepartmentSlug: string): void {
  if (!user) {
    throw ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED');
  }

  if (user.role === 'master_admin' || user.role === 'ADMIN' || user.role === 'sub_admin') {
    return;
  }

  if (user.role === 'hod') {
    if (!user.departmentId || user.departmentId.trim() === '') {
      throw ApiError.forbidden(
        'Account lacks an assigned department scope. Please contact the administrator.',
        'UNASSIGNED_SCOPE'
      );
    }

    if (user.departmentId.trim().toLowerCase() !== targetDepartmentSlug.trim().toLowerCase()) {
      throw ApiError.forbidden(
        `You can only modify courses belonging to your assigned department (${user.departmentId}).`,
        'FORBIDDEN_DEPARTMENT_SCOPE'
      );
    }
    return;
  }

  throw ApiError.forbidden(
    'Forbidden: You do not have permission to manage academic degree programmes.',
    'FORBIDDEN_ROLE'
  );
}

/**
 * Asserts that the authenticated user has authority to mutate an event.
 * Enforces HOD department scope and Club Head club scope.
 */
export function assertEventScope(
  user: IAuthUser | undefined,
  eventScope: { departmentSlug?: string; clubId?: string }
): void {
  if (!user) {
    throw ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED');
  }

  // Master Admin, Sub Admin, and Content Editor have global institutional event publishing access
  if (
    user.role === 'master_admin' ||
    user.role === 'ADMIN' ||
    user.role === 'sub_admin' ||
    user.role === 'content_editor'
  ) {
    return;
  }

  // HOD scope
  if (user.role === 'hod') {
    if (!user.departmentId || user.departmentId.trim() === '') {
      throw ApiError.forbidden(
        'Account lacks an assigned department scope. Please contact the administrator.',
        'UNASSIGNED_SCOPE'
      );
    }

    if (
      !eventScope.departmentSlug ||
      user.departmentId.trim().toLowerCase() !== eventScope.departmentSlug.trim().toLowerCase()
    ) {
      throw ApiError.forbidden(
        `You can only modify events belonging to your assigned department (${user.departmentId}).`,
        'FORBIDDEN_DEPARTMENT_SCOPE'
      );
    }
    return;
  }

  // Club Head scope
  if (user.role === 'club_head') {
    if (!user.clubId || user.clubId.trim() === '') {
      throw ApiError.forbidden(
        'Account lacks an assigned club scope. Please contact the administrator.',
        'UNASSIGNED_SCOPE'
      );
    }

    if (
      !eventScope.clubId ||
      user.clubId.trim().toLowerCase() !== eventScope.clubId.trim().toLowerCase()
    ) {
      throw ApiError.forbidden(
        `You can only modify events belonging to your assigned club (${user.clubId}).`,
        'FORBIDDEN_CLUB_SCOPE'
      );
    }
    return;
  }

  throw ApiError.forbidden('Forbidden: You lack the required scope to mutate campus events.', 'FORBIDDEN_ROLE');
}

/**
 * Asserts that the authenticated user is authorized to manage global distinguished guest speakers.
 * Strictly prohibits HOD and Club Head roles from altering institutional speakers.
 */
export function assertSpeakerManagementRole(user: IAuthUser | undefined): void {
  if (!user) {
    throw ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED');
  }

  if (
    user.role === 'master_admin' ||
    user.role === 'ADMIN' ||
    user.role === 'sub_admin' ||
    user.role === 'content_editor'
  ) {
    return;
  }

  if (user.role === 'hod' || user.role === 'club_head') {
    throw ApiError.forbidden(
      'HOD and Club Head roles are prohibited from managing global distinguished guest speakers.',
      'FORBIDDEN_ROLE'
    );
  }

  throw ApiError.forbidden('Forbidden: You do not have permission to manage guest speakers.', 'FORBIDDEN_ROLE');
}

/**
 * Asserts that the authenticated user is authorized to update photo gallery albums.
 * Enforces explicit gallery:update permission; event permissions DO NOT grant gallery access.
 */
export function assertGalleryManagement(user: IAuthUser | undefined): void {
  if (!user) {
    throw ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED');
  }

  if (user.role === 'master_admin' || user.role === 'ADMIN') {
    return;
  }

  if (user.role === 'hod' || user.role === 'club_head') {
    throw ApiError.forbidden(
      'HOD and Club Head roles are prohibited from modifying photo albums and gallery archives.',
      'FORBIDDEN_ROLE'
    );
  }

  const perms = user.permissions || [];
  if (perms.includes('*') || perms.includes('all') || perms.includes('gallery:update')) {
    return;
  }

  throw ApiError.forbidden(
    'Forbidden: You lack gallery:update permission. Event permissions do not grant gallery access.',
    'FORBIDDEN_PERMISSION'
  );
}
