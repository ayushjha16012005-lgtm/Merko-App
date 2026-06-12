import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { CategoryResponseDto } from '@merko/types';

interface GetCategoriesParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function useCategories(params: GetCategoriesParams = {}) {
  const { search, isActive = true, page = 1, limit = 100 } = params;

  return useQuery({
    queryKey: ['categories', { search, isActive, page, limit }],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CategoryResponseDto[]>>('/categories', {
        params: {
          search: search || undefined,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          page,
          limit,
        },
      });
      return response.data;
    },
  });
}

export function useCategory(idOrSlug: string) {
  const isSlug = !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);

  return useQuery({
    queryKey: ['category', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const url = isSlug ? `/categories/slug/${idOrSlug}` : `/categories/${idOrSlug}`;
      const response = await apiClient.get<ApiResponse<CategoryResponseDto>>(url);
      return response.data.data;
    },
    enabled: !!idOrSlug,
  });
}
