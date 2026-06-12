import { prisma } from '@/config/db';

export class ShipmentsRepository {
  async createShipment({
    orderId,
    courierName,
    trackingNumber,
    trackingUrl,
    estimatedDelivery,
  }: {
    orderId: string;
    courierName: string;
    trackingNumber: string;
    trackingUrl?: string;
    estimatedDelivery?: Date;
  }) {
    return prisma.shipment.create({
      data: {
        orderId,
        courierName,
        trackingNumber,
        trackingUrl: trackingUrl || null,
        status: 'CREATED',
        estimatedDelivery: estimatedDelivery || null,
        shippedAt: new Date(),
      },
    });
  }

  async findShipmentByOrderId(orderId: string) {
    return prisma.shipment.findUnique({
      where: { orderId },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async findShipmentById(id: string) {
    return prisma.shipment.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateShipmentStatus(id: string, status: string) {
    return prisma.shipment.update({
      where: { id },
      data: { status },
    });
  }

  async createShipmentEvent({
    shipmentId,
    status,
    description,
    location,
  }: {
    shipmentId: string;
    status: string;
    description: string;
    location?: string;
  }) {
    return prisma.shipmentEvent.create({
      data: {
        shipmentId,
        status,
        description,
        location: location || null,
      },
    });
  }
}

export const shipmentsRepository = new ShipmentsRepository();
