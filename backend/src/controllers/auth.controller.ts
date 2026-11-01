/**
 * auth.controller.ts — Authentication and Session Controller
 *
 * Implements:
 *  - POST /api/auth/login   (Strict rate limit, lockout, timing mitigation, generic errors)
 *  - POST /api/auth/logout  (Cookie clearance, tokenVersion increment)
 *  - GET  /api/auth/me      (Profile retrieval for active user)
 */
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/user.model';
import { ApiError } from '../utils/api-error';
import {
  AUTH_COOKIE_NAME,
  signAuthToken,
  getAuthCookieOptions,
} from '../utils/token';
import { getEnv } from '../config/env';
import logger from '../utils/logger';

// Dummy hash used to balance timing attacks when an email is not found
const DUMMY_HASH = '$2a$12$e8s3xK1mQd0T0f8tXlHlre2zW3p4r5t6u7v8w9x0y1z2a3b4c5d6e';

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body as { email: string; password: string };
  const normalizedEmail = email.trim().toLowerCase();

  const user = await User.findByNormalizedEmail(normalizedEmail);

  // Timing mitigation: if user not found, perform dummy bcrypt check
  if (!user) {
    await bcrypt.compare(password, DUMMY_HASH);
    logger.warn('Failed login attempt: non-existent account', {
      requestId: req.id,
      email: normalizedEmail,
    });
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  // Check account lockout (with timing mitigation to prevent timing attacks)
  if (user.isLocked()) {
    await bcrypt.compare(password, DUMMY_HASH);
    logger.warn('Login attempt on locked account', {
      requestId: req.id,
      userId: String(user._id),
      email: normalizedEmail,
    });
    throw ApiError.tooManyRequests(
      'Account is temporarily locked due to consecutive failed attempts. Please try again later.'
    );
  }

  // Check active account status
  if (user.status !== 'active') {
    logger.warn('Login attempt on inactive account', {
      requestId: req.id,
      userId: String(user._id),
      email: normalizedEmail,
      status: user.status,
    });
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    await user.incLoginAttempts();
    logger.warn('Failed login attempt: incorrect password', {
      requestId: req.id,
      userId: String(user._id),
      email: normalizedEmail,
    });
    throw ApiError.unauthorized('Invalid email or password.', 'INVALID_CREDENTIALS');
  }

  // Successful login — reset lockouts & update lastLogin
  await user.resetLoginAttempts();
  user.lastLogin = new Date();
  await user.save();

  const env = getEnv();
  const token = signAuthToken(
    {
      sub: String(user._id),
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    env.JWT_SECRET,
    env.JWT_EXPIRES_IN
  );

  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = getAuthCookieOptions(isProduction);

  // Set HttpOnly session cookie
  res.cookie(AUTH_COOKIE_NAME, token, cookieOptions);

  logger.info('Successful administrator login', {
    requestId: req.id,
    userId: String(user._id),
    email: user.email,
    role: user.role,
  });

  const userData = user.toJSON();

  res.status(200).json({
    success: true,
    data: {
      user: userData,
      token,
    },
    // Top-level compatibility fields
    token,
    user: userData,
  });
}

export async function logout(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;
  const env = getEnv();
  const isProduction = env.NODE_ENV === 'production';
  const cookieOptions = getAuthCookieOptions(isProduction);

  // Clear authentication cookie with matched security attributes (path, httpOnly, secure, sameSite)
  res.clearCookie(AUTH_COOKIE_NAME, {
    httpOnly: cookieOptions.httpOnly,
    secure: cookieOptions.secure,
    sameSite: cookieOptions.sameSite,
    path: cookieOptions.path,
  });

  // Invalidate all tokens for this user by incrementing tokenVersion
  if (userId) {
    await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } });
    logger.info('Administrator logged out and session revoked', {
      requestId: req.id,
      userId,
    });
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  const userId = req.user?.id;

  const user = await User.findById(userId);
  if (!user || user.status !== 'active') {
    throw ApiError.unauthorized('User session is invalid.', 'INVALID_SESSION');
  }

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON(),
    },
  });
}
