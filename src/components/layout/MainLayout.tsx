import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { AuthSidebar, Header, Sidebar } from './';
import { hasDesktopView } from '../../constants/desktopRoutes';
import { useAuth } from '../../hooks/useAuth';
import { useIsDesktop } from '../../hooks/useIsDesktop';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const isDesktop = useIsDesktop();
  const { pathname } = useLocation();

  // 데스크톱 뷰는 자기 헤더(DesktopHeader)와 <main>(DesktopPageShell)을 그리므로
  // 모바일 헤더·사이드바와 바깥 <main>을 뺀다 — <main>이 중첩되지 않게 한다.
  if (isDesktop && hasDesktopView(pathname)) {
    return <Outlet />;
  }

  return (
    <div className="bg-[#F1F1F1]">
      <Header onMenuClick={() => setIsSidebarOpen(true)} />

      <main>
        <Outlet />
      </main>

      {isAuthenticated ? (
        <AuthSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      ) : (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default MainLayout;
