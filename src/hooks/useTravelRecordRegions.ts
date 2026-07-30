import { useQuery } from '@tanstack/react-query';

import {
  getPopularRegions,
  searchRegions,
} from '../apis/regions.api';

const trimmedKeyword = (keyword: string) => keyword.trim();

export function usePopularTravelRecordRegions() {
  return useQuery({
    queryKey: ['travelRecordRegions', 'popular'],
    queryFn: getPopularRegions,
  });
}

export function useTravelRecordRegionSearch(keyword: string) {
  const query = trimmedKeyword(keyword);

  return useQuery({
    queryKey: ['travelRecordRegions', 'search', query],
    queryFn: () => searchRegions(query),
    enabled: query.length > 0,
  });
}
