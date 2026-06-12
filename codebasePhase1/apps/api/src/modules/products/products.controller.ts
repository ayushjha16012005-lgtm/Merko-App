import type { Request, Response } from 'express';
import { productsService } from './products.service';
import { sendSuccess } from '@/lib/response';
import { ValidationError, ForbiddenError } from '@/errors';
import { createProductSchema, updateProductSchema } from '@/middleware/validators';
import { logAuditEvent } from '@/modules/audit/audit.service';

export async function getAllProducts(req: Request, res: Response): Promise<Response> {
  const { search, categoryId, isActive, page = 1, limit = 10 } = req.query;
  const pageNum = Math.max(1, Number(page) || 1);
  const limitNum = Math.min(100, Math.max(1, Number(limit) || 10));
  const isActiveFilter = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

  const result = await productsService.getAllProducts(
    search as string | undefined,
    categoryId as string | undefined,
    isActiveFilter,
    pageNum,
    limitNum
  );

  return sendSuccess(res, result.data, 200, result.pagination);
}

export async function getProductById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as { id: string };
  const product = await productsService.getProductById(id);
  return sendSuccess(res, product);
}

export async function getProductBySlug(req: Request, res: Response): Promise<Response> {
  const { slug } = req.params as { slug: string };
  const product = await productsService.getProductBySlug(slug);
  return sendSuccess(res, product);
}

export async function createProduct(req: Request, res: Response): Promise<Response> {
  try {
    const user = req.user!;
    const isPlatformSuperAdminOrSuperAdmin = user.role === 'SUPER_ADMIN' || user.isPlatformSuperAdmin;
    const permissions = user.permissions?.map((p: string) => p.toLowerCase()) || [];
    const hasPayments = isPlatformSuperAdminOrSuperAdmin || permissions.includes('payments');

    if (!hasPayments) {
      if (
        req.body.basePrice !== undefined ||
        req.body.discountType !== undefined ||
        req.body.discountValue !== undefined ||
        (req.body.variants && req.body.variants.some((v: any) => v.price !== undefined))
      ) {
        throw new ForbiddenError('You do not have permission to modify pricing or discount attributes');
      }
    }

    const data = createProductSchema.parse(req.body);
    const product = await productsService.createProduct(data);

    await logAuditEvent({
      userId: req.user!.id,
      actorRole: req.user!.role,
      action: 'Product Created',
      resource: 'Product',
      resourceId: product.id,
      changes: JSON.stringify(product),
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    return sendSuccess(res, product, 201);
  } catch (error: unknown) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
      const errors = issues.map((issue) => ({
        field: String(issue.path[0]),
        message: issue.message,
      }));
      throw new ValidationError(errors);
    }
    throw error;
  }
}

export async function updateProduct(req: Request, res: Response): Promise<Response> {
  try {
    const user = req.user!;
    const isPlatformSuperAdminOrSuperAdmin = user.role === 'SUPER_ADMIN' || user.isPlatformSuperAdmin;
    const permissions = user.permissions?.map((p: string) => p.toLowerCase()) || [];
    const hasPayments = isPlatformSuperAdminOrSuperAdmin || permissions.includes('payments');

    if (!hasPayments) {
      if (
        req.body.basePrice !== undefined ||
        req.body.discountType !== undefined ||
        req.body.discountValue !== undefined ||
        (req.body.variants && req.body.variants.some((v: any) => v.price !== undefined))
      ) {
        throw new ForbiddenError('You do not have permission to modify pricing or discount attributes');
      }
    }

    const { id } = req.params as { id: string };
    const data = updateProductSchema.parse(req.body);
    const product = await productsService.updateProduct(id, data);

    const hasDiscountField = req.body.discountType !== undefined || req.body.discountValue !== undefined;
    const keys = Object.keys(req.body);
    const hasOtherFields = keys.some(key => key !== 'discountType' && key !== 'discountValue');

    if (hasDiscountField) {
      await logAuditEvent({
        userId: req.user!.id,
        actorRole: req.user!.role,
        action: 'Discount Updated',
        resource: 'Product',
        resourceId: product.id,
        changes: JSON.stringify({ discountType: req.body.discountType, discountValue: req.body.discountValue }),
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.headers['user-agent'] || undefined,
      });
    }

    if (hasOtherFields) {
      await logAuditEvent({
        userId: req.user!.id,
        actorRole: req.user!.role,
        action: 'Product Updated',
        resource: 'Product',
        resourceId: product.id,
        changes: JSON.stringify(data),
        ipAddress: req.ip || req.socket.remoteAddress || undefined,
        userAgent: req.headers['user-agent'] || undefined,
      });
    }

    return sendSuccess(res, product);
  } catch (error: unknown) {
    if (error instanceof Error && 'issues' in error) {
      const issues = (error as { issues: Array<{ path: (string | number)[]; message: string }> }).issues;
      const errors = issues.map((issue) => ({
        field: String(issue.path[0]),
        message: issue.message,
      }));
      throw new ValidationError(errors);
    }
    throw error;
  }
}

export async function updateProductStatus(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as { id: string };
  const { isActive } = (req.body as { isActive?: boolean });
  if (typeof isActive !== 'boolean') {
    throw new ValidationError([{ field: 'isActive', message: 'isActive must be a boolean' }]);
  }
  const product = await productsService.updateProductStatus(id, isActive);

  await logAuditEvent({
    userId: req.user!.id,
    actorRole: req.user!.role,
    action: 'Product Updated',
    resource: 'Product',
    resourceId: product.id,
    changes: JSON.stringify({ isActive }),
    ipAddress: req.ip || req.socket.remoteAddress || undefined,
    userAgent: req.headers['user-agent'] || undefined,
  });

  return sendSuccess(res, product);
}

export async function deleteProduct(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as { id: string };
  await productsService.deleteProduct(id);
  return sendSuccess(res, { message: 'Product deleted successfully' });
}

export async function permanentlyDeleteProduct(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as { id: string };
  await productsService.permanentlyDeleteProduct(id);
  return sendSuccess(res, { message: 'Product permanently deleted' });
}
