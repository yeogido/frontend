import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchYeogidoCourses } from '../../../apis/yeogidoCourses';
import type { YeogidoCourseSelectedFilters } from '../constants/filters';

interface UseYeogidoCoursesParams {
  filters: YeogidoCourseSelectedFilters;
  keyword?: string;
}

function useYeogidoCourses({ filters, keyword = '' }: UseYeogidoCoursesParams) {
  const normalizedKeyword = keyword.trim();

  return useInfiniteQuery({
    queryKey: ['yeogidoCourses', { filters, keyword: normalizedKeyword }],
    queryFn: ({ pageParam }) =>
      fetchYeogidoCourses({
        page: pageParam,
        filters,
        keyword: normalizedKeyword,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export default useYeogidoCourses;
