import courseMapImage from '../../assets/courseimage.svg';
import type { TagType } from '../../../../components/common/TagChip';
import type { YeogidoCourse } from '../../types';

const defaultTags: TagType[] = ['sea', 'nature', 'summer'];

export const toRecentCourseCardProps = (course: YeogidoCourse) => ({
  id: course.id,
  image: courseMapImage,
  title: course.title,
  duration: course.duration,
  courseType: course.courseName,
  companion: '혼자',
  tags: defaultTags,
  liked: false,
});