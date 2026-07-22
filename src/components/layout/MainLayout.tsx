import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { Header, Sidebar } from './';

import { useGlobalScale } from '../../hooks/useGlobalScale';

// Header의 HEADER_HEIGHT와 반드시 동일해야 하는 값
const HEADER_HEIGHT = 56;

function MainLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const scale = useGlobalScale();

  return (
    <div className="bg-[#F1F1F1]">
      <Header
        onMenuClick={() => setIsSidebarOpen(true)}
      />

      <main style={{ paddingTop: HEADER_HEIGHT * scale }}>
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