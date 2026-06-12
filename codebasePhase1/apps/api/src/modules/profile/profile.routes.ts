import { Router } from 'express';
import { profileController } from './profile.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, validateBody } from '@/middleware';
import { updateProfileSchema, addressSchema } from '@/middleware/validators';

const router = Router();

router.use(authMiddleware);

router.put('/', validateBody(updateProfileSchema), asyncHandler(profileController.updateProfile));

router.get('/addresses', asyncHandler(profileController.getAddresses));
router.post('/addresses', validateBody(addressSchema), asyncHandler(profileController.createAddress));
router.put('/addresses/:id', validateBody(addressSchema.partial()), asyncHandler(profileController.updateAddress));
router.delete('/addresses/:id', asyncHandler(profileController.deleteAddress));
router.patch('/addresses/:id/default', asyncHandler(profileController.setDefaultAddress));

export const profileRouter = router;
