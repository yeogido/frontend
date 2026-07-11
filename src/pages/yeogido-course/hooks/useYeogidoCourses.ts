import { useInfiniteQuery } from '@tanstack/react-query';

import type { YeogidoCourse } from '../types';

const PAGE_SIZE = 12;
const TOTAL_COUNT = 48;

interface YeogidoCoursePage {
  content: YeogidoCourse[];
  page: number;
  last: boolean;
}

function createMockCourse(id: number): YeogidoCourse {
  return {
    id,
    title: '강릉 혼자 여행 코스',
    duration: '2박 3일',
    courseName: '뚜벅이 코스',
  };
}

async function fetchYeogidoCourses(page: number): Promise<YeogidoCoursePage> {
  await new Promise((resolve) => {
    window.setTimeout(resolve, 500);
  });

  const start = page * PAGE_SIZE;
  const end = Math.min(start + PAGE_SIZE, TOTAL_COUNT);
  const content = Array.from({ length: end - start }, (_, index) =>
    createMockCourse(start + index + 1)
  );

  return {
    content,
    page,
    last: end >= TOTAL_COUNT,
  };
}

function useYeogidoCourses() {
  return useInfiniteQuery({
    queryKey: ['yeogidoCourses'],
    queryFn: ({ pageParam }) => fetchYeogidoCourses(pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export default useYeogidoCourses;
