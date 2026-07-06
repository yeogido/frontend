import { Outlet } from 'react-router-dom';

import Header from './Header';
import Sidebar from './Sidebar';

function MainLayout() {
  return (
    <>
    <Header />

    <main className="pt-14">
        <Outlet />
    </main>

    <Sidebar />
    </>
  );
}

export default MainLayout;