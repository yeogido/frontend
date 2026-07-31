import { getCourseDetail, type CourseDetailResult } from './courses';
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
const DEFAULT_FILTER_LABELS = {
  transport: localCourseFilterGroups[0].defaultLabel,
  duration: localCourseFilterGroups[1].defaultLabel,
  companion: localCourseFilterGroups[2].defaultLabel,
  sort: localCourseFilterGroups[3].defaultLabel,
};
const ALL_FILTER_LABEL = localCourseFilterGroups[0].options[0];
const TRANSPORT_COURSE_TYPE_LABELS: Record<string, string> = {
  도보: '뚜벅이',
  대중교통: '대중교통',
  자차: '드라이브',
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

function getFilteredCourses(
  courses: readonly LocalCourse[],
  filters: LocalCourseSelectedFilters
) {
  return courses.filter((course) => {
    const matchesTransport =
      filters.transport === DEFAULT_FILTER_LABELS.transport ||
      filters.transport === ALL_FILTER_LABEL ||
      course.courseType.includes(
        TRANSPORT_COURSE_TYPE_LABELS[filters.transport] ?? filters.transport
      );
    const matchesDuration =
      filters.duration === ALL_FILTER_LABEL ||
      course.duration === filters.duration;
    const matchesCompanion = course.companion === filters.companion;

    return matchesTransport && matchesDuration && matchesCompanion;
  });
}

function createMockCourse(
  id: number,
  filters: LocalCourseSelectedFilters,
  courses: readonly LocalCourse[],
  searchLabel = ''
): LocalCourse {
  const baseCourse = courses[(id - 1) % courses.length];

  return {
    ...baseCourse,
    id,
    title: searchLabel
      ? `${searchLabel} ${baseCourse.title}`
      : baseCourse.title,
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
    applyFilters: false,
  });
}

async function fetchLocalCoursePage({
  page,
  filters,
  keyword = '',
  region = '',
  subRegion = '',
  courses,
  applyFilters = true,
}: FetchLocalCoursesParams & {
  courses: readonly LocalCourse[];
  applyFilters?: boolean;
}): Promise<LocalCoursePage> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500);
  });

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

  const filteredCourses = applyFilters
    ? getFilteredCourses(courses, filters)
    : [...courses];
  const sourceCourses = filteredCourses;
  const totalCount = sourceCourses.length;
  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, totalCount);
  const content = Array.from({ length: end - start }, (_, index) =>
    createMockCourse(start + index + 1, filters, sourceCourses, searchLabel)
  );

  return {
    content:
      filters.sort === DEFAULT_FILTER_LABELS.sort
        ? content
        : [...content].reverse(),
    page,
    last: end >= totalCount,
  };
}

export type LocalCourseDetailResult = CourseDetailResult;

export async function getLocalCourseDetail(
  courseId: number
): Promise<LocalCourseDetailResult> {
  return getCourseDetail(courseId);
}
