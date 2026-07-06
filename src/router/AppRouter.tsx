import { Routes, Route } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

import HomePage from '../pages/home';
import LoginPage from '../pages/auth/login';
import SignupPage from '../pages/auth/signup';
import LocalCoursePage from '../pages/local-course';
import NotFoundPage from '../pages/not-found';

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/local-course" element={<LocalCoursePage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;