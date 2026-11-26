import { useEffect } from 'react';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { rememberTravelShareReturn } from '../../pages/travel-record/utils/travelShareLoginReturn';

import { useAuth } from '../../hooks/useAuth';

function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    if (
      /^\/friends\/[1-9]\d*$/.test(location.pathname) &&
      location.search === '?tab=map'
    )
      return (
        <MapLoginRedirect path={`${location.pathname}${location.search}`} />
      );
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

function MapLoginRedirect({ path }: { path: string }) {
  const navigate = useNavigate();
  useEffect(() => {
    try {
      rememberTravelShareReturn(sessionStorage, path);
    } catch {
      /* 저장소가 없으면 로그인 후 기본 화면으로 이동한다. */
    }
    navigate('/login', { replace: true });
  }, [navigate, path]);
  return null;
}

export default ProtectedRoute;
