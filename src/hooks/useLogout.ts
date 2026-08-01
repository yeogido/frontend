import { useNavigate } from 'react-router-dom';

import { logout } from '../apis/auth.api';
import { useAuthStore } from '../store/auth.store';

export function useLogout() {
  const navigate = useNavigate();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return async function handleLogout() {
    try {
      await logout();
    } catch {
      // 서버 로그아웃 실패해도 로컬 세션은 정리한다
    } finally {
      clearAuth();
      navigate('/login');
    }
  };
}
