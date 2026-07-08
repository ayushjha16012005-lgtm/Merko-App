import { Router } from 'express';
import { usersController } from './users.controller';
import { authMiddleware, permissionGuard } from '@/middleware/auth';

const router = Router();

// Public routes
router.get('/email-action', usersController.handleEmailAction);
router.post('/activate-super-admin', usersController.activateSuperAdmin);

// Protected routes (guarded by granular permissions, SUPER_ADMIN bypasses)
router.get('/admin-requests', authMiddleware, permissionGuard('Access Requests:View'), usersController.getAdminRequests);
router.put('/admin-requests/:id/status', authMiddleware, permissionGuard('Access Requests:Edit'), usersController.updateAdminRequestStatus);
router.put('/:id/permissions', authMiddleware, permissionGuard('Access Requests:Edit'), usersController.updateAdminPermissions);

router.get('/super-admins', authMiddleware, permissionGuard('Settings:View'), usersController.getSuperAdmins);
router.post('/super-admins/invite', authMiddleware, permissionGuard('Settings:Create'), usersController.inviteSuperAdmin);
router.put('/super-admins/:id/status', authMiddleware, permissionGuard('Settings:Edit'), usersController.updateSuperAdminStatus);

router.get('/audit-logs', authMiddleware, permissionGuard('Reports:View'), usersController.getAuditLogs);

// General route
router.get('/:id', authMiddleware, usersController.getUserById);

export const usersRouter = router;
export default usersRouter;
