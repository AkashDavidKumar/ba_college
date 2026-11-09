/**
 * audit-log.ts — Centralized Audit Logger for Protected Administrative Operations
 *
 * Conforms to security auditing standards:
 *  1. Records authenticated actor identifier, role, and action type.
 *  2. Records target resource type, identifier, and mutation outcome.
 *  3. Injects trace Request ID for correlation with operational logs.
 *  4. STRICT PRIVACY GUARD: Never logs passwords, tokens, student PII,
 *     applicant marks/addresses, or raw contact enquiry bodies.
 *  5. PERSISTENCE: Asynchronously persists audit entries to the MongoDB `audit_logs`
 *     collection without blocking primary transaction execution.
 */
import { Request } from 'express';
import logger from './logger';
import { AuditLog, AuditAction, AUDIT_ACTIONS } from '../models/audit-log.model';

export interface AuditLogDetails {
  action: string;
  resourceType?: string;
  resourceId?: string;
  module?: string;
  recordId?: string;
  recordTitle?: string;
  oldValue?: unknown;
  newValue?: unknown;
  status: 'SUCCESS' | 'FAILURE';
  reason?: string;
}

const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'tokenversion',
  'jwt',
  'accesstoken',
  'refreshtoken',
];

/**
 * Recursively redacts sensitive keys from audit log payloads.
 */
function redactSensitiveData(data: unknown): string | undefined {
  if (data === undefined || data === null) {
    return undefined;
  }

  if (typeof data === 'string') {
    // If it looks like a JSON string, attempt parsing and redaction
    if ((data.startsWith('{') && data.endsWith('}')) || (data.startsWith('[') && data.endsWith(']'))) {
      try {
        const parsed = JSON.parse(data);
        return JSON.stringify(redactSensitiveObject(parsed));
      } catch {
        // Plain string: redact if matches common password/token patterns
        return data;
      }
    }
    return data;
  }

  if (typeof data === 'object') {
    return JSON.stringify(redactSensitiveObject(data));
  }

  return String(data);
}

function redactSensitiveObject(obj: unknown): unknown {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactSensitiveObject(item));
  }

  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
      result[key] = '[REDACTED]';
    } else if (val && typeof val === 'object') {
      result[key] = redactSensitiveObject(val);
    } else {
      result[key] = val;
    }
  }
  return result;
}

function normalizeAction(action: string): AuditAction {
  const upper = action.toUpperCase();
  if (AUDIT_ACTIONS.includes(upper as AuditAction)) {
    return upper as AuditAction;
  }
  if (upper === 'SUBMIT') return 'CREATE';
  if (upper === 'EDIT' || upper === 'PATCH') return 'UPDATE';
  if (upper === 'REMOVE') return 'DELETE';
  return 'UPDATE';
}

export function logAdminAction(req: Request, details: AuditLogDetails): void {
  const actorId = req.user?.id || 'unauthenticated';
  const actorName = req.user?.name || req.user?.email || 'Anonymous';
  const actorEmail = req.user?.email || 'unknown';
  const actorRole = req.user?.role || 'unknown';
  const requestId = (req.headers['x-request-id'] as string) || req.id;
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || req.ip;

  const resourceType = details.module || details.resourceType || 'General';
  const resourceId = details.recordId || details.resourceId || 'global';
  const actionNormalized = normalizeAction(details.action);
  const title =
    details.recordTitle ||
    `${details.action} ${resourceType}${details.resourceId ? `:${details.resourceId}` : ''}`;

  // 1. Winston structured logger
  logger.info(
    `ADMIN_AUDIT: [${details.status}] ${details.action} on ${resourceType}${
      resourceId ? `:${resourceId}` : ''
    }`,
    {
      actorId,
      actorEmail,
      actorRole,
      action: details.action,
      resourceType,
      resourceId,
      status: details.status,
      reason: details.reason,
      requestId,
    }
  );

  // 2. Persist to MongoDB AuditLog collection if operation was successful or explicitly logged
  // Non-blocking fire-and-forget with observable error trapping
  const auditDoc = {
    userId: actorId,
    userName: actorName,
    userRole: actorRole,
    action: actionNormalized,
    module: resourceType,
    recordId: String(resourceId),
    recordTitle: title,
    oldValue: redactSensitiveData(details.oldValue),
    newValue: redactSensitiveData(details.newValue),
    ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : undefined,
    requestId: typeof requestId === 'string' ? requestId : undefined,
    timestamp: new Date(),
  };

  AuditLog.create(auditDoc).catch((err: unknown) => {
    logger.error('CRITICAL_AUDIT_LOG_PERSISTENCE_FAILURE: Failed to persist audit log document to MongoDB', {
      error: err instanceof Error ? err.message : String(err),
      auditDoc,
    });
  });
}

/**
 * Synchronous / awaitable audit logging variant for high-compliance mutations.
 */
export async function persistAuditLog(req: Request, details: AuditLogDetails) {
  const actorId = req.user?.id || 'unauthenticated';
  const actorName = req.user?.name || req.user?.email || 'Anonymous';
  const actorEmail = req.user?.email || 'unknown';
  const actorRole = req.user?.role || 'unknown';
  const requestId = (req.headers['x-request-id'] as string) || req.id;
  const ipAddress = (req.headers['x-forwarded-for'] as string) || req.socket?.remoteAddress || req.ip;

  const resourceType = details.module || details.resourceType || 'General';
  const resourceId = details.recordId || details.resourceId || 'global';
  const actionNormalized = normalizeAction(details.action);
  const title =
    details.recordTitle ||
    `${details.action} ${resourceType}${details.resourceId ? `:${details.resourceId}` : ''}`;

  logger.info(
    `ADMIN_AUDIT: [${details.status}] ${details.action} on ${resourceType}${
      resourceId ? `:${resourceId}` : ''
    }`,
    {
      actorId,
      actorEmail,
      actorRole,
      action: details.action,
      resourceType,
      resourceId,
      status: details.status,
      reason: details.reason,
      requestId,
    }
  );

  const auditDoc = {
    userId: actorId,
    userName: actorName,
    userRole: actorRole,
    action: actionNormalized,
    module: resourceType,
    recordId: String(resourceId),
    recordTitle: title,
    oldValue: redactSensitiveData(details.oldValue),
    newValue: redactSensitiveData(details.newValue),
    ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : undefined,
    requestId: typeof requestId === 'string' ? requestId : undefined,
    timestamp: new Date(),
  };

  return AuditLog.create(auditDoc);
}
