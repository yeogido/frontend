import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../../hooks/useAuth';
import { useMyProfile } from '../../hooks/useMyProfile';
import { isBusinessRole } from '../../utils/role';
import LoadingSpinner from '../common/LoadingSpinner';

/**
 * AdminRoute와 같은 패턴 — 소상공인 권한 여부도 서버가 준 role로만
 * 판단한다. 조회가 끝나기 전에 isBusinessRole(undefined)인 false로 곧장
 * 리다이렉트하면 실제 소상공인도 잠깐 튕겨나가므로, 로딩 중에는
 * 리다이렉트하지 않고 기다린다.
 */
function BusinessRoute() {
  const { isAuthenticated } = useAuth();
  const { data, isPending, isError, refetch } = useMyProfile();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isPending) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <p className="text-main-5 text-center font-medium">
          권한 정보를 불러오지 못했어요.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-full border border-[#e4e4e4] px-4 py-2 font-medium text-[#505050]"
        >
          다시 시도
        </button>
      </div>
    );
  }

  if (!isBusinessRole(data?.role)) {
    return <Navigate to="/local-business" replace />;
  }

  return <Outlet />;
}

export default BusinessRoute;
