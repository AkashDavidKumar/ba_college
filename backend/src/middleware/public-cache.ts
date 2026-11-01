/**
 * public-cache.ts — Public Read Caching & ETag Negotiation Middleware
 *
 * Performance & Caching Policies:
 *  1. Header: Cache-Control: public, max-age=60, stale-while-revalidate=300
 *  2. Cryptographic ETag calculation based on serialized response payload.
 *  3. HTTP 304 Not Modified conditional request handling on If-None-Match match.
 *  4. Strict isolation: NEVER applied to authenticated, administrative, or PII routes.
 */
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface CacheOptions {
  maxAge?: number;
  staleWhileRevalidate?: number;
}

/**
 * Express middleware that generates Cache-Control headers and negotiates ETags for public GET requests.
 */
export function publicCache(options: CacheOptions = {}) {
  const maxAge = options.maxAge ?? 60;
  const swr = options.staleWhileRevalidate ?? 300;
  const cacheControlHeader = `public, max-age=${maxAge}, stale-while-revalidate=${swr}`;

  return (req: Request, res: Response, next: NextFunction): void => {
    // Only apply caching to idempotent public GET and HEAD requests
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next();
    }

    res.setHeader('Cache-Control', cacheControlHeader);

    // Capture res.send to compute ETag before payload transmission
    const originalSend = res.send.bind(res);

    res.send = function (body?: unknown): Response {
      // If status code is not 200, pass through without ETag negotiation
      if (res.statusCode !== 200 || body === undefined || body === null) {
        return originalSend(body);
      }

      // Serialize body to string for hashing
      let contentString: string;
      if (typeof body === 'string') {
        contentString = body;
      } else if (Buffer.isBuffer(body)) {
        contentString = body.toString('utf8');
      } else {
        try {
          contentString = JSON.stringify(body);
        } catch {
          return originalSend(body);
        }
      }

      // Generate deterministic SHA-256 hash (weak ETag format)
      const hash = crypto.createHash('sha256').update(contentString, 'utf8').digest('hex');
      const etag = `W/"${hash}"`;
      res.setHeader('ETag', etag);

      // Check conditional request header (If-None-Match)
      const ifNoneMatch = req.headers['if-none-match'];
      if (ifNoneMatch) {
        const clientEtags = ifNoneMatch.split(',').map((tag) => tag.trim());
        const matchFound = clientEtags.some((tag) => tag === etag || tag === `"${hash}"` || tag === '*');

        if (matchFound) {
          // Return 304 Not Modified with zero response body
          res.status(304);
          return res.end();
        }
      }

      return originalSend(body);
    };

    next();
  };
}
