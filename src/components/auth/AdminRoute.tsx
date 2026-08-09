import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useMyProfile } from '../../hooks/useMyProfile';
import { isAdminRole } from '../../utils/role';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * 관리자 권한 여부는 서버가 준 role로만 판단한다(ProtectedRoute와 동일한
 * useAuth 기반 인증 확인에 useMyProfile 조회를 더한 것). 조회가 끝나기
 * 전에 isAdminRole(undefined)인 false로 곧장 리다이렉트하면 실제 관리자도
 * 잠깐 튕겨나가므로, 로딩 중에는 리다이렉트하지 않고 기다린다.
 */
function AdminRoute() {
  const { isAuthenticated } = useAuth();
  const { data, isPending } = useMyProfile();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isPending) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (!isAdminRole(data?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
