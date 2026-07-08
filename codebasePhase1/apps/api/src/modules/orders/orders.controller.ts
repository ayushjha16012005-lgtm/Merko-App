import type { Request, Response } from 'express';
import { ordersService } from './orders.service';
import { sendSuccess } from '@/lib/response';
import { UnauthorizedError } from '@/errors';

export class OrdersController {
  async placeOrder(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const order = await ordersService.placeOrder(req.user.id, req.body);
    return sendSuccess(res, order, 201);
  }

  async getCustomerOrders(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const orders = await ordersService.getCustomerOrders(req.user.id);
    return sendSuccess(res, orders);
  }

  async getOrderById(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN' || req.user.isPlatformSuperAdmin;
    const order = await ordersService.getOrderById(req.user.id, id!, isAdmin);
    return sendSuccess(res, order);
  }

  async getAdminOrders(req: Request, res: Response) {
    const { search, status, page, limit } = req.query;
    const pageNum = page ? parseInt(page as string, 10) : 1;
    const limitNum = limit ? parseInt(limit as string, 10) : 20;

    const result = await ordersService.getAdminOrders({
      search: search as string,
      status: status as string,
      page: pageNum,
      limit: limitNum,
    });
    return sendSuccess(res, result);
  }

  async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, description } = req.body;
    const result = await ordersService.updateOrderStatus(id!, status, description);
    return sendSuccess(res, result);
  }
}

export const ordersController = new OrdersController();
