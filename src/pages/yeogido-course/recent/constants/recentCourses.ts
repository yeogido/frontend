import courseMapImage from '../../assets/courseimage.svg';
import { defaultCardTagIds } from '../../../../constants/tags';
import type { YeogidoCourse } from '../../types';

export const toRecentCourseCardProps = (course: YeogidoCourse) => ({
  id: course.id,
  image: courseMapImage,
  title: course.title,
  duration: course.duration,
  courseType: course.courseName,
  companion: '혼자',
  tags: course.tags ?? defaultCardTagIds,
  liked: false,
});
