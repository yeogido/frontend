import type { CourseRegionSearchTarget } from '../types';

interface CourseRegionSearchTargetConfig {
  pathname: string;
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
  },
  'local-course': {
    pathname: '/local-course/search',
  },
};

export const getCourseRegionSearchTarget = (
  target: string | null
): CourseRegionSearchTarget => {
  if (target === 'course' || target === 'local-course') {
    return target;
  }

  return DEFAULT_COURSE_REGION_SEARCH_TARGET;
};
