import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { CreateAddressDto } from '@merko/types';

export function useAddresses() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: async () => {
      const response = await apiClient.get('/profile/addresses');
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  const createAddressMutation = useMutation({
    mutationFn: async (data: CreateAddressDto) => {
      const response = await apiClient.post('/profile/addresses', data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const updateAddressMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateAddressDto> }) => {
      const response = await apiClient.put(`/profile/addresses/${id}`, data);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const deleteAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/profile/addresses/${id}`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const setDefaultAddressMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.patch(`/profile/addresses/${id}/default`);
      return response.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  return {
    addresses: addressesQuery.data || [],
    isLoading: addressesQuery.isLoading,
    error: addressesQuery.error,
    createAddress: createAddressMutation.mutateAsync,
    isCreating: createAddressMutation.isPending,
    updateAddress: updateAddressMutation.mutateAsync,
    isUpdating: updateAddressMutation.isPending,
    deleteAddress: deleteAddressMutation.mutateAsync,
    isDeleting: deleteAddressMutation.isPending,
    setDefaultAddress: setDefaultAddressMutation.mutateAsync,
    isSettingDefault: setDefaultAddressMutation.isPending,
  };
}
