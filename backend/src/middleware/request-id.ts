/**
 * request-id.ts — Per-request UUID middleware
 *
 * Assigns a unique UUID v4 to every incoming request:
 *  1. If the client provides a configured request-ID header, that value is
 *     validated (must be a UUID v4 — rejecting arbitrary attacker-supplied IDs).
 *  2. Otherwise a new UUID is generated server-side.
 *  3. The ID is attached to req.id and echoed in the response header.
 *
 * The request ID is bound to every logger.child() call from here on, enabling
 * end-to-end tracing of a single request through all log lines.
 *
 * Security: We do NOT blindly echo the raw incoming header value to prevent
 * log injection. Only UUID v4 format is accepted from clients.
 */
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';

const UUID_V4_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuidV4(value: string): boolean {
  return UUID_V4_RE.test(value) && uuidValidate(value) && uuidVersion(value) === 4;
}

export function requestIdMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const headerName = process.env['REQUEST_ID_HEADER'] ?? 'X-Request-Id';
  const incoming = req.headers[headerName.toLowerCase()];

  let requestId: string;

  if (typeof incoming === 'string' && isValidUuidV4(incoming)) {
    // Accept client-supplied ID only if it is a valid UUID v4
    requestId = incoming;
  } else {
    // Generate a fresh UUID for this request
    requestId = uuidv4();
  }

  req.id = requestId;
  res.setHeader(headerName, requestId);
  next();
}
