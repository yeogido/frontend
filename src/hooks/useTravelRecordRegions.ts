import {
  useQueries,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query';

import { getRegion, searchRegions } from '../apis/regions.api';
import type { RegionDetailResponse } from '../types/region.type';

const trimmedKeyword = (keyword: string) => keyword.trim();

// 모듈 스코프에 두어 참조가 고정되게 한다. combine이 렌더마다 새
// 함수면 react-query가 결과를 재사용하지 못한다.
const combineRegionDetails = (
  results: UseQueryResult<RegionDetailResponse, Error>[],
) => {
  const regionInfoByRegionId = new Map<number, RegionDetailResponse>();

  results.forEach(({ data }) => {
    if (data) {
      regionInfoByRegionId.set(data.regionId, data);
    }
  });

  return regionInfoByRegionId;
};

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

  return useQueries({
    queries: uniqueRegionIds.map((regionId) => ({
      queryKey: ['region', regionId],
      queryFn: () => getRegion(regionId),
      staleTime: Infinity,
    })),
    combine: combineRegionDetails,
  });
}
