export type CourseReviewType = 'local-course' | 'yeogido-course';

export function getCourseReviewsPath(
  courseType: CourseReviewType,
  courseId: string | number
) {
  return `/${courseType}/detail/${courseId}/reviews`;
}
