import { toContentTagIds } from './contentTags';

import type {
  Course,
  CourseCompanionType,
  CourseDurationType,
} from '../types/course.type';

const durationLabelByType: Record<CourseDurationType, string> = {
  DAY_TRIP: '당일치기',
  ONE_NIGHT: '1박 2일',
  TWO_NIGHT: '2박 3일',
  THREE_PLUS: '3박 이상',
};

const companionLabelByType: Record<CourseCompanionType, string> = {
  SOLO: '혼자',
  FRIEND: '친구와',
  COUPLE: '연인과',
  FAMILY: '가족과',
  PET: '반려동물과',
};

export function toCourseCardProps(course: Course) {
  return {
    id: course.courseId,
    image: course.thumbnailUrl,
    title: course.title,
    duration: durationLabelByType[course.durationType],
    courseType: course.region,
    companion: companionLabelByType[course.companionType],
    tags: toContentTagIds(course.tags),
    liked: course.isLiked,
  };
}
