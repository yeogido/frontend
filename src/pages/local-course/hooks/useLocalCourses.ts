import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchLocalCourses } from '../../../apis/localCourses';
import type { LocalCourseSelectedFilters } from '../constants/filters';

interface UseLocalCoursesParams {
  filters: LocalCourseSelectedFilters;
  keyword?: string;
  region?: string;
  subRegion?: string;
}

function useLocalCourses({
  filters,
  keyword = '',
  region = '',
  subRegion = '',
}: UseLocalCoursesParams) {
  const normalizedKeyword = keyword.trim();
  const normalizedRegion = region.trim();
  const normalizedSubRegion = subRegion.trim();

  return useInfiniteQuery({
    queryKey: [
      'localCourses',
      {
        filters,
        keyword: normalizedKeyword,
        region: normalizedRegion,
        subRegion: normalizedSubRegion,
      },
    ],
    queryFn: ({ pageParam }) =>
      fetchLocalCourses({
        page: pageParam,
        filters,
        keyword: normalizedKeyword,
        region: normalizedRegion,
        subRegion: normalizedSubRegion,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export default useLocalCourses;
