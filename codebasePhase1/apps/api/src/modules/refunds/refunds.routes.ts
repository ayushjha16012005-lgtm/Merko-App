import { Router } from 'express';
import { refundsController } from './refunds.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, validateBody, permissionGuard } from '@/middleware';
import { createRefundSchema } from '@/middleware/validators';
const router = Router();

router.use(authMiddleware);

// Admin-only endpoints (guarded by payments permission authority)
router.post(
  '/',
  permissionGuard('payments'),
  validateBody(createRefundSchema),
  asyncHandler(refundsController.createRefund)
);

// Common endpoint
router.get('/order/:orderId', asyncHandler(refundsController.getRefundByOrderId));

export const refundsRouter = router;
