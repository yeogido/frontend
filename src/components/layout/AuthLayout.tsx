import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className="min-h-dvh bg-[#F9F9F9]">
      <Outlet />
    </main>
  );
}

export default AuthLayout;
