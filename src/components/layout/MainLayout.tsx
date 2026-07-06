import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Header, Sidebar } from './';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <main className="pt-14">
        <Outlet />
      </main>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </>
  );
}

export default MainLayout;