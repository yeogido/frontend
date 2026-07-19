import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchFestivals } from '../../../apis/festivals';
import type { FestivalSelectedFilters } from '../constants/filters';
import type { FestivalStatus } from '../types';

interface UseFestivalsParams {
  filters: FestivalSelectedFilters;
  keyword?: string;
  region?: string;
  subRegion?: string;
  status?: FestivalStatus;
  enabled?: boolean;
}

function useFestivals({
  filters,
  keyword = '',
  region = '',
  subRegion = '',
  status,
  enabled = true,
}: UseFestivalsParams) {
  const normalizedKeyword = keyword.trim();
  const normalizedRegion = region.trim();
  const normalizedSubRegion = subRegion.trim();

  return useInfiniteQuery({
    queryKey: [
      'festivals',
      {
        filters,
        keyword: normalizedKeyword,
        region: normalizedRegion,
        subRegion: normalizedSubRegion,
        status,
      },
    ],
    queryFn: ({ pageParam }) =>
      fetchFestivals({
        page: pageParam,
        filters,
        keyword: normalizedKeyword,
        region: normalizedRegion,
        subRegion: normalizedSubRegion,
        status,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) =>
      lastPage.last ? undefined : lastPage.page + 1,
    enabled,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 5,
  });
}

export default useFestivals;
