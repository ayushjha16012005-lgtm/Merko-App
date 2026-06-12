import type { PaginationMeta } from './pagination';
import type { ValidationErrorItem } from './validation';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  meta: PaginationMeta | null;
  errors?: ValidationErrorItem[];
}
