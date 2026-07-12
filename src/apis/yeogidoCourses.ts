import type { YeogidoCourseSelectedFilters } from '../pages/yeogido-course/constants/filters';
import type { YeogidoCourse } from '../pages/yeogido-course/types';

const PAGE_SIZE = 12;
const TOTAL_COUNT = 48;

export interface YeogidoCoursePage {
  content: YeogidoCourse[];
  page: number;
  last: boolean;
}

interface FetchYeogidoCoursesParams {
  page: number;
  filters: YeogidoCourseSelectedFilters;
  keyword?: string;
}

function createMockCourse(
  id: number,
  filters: YeogidoCourseSelectedFilters,
  keyword = ''
): YeogidoCourse {
  const companionPrefix =
    filters.companion === '전체' ? '강릉' : filters.companion;
  const titlePrefix = keyword || companionPrefix;

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
  keyword,
}: FetchYeogidoCoursesParams): Promise<YeogidoCoursePage> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500);
  });

  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL_COUNT);
  const content = Array.from({ length: end - start }, (_, index) =>
    createMockCourse(start + index + 1, filters, keyword)
  );

  return {
    content,
    page,
    last: end >= TOTAL_COUNT,
  };
}
