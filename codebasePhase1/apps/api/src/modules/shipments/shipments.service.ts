import { shipmentsRepository } from './shipments.repository';
import { prisma } from '@/config/db';
import { AppError, NotFoundError } from '@/errors';

export class ShipmentsService {
  async createShipment(data: {
    orderId: string;
    courierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  }) {
    const order = await prisma.order.findUnique({
      where: { id: data.orderId },
      include: { shipment: true },
    });

    if (!order) {
      throw new NotFoundError('Order not found');
    }

    if (order.shipment) {
      throw new AppError('Shipment already created for this order', 400);
    }

    const estimatedDeliveryDate = data.estimatedDelivery ? new Date(data.estimatedDelivery) : undefined;

    return prisma.$transaction(async (tx) => {
      // 1. Create shipment
      const shipment = await tx.shipment.create({
        data: {
          orderId: data.orderId,
          courierName: data.courierName,
          trackingNumber: data.trackingNumber,
          trackingUrl: data.trackingUrl || null,
          status: 'DISPATCHED',
          estimatedDelivery: estimatedDeliveryDate || null,
          shippedAt: new Date(),
        },
      });

      // 2. Create initial event
      await tx.shipmentEvent.create({
        data: {
          shipmentId: shipment.id,
          status: 'DISPATCHED',
          description: `Parcel handed over to ${data.courierName}. Tracking number: ${data.trackingNumber}`,
        },
      });

      // 3. Update order status and add timeline event
      await tx.order.update({
        where: { id: data.orderId },
        data: { status: 'DISPATCHED' },
      });

      await tx.orderTimelineEvent.create({
        data: {
          orderId: data.orderId,
          status: 'DISPATCHED',
          description: `Your package has been dispatched via ${data.courierName} (Tracking: ${data.trackingNumber}).`,
        },
      });

      return tx.shipment.findUnique({
        where: { id: shipment.id },
        include: { events: true },
      });
    });
  }

  async addShipmentEvent(
    shipmentId: string,
    eventData: { status: string; description: string; location?: string }
  ) {
    const shipment = await shipmentsRepository.findShipmentById(shipmentId);
    if (!shipment) {
      throw new NotFoundError('Shipment not found');
    }

    const validStatuses = [
      'CREATED',
      'PROCESSING',
      'PRINTED',
      'PACKED',
      'DISPATCHED',
      'IN_TRANSIT',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
    ];

    if (!validStatuses.includes(eventData.status)) {
      throw new AppError(`Invalid shipment status: ${eventData.status}`, 400);
    }

    return prisma.$transaction(async (tx) => {
      // 1. Create event
      const event = await tx.shipmentEvent.create({
        data: {
          shipmentId,
          status: eventData.status,
          description: eventData.description,
          location: eventData.location || null,
        },
      });

      // 2. Update shipment status
      await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: eventData.status },
      });

      // 3. If delivered, update order status
      if (eventData.status === 'DELIVERED') {
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: 'DELIVERED' },
        });

        await tx.orderTimelineEvent.create({
          data: {
            orderId: shipment.orderId,
            status: 'DELIVERED',
            description: 'Order delivered successfully. Enjoy your customized gear!',
          },
        });
      } else if (eventData.status === 'IN_TRANSIT' || eventData.status === 'OUT_FOR_DELIVERY') {
        // Update order status if in transit / out for delivery
        await tx.order.update({
          where: { id: shipment.orderId },
          data: { status: eventData.status },
        });

        await tx.orderTimelineEvent.create({
          data: {
            orderId: shipment.orderId,
            status: eventData.status,
            description: eventData.description,
          },
        });
      }

      return event;
    });
  }

  async getShipmentByOrderId(orderId: string) {
    return shipmentsRepository.findShipmentByOrderId(orderId);
  }
}

export const shipmentsService = new ShipmentsService();
