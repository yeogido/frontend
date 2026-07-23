import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Header, Sidebar } from './';

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-[#F1F1F1]">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <main>
        <Outlet />
      </main>

      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
    </div>
  );
}

export default MainLayout;