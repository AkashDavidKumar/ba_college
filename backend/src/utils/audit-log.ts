/**
 * audit-log.ts — Centralized Audit Logger for Protected Administrative Operations
 *
 * Conforms to security auditing standards:
 *  1. Records authenticated actor identifier, role, and action type.
 *  2. Records target resource type, identifier, and mutation outcome.
 *  3. Injects trace Request ID for correlation with operational logs.
 *  4. STRICT PRIVACY GUARD: Never logs passwords, tokens, student PII,
 *     applicant marks/addresses, or raw contact enquiry bodies.
 */
import { Request } from 'express';
import logger from './logger';

export interface AuditLogDetails {
  action: string;
  resourceType: string;
  resourceId?: string;
  status: 'SUCCESS' | 'FAILURE';
  reason?: string;
}

export function logAdminAction(req: Request, details: AuditLogDetails): void {
  const actorId = req.user?.id || 'unauthenticated';
  const actorEmail = req.user?.email || 'unknown';
  const actorRole = req.user?.role || 'unknown';
  const requestId = (req.headers['x-request-id'] as string) || req.id;

  logger.info(
    `ADMIN_AUDIT: [${details.status}] ${details.action} on ${details.resourceType}${
      details.resourceId ? `:${details.resourceId}` : ''
    }`,
    {
      actorId,
      actorEmail,
      actorRole,
      action: details.action,
      resourceType: details.resourceType,
      resourceId: details.resourceId,
      status: details.status,
      reason: details.reason,
      requestId,
    }
  );
}
