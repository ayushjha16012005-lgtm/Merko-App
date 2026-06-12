import { ordersRepository } from './orders.repository';
import { cartService } from '../cart/cart.service';
import { prisma } from '@/config/db';
import { NotFoundError, AppError, ForbiddenError } from '@/errors';
import type { CreateOrderDto } from '@merko/types';

export class OrdersService {
  async placeOrder(userId: string, data: CreateOrderDto) {
    const { shippingAddressId } = data;

    // 1. Get user's cart
    const cart = await cartService.getCart(userId);
    if (!cart || cart.items.length === 0) {
      throw new AppError('Cannot place an order with an empty cart', 400);
    }

    // 2. Get shipping address
    const address = await prisma.address.findUnique({
      where: { id: shippingAddressId },
    });

    if (!address || address.userId !== userId) {
      throw new NotFoundError('Shipping address not found');
    }

    // 3. Place order through repository transaction
    const order = await ordersRepository.createOrder({
      userId,
      shippingAddress: {
        name: address.name,
        phone: address.phone,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      cartId: cart.id,
      cartItems: cart.items.map((item) => ({
        productVariantId: item.productVariantId,
        quantity: item.quantity,
        designFileUrl: item.designFileUrl,
        designFileName: item.designFileName,
        designFileType: item.designFileType,
        productId: item.productVariant.productId,
        designConfig: item.designConfig,
        mockupUrl: item.mockupUrl,
      })),
    });

    // 4. Return complete order details
    return this.getOrderById(userId, order.id, true);
  }

  async getCustomerOrders(userId: string) {
    return ordersRepository.findOrdersByUserId(userId);
  }

  async getOrderById(userId: string, orderId: string, isAdmin = false) {
    const order = await ordersRepository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (!isAdmin && order.userId !== userId) {
      throw new ForbiddenError('You do not have permission to view this order');
    }

    return order;
  }

  async getAdminOrders(filters: { search?: string; status?: string; page?: number; limit?: number }) {
    return ordersRepository.findAllOrders(filters);
  }

  async updateOrderStatus(orderId: string, status: string, description?: string) {
    const order = await ordersRepository.findOrderById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    const validTransitions = ['DESIGN_APPROVED', 'PRINTING_STARTED', 'PRINTING_COMPLETED', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
    if (!validTransitions.includes(status)) {
      throw new AppError(`Invalid order status transition: ${status}`, 400);
    }

    // Default descriptions based on status
    const statusLogs: Record<string, string> = {
      DESIGN_APPROVED: 'Your merchandise customization design has been reviewed and approved by our print specialists.',
      PRINTING_STARTED: 'Production process initiated. The custom print job has been sent to our machinery line.',
      PRINTING_COMPLETED: 'Printing completed successfully. Your custom blanks are currently moving to inspection and finishing.',
      PACKED: 'Quality checks passed. Your items have been packed securely and are awaiting pickup.',
      DISPATCHED: 'Your shipment has been handed over to our delivery partner.',
      DELIVERED: 'Package delivered successfully. Thank you for shopping with Merko!',
      CANCELLED: 'This order was cancelled by the store administrator.',
    };

    const finalDescription = description || statusLogs[status] || `Order status updated to ${status}.`;

    return prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: { status },
      });

      await tx.orderTimelineEvent.create({
        data: {
          orderId,
          status,
          description: finalDescription,
        },
      });

      return tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
          timeline: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });
  }
}

export const ordersService = new OrdersService();
