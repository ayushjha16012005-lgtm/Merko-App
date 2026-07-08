import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '@/errors';
import { verifyToken } from '@/lib/auth-tokens';
import { prisma } from '@/config/db';
import type { UserRole } from '@merko/types';

export async function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return next(new UnauthorizedError('Access token is missing'));
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        status: true,
        isActive: true,
        isPlatformSuperAdmin: true,
        permissions: true,
        languagePreference: true,
      },
    });

    if (!user || user.status !== 'ACTIVE' || !user.isActive) {
      return next(new UnauthorizedError('User account is inactive or pending approval'));
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      firstName: user.firstName,
      lastName: user.lastName,
      isPlatformSuperAdmin: user.isPlatformSuperAdmin,
      permissions: user.permissions ? user.permissions.split(',') : [],
      languagePreference: user.languagePreference,
    };
    next();
  } catch {
    next(new UnauthorizedError('Invalid or expired access token'));
  }
}

export function roleGuard(roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Unauthorized'));
    }

    // Platform Super Admin always has full access
    if (req.user.isPlatformSuperAdmin) {
      return next();
    }

    // Role Hierarchy: CUSTOMER < ADMIN < SUPER_ADMIN
    const allowedRoles = [...roles];
    if (roles.includes('ADMIN' as UserRole)) {
      allowedRoles.push('SUPER_ADMIN' as UserRole);
    }
    if (roles.includes('CUSTOMER' as UserRole)) {
      allowedRoles.push('ADMIN' as UserRole);
      allowedRoles.push('SUPER_ADMIN' as UserRole);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(new ForbiddenError('You do not have permission to access this resource'));
    }

    next();
  };
}

export function permissionGuard(requiredPermission: string) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new UnauthorizedError('Unauthorized'));
    }

    // Platform Super Admin and Super Admin always have full access
    if (req.user.role === 'SUPER_ADMIN' || req.user.isPlatformSuperAdmin) {
      return next();
    }

    if (req.user.role === 'ADMIN') {
      const permissions = req.user.permissions || [];
      if (permissions.includes(requiredPermission)) {
        return next();
      }

      // Fallback for non-colon permissions like shipments and returns
      if (requiredPermission === 'shipments' && (permissions.includes('shipments') || permissions.includes('orders'))) {
        return next();
      }
      if (requiredPermission === 'returns' && (permissions.includes('returns') || permissions.includes('orders'))) {
        return next();
      }

      if (requiredPermission.includes(':')) {
        const [module] = requiredPermission.split(':');
        const legacyMap: Record<string, string[]> = {
          products: ['Products'],
          categories: ['Categories'],
          orders: ['Orders'],
          returns: ['Orders'],
          shipments: ['Orders'],
          payments: ['Payments'],
          analytics: ['Reports'],
          reports: ['Reports'],
          settings: ['Settings'],
          customers: ['Customers'],
        };

        const hasLegacy = permissions.some((p) => {
          const mappedModules = legacyMap[p.toLowerCase()];
          return mappedModules && mappedModules.some((m) => m.toLowerCase() === module!.toLowerCase());
        });

        if (hasLegacy) {
          return next();
        }
      }
    }

    return next(new ForbiddenError('You do not have permission to access this resource'));
  };
}

