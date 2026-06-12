import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';

export function useReturns() {
  const queryClient = useQueryClient();

  const requestReturnMutation = useMutation({
    mutationFn: async (data: { orderId: string; reason: string }) => {
      const response = await apiClient.post('/returns', data);
      return response.data.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });

  return {
    requestReturn: requestReturnMutation.mutateAsync,
    isRequestingReturn: requestReturnMutation.isPending,
  };
}
