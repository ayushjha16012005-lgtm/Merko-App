import crypto from 'crypto';
import { prisma } from '@/config/db';
import { AppError, NotFoundError } from '@/errors';

export class RefundsService {
  async createRefund(data: {
    paymentId: string;
    returnRequestId?: string;
    amount: number;
    reason?: string;
  }) {
    const payment = await prisma.payment.findUnique({
      where: { id: data.paymentId },
      include: { refunds: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status !== 'COMPLETED') {
      throw new AppError('Cannot refund an incomplete payment', 400);
    }

    // Calculate total already refunded
    const totalRefunded = payment.refunds.reduce((acc, r) => acc + Number(r.amount), 0);
    if (totalRefunded + data.amount > Number(payment.amount)) {
      throw new AppError('Refund amount exceeds original payment amount', 400);
    }

    let returnRequest = null;
    if (data.returnRequestId) {
      returnRequest = await prisma.returnRequest.findUnique({
        where: { id: data.returnRequestId },
      });
      if (!returnRequest) {
        throw new NotFoundError('Return request not found');
      }
    }

    const gatewayRefundId = `rfnd_mock_${crypto.randomBytes(8).toString('hex')}`;

    return prisma.$transaction(async (tx) => {
      // 1. Create refund record
      const refund = await tx.refund.create({
        data: {
          paymentId: data.paymentId,
          returnRequestId: data.returnRequestId || null,
          amount: data.amount,
          status: 'REFUNDED',
          reason: data.reason || 'Customer Return',
          gatewayRefundId,
        },
      });

      // 2. If return request exists, update status to CLOSED
      if (data.returnRequestId) {
        await tx.returnRequest.update({
          where: { id: data.returnRequestId },
          data: { status: 'CLOSED' },
        });

        await tx.returnEvent.create({
          data: {
            returnRequestId: data.returnRequestId,
            status: 'CLOSED',
            description: `Refund of ₹${data.amount} has been processed successfully. Return request closed.`,
          },
        });
      }

      // 3. Update order status to CANCELLED or REFUNDED and add order timeline event
      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: 'CANCELLED' }, // Standard state indicating transaction is cancelled/refunded
      });

      await tx.orderTimelineEvent.create({
        data: {
          orderId: payment.orderId,
          status: 'CANCELLED',
          description: `Order amount of ₹${data.amount} has been refunded to source account. (Reference: ${gatewayRefundId})`,
        },
      });

      // 4. Update parent payment status if fully refunded
      const isFullyRefunded = totalRefunded + data.amount === Number(payment.amount);
      if (isFullyRefunded) {
        await tx.payment.update({
          where: { id: data.paymentId },
          data: { status: 'REFUNDED' },
        });
      }

      return refund;
    });
  }

  async getRefundByOrderId(orderId: string) {
    const payment = await prisma.payment.findUnique({
      where: { orderId },
    });
    if (!payment) {
      return null;
    }
    return prisma.refund.findFirst({
      where: { paymentId: payment.id },
    });
  }
}

export const refundsService = new RefundsService();
