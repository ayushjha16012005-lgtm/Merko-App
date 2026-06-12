import type { Prisma } from '@prisma/client';
import { prisma } from '@/config/db';
import { AppError } from '@/errors';

export class OrdersRepository {
  async createOrder({
    userId,
    shippingAddress,
    cartId,
    cartItems,
  }: {
    userId: string;
    shippingAddress: {
      name: string;
      phone: string;
      addressLine1: string;
      addressLine2?: string | null;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    cartId: string;
    cartItems: {
      productVariantId: string;
      quantity: number;
      designFileUrl?: string | null;
      designFileName?: string | null;
      designFileType?: string | null;
      productId: string;
      designConfig?: string | null;
      mockupUrl?: string | null;
    }[];
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Double check stock availability and calculate totals
      let totalAmount = 0;
      const orderItemsData = [];

      for (const item of cartItems) {
        const variant = await tx.productVariant.findUnique({
          where: { id: item.productVariantId },
          include: { product: true },
        });

        if (!variant || !variant.isActive || !variant.product.isActive) {
          throw new AppError(`Product variant ${item.productVariantId} is no longer active or available`, 400);
        }

        if (variant.stock < item.quantity) {
          throw new AppError(`Insufficient stock for ${variant.name}. Only ${variant.stock} available.`, 400);
        }

        // Deduct stock
        await tx.productVariant.update({
          where: { id: item.productVariantId },
          data: {
            stock: variant.stock - item.quantity,
          },
        });

        const itemPrice = Number(variant.price);
        totalAmount += itemPrice * item.quantity;

        orderItemsData.push({
          productVariantId: item.productVariantId,
          productName: variant.product.name,
          variantName: variant.name,
          sku: variant.sku,
          price: itemPrice,
          quantity: item.quantity,
          designConfig: item.designConfig || null,
          mockupUrl: item.mockupUrl || null,
        });
      }

      // Generate a unique order number (e.g. MRK-2026-XXXX)
      const timestamp = Date.now().toString().slice(-6);
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `MRK-${timestamp}-${randomPart}`;

      // 2. Create the Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          shippingName: shippingAddress.name,
          shippingPhone: shippingAddress.phone,
          shippingAddressLine1: shippingAddress.addressLine1,
          shippingAddressLine2: shippingAddress.addressLine2 || null,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
          shippingPostalCode: shippingAddress.postalCode,
          shippingCountry: shippingAddress.country || 'India',
          totalAmount,
          status: 'ORDER_PLACED',
          items: {
            create: orderItemsData,
          },
        },
      });

      // 2.5. Create design files records if any
      for (const item of cartItems) {
        if (item.designFileUrl) {
          await tx.orderDesignFile.create({
            data: {
              orderId: order.id,
              productId: item.productId,
              customerId: userId,
              fileUrl: item.designFileUrl,
              fileName: item.designFileName || 'custom-design',
              fileType: item.designFileType || 'application/octet-stream',
            },
          });
        }
      }

      // 3. Create initial timeline event
      await tx.orderTimelineEvent.create({
        data: {
          orderId: order.id,
          status: 'ORDER_PLACED',
          description: 'Your order has been placed successfully and is awaiting review.',
        },
      });

      // 4. Clear the cart
      await tx.cartItem.deleteMany({
        where: { cartId },
      });

      return order;
    });
  }

  async findOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
        payment: {
          include: {
            transactions: {
              orderBy: { createdAt: 'desc' },
            },
            refunds: true,
          },
        },
        shipment: {
          include: {
            events: {
              orderBy: { createdAt: 'desc' },
            },
          },
        },
        returnRequests: {
          include: {
            events: {
              orderBy: { createdAt: 'desc' },
            },
            refunds: true,
          },
        },
        designFiles: true,
      },
    });
  }

  async findOrdersByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: true,
        timeline: {
          orderBy: { createdAt: 'desc' },
        },
        payment: true,
        shipment: true,
        returnRequests: true,
        designFiles: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllOrders({
    search,
    status,
    page = 1,
    limit = 20,
  }: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const where: Prisma.OrderWhereInput = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { shippingName: { contains: search } },
        { user: { email: { contains: search } } },
      ];
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: true,
          timeline: {
            orderBy: { createdAt: 'desc' },
          },
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            },
          },
          payment: {
            include: {
              transactions: {
                orderBy: { createdAt: 'desc' },
              },
              refunds: true,
            },
          },
          shipment: {
            include: {
              events: {
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          returnRequests: {
            include: {
              events: {
                orderBy: { createdAt: 'desc' },
              },
            },
          },
          designFiles: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.order.count({ where }),
    ]);

    return { items, total };
  }

  async updateOrderStatus(orderId: string, status: string) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }

  async createTimelineEvent(orderId: string, status: string, description: string) {
    return prisma.orderTimelineEvent.create({
      data: {
        orderId,
        status,
        description,
      },
    });
  }
}

export const ordersRepository = new OrdersRepository();
