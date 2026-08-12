import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { LoginResult } from '../types/auth.type';

// login/reissue/social-login/social-signup 응답에 role이 포함되어 있어(스웨거
// AuthTokenRes/AuthSocialLoginRes 기준), 인증 시점에 서버가 준 값을 그대로
// 저장한다. 다만 소상공인/관리자 전용 화면·버튼처럼 "인가"에 직접 쓰이는
// 판단은 지금도 GET /users/me(useMyProfile)를 진실의 출처로 쓴다 — 세션 도중
// 관리자가 역할을 바꾸는 경우까지 반영하려면 재조회가 필요하기 때문이다.
// 이 role은 그 전까지 화면을 미리 그리는 용도로만 쓴다.
interface AuthState {
  accessToken: string;
  refreshToken: string;
  userId: number | null;
  role: string | null;
  isAuthenticated: boolean;
  // 로그인/로그아웃마다 하나씩 올라간다. 로그아웃 전에 시작된 좋아요 요청이
  // 로그아웃(또는 그 사이의 재로그인) 이후에 완료됐을 때, 응답을 그 시점의
  // 로컬 상태(override/최근 목록/localStorage)에 반영해도 되는지 판별하는
  // 용도다 — 요청 시작 시점의 값과 완료 시점의 값이 다르면 반영하지 않는다.
  authGeneration: number;
  setAuth: (auth: LoginResult) => void;
  clearAuth: () => void;
}

const initialState = {
  accessToken: '',
  refreshToken: '',
  userId: null,
  role: null,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      isAuthenticated: false,
      authGeneration: 0,
      setAuth: (auth) =>
        set((state) => ({
          accessToken: auth.accessToken,
          refreshToken: auth.refreshToken,
          userId: auth.userId,
          role: auth.role,
          isAuthenticated: Boolean(auth.accessToken),
          authGeneration: state.authGeneration + 1,
        })),
      clearAuth: () =>
        set((state) => ({
          ...initialState,
          isAuthenticated: false,
          authGeneration: state.authGeneration + 1,
        })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      version: 4,
      // version 3까지는 role을 저장하지 않았으므로(과거엔 일부러 뺐다),
      // role 없이 넘어온 옛 세션은 null로 채운다 — 다음 로그인/재발급에서
      // 서버가 준 값으로 자연스럽게 채워진다.
      migrate: (persistedState) => {
        const stored = { ...((persistedState ?? {}) as AuthState) } as Record<
          string,
          unknown
        >;

        if (typeof stored.role !== 'string') {
          stored.role = null;
        }

        return stored as unknown as AuthState;
      },
    }
  )
);
