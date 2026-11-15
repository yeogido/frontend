import type {
  CourseCompanionType,
  CourseDurationType,
  CourseSort,
  CourseTransportType,
} from '../../../types/course.type';
import type { YeogidoCourseSelectedFilters } from '../constants/filters';

const transportTypeByLabel: Record<string, CourseTransportType | undefined> = {
  도보: 'WALK',
  자차: 'CAR',
};
const durationTypeByLabel: Record<string, CourseDurationType | undefined> = {
  당일치기: 'DAY_TRIP',
  '1박 2일': 'ONE_NIGHT',
  '2박 3일': 'TWO_NIGHT',
  '3박 이상': 'THREE_PLUS',
};
const companionTypeByLabel: Record<string, CourseCompanionType | undefined> = {
  혼자: 'SOLO',
  친구와: 'FRIEND',
  연인과: 'COUPLE',
  가족과: 'FAMILY',
  반려동물과: 'PET',
};
const sortByLabel: Record<string, CourseSort> = {
  추천순: 'RECOMMEND',
  인기순: 'POPULAR',
  최신순: 'LATEST',
  저장순: 'SAVED',
  후기순: 'REVIEW',
  거리순: 'DISTANCE',
};

/** 여기도 추천 코스 필터 선택값을 코스 목록 API 파라미터로 바꾼다. */
export function toCourseFilterParams(filters: YeogidoCourseSelectedFilters) {
  return {
    transportType: transportTypeByLabel[filters.transport],
    durationType: durationTypeByLabel[filters.duration],
    companionType: companionTypeByLabel[filters.companion],
    sort: sortByLabel[filters.sort],
  };
}
