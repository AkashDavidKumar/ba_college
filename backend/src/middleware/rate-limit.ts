/**
 * rate-limit.ts — Express rate limiting middleware
 *
 * Two limiters are exported:
 *
 *  generalRateLimit  — applied globally to all /api routes
 *                      100 requests per 15-minute window per IP
 *
 *  strictRateLimit   — reserved for abuse-prone endpoints (auth, seed, etc.)
 *                      10 requests per 15-minute window per IP
 *                      Will be applied in Phase 3 when auth routes are added.
 *
 * Reverse proxy configuration:
 *  When TRUST_PROXY=1, Express trusts X-Forwarded-For and rate limiting keys
 *  on the real client IP. Without this, all requests behind a proxy appear to
 *  come from the proxy IP and a single slow-rate attacker could lock out all
 *  users. TRUST_PROXY must only be set when an actual trusted proxy exists.
 *
 * Security: The 429 response body is minimal — it does not reveal the window
 * duration, remaining requests, or internal rate-limit storage details.
 */
import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';

/** 100 req / 15 min — general API traffic */
export const generalRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: 'draft-7', // Send RateLimit-* headers per RFC 9110 draft
  legacyHeaders: false,       // Disable X-RateLimit-* headers (deprecated)
  // Do NOT include retryAfter info — it helps attackers time bursts
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

/** 10 req / 15 min — auth and other abuse-prone endpoints */
export const strictRateLimit: RateLimitRequestHandler = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests. Please try again later.',
    code: 'RATE_LIMIT_EXCEEDED',
  },
});
