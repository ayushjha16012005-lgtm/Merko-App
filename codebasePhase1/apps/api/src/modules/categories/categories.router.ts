import { Router } from 'express';
import * as categoriesController from './categories.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, permissionGuard } from '@/middleware';

const router = Router();

router.get('/', asyncHandler(categoriesController.getAllCategories));
router.get('/slug/:slug', asyncHandler(categoriesController.getCategoryBySlug));
router.get('/:id', asyncHandler(categoriesController.getCategoryById));

// Guard write endpoints with categories scope toggle authority
router.post('/', authMiddleware, permissionGuard('Categories:Create'), asyncHandler(categoriesController.createCategory));
router.put('/:id', authMiddleware, permissionGuard('Categories:Edit'), asyncHandler(categoriesController.updateCategory));
router.patch('/:id/status', authMiddleware, permissionGuard('Categories:Edit'), asyncHandler(categoriesController.updateCategoryStatus));
router.delete('/:id', authMiddleware, permissionGuard('Categories:Delete'), asyncHandler(categoriesController.deleteCategory));

export default router;
