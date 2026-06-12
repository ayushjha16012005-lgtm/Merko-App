import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { CreateOrderDto, OrderResponseDto } from '@merko/types';

export function useOrders(orderId?: string) {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const ordersQuery = useQuery<OrderResponseDto[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await apiClient.get('/orders');
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  const orderQuery = useQuery<OrderResponseDto>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) throw new Error('Order ID is required');
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data.data;
    },
    enabled: isAuthenticated && !!orderId,
  });

  const placeOrderMutation = useMutation({
    mutationFn: async (data: CreateOrderDto) => {
      const response = await apiClient.post('/orders', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoadingOrders: ordersQuery.isLoading,
    ordersError: ordersQuery.error,
    order: orderQuery.data,
    isLoadingOrder: orderQuery.isLoading,
    orderError: orderQuery.error,
    placeOrder: placeOrderMutation.mutateAsync,
    isPlacingOrder: placeOrderMutation.isPending,
  };
}
