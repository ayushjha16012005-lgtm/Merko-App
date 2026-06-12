import { Router } from 'express';
import { returnsController } from './returns.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, validateBody, permissionGuard } from '@/middleware';
import { createReturnRequestSchema, updateReturnRequestStatusSchema } from '@/middleware/validators';
import { UserRole } from '@merko/types';

const router = Router();

router.use(authMiddleware);

// Customer endpoints
router.post('/', validateBody(createReturnRequestSchema), asyncHandler(returnsController.requestReturn));
router.get('/', asyncHandler(returnsController.getCustomerReturns));

// Admin-only endpoints (guarded by returns scope toggle authority)
router.get('/admin', permissionGuard('returns'), asyncHandler(returnsController.getAdminReturns));
router.put(
  '/:id/status',
  permissionGuard('returns'),
  validateBody(updateReturnRequestStatusSchema),
  asyncHandler(returnsController.updateReturnStatus)
);

// Common endpoint
router.get('/:id', asyncHandler(returnsController.getReturnById));

export const returnsRouter = router;
