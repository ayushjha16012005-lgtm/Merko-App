import { Router } from 'express';
import { ordersController } from './orders.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, validateBody, permissionGuard } from '@/middleware';
import { createOrderSchema, updateOrderStatusSchema } from '@/middleware/validators';
const router = Router();

router.use(authMiddleware);

// Customer endpoints
router.post('/', validateBody(createOrderSchema), asyncHandler(ordersController.placeOrder));
router.get('/', asyncHandler(ordersController.getCustomerOrders));

// Admin endpoints (guarded by orders scope toggle authority)
router.get('/admin', permissionGuard('Orders:View'), asyncHandler(ordersController.getAdminOrders));
router.put('/:id/status', permissionGuard('Orders:Edit'), validateBody(updateOrderStatusSchema), asyncHandler(ordersController.updateStatus));

// Common endpoints
router.get('/:id', asyncHandler(ordersController.getOrderById));

export const ordersRouter = router;
