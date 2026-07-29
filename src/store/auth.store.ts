import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LoginResult } from '../types/auth.type';

interface AuthState {
  accessToken: string;
  refreshToken: string;
  userId: number | null;
  isAuthenticated: boolean;
  setAuth: (auth: LoginResult) => void;
  clearAuth: () => void;
}

const initialState = {
  accessToken: '',
  refreshToken: '',
  userId: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          userId: auth.userId,
          isAuthenticated: Boolean(auth.accessToken),
        }),
      clearAuth: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 1,
    }
  )
);
