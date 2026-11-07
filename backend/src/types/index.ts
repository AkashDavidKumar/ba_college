import { Request, Response, NextFunction } from 'express';
import { IUserDocument, IUser } from '../models/user.model';

// ── Authenticated User payload attached to Request ───────────────────────────
export interface IAuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  departmentId?: string;
  clubId?: string;
  permissions: string[];
  status: 'active' | 'deactivated' | 'locked';
  tokenVersion: number;
}

export type ILeanUser = IUser & { _id: unknown };

// ── Express request augmentation ──────────────────────────────────────────────
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      /** Unique per-request UUID assigned by requestIdMiddleware */
      id: string;
      /** Authenticated user attached by requireAuth middleware */
      user?: IAuthUser;
      /** Loaded user document or lean object attached by requireAuth to eliminate duplicate lookups */
      userDoc?: IUserDocument | ILeanUser;
    }
  }
}

// ── Validated environment object ──────────────────────────────────────────────
export interface ValidatedEnv {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  MONGODB_URI: string;
  CORS_ORIGINS: string[];
  TRUST_PROXY: boolean;
  LOG_LEVEL: string;
  REQUEST_ID_HEADER: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  COOKIE_SECRET?: string;
}

// ── Async request handler type ────────────────────────────────────────────────
export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void | Response>;
