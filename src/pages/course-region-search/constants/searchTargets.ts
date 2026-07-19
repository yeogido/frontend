import type { CourseRegionSearchTarget } from '../types';

interface CourseRegionSearchTargetConfig {
  pathname: string;
  searchLabel: string;
  searchPlaceholder: string;
}

export const DEFAULT_COURSE_REGION_SEARCH_TARGET: CourseRegionSearchTarget =
  'course';

export const COURSE_REGION_SEARCH_TARGET_PARAM = 'from';

export const courseRegionSearchTargets: Record<
  CourseRegionSearchTarget,
  CourseRegionSearchTargetConfig
> = {
  course: {
    pathname: '/yeogido-course/search',
    searchLabel: '코스명 또는 지역명 검색',
    searchPlaceholder: '코스명 또는 지역명을 검색해 주세요',
  },
  'local-course': {
    pathname: '/local-course/search',
    searchLabel: '지역명 또는 도시명 검색',
    searchPlaceholder: '지역명 또는 도시명을 검색해 주세요',
  },
  festival: {
    pathname: '/festival/search',
    searchLabel: '행사명 또는 지역명 검색',
    searchPlaceholder: '행사명 또는 지역명을 검색해 주세요',
  },
};

export const getCourseRegionSearchTarget = (
  target: string | null
): CourseRegionSearchTarget => {
  if (target === 'course' || target === 'local-course' || target === 'festival') {
    return target;
  }

  return DEFAULT_COURSE_REGION_SEARCH_TARGET;
};
