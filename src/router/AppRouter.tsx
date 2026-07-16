import { Routes, Route } from 'react-router-dom';

import MainLayout from '../components/layout/MainLayout';
import AuthLayout from '../components/layout/AuthLayout';

import HomePage from '../pages/home';
import LoginPage from '../pages/auth/login';
import ForgotPasswordPage from '../pages/auth/forgot-password';
import ForgotPasswordResetPage from '../pages/auth/forgot-password/reset';
import SignupPage from '../pages/auth/signup';
import KakaoSignupPage from '../pages/auth/signup/kakao';
import NaverSignupPage from '../pages/auth/signup/naver';
import LocalCoursePage from '../pages/local-course';
import FestivalPage from '../pages/festival';
import ReviewPage from '../pages/review';
import CourseRegionSearchPage from '../pages/course-region-search';
import YeogidoCoursePage from '../pages/yeogido-course';
import YeogidoCoursePopularPage from '../pages/yeogido-course/popular';
import YeogidoCourseRecentPage from '../pages/yeogido-course/recent';
import YeogidoCourseSearchPage from '../pages/yeogido-course/search';
import LocalBusinessPage from '../pages/local-business';
import LocalRecommendationPage from '../pages/local-recommendation';
import CourseBasicInfoPage from '../pages/local-recommendation/course-basic-info';
import TagSelectionPage from '../pages/local-recommendation/tag-selection';
import NotFoundPage from '../pages/not-found';
import YeogidoCourseDetailPage from '../pages/yeogido-course-detail';
function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route path="/local-course" element={<LocalCoursePage />} />

        <Route path="/festival" element={<FestivalPage />} />

        <Route path="/review" element={<ReviewPage />} />

        <Route
          path="/course-region-search"
          element={<CourseRegionSearchPage />}
        />

        <Route path="/yeogido-course" element={<YeogidoCoursePage />} />

        <Route
          path="/yeogido-course/popular"
          element={<YeogidoCoursePopularPage />}
        />

        <Route
          path="/yeogido-course/recent"
          element={<YeogidoCourseRecentPage />}
        />

        <Route
          path="/yeogido-course/search"
          element={<YeogidoCourseSearchPage />}
        />
        <Route
          path="/yeogido-course/detail/:courseId"
          element={<YeogidoCourseDetailPage />}
        />

        <Route path="/local-business" element={<LocalBusinessPage />} />

        <Route
          path="/local-recommendation"
          element={<LocalRecommendationPage />}
        />

        <Route
          path="/local-recommendation"
          element={<LocalRecommendationPage />}
        />
      </Route>

      <Route
        path="/local-recommendation/course-info"
        element={<CourseBasicInfoPage />}
      />

      <Route
        path="/local-recommendation/tag-selection"
        element={<TagSelectionPage />}
      />

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          path="/forgot-password/reset"
          element={<ForgotPasswordResetPage />}
        />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/signup/kakao" element={<KakaoSignupPage />} />
        <Route path="/signup/naver" element={<NaverSignupPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRouter;
