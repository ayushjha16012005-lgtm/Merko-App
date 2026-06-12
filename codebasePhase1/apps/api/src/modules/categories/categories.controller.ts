import type { Request, Response } from 'express';
import { categoriesService } from './categories.service';
import { sendSuccess } from '@/lib/response';
import { ValidationError } from '@/errors';
import { createCategorySchema, updateCategorySchema, categoriesQuerySchema } from '@/middleware/validators';
import { logAuditEvent } from '@/modules/audit/audit.service';

export async function getAllCategories(req: Request, res: Response): Promise<Response> {
  try {
    const query = categoriesQuerySchema.parse(req.query);
    const result = await categoriesService.getAllCategories(query);
    return sendSuccess(res, result.data, 200, result.pagination);
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

export async function getCategoryById(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as { id: string };
  const category = await categoriesService.getCategoryById(id);
  return sendSuccess(res, category);
}

export async function getCategoryBySlug(req: Request, res: Response): Promise<Response> {
  const { slug } = req.params as { slug: string };
  const category = await categoriesService.getCategoryBySlug(slug);
  return sendSuccess(res, category);
}

export async function createCategory(req: Request, res: Response): Promise<Response> {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await categoriesService.createCategory(data);

    await logAuditEvent({
      userId: req.user!.id,
      actorRole: req.user!.role,
      action: 'Category Created',
      resource: 'Category',
      resourceId: category.id,
      changes: JSON.stringify(category),
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    return sendSuccess(res, category, 201);
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

export async function updateCategory(req: Request, res: Response): Promise<Response> {
  try {
    const { id } = req.params as { id: string };
    const data = updateCategorySchema.parse(req.body);
    const category = await categoriesService.updateCategory(id, data);

    await logAuditEvent({
      userId: req.user!.id,
      actorRole: req.user!.role,
      action: 'Category Updated',
      resource: 'Category',
      resourceId: category.id,
      changes: JSON.stringify(data),
      ipAddress: req.ip || req.socket.remoteAddress || undefined,
      userAgent: req.headers['user-agent'] || undefined,
    });

    return sendSuccess(res, category);
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

export async function updateCategoryStatus(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as { id: string };
  const { isActive } = (req.body as { isActive?: boolean });
  if (typeof isActive !== 'boolean') {
    throw new ValidationError([{ field: 'isActive', message: 'isActive must be a boolean' }]);
  }
  const category = await categoriesService.updateCategoryStatus(id, isActive);

  await logAuditEvent({
    userId: req.user!.id,
    actorRole: req.user!.role,
    action: 'Category Updated',
    resource: 'Category',
    resourceId: category.id,
    changes: JSON.stringify({ isActive }),
    ipAddress: req.ip || req.socket.remoteAddress || undefined,
    userAgent: req.headers['user-agent'] || undefined,
  });

  return sendSuccess(res, category);
}

export async function deleteCategory(req: Request, res: Response): Promise<Response> {
  const { id } = req.params as { id: string };
  await categoriesService.deleteCategory(id);
  return sendSuccess(res, { message: 'Category deleted successfully' });
}
