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
  const { data, isPending, isError, refetch } = useMyProfile();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (isPending) {
    return <LoadingSpinner className="min-h-screen" />;
  }

  // 조회 실패를 "관리자 아님"으로 취급해 곧장 홈으로 보내면, 네트워크
  // 오류로 role을 못 받아온 실제 관리자도 아무 설명 없이 튕겨나간다.
  // 다른 화면들처럼 재시도 UI를 보여주고, / 리다이렉트는 조회가
  // 성공적으로 끝나 관리자가 아님이 확인됐을 때만 한다.
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

  if (!isAdminRole(data?.role)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
