import { useInfiniteQuery } from '@tanstack/react-query';

import type { YeogidoCourseSelectedFilters } from '../constants/filters';
import type { YeogidoCourse } from '../types';

const PAGE_SIZE = 12;
const TOTAL_COUNT = 48;

interface YeogidoCoursePage {
  content: YeogidoCourse[];
  page: number;
  last: boolean;
}

interface FetchYeogidoCoursesParams {
  page: number;
  filters: YeogidoCourseSelectedFilters;
}

function createMockCourse(
  id: number,
  filters: YeogidoCourseSelectedFilters
): YeogidoCourse {
  const companionPrefix =
    filters.companion === '전체' ? '강릉' : filters.companion;

  return {
    id,
    title: `${companionPrefix} 여행 코스`,
    duration: filters.duration === '전체' ? '2박 3일' : filters.duration,
    courseName:
      filters.transport === '전체'
        ? '뚜벅이 코스'
        : `${filters.transport} 코스`,
  };
}

async function fetchYeogidoCourses({
  page,
  filters,
}: FetchYeogidoCoursesParams): Promise<YeogidoCoursePage> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500);
  });

  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL_COUNT);
  const content = Array.from({ length: end - start }, (_, index) =>
    createMockCourse(start + index + 1, filters)
  );

  return {
    content,
    page,
    last: end >= TOTAL_COUNT,
  };
}

function useYeogidoCourses(filters: YeogidoCourseSelectedFilters) {
  return useInfiniteQuery({
    queryKey: ['yeogidoCourses', filters],
    queryFn: ({ pageParam }) =>
      fetchYeogidoCourses({ page: pageParam, filters }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export default useYeogidoCourses;
