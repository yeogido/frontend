import { isBusinessRole, useAuthStore } from '../store/auth.store';

export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);
  const role = useAuthStore((state) => state.role);

  return { isAuthenticated, userId, role, isBusiness: isBusinessRole(role) };
}
