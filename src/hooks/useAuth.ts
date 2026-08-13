import { useAuthStore } from '../store/auth.store';

// 권한은 여기서 주지 않는다. 서버가 진실의 출처이므로 useMyProfile을 쓴다.
export function useAuth() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const userId = useAuthStore((state) => state.userId);

  return { isAuthenticated, userId };
}
