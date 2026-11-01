/**
 * token.ts — Cryptographic JWT Token & Cookie Management
 *
 * Security rules:
 *  1. Tokens are signed using HMAC-SHA256 with a high-entropy secret (>=32 chars).
 *  2. Payload contains subject (user id), email, role, and tokenVersion.
 *  3. Tokens have a strict bounded expiration (default 8 hours).
 *  4. Cookies use HttpOnly, Secure (in production), and SameSite protections.
 */
import jwt, { SignOptions } from 'jsonwebtoken';
import { CookieOptions } from 'express';

export interface JwtUserPayload {
  sub: string;
  email: string;
  role: string;
  tokenVersion: number;
}

export const AUTH_COOKIE_NAME = 'bac_token';

/**
 * Generates a signed JWT token.
 */
export function signAuthToken(
  payload: JwtUserPayload,
  secret: string,
  expiresIn: string = '8h'
): string {
  const options: SignOptions = {
    expiresIn: expiresIn as SignOptions['expiresIn'],
    algorithm: 'HS256',
  };
  return jwt.sign(payload, secret, options);
}

/**
 * Verifies a JWT token and returns its decoded payload.
 * Throws JsonWebTokenError or TokenExpiredError on failure.
 */
export function verifyAuthToken(
  token: string,
  secret: string
): JwtUserPayload {
  return jwt.verify(token, secret, { algorithms: ['HS256'] }) as JwtUserPayload;
}

/**
 * Returns security-hardened options for setting the authentication cookie.
 */
export function getAuthCookieOptions(isProduction: boolean, maxAgeMs = 8 * 60 * 60 * 1000): CookieOptions {
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}
