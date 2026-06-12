import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import type { UserRole } from '@merko/types';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setIsLoading: (loading: boolean) => void;
  checkAuth: () => Promise<User | null>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => {
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', () => {
      set({ user: null, isAuthenticated: false, isLoading: false });
    });
  }

  return {
    user: null,
    isAuthenticated: false,
    isLoading: true,

    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setIsLoading: (loading) => set({ isLoading: loading }),

    checkAuth: async () => {
      set({ isLoading: true });
      try {
        const response = await apiClient.get('/auth/me');
        const userData = response.data.data.user;
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return userData;
      } catch {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return null;
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        await apiClient.post('/auth/logout');
      } catch (error) {
        console.error('Logout error', error);
      } finally {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    },
  };
});
