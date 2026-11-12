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

  // 데스크톱 뷰는 자기 헤더(DesktopHeader)를 그리므로 모바일 헤더·사이드바를 뺀다.
  if (isDesktop && hasDesktopView(pathname)) {
    return (
      <main>
        <Outlet />
      </main>
    );
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
