/**
 * api-error.ts — Application-level HTTP error class
 *
 * Throw ApiError from any controller or middleware instead of generic Error.
 * The centralised errorHandler checks `instanceof ApiError` to decide whether
 * to expose the message to the client or replace it with a generic string.
 */
export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string | undefined;
  /** Always true — used by errorHandler to distinguish operational errors */
  public readonly isOperational = true;

  constructor(statusCode: number, message: string, code?: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'ApiError';
    // Restore prototype chain (required when extending built-ins in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Convenience factories ────────────────────────────────────────────────

  static badRequest(message: string, code?: string): ApiError {
    return new ApiError(400, message, code ?? 'BAD_REQUEST');
  }

  static unauthorized(message = 'Authentication required.', code = 'UNAUTHORIZED'): ApiError {
    return new ApiError(401, message, code);
  }

  static forbidden(message = 'You do not have permission to perform this action.', code = 'FORBIDDEN'): ApiError {
    return new ApiError(403, message, code);
  }

  static notFound(resource = 'Resource'): ApiError {
    return new ApiError(404, `${resource} not found.`, 'NOT_FOUND');
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message, 'CONFLICT');
  }

  static tooManyRequests(message = 'Too many requests. Please try again later.'): ApiError {
    return new ApiError(429, message, 'RATE_LIMIT_EXCEEDED');
  }

  static internal(message = 'An unexpected error occurred.'): ApiError {
    return new ApiError(500, message, 'INTERNAL_ERROR');
  }
}
