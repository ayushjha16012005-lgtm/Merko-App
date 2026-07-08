import type { Request, Response } from 'express';
import { returnsService } from './returns.service';
import { sendSuccess } from '@/lib/response';
import { UnauthorizedError } from '@/errors';

export class ReturnsController {
  async requestReturn(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const result = await returnsService.requestReturn(req.user.id, req.body);
    return sendSuccess(res, result, 201);
  }

  async getCustomerReturns(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const result = await returnsService.getCustomerReturns(req.user.id);
    return sendSuccess(res, result);
  }

  async getAdminReturns(req: Request, res: Response) {
    const { status, page, limit } = req.query;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    const result = await returnsService.getAdminReturns({
      status: status as string,
      page: pageNum,
      limit: limitNum,
    });
    return sendSuccess(res, result);
  }

  async getReturnById(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || req.user.isPlatformSuperAdmin;
    const result = await returnsService.getReturnById(id!, req.user.id, isAdmin);
    return sendSuccess(res, result);
  }

  async updateReturnStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, description } = req.body;
    const result = await returnsService.updateReturnRequestStatus(id!, status, description);
    return sendSuccess(res, result);
  }
}

export const returnsController = new ReturnsController();
