import jwt from 'jsonwebtoken';
import { getEnv } from '@merko/config';
import type { UserRole } from '@merko/types';

const env = getEnv();
const JWT_SECRET = env.JWT_SECRET;

export interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
}

export function generateRefreshToken(payload: { id: string }): string {
  return jwt.sign(
    { ...payload, jti: Math.random().toString(36).substring(2, 15) + Date.now() },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
}

export interface EmailActionPayload {
  userId: string;
  action: 'approve' | 'reject';
}

export function generateEmailActionToken(userId: string, action: 'approve' | 'reject'): string {
  return jwt.sign({ userId, action }, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyEmailActionToken(token: string): EmailActionPayload {
  return jwt.verify(token, JWT_SECRET) as unknown as EmailActionPayload;
}

