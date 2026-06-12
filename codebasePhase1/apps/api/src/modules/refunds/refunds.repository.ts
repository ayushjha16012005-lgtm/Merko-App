import { prisma } from '@/config/db';

export class RefundsRepository {
  async createRefund({
    paymentId,
    returnRequestId,
    amount,
    status = 'PENDING',
    reason,
    gatewayRefundId,
  }: {
    paymentId: string;
    returnRequestId?: string;
    amount: number;
    status?: string;
    reason?: string;
    gatewayRefundId?: string;
  }) {
    return prisma.refund.create({
      data: {
        paymentId,
        returnRequestId: returnRequestId || null,
        amount,
        status,
        reason: reason || null,
        gatewayRefundId: gatewayRefundId || null,
      },
    });
  }

  async findRefundById(id: string) {
    return prisma.refund.findUnique({
      where: { id },
      include: {
        payment: true,
        returnRequest: true,
      },
    });
  }

  async findRefundsByPaymentId(paymentId: string) {
    return prisma.refund.findMany({
      where: { paymentId },
    });
  }

  async findRefundByReturnRequestId(returnRequestId: string) {
    return prisma.refund.findFirst({
      where: { returnRequestId },
    });
  }

  async updateRefundStatus(id: string, status: string, gatewayRefundId?: string) {
    return prisma.refund.update({
      where: { id },
      data: {
        status,
        gatewayRefundId: gatewayRefundId || undefined,
      },
    });
  }
}

export const refundsRepository = new RefundsRepository();
