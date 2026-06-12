import { Router } from 'express';
import { paymentsController } from './payments.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, validateBody } from '@/middleware';
import { initiatePaymentSchema, verifyPaymentSchema } from '@/middleware/validators';

const router = Router();

router.use(authMiddleware);

router.post('/initiate', validateBody(initiatePaymentSchema), asyncHandler(paymentsController.initiatePayment));
router.post('/verify', validateBody(verifyPaymentSchema), asyncHandler(paymentsController.verifyPayment));
router.get('/order/:orderId', asyncHandler(paymentsController.getPaymentByOrderId));

export const paymentsRouter = router;
