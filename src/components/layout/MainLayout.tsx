import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AuthSidebar, Header, Sidebar } from './';
import { useAuth } from '../../hooks/useAuth';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-[#F1F1F1]">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
      />

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