import type { Request, Response } from 'express';
import { shipmentsService } from './shipments.service';
import { sendSuccess } from '@/lib/response';

export class ShipmentsController {
  async createShipment(req: Request, res: Response) {
    const shipment = await shipmentsService.createShipment(req.body);
    return sendSuccess(res, shipment, 201);
  }

  async addShipmentEvent(req: Request, res: Response) {
    const { id } = req.params;
    const event = await shipmentsService.addShipmentEvent(id!, req.body);
    return sendSuccess(res, event, 201);
  }

  async getShipmentByOrderId(req: Request, res: Response) {
    const { orderId } = req.params;
    const shipment = await shipmentsService.getShipmentByOrderId(orderId!);
    return sendSuccess(res, shipment);
  }
}

export const shipmentsController = new ShipmentsController();
