import { useMemo } from 'react';

import { useQueries, useQuery } from '@tanstack/react-query';

import {
  getPopularRegions,
  getRegion,
  searchRegions,
} from '../apis/regions.api';
import type { RegionDetailResponse } from '../types/region.type';

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

/**
 * regionId 목록에 대한 지역 상세(name/fullName)를 조회해 지도 도형
 * 매칭에 쓴다. 지역 이름은 사실상 불변이라 무기한 캐시한다.
 */
export function useTravelRecordRegionDetails(regionIds: readonly number[]) {
  const uniqueRegionIds = Array.from(new Set(regionIds));

  const queries = useQueries({
    queries: uniqueRegionIds.map((regionId) => ({
      queryKey: ['region', regionId],
      queryFn: () => getRegion(regionId),
      staleTime: Infinity,
    })),
  });

  return useMemo(() => {
    const regionInfoByRegionId = new Map<number, RegionDetailResponse>();

    uniqueRegionIds.forEach((regionId, index) => {
      const regionDetail = queries[index]?.data;

      if (regionDetail) {
        regionInfoByRegionId.set(regionId, regionDetail);
      }
    });

    return regionInfoByRegionId;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queries]);
}
