import {
  localCoursePopularPreviews,
  localCourseRecentPreviews,
} from '../constants/localCourses';

function useLocalCoursePreviews() {
  return {
    popularCourses: localCoursePopularPreviews.slice(0, 2),
    recentCourses: localCourseRecentPreviews,
  };
}

export default useLocalCoursePreviews;
