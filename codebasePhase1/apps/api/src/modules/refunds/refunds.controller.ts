import type { Request, Response } from 'express';
import { refundsService } from './refunds.service';
import { sendSuccess } from '@/lib/response';
import { prisma } from '@/config/db';
import { NotFoundError, ForbiddenError, UnauthorizedError } from '@/errors';

export class RefundsController {
  async createRefund(req: Request, res: Response) {
    const refund = await refundsService.createRefund(req.body);
    return sendSuccess(res, refund, 201);
  }

  async getRefundByOrderId(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { orderId } = req.params;
    const isAdmin = !!(req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || req.user.isPlatformSuperAdmin);
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!isAdmin && order.userId !== req.user.id) {
      throw new ForbiddenError('You do not have permission to view refund details for this order');
    }

    const refund = await refundsService.getRefundByOrderId(orderId!);
    return sendSuccess(res, refund);
  }
}

export const refundsController = new RefundsController();
