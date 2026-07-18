import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchLocalRecentCourses } from '../../../apis/localCourses';
import type { LocalCourseSelectedFilters } from '../constants/filters';

interface UseLocalRecentCoursesParams {
  filters: LocalCourseSelectedFilters;
}

function useLocalRecentCourses({ filters }: UseLocalRecentCoursesParams) {
  return useInfiniteQuery({
    queryKey: ['localRecentCourses', { filters }],
    queryFn: ({ pageParam }) =>
      fetchLocalRecentCourses({
        page: pageParam,
        filters,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export default useLocalRecentCourses;
