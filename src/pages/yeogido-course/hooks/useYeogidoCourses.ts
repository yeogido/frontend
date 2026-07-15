import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchYeogidoCourses } from '../../../apis/yeogidoCourses';
import type { YeogidoCourseSelectedFilters } from '../constants/filters';

interface UseYeogidoCoursesParams {
  filters: YeogidoCourseSelectedFilters;
  keyword?: string;
  region?: string;
  subRegion?: string;
}

function useYeogidoCourses({
  filters,
  keyword = '',
  region = '',
  subRegion = '',
}: UseYeogidoCoursesParams) {
  const normalizedKeyword = keyword.trim();
  const normalizedRegion = region.trim();
  const normalizedSubRegion = subRegion.trim();

  return useInfiniteQuery({
    queryKey: [
      'yeogidoCourses',
      {
        filters,
        keyword: normalizedKeyword,
        region: normalizedRegion,
        subRegion: normalizedSubRegion,
      },
    ],
    queryFn: ({ pageParam }) =>
      fetchYeogidoCourses({
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

export default useYeogidoCourses;
