import {
  localCoursePopularPreviews,
  localCourseRecentPreviews,
} from './localCourses';

export const localCourseSearchSuggestions = [
  ...new Set(
    [...localCoursePopularPreviews, ...localCourseRecentPreviews].flatMap(
      (course) => [
        course.title,
        course.duration,
        course.courseType,
        course.companion,
      ]
    )
  ),
];
