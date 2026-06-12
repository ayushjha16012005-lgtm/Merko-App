import type { Request, Response } from 'express';
import { paymentsService } from './payments.service';
import { sendSuccess } from '@/lib/response';
import { UnauthorizedError } from '@/errors';

export class PaymentsController {
  async initiatePayment(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { orderId } = req.body;
    const session = await paymentsService.initiatePayment(orderId);
    return sendSuccess(res, session, 201);
  }

  async verifyPayment(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
    const result = await paymentsService.verifyPayment(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );
    return sendSuccess(res, result);
  }

  async getPaymentByOrderId(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { orderId } = req.params;
    const payment = await paymentsService.getPaymentByOrderId(orderId!);
    return sendSuccess(res, payment);
  }
}

export const paymentsController = new PaymentsController();
