import { prisma } from '@/config/db';

export class PaymentsRepository {
  async createPayment({
    orderId,
    amount,
    provider,
    status = 'PENDING',
    gatewayOrderId,
  }: {
    orderId: string;
    amount: number;
    provider: string;
    status?: string;
    gatewayOrderId?: string;
  }) {
    return prisma.payment.create({
      data: {
        orderId,
        amount,
        provider,
        status,
        gatewayOrderId: gatewayOrderId || null,
      },
    });
  }

  async updatePaymentStatus(
    paymentId: string,
    status: string,
    gatewayPaymentId?: string
  ) {
    return prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        gatewayPaymentId: gatewayPaymentId || undefined,
      },
    });
  }

  async findPaymentByOrderId(orderId: string) {
    return prisma.payment.findUnique({
      where: { orderId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findPaymentById(paymentId: string) {
    return prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findPaymentByGatewayOrderId(gatewayOrderId: string) {
    return prisma.payment.findUnique({
      where: { gatewayOrderId },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async createTransaction({
    paymentId,
    transactionId,
    status,
    rawPayload,
  }: {
    paymentId: string;
    transactionId: string;
    status: string;
    rawPayload?: string;
  }) {
    return prisma.paymentTransaction.create({
      data: {
        paymentId,
        transactionId,
        status,
        rawPayload: rawPayload || null,
      },
    });
  }
}

export const paymentsRepository = new PaymentsRepository();
