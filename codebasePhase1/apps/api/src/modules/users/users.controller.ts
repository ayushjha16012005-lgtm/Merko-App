import type { Request, Response, NextFunction } from 'express';
import { usersService } from './users.service';
import { sendSuccess } from '@/lib/response';

export class UsersController {
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getUserById(req.params['id'] as string);
      sendSuccess(res, {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role,
        status: user.status,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAdminRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await usersService.getAdminRequests();
      sendSuccess(res, admins.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        businessAddress: user.businessAddress,
        status: user.status,
        approvedBy: user.approvedBy,
        approvedAt: user.approvedAt ? user.approvedAt.toISOString() : null,
        rejectedBy: user.rejectedBy,
        rejectedAt: user.rejectedAt ? user.rejectedAt.toISOString() : null,
        permissions: user.permissions ? user.permissions.split(',') : [],
        createdAt: user.createdAt.toISOString(),
      })));
    } catch (error) {
      next(error);
    }
  }

  async updateAdminRequestStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { status } = req.body;
      const targetId = req.params['id'] as string;
      const actorId = req.user!.id;
      const actorRole = req.user!.role;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;

      const user = await usersService.updateAdminRequestStatus(
        targetId,
        status,
        actorId,
        actorRole,
        ipAddress,
        userAgent
      );

      sendSuccess(res, {
        id: user.id,
        email: user.email,
        status: user.status,
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  async getSuperAdmins(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const admins = await usersService.getSuperAdmins();
      sendSuccess(res, admins.map(user => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
      })));
    } catch (error) {
      next(error);
    }
  }

  async inviteSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { fullName, email, phone } = req.body;
      const actorId = req.user!.id;
      const actorRole = req.user!.role;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;

      const user = await usersService.inviteSuperAdmin(
        { fullName, email, phone },
        actorId,
        actorRole,
        ipAddress,
        userAgent
      );

      sendSuccess(res, {
        id: user.id,
        email: user.email,
        status: user.status,
      }, 201);
    } catch (error) {
      next(error);
    }
  }

  async activateSuperAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;

      const result = await usersService.activateSuperAdmin(token, password, ipAddress, userAgent);
      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async updateSuperAdminStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { action } = req.body; // suspend, reactivate, remove
      const targetId = req.params['id'] as string;
      const actorId = req.user!.id;
      const actorRole = req.user!.role;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;

      const result = await usersService.updateSuperAdminStatus(
        targetId,
        action,
        actorId,
        actorRole,
        ipAddress,
        userAgent
      );

      sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  async handleEmailAction(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.query['token'] as string;
      const html = await usersService.handleEmailAction(token);
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(html);
    } catch (error) {
      next(error);
    }
  }

  async updateAdminPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { permissions } = req.body;
      const targetId = req.params['id'] as string;
      const actorId = req.user!.id;
      const actorRole = req.user!.role;
      const ipAddress = req.ip || req.socket.remoteAddress || undefined;
      const userAgent = req.headers['user-agent'] || undefined;

      const user = await usersService.updateAdminPermissions(
        targetId,
        permissions,
        actorId,
        actorRole,
        ipAddress,
        userAgent
      );

      sendSuccess(res, {
        id: user.id,
        email: user.email,
        permissions: user.permissions ? user.permissions.split(',') : [],
      }, 200);
    } catch (error) {
      next(error);
    }
  }

  async getAuditLogs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const logs = await usersService.getAuditLogs();
      sendSuccess(res, logs.map(log => ({
        id: log.id,
        userId: log.userId,
        actorRole: log.actorRole,
        action: log.action,
        resource: log.resource,
        resourceId: log.resourceId,
        changes: log.changes,
        metadata: log.metadata,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        createdAt: log.createdAt.toISOString(),
      })));
    } catch (error) {
      next(error);
    }
  }
}

export const usersController = new UsersController();
