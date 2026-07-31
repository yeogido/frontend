import { useAuthStore } from '../store/auth.store';

export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);

  return { isAuthenticated, userId };
}
