import { prisma } from '@/config/db';
import type { Prisma } from '@prisma/client';

export class ReturnsRepository {
  async createReturnRequest({
    orderId,
    reason,
  }: {
    orderId: string;
    reason: string;
  }) {
    return prisma.returnRequest.create({
      data: {
        orderId,
        reason,
        status: 'RETURN_REQUESTED',
      },
    });
  }

  async findReturnRequestById(id: string) {
    return prisma.returnRequest.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
        order: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  async findReturnRequestsByOrderId(orderId: string) {
    return prisma.returnRequest.findMany({
      where: { orderId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findReturnRequestsByUserId(userId: string) {
    return prisma.returnRequest.findMany({
      where: {
        order: { userId },
      },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
        order: {
          select: {
            orderNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllReturnRequests({
    status,
    page = 1,
    limit = 20,
  }: {
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.ReturnRequestWhereInput = {};

    if (status) {
      where.status = status;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.returnRequest.findMany({
        where,
        include: {
          events: {
            orderBy: { createdAt: 'desc' },
          },
          order: {
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.returnRequest.count({ where }),
    ]);

    return { items, total };
  }

  async updateReturnRequestStatus(id: string, status: string) {
    return prisma.returnRequest.update({
      where: { id },
      data: { status },
    });
  }

  async createReturnEvent({
    returnRequestId,
    status,
    description,
  }: {
    returnRequestId: string;
    status: string;
    description: string;
  }) {
    return prisma.returnEvent.create({
      data: {
        returnRequestId,
        status,
        description,
      },
    });
  }
}

export const returnsRepository = new ReturnsRepository();
