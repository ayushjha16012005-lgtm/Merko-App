import { Router } from 'express';
import { wishlistController } from './wishlist.controller';
import { authMiddleware, validateBody } from '@/middleware';
import { asyncHandler } from '@/lib/async-handler';
import { z } from 'zod';

const router = Router();

const addToWishlistSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
});

router.use(authMiddleware);

router.get('/', asyncHandler(wishlistController.getWishlist));
router.post('/', validateBody(addToWishlistSchema), asyncHandler(wishlistController.addToWishlist));
router.delete('/:productId', asyncHandler(wishlistController.removeFromWishlist));

export { router as wishlistRouter };
