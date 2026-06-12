import { Router } from 'express';
import { authController } from './auth.controller';
import { asyncHandler } from '@/lib/async-handler';
import {
  validateBody,
  rateLimiter,
  authMiddleware,
} from '@/middleware';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from '@/middleware/validators';

const router = Router();

// Define a 15-minute rate limit for login and registration requests (max 10 tries)
const authRateLimiter = rateLimiter(10, 15 * 60 * 1000);

router.post('/register', authRateLimiter, validateBody(registerSchema), asyncHandler(authController.register));
router.post('/login', authRateLimiter, validateBody(loginSchema), asyncHandler(authController.login));
router.post('/logout', asyncHandler(authController.logout));
router.post('/logout-all', authMiddleware, asyncHandler(authController.logoutAll));
router.post('/refresh', asyncHandler(authController.refresh));
router.post('/forgot-password', validateBody(forgotPasswordSchema), asyncHandler(authController.forgotPassword));
router.post('/reset-password', validateBody(resetPasswordSchema), asyncHandler(authController.resetPassword));
router.post('/change-password', authMiddleware, validateBody(changePasswordSchema), asyncHandler(authController.changePassword));
router.get('/me', authMiddleware, asyncHandler(authController.getProfile));

export const authRouter = router;
