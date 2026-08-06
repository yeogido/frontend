import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LoginResult } from '../types/auth.type';

interface AuthState {
  accessToken: string;
  refreshToken: string;
  userId: number | null;
  // 서버가 내려주는 권한 문자열(USER | ADMIN | BUSINESS). 문서와 실제 응답
  // 표기가 어긋난 사례가 있어 유니온으로 좁히지 않는다. 로그인 응답에는
  // role이 없어서, 사업자 인증 성공 응답으로만 채워진다.
  role: string;
  isAuthenticated: boolean;
  setAuth: (auth: LoginResult) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setRole: (role: string) => void;
  clearAuth: () => void;
}

const initialState = {
  accessToken: '',
  refreshToken: '',
  userId: null,
  role: '',
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
          // 로그인 응답에 role이 없다. 이전 계정의 role이 남지 않도록 비운다.
          role: '',
          isAuthenticated: Boolean(auth.accessToken),
        }),
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      setRole: (role) => set({ role }),
      clearAuth: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      // version 1로 저장된 세션에는 role이 없다. 그대로 두면 undefined가 되어
      // isBusinessRole()이 터지므로 빈 문자열로 채워준다.
      migrate: (persistedState, version) => {
        if (version < 2) {
          return { ...(persistedState as object), role: '' } as AuthState;
        }

        return persistedState as AuthState;
      },
    }
  )
);

export const BUSINESS_ROLE = 'BUSINESS';

export function isBusinessRole(role: string) {
  return role.toUpperCase() === BUSINESS_ROLE;
}
