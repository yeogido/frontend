import { Routes, Route } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

import HomePage from '../pages/home';
import LoginPage from '../pages/auth/login';
import SignupPage from '../pages/auth/signup';
import LocalCoursePage from '../pages/local-course';
import FestivalPage from '../pages/festival';
import ReviewPage from '../pages/review';
import YeogidoCoursePage from '../pages/yeogido-course';
import YeogidoCoursePopularPage from '../pages/yeogido-course/popular';
import YeogidoCourseSearchPage from '../pages/yeogido-course/search';
import LocalBusinessPage from '../pages/local-business';
import NotFoundPage from '../pages/not-found';

function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/local-course"
          element={<LocalCoursePage />}
        />

        <Route
          path="/festival"
          element={<FestivalPage />}
        />

        <Route
          path="/review"
          element={<ReviewPage />}
        />

        <Route
          path="/yeogido-course"
          element={<YeogidoCoursePage />}
        />

        <Route
          path="/yeogido-course/popular"
          element={<YeogidoCoursePopularPage />}
        />

        <Route
          path="/yeogido-course/search"
          element={<YeogidoCourseSearchPage />}
        />

        <Route
          path="/local-business"
          element={<LocalBusinessPage />}
        />
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
