import type { Request, Response } from 'express';
import { refundsService } from './refunds.service';
import { sendSuccess } from '@/lib/response';

export class RefundsController {
  async createRefund(req: Request, res: Response) {
    const refund = await refundsService.createRefund(req.body);
    return sendSuccess(res, refund, 201);
  }

  async getRefundByOrderId(req: Request, res: Response) {
    const { orderId } = req.params;
    const refund = await refundsService.getRefundByOrderId(orderId!);
    return sendSuccess(res, refund);
  }
}

export const refundsController = new RefundsController();
