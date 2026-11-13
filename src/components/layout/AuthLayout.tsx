import { Outlet, useLocation } from 'react-router-dom';

import { hasDesktopView } from '../../constants/desktopRoutes';
import { useIsDesktop } from '../../hooks/useIsDesktop';

function AuthLayout() {
  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();

  // 데스크톱 뷰는 자기 <main>(AuthDesktopLayout)을 그리므로 바깥 <main>을 빼
  // <main>이 중첩되지 않게 한다.
  if (isDesktop && hasDesktopView(pathname)) {
    return <Outlet />;
  }

  return (
    <main className="min-h-dvh bg-[#F9F9F9]">
      <Outlet />
    </main>
  );
}

export default AuthLayout;
