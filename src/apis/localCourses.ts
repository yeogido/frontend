import { regionSearchKeywords } from '../constants/regions';
import {
  localCourseFilterGroups,
  type LocalCourseSelectedFilters,
} from '../constants/localCourseFilters';
import {
  localCoursePopularPreviews,
  localCourseRecentPreviews,
} from '../constants/localCourses';
import type { LocalCourse } from '../types/localCourse.type';

const PAGE_SIZE = 6;
const TOTAL_COUNT = 18;
const DEFAULT_FILTER_LABELS = {
  transport: localCourseFilterGroups[0].defaultLabel,
  duration: localCourseFilterGroups[1].defaultLabel,
  companion: localCourseFilterGroups[2].defaultLabel,
  sort: localCourseFilterGroups[3].defaultLabel,
};
const MOCK_SEARCH_KEYWORDS = [
  ...regionSearchKeywords,
  ...localCoursePopularPreviews.flatMap((course) => [
    course.title,
    course.duration,
    course.courseType,
    course.companion,
  ]),
  ...localCourseRecentPreviews.flatMap((course) => [
    course.title,
    course.duration,
    course.courseType,
    course.companion,
  ]),
  ...localCourseFilterGroups.flatMap((filter) => filter.options),
];
const NORMALIZED_MOCK_SEARCH_KEYWORDS = MOCK_SEARCH_KEYWORDS.map((keyword) =>
  normalizeSearchText(keyword)
);

export interface LocalCoursePage {
  content: LocalCourse[];
  page: number;
  last: boolean;
}

interface FetchLocalCoursesParams {
  page: number;
  filters: LocalCourseSelectedFilters;
  keyword?: string;
  region?: string;
  subRegion?: string;
}

function normalizeSearchText(text: string) {
  return text.replace(/\s/g, '').toLowerCase();
}

function hasMockSearchResult(keyword: string) {
  const normalizedKeyword = normalizeSearchText(keyword);

  if (!normalizedKeyword) {
    return true;
  }

  return NORMALIZED_MOCK_SEARCH_KEYWORDS.some((mockKeyword) =>
    mockKeyword.includes(normalizedKeyword)
  );
}

function createMockCourse(
  id: number,
  filters: LocalCourseSelectedFilters,
  courses: readonly LocalCourse[],
  searchLabel = ''
): LocalCourse {
  const baseCourse = courses[(id - 1) % courses.length];
  const transport =
    filters.transport === DEFAULT_FILTER_LABELS.transport
      ? baseCourse.courseType
      : `${filters.transport} 코스`;
  const duration =
    filters.duration === DEFAULT_FILTER_LABELS.duration
      ? baseCourse.duration
      : filters.duration;
  const titlePrefix =
    searchLabel ||
    (filters.companion === DEFAULT_FILTER_LABELS.companion
      ? ''
      : filters.companion);

  return {
    ...baseCourse,
    id,
    title: titlePrefix ? `${titlePrefix} ${baseCourse.title}` : baseCourse.title,
    duration,
    courseType: transport,
    companion: filters.companion,
    liked:
      filters.sort === DEFAULT_FILTER_LABELS.sort
        ? baseCourse.liked
        : id % 2 === 0,
  };
}

export async function fetchLocalCourses({
  page,
  filters,
  keyword = '',
  region = '',
  subRegion = '',
}: FetchLocalCoursesParams): Promise<LocalCoursePage> {
  return fetchLocalCoursePage({
    page,
    filters,
    keyword,
    region,
    subRegion,
    courses: localCoursePopularPreviews,
  });
}

export async function fetchLocalRecentCourses({
  page,
  filters,
  keyword = '',
  region = '',
  subRegion = '',
}: FetchLocalCoursesParams): Promise<LocalCoursePage> {
  return fetchLocalCoursePage({
    page,
    filters,
    keyword,
    region,
    subRegion,
    courses: localCourseRecentPreviews,
  });
}

async function fetchLocalCoursePage({
  page,
  filters,
  keyword = '',
  region = '',
  subRegion = '',
  courses,
}: FetchLocalCoursesParams & {
  courses: readonly LocalCourse[];
}): Promise<LocalCoursePage> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500);
  });

  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL_COUNT);
  const regionLabel =
    region && subRegion ? `${region} ${subRegion}` : region || subRegion;
  const searchLabel = keyword || regionLabel;

  if (keyword && !hasMockSearchResult(keyword)) {
    return {
      content: [],
      page,
      last: true,
    };
  }

  const content = Array.from({ length: end - start }, (_, index) =>
    createMockCourse(start + index + 1, filters, courses, searchLabel)
  );

  return {
    content:
      filters.sort === DEFAULT_FILTER_LABELS.sort
        ? content
        : [...content].reverse(),
    page,
    last: end >= TOTAL_COUNT,
  };
}
