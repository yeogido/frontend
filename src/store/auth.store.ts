import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type {
  AuthUser,
  LoginResponse,
} from '../types/auth.type';

interface AuthState {
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setAuth: (auth: LoginResponse) => void;
  clearAuth: () => void;
}

const initialState = {
  accessToken: '',
  refreshToken: '',
  user: null,
  isAuthenticated: false,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      setAuth: (auth) =>
        set({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken ?? '',
          user: auth.user ?? null,
          isAuthenticated: Boolean(auth.accessToken),
        }),
      clearAuth: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
