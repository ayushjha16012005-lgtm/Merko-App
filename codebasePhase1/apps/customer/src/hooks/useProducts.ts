import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type { ProductResponseDto } from '@merko/types';

interface GetProductsParams {
  search?: string;
  categoryId?: string;
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

export function useProducts(params: GetProductsParams = {}) {
  const { search, categoryId, isActive = true, page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['products', { search, categoryId, isActive, page, limit }],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<ProductResponseDto[]>>('/products', {
        params: {
          search: search || undefined,
          categoryId: categoryId || undefined,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          page,
          limit,
        },
      });
      return response.data;
    },
    placeholderData: (previousData) => previousData, // keep previous data for smooth pagination
  });
}

export function useProduct(idOrSlug: string) {
  const isSlug = !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idOrSlug);

  return useQuery({
    queryKey: ['product', idOrSlug],
    queryFn: async () => {
      if (!idOrSlug) return null;
      const url = isSlug ? `/products/slug/${idOrSlug}` : `/products/${idOrSlug}`;
      const response = await apiClient.get<ApiResponse<ProductResponseDto>>(url);
      return response.data.data;
    },
    enabled: !!idOrSlug,
  });
}
