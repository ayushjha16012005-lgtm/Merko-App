import type { Request, Response } from 'express';
import { wishlistService } from './wishlist.service';
import { sendSuccess } from '@/lib/response';
import { NotFoundError } from '@/errors';

export class WishlistController {
  async getWishlist(req: Request, res: Response) {
    const userId = req.user!.id;
    const items = await wishlistService.getWishlist(userId);
    return sendSuccess(res, items);
  }

  async addToWishlist(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.body;
    try {
      const item = await wishlistService.addToWishlist(userId, productId);
      return sendSuccess(res, item, 201);
    } catch (err: any) {
      if (err.message === 'Product not found') {
        throw new NotFoundError(err.message);
      }
      throw err;
    }
  }

  async removeFromWishlist(req: Request, res: Response) {
    const userId = req.user!.id;
    const { productId } = req.params;
    if (!productId) {
      throw new NotFoundError('Product ID is required');
    }
    const result = await wishlistService.removeFromWishlist(userId, productId);
    return sendSuccess(res, result);
  }
}

export const wishlistController = new WishlistController();
