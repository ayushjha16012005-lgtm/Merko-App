import type { Request, Response } from 'express';
import { cartService } from './cart.service';
import { sendSuccess } from '@/lib/response';
import { UnauthorizedError } from '@/errors';

export class CartController {
  async getCart(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const cart = await cartService.getCart(req.user.id);
    return sendSuccess(res, cart);
  }

  async addItem(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const cart = await cartService.addItemToCart(req.user.id, req.body);
    return sendSuccess(res, cart, 201);
  }

  async updateQuantity(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateItemQuantity(req.user.id, id!, quantity);
    return sendSuccess(res, cart);
  }

  async removeItem(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const { id } = req.params;
    const cart = await cartService.removeItemFromCart(req.user.id, id!);
    return sendSuccess(res, cart);
  }

  async clearCart(req: Request, res: Response) {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    const cart = await cartService.clearCart(req.user.id);
    return sendSuccess(res, cart);
  }
}

export const cartController = new CartController();
