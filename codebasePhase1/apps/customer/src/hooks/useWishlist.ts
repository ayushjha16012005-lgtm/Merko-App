import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { ProductResponseDto } from '@merko/types';

export interface WishlistItemResponse {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
  product: ProductResponseDto;
}

export function useWishlist() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const wishlistQuery = useQuery<WishlistItemResponse[]>({
    queryKey: ['wishlist'],
    queryFn: async () => {
      const response = await apiClient.get('/wishlist');
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  const addToWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiClient.post('/wishlist', { productId });
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      const response = await apiClient.delete(`/wishlist/${productId}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const items = wishlistQuery.data || [];
  const wishlistedIds = new Set<string>(items.map((item) => item.productId));

  return {
    items,
    wishlistedIds,
    totalItemsCount: items.length,
    isLoading: wishlistQuery.isLoading,
    error: wishlistQuery.error,
    addToWishlist: addToWishlistMutation.mutateAsync,
    isAdding: addToWishlistMutation.isPending,
    removeFromWishlist: removeFromWishlistMutation.mutateAsync,
    isRemoving: removeFromWishlistMutation.isPending,
  };
}
