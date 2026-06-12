import { Router } from 'express';
import { shipmentsController } from './shipments.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, validateBody, permissionGuard } from '@/middleware';
import { createShipmentSchema, addShipmentEventSchema } from '@/middleware/validators';
import { UserRole } from '@merko/types';

const router = Router();

router.use(authMiddleware);

// Admin-only endpoints (guarded by shipments scope toggle authority)
router.post(
  '/',
  permissionGuard('shipments'),
  validateBody(createShipmentSchema),
  asyncHandler(shipmentsController.createShipment)
);

router.post(
  '/:id/events',
  permissionGuard('shipments'),
  validateBody(addShipmentEventSchema),
  asyncHandler(shipmentsController.addShipmentEvent)
);

// Common endpoint
router.get('/order/:orderId', asyncHandler(shipmentsController.getShipmentByOrderId));

export const shipmentsRouter = router;
