import { useAuthStore } from '../store/auth.store.ts';

import { isTokenExpired } from './jwt.ts';

export function validateStoredSession(): void {
  const { accessToken, refreshToken, clearAuth } = useAuthStore.getState();

  // 만료된 access token은 다음 API 요청의 401에서 refresh token으로 갱신한다.
  // 앱을 다시 열 때 둘을 함께 지우면 정상적인 재발급 기회가 사라진다.
  if (accessToken && isTokenExpired(accessToken) && !refreshToken) {
    clearAuth();
  }
}
