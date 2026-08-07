import type { CourseType } from '../types/course.type';

export function buildFestivalDetailPath(festivalId: number | string) {
  return `/festival/detail/${festivalId}`;
}

/**
 * 코스 검색 경로. 코스 상세와 마찬가지로 여기도(OFFICIAL)와
 * 동네(LOCAL) 검색 화면이 나뉘어 있다.
 */
export const COURSE_SEARCH_PATH: Record<CourseType, string> = {
  OFFICIAL: '/yeogido-course/search',
  LOCAL: '/local-course/search',
};

export function buildCourseSearchPath(keyword: string) {
  const searchParams = new URLSearchParams({ keyword });

  return `/yeogido-course/search?${searchParams.toString()}`;
}

export function buildLocalBusinessDetailPath(businessId: number | string) {
  return `/local-business/detail/${businessId}`;
}

/**
 * 코스 상세 경로. 여기도(OFFICIAL)와 동네(LOCAL) 라우트가 나뉘어 있고,
 * 각 상세 페이지는 자기 타입이 아닌 코스를 받으면 NotFound를 띄운다.
 * 그래서 타입을 모른 채로는 경로를 만들 수 없다.
 */
export function buildCourseDetailPath(
  courseType: string,
  courseId: number | string
) {
  return courseType === 'LOCAL'
    ? `/local-course/detail/${courseId}`
    : `/yeogido-course/detail/${courseId}`;
}
