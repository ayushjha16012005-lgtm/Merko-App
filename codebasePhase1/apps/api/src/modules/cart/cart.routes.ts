import { Router } from 'express';
import { cartController } from './cart.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, validateBody } from '@/middleware';
import { addToCartSchema, updateCartItemSchema } from '@/middleware/validators';

const router = Router();

router.use(authMiddleware);

router.get('/', asyncHandler(cartController.getCart));
router.post('/items', validateBody(addToCartSchema), asyncHandler(cartController.addItem));
router.put('/items/:id', validateBody(updateCartItemSchema), asyncHandler(cartController.updateQuantity));
router.delete('/items/:id', asyncHandler(cartController.removeItem));
router.delete('/', asyncHandler(cartController.clearCart));

export const cartRouter = router;
