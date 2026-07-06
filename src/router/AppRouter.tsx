import { Routes, Route } from 'react-router-dom';

import HomePage from '../pages/home';
import LoginPage from '../pages/auth/login';
import SignupPage from '../pages/auth/signup';
import LocalCoursePage from '../pages/local-course';
import NotFoundPage from '../pages/not-found';

function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/local-course" element={<LocalCoursePage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;