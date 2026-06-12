import type { Response } from 'express';
import type { ApiResponse, PaginationMeta } from '@merko/types';

export function sendSuccess<T>(
  res: Response,
  data: T,
  statusCode = 200,
  meta: PaginationMeta | null = null,
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
    meta,
  });
}

export function sendError(
  res: Response,
  error: string,
  statusCode = 500,
  errors?: ApiResponse<null>['errors'],
): Response<ApiResponse<null>> {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error,
    meta: null,
    ...(errors ? { errors } : {}),
  });
}
