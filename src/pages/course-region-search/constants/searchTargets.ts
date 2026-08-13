import type { CourseRegionSearchTarget } from '../types';

interface CourseRegionSearchTargetConfig {
  pathname: string;
  searchLabel: string;
  searchPlaceholder: string;
  /**
   * 도시를 정확히 선택했을 때(자동완성 일치, 구/군 '전체') 그 도시의
   * /region-info로 보낼지 여부. 헤더의 전역 검색(home)만 지역 탐색이
   * 목적이라 true — 각 페이지 자체 검색(course/local-course/festival)은
   * 항상 자기 목록 화면(pathname)에 region으로 필터링해 보여준다.
   */
  navigatesToRegionInfo?: boolean;
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
  home: {
    pathname: '/yeogido-course/search',
    searchLabel: '코스명 또는 지역명 검색',
    searchPlaceholder: '코스명 또는 지역명을 검색해 주세요',
    navigatesToRegionInfo: true,
  },
};

const nationwideSearchPaths: Record<CourseRegionSearchTarget, string> = {
  course: '/yeogido-course',
  'local-course': '/local-course/search',
  festival: '/festival/search',
  home: '/yeogido-course',
};

const nationwideSearchPagePaths: Record<CourseRegionSearchTarget, string> = {
  course: '/yeogido-course/search',
  'local-course': '/local-course/search',
  festival: '/festival/search',
  home: '/yeogido-course/search',
};

export const getNationwideSearchPath = (
  target: CourseRegionSearchTarget
) => nationwideSearchPaths[target];

export const getNationwideSearchPagePath = (
  target: CourseRegionSearchTarget
) => nationwideSearchPagePaths[target];

export const getCourseRegionSearchTarget = (
  target: string | null
): CourseRegionSearchTarget => {
  if (
    target === 'course' ||
    target === 'local-course' ||
    target === 'festival' ||
    target === 'home'
  ) {
    return target;
  }

  return DEFAULT_COURSE_REGION_SEARCH_TARGET;
};
