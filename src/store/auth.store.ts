import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LoginResult } from '../types/auth.type';

// 권한(role)은 여기에 두지 않는다. 로그인 응답에 role이 없어서 저장해 두면
// 재로그인 시점에 비워지고, 인증 직후에도 서버와 어긋난다. 백엔드가 DB의
// role로 인가하므로 프론트도 GET /users/me를 진실의 출처로 쓴다
// (useMyProfile).
interface AuthState {
  accessToken: string;
  refreshToken: string;
  userId: number | null;
  isAuthenticated: boolean;
  setAuth: (auth: LoginResult) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
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
      setTokens: (accessToken, refreshToken) =>
        set({ accessToken, refreshToken }),
      clearAuth: () => set(initialState),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 3,
      // version 2로 저장된 세션에는 role이 들어 있다. 그대로 두면 스토어에
      // 타입에 없는 값이 섞여 남으므로 떨어뜨린다.
      migrate: (persistedState) => {
        const stored = { ...((persistedState ?? {}) as AuthState) } as Record<
          string,
          unknown
        >;
        delete stored.role;

        return stored as unknown as AuthState;
      },
    }
  )
);
