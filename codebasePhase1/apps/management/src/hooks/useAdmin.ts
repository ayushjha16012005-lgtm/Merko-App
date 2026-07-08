import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import type {
  ProductResponseDto,
  CategoryResponseDto,
  CreateProductDto,
  UpdateProductDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  OrderResponseDto,
  ReturnRequestResponseDto,
  RefundResponseDto,
  AccessRequestResponse,
  SuperAdminResponse,
  AuditLogResponse,
} from '@merko/types';

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

// Queries
export function useAdminProducts(params: { search?: string; categoryId?: string; isActive?: boolean; page?: number; limit?: number } = {}) {
  const { search, categoryId, isActive, page = 1, limit = 10 } = params;

  return useQuery({
    queryKey: ['admin-products', { search, categoryId, isActive, page, limit }],
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
      const resData = response.data as any;
      if (resData && resData.meta && !resData.pagination) {
        resData.pagination = resData.meta;
      }
      return resData;
    },
    placeholderData: (previousData) => previousData,
  });
}

export function useAdminCategories(params: { search?: string; isActive?: boolean; page?: number; limit?: number } = {}) {
  const { search, isActive, page = 1, limit = 100 } = params;

  return useQuery({
    queryKey: ['admin-categories', { search, isActive, page, limit }],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<CategoryResponseDto[]>>('/categories', {
        params: {
          search: search || undefined,
          isActive: isActive !== undefined ? String(isActive) : undefined,
          page,
          limit,
        },
      });
      const resData = response.data as any;
      if (resData && resData.meta && !resData.pagination) {
        resData.pagination = resData.meta;
      }
      return resData;
    },
  });
}

// Product Mutations
export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateProductDto) => {
      const response = await apiClient.post<ApiResponse<ProductResponseDto>>('/products', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateProductDto }) => {
      const response = await apiClient.put<ApiResponse<ProductResponseDto>>(`/products/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

export function useToggleProductStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiClient.patch<ApiResponse<ProductResponseDto>>(`/products/${id}/status`, { isActive });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, permanent = false }: { id: string; permanent?: boolean }) => {
      const url = permanent ? `/products/${id}/permanent` : `/products/${id}`;
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(url);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// Category Mutations
export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateCategoryDto) => {
      const response = await apiClient.post<ApiResponse<CategoryResponseDto>>('/categories', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateCategoryDto }) => {
      const response = await apiClient.put<ApiResponse<CategoryResponseDto>>(`/categories/${id}`, data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
}

export function useToggleCategoryStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await apiClient.patch<ApiResponse<CategoryResponseDto>>(`/categories/${id}/status`, { isActive });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', variables.id] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/categories/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
}

export function useAdminOrders(params: { search?: string; status?: string; page?: number; limit?: number } = {}) {
  const { search, status, page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ['admin-orders', { search, status, page, limit }],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ items: OrderResponseDto[]; total: number }>>('/orders/admin', {
        params: {
          search: search || undefined,
          status: status || undefined,
          page,
          limit,
        },
      });
      return response.data.data;
    },
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status, description }: { id: string; status: string; description?: string }) => {
      const response = await apiClient.put<ApiResponse<OrderResponseDto>>(`/orders/${id}/status`, { status, description });
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
    },
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      orderId: string;
      courierName: string;
      trackingNumber: string;
      trackingUrl?: string;
      estimatedDelivery?: string;
    }) => {
      const response = await apiClient.post('/shipments', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useAddShipmentEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      shipmentId,
      status,
      description,
      location,
    }: {
      shipmentId: string;
      status: string;
      description: string;
      location?: string;
    }) => {
      const response = await apiClient.post(`/shipments/${shipmentId}/events`, {
        status,
        description,
        location,
      });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useAdminReturns(params: { status?: string; page?: number; limit?: number } = {}) {
  const { status, page = 1, limit = 20 } = params;

  return useQuery({
    queryKey: ['admin-returns', { status, page, limit }],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<{ items: ReturnRequestResponseDto[]; total: number }>>('/returns/admin', {
        params: {
          status: status || undefined,
          page,
          limit,
        },
      });
      return response.data.data;
    },
  });
}

export function useUpdateReturnStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      description,
    }: {
      id: string;
      status: string;
      description?: string;
    }) => {
      const response = await apiClient.put<ApiResponse<ReturnRequestResponseDto>>(`/returns/${id}/status`, { status, description });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

export function useCreateRefund() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      paymentId: string;
      returnRequestId?: string;
      amount: number;
      reason?: string;
    }) => {
      const response = await apiClient.post<ApiResponse<RefundResponseDto>>('/refunds', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-returns'] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
    },
  });
}

// Super Admin Hooks
export function useAccessRequests() {
  return useQuery({
    queryKey: ['access-requests'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AccessRequestResponse[]>>('/users/admin-requests');
      return response.data.data;
    },
  });
}

export function useUpdateAccessRequestStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.put<ApiResponse<unknown>>(`/users/admin-requests/${id}/status`, { status });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
  });
}

export function useSuperAdmins() {
  return useQuery({
    queryKey: ['super-admins'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<SuperAdminResponse[]>>('/users/super-admins');
      return response.data.data;
    },
  });
}

export function useInviteSuperAdmin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { fullName: string; email: string; phone?: string }) => {
      const response = await apiClient.post<ApiResponse<unknown>>('/users/super-admins/invite', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admins'] });
    },
  });
}

export function useUpdateSuperAdminStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'suspend' | 'reactivate' | 'remove' }) => {
      const response = await apiClient.put<ApiResponse<unknown>>(`/users/super-admins/${id}/status`, { action });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admins'] });
    },
  });
}

export function useAuditLogs() {
  return useQuery({
    queryKey: ['audit-logs'],
    queryFn: async () => {
      const response = await apiClient.get<ApiResponse<AuditLogResponse[]>>('/users/audit-logs');
      return response.data.data;
    },
  });
}

export function useUpdateAdminPermissions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, permissions }: { id: string; permissions: string[] }) => {
      const response = await apiClient.put<ApiResponse<unknown>>(`/users/${id}/permissions`, { permissions });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
    },
  });
}
