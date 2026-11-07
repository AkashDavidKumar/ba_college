/**
 * auth.ts — Authentication and Role-Based Authorization Middleware
 *
 * Security guarantees:
 *  1. Checks both HttpOnly cookie and Bearer Authorization header.
 *  2. Verifies cryptographic signature and expiry.
 *  3. Validates tokenVersion against database for instant session revocation.
 *  4. Checks active account status on every protected request.
 *  5. Role checks default to deny; returns 401 unauthenticated vs 403 unauthorized.
 *  6. Never leaks internal error messages or user details on auth failure.
 */
import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../utils/api-error';
import { AUTH_COOKIE_NAME, verifyAuthToken } from '../utils/token';
import { User } from '../models/user.model';
import { getEnv } from '../config/env';

/**
 * Extracts authentication token from either HttpOnly cookie or Authorization Bearer header.
 */
function extractToken(req: Request): string | null {
  // 1. Check HttpOnly cookie
  if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
    return req.cookies[AUTH_COOKIE_NAME];
  }

  // 2. Check Authorization Bearer header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }

  return null;
}

/**
 * Middleware: Requires a valid authenticated session.
 */
export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    next(ApiError.unauthorized('Authentication required. Please log in.', 'UNAUTHORIZED'));
    return;
  }

  const env = getEnv();

  let payload;
  try {
    payload = verifyAuthToken(token, env.JWT_SECRET);
  } catch (err: unknown) {
    const errorName = err instanceof Error ? err.name : 'UnknownError';
    if (errorName === 'TokenExpiredError') {
      next(ApiError.unauthorized('Authentication token has expired. Please log in again.', 'TOKEN_EXPIRED'));
      return;
    }
    next(ApiError.unauthorized('Invalid or tampered authentication token.', 'INVALID_TOKEN'));
    return;
  }

  try {
    // Look up the user in database as a lean object (bypasses Mongoose Document hydration overhead)
    const query = User.findById(payload.sub).select('+tokenVersion +status');
    const user = typeof query.lean === 'function' ? await query.lean() : await query;

    if (!user) {
      next(ApiError.unauthorized('User account no longer exists.', 'USER_NOT_FOUND'));
      return;
    }

    if (user.status !== 'active') {
      next(ApiError.unauthorized('Account is deactivated or suspended.', 'ACCOUNT_DISABLED'));
      return;
    }

    // Verify token version (supports instant invalidation across all user tokens)
    if (user.tokenVersion !== payload.tokenVersion) {
      next(ApiError.unauthorized('Session has been revoked. Please log in again.', 'TOKEN_REVOKED'));
      return;
    }

    // Attach user to request
    req.user = {
      id: String(user._id),
      name: user.name,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
      clubId: user.clubId,
      permissions: user.permissions || [],
      status: user.status,
      tokenVersion: user.tokenVersion,
    };
    req.userDoc = user;

    next();
  } catch (err: unknown) {
    // Fail closed: Database or internal errors must result in 500, never leak or authenticate
    next(err);
  }
}

/**
 * Middleware factory: Enforces role-based authorization.
 *
 * Defaults to deny. Master Admin / ADMIN is always granted access.
 */
export function requireRoles(...allowedRoles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED'));
      return;
    }

    const currentRole = req.user.role;

    // Master Admin / ADMIN bypasses individual role requirements
    if (currentRole === 'master_admin' || currentRole === 'ADMIN') {
      next();
      return;
    }

    if (allowedRoles.includes(currentRole)) {
      next();
      return;
    }

    next(
      ApiError.forbidden(
        'Forbidden: You do not have the required role to access this resource.',
        'FORBIDDEN_ROLE'
      )
    );
  };
}

/**
 * Middleware factory: Enforces explicit granular permission checks.
 */
export function requirePermissions(...requiredPermissions: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(ApiError.unauthorized('Authentication required.', 'UNAUTHORIZED'));
      return;
    }

    const userPerms = req.user.permissions || [];

    // Master Admin / ADMIN or wildcard permissions
    if (
      req.user.role === 'master_admin' ||
      req.user.role === 'ADMIN' ||
      userPerms.includes('*') ||
      userPerms.includes('all')
    ) {
      next();
      return;
    }

    const hasAll = requiredPermissions.every((p) => userPerms.includes(p));
    if (hasAll) {
      next();
      return;
    }

    next(
      ApiError.forbidden(
        'Forbidden: You lack the necessary permissions to perform this action.',
        'FORBIDDEN_PERMISSION'
      )
    );
  };
}
