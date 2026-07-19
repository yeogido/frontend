import { useInfiniteQuery } from '@tanstack/react-query';

import { fetchFestivals } from '../../../apis/festivals';
import type { FestivalSelectedFilters } from '../constants/filters';

interface UseFestivalsParams {
  filters: FestivalSelectedFilters;
  keyword?: string;
  region?: string;
  subRegion?: string;
  enabled?: boolean;
}

function useFestivals({
  filters,
  keyword = '',
  region = '',
  subRegion = '',
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
      },
    ],
    queryFn: ({ pageParam }) =>
      fetchFestivals({
        page: pageParam,
        filters,
        keyword: normalizedKeyword,
        region: normalizedRegion,
        subRegion: normalizedSubRegion,
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
