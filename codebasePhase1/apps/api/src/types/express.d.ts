import type { UserRole } from '@merko/types';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      user?: {
        id: string;
        email: string;
        role: UserRole;
        firstName: string;
        lastName: string;
        isPlatformSuperAdmin?: boolean;
        permissions?: string[];
      };
    }
  }
}

export {};

