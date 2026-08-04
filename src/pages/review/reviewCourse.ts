import type { CourseDetailResult } from '../../apis/courses';

export interface ReviewCourseCardData {
  readonly id: number | string;
  readonly title: string;
  readonly thumbnailUrl?: string;
  readonly duration: string;
  readonly transport: string;
  readonly companion: string;
}

const durationLabels: Record<string, string> = {
  DAY_TRIP: '당일치기',
  ONE_NIGHT: '1박 2일',
  ONE_NIGHT_TWO_DAYS: '1박 2일',
  TWO_NIGHT: '2박 3일',
  TWO_NIGHTS_THREE_DAYS: '2박 3일',
  THREE_NIGHT: '3박 4일',
  THREE_NIGHTS_FOUR_DAYS: '3박 4일',
  THREE_PLUS: '3박 이상',
  FOUR_NIGHTS_OR_MORE: '4박 이상',
};

const transportLabels: Record<string, string> = {
  WALK: '뚜벅이 코스',
  CAR: '자동차 코스',
  PUBLIC_TRANSPORT: '대중교통 코스',
  PUBLIC: '대중교통 코스',
};

const companionLabels: Record<string, string> = {
  SOLO: '혼자',
  ALONE: '혼자',
  FRIEND: '친구와',
  COUPLE: '연인과',
  FAMILY: '가족과',
  CHILDREN: '아이와',
  PET: '반려동물과',
};

export function mapCourseDetailToReviewCourse(
  course: CourseDetailResult
): ReviewCourseCardData {
  return {
    id: course.courseId,
    title: course.title,
    thumbnailUrl: course.thumbnailUrl || undefined,
    duration: durationLabels[course.durationType] ?? course.durationType,
    transport: transportLabels[course.transportType] ?? course.transportType,
    companion: companionLabels[course.companionType] ?? course.companionType,
  };
}
