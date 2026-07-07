import { Outlet } from 'react-router-dom';

function AuthLayout() {
  return (
    <main className='bg-[#F1F1F1]'>
      <Outlet />
    </main>
  );
}

export default AuthLayout;