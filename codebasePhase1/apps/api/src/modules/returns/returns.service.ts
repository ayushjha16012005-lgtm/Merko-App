import { returnsRepository } from './returns.repository';
import { prisma } from '@/config/db';
import { AppError, NotFoundError, ForbiddenError } from '@/errors';

export class ReturnsService {
  async requestReturn(userId: string, data: { orderId: string; reason: string }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { returnRequests: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to return this order');
    }

    if (order.status !== 'DELIVERED') {
      throw new AppError('Returns are only allowed for delivered orders', 400);
    }

    if (order.returnRequests.length > 0) {
      throw new AppError('A return request already exists for this order', 400);
    }

    return prisma.$transaction(async (tx) => {
      const returnRequest = await tx.returnRequest.create({
        data: {
          orderId: data.orderId,
          reason: data.reason,
          status: 'RETURN_REQUESTED',
        },
      });

      await tx.returnEvent.create({
        data: {
          returnRequestId: returnRequest.id,
          status: 'RETURN_REQUESTED',
          description: `Return requested by customer. Reason: ${data.reason}`,
        },
      });

      await tx.order.update({
        where: { id: data.orderId },
        data: { status: 'RETURN_REQUESTED' },
      });

      await tx.orderTimelineEvent.create({
        data: {
          orderId: data.orderId,
          status: 'RETURN_REQUESTED',
          description: 'Return request submitted and is currently under review.',
        },
      });

      return returnRequest;
    });
  }

  async updateReturnRequestStatus(
    id: string,
    status: string,
    description?: string
  ) {
    const returnRequest = await returnsRepository.findReturnRequestById(id);
    if (!returnRequest) {
      throw new NotFoundError('Return request not found');
    }

    const validStatuses = [
      'RETURN_REQUESTED',
      'RETURN_UNDER_REVIEW',
      'RETURN_APPROVED',
      'RETURN_REJECTED',
      'PICKUP_SCHEDULED',
      'PICKED_UP',
      'RETURN_RECEIVED',
      'CLOSED',
    ];

    if (!validStatuses.includes(status)) {
      throw new AppError(`Invalid return status: ${status}`, 400);
    }

    const defaultLogs: Record<string, string> = {
      RETURN_UNDER_REVIEW: 'Your return request is currently being reviewed by our support team.',
      RETURN_APPROVED: 'Return request approved. We are scheduling the pickup of your parcel.',
      RETURN_REJECTED: 'Return request rejected. The merchandise items do not qualify for returns.',
      PICKUP_SCHEDULED: 'Pickup has been scheduled with our logistics partner.',
      PICKED_UP: 'Parcel has been successfully picked up by our courier partner.',
      RETURN_RECEIVED: 'Your return parcel has been received at our warehouse. Initiating quality check.',
      CLOSED: 'Return process closed successfully.',
    };

    const finalDescription = description || defaultLogs[status] || `Return status updated to ${status}.`;

    return prisma.$transaction(async (tx) => {
      // 1. Update status
      const updated = await tx.returnRequest.update({
        where: { id },
        data: { status },
      });

      // 2. Create return event
      await tx.returnEvent.create({
        data: {
          returnRequestId: id,
          status,
          description: finalDescription,
        },
      });

      // 3. Update order status and add timeline event to sync with Order model
      let orderStatusUpdate = status;
      if (status === 'RETURN_APPROVED') {
        orderStatusUpdate = 'RETURN_APPROVED';
      } else if (status === 'RETURN_REJECTED') {
        orderStatusUpdate = 'DELIVERED'; // Revert back to original delivered state if rejected
      }

      await tx.order.update({
        where: { id: returnRequest.orderId },
        data: { status: orderStatusUpdate },
      });

      await tx.orderTimelineEvent.create({
        data: {
          orderId: returnRequest.orderId,
          status: orderStatusUpdate,
          description: finalDescription,
        },
      });

      return updated;
    });
  }

  async getCustomerReturns(userId: string) {
    return returnsRepository.findReturnRequestsByUserId(userId);
  }

  async getAdminReturns(filters: { status?: string; page?: number; limit?: number }) {
    return returnsRepository.findAllReturnRequests(filters);
  }

  async getReturnById(id: string, userId: string, isAdmin = false) {
    const returnRequest = await returnsRepository.findReturnRequestById(id);
    if (!returnRequest) {
      throw new NotFoundError('Return request not found');
    }

    if (!isAdmin && returnRequest.order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view this return request');
    }

    return returnRequest;
  }
}

export const returnsService = new ReturnsService();
