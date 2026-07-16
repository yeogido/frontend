import { regionSearchKeywords } from '../constants/regions';
import { yeogidoCourseSearchKeywords } from '../constants/yeogidoCourseSearch';
import type { YeogidoCourseSelectedFilters } from '../pages/yeogido-course/constants/filters';
import type { YeogidoCourse } from '../pages/yeogido-course/types';

const PAGE_SIZE = 12;
const TOTAL_COUNT = 48;
const MOCK_SEARCH_KEYWORDS = [
  ...yeogidoCourseSearchKeywords,
  ...regionSearchKeywords,
] as const;
const NORMALIZED_MOCK_SEARCH_KEYWORDS = new Set(
  MOCK_SEARCH_KEYWORDS.map((keyword) => normalizeSearchText(keyword))
);

export interface YeogidoCoursePage {
  content: YeogidoCourse[];
  page: number;
  last: boolean;
}

interface FetchYeogidoCoursesParams {
  page: number;
  filters: YeogidoCourseSelectedFilters;
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

  if (NORMALIZED_MOCK_SEARCH_KEYWORDS.has(normalizedKeyword)) {
    return true;
  }

  const normalizedTokens = keyword
    .trim()
    .split(/\s+/)
    .map((token) => normalizeSearchText(token));

  return (
    normalizedTokens.length > 1 &&
    normalizedTokens.every((token) => NORMALIZED_MOCK_SEARCH_KEYWORDS.has(token))
  );
}

function createMockCourse(
  id: number,
  filters: YeogidoCourseSelectedFilters,
  searchLabel = ''
): YeogidoCourse {
  const companionPrefix =
    filters.companion === '전체' ? '강릉' : filters.companion;
  const titlePrefix = searchLabel || companionPrefix;

  return {
    id,
    title: `${titlePrefix} 여행 코스`,
    duration: filters.duration === '전체' ? '2박 3일' : filters.duration,
    courseName:
      filters.transport === '전체'
        ? '뚜벅이 코스'
        : `${filters.transport} 코스`,
  };
}

export async function fetchYeogidoCourses({
  page,
  filters,
  keyword = '',
  region = '',
  subRegion = '',
}: FetchYeogidoCoursesParams): Promise<YeogidoCoursePage> {
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
    createMockCourse(start + index + 1, filters, searchLabel)
  );

  return {
    content,
    page,
    last: end >= TOTAL_COUNT,
  };
}
