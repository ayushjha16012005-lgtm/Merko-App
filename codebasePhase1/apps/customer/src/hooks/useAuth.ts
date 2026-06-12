import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import type { CreateUserDto, UpdateUserDto } from '@merko/types';

export function useAuth() {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isLoading = useAuthStore((state) => state.isLoading);
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const logoutStore = useAuthStore((state) => state.logout);

  const loginMutation = useMutation({
    mutationFn: async (credentials: Record<string, string>) => {
      const response = await apiClient.post('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.data.user);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (userData: CreateUserDto) => {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logoutStore();
    },
    onSuccess: () => {
      queryClient.clear();
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (profileData: UpdateUserDto) => {
      const response = await apiClient.put('/profile', profileData);
      return response.data;
    },
    onSuccess: (data) => {
      setUser(data.data);
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async (passwordData: Record<string, string>) => {
      const response = await apiClient.post('/auth/change-password', passwordData);
      return response.data;
    },
    onSuccess: () => {
      setUser(null);
      queryClient.clear();
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (emailData: Record<string, string>) => {
      const response = await apiClient.post('/auth/forgot-password', emailData);
      return response.data;
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (resetData: Record<string, string>) => {
      const response = await apiClient.post('/auth/reset-password', resetData);
      return response.data;
    },
  });

  return {
    user,
    isAuthenticated,
    isLoading,
    checkAuth,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout: logoutMutation.mutateAsync,
    isLoggingOut: logoutMutation.isPending,
    updateProfile: updateProfileMutation.mutateAsync,
    isUpdatingProfile: updateProfileMutation.isPending,
    changePassword: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutateAsync,
    isForgotPasswordPending: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutateAsync,
    isResetPasswordPending: resetPasswordMutation.isPending,
  };
}
