import { useAuthStore } from '../store/auth.store.ts';

import { isTokenExpired } from './jwt';

export function validateStoredSession(): void {
  const { accessToken, clearAuth } = useAuthStore.getState();

  if (accessToken && isTokenExpired(accessToken)) {
    clearAuth();
  }
}
