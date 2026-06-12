import { Router } from 'express';
import * as productsController from './products.controller';
import { asyncHandler } from '@/lib/async-handler';
import { authMiddleware, permissionGuard } from '@/middleware';

const router = Router();

router.get('/', asyncHandler(productsController.getAllProducts));
router.get('/slug/:slug', asyncHandler(productsController.getProductBySlug));
router.get('/:id', asyncHandler(productsController.getProductById));

// Guard write endpoints with products scope toggle authority
router.post('/', authMiddleware, permissionGuard('Products:Create'), asyncHandler(productsController.createProduct));
router.put('/:id', authMiddleware, permissionGuard('Products:Edit'), asyncHandler(productsController.updateProduct));
router.patch('/:id/status', authMiddleware, permissionGuard('Products:Edit'), asyncHandler(productsController.updateProductStatus));
router.delete('/:id', authMiddleware, permissionGuard('Products:Delete'), asyncHandler(productsController.deleteProduct));
router.delete('/:id/permanent', authMiddleware, permissionGuard('Products:Delete'), asyncHandler(productsController.permanentlyDeleteProduct));

export default router;
