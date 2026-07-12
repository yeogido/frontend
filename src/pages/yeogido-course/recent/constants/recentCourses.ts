import courseMapImage from '../../assets/courseimage.svg';
import type { YeogidoCourse } from '../../types';

export const toRecentCourseCardProps = (course: YeogidoCourse) => ({
  id: course.id,
  image: courseMapImage,
  title: course.title,
  description: '바다를 따라 걷고, 감성 가득한 코스를 둘러보세요.',
  duration: course.duration,
  courseType: course.courseName,
  liked: false,
});
